// Claude Code 桥 —— 用 Claude 订阅（Pro/Max）驱动 Chat 模式，不需要 API Key
//
// 设计动机：
//   ChatVendorAdapter.buildRequest() 返回的是 HttpRequest（{url, headers, body}），
//   调度层自己发 fetch。而 Claude Agent SDK 的 query() 是进程内 async generator，
//   根本无法实现这个接口——Transport 也是 "openai" | "anthropic" 的封闭联合，没有第三种。
//
//   所以这里反过来做：在 main 进程里起一个只监听 127.0.0.1 的最小 HTTP 服务，
//   对外说 Anthropic Messages 协议（POST /v1/messages），对内跑 Agent SDK。
//   这样 anthropic-adapter / chat-loop / capabilities 一行都不用改，
//   新厂商只是"baseUrl 恰好指向本机"的普通 Anthropic 厂商。
//
// 边界（重要，不是偷懒）：
//   本桥**只支持 Chat 模式**。Work 模式（CITA → Action Gate → Native FC）要求
//   厂商侧提供 tools + structured output，而 Agent SDK 自带一整套 agent loop 和工具，
//   两个 agent 会互相打架——Cyrene 的 Execution Policy / Tool Runtime 会被绕开。
//   因此请求里出现 tools / tool_choice 时直接 400，而不是静默返回一个错的结果。
//   capabilities 里的 supportsTools 字段全仓库没人读，靠它拦不住，只能在边界上硬拦。
//
// 鉴权：只监听回环地址，另外要求请求带上启动时随机生成的 token。
//   token 不是防外网（回环本来就出不去），是防同机其它进程乱打这个端口。
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { query } from "@anthropic-ai/claude-agent-sdk";

/** Chat 模式单轮上限；无工具时一轮就够，留着是防 SDK 侧自行多轮。 */
const MAX_TURNS = 1;
/** 请求体上限，防跑飞的 prompt 把 main 进程内存吃掉。 */
const MAX_BODY_BYTES = 8 * 1024 * 1024;

export interface ClaudeCodeBridgeHandle {
  /** 直接填进 settings 的 baseUrl（已含 /v1）。 */
  baseUrl: string;
  /** 直接填进 settings 的 API Key 位置。 */
  token: string;
  port: number;
  close(): Promise<void>;
}

interface WireContentBlock {
  type: string;
  text?: string;
  [k: string]: unknown;
}

interface WireMessage {
  role: string;
  content?: string | WireContentBlock[];
}

interface WireRequest {
  model?: string;
  system?: string;
  messages?: WireMessage[];
  tools?: unknown[];
  tool_choice?: unknown;
  stream?: boolean;
}

/** content 可能是 string 也可能是 block 数组，只取 text 部分。 */
function flattenContent(content: WireMessage["content"]): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter(b => b?.type === "text" && typeof b.text === "string")
    .map(b => b.text as string)
    .join("\n")
    .trim();
}

/**
 * 把 Anthropic wire messages 压成 Agent SDK 的单个 prompt 字符串。
 *
 * 这是本桥唯一有损的地方。Agent SDK 的 query() 只吃 prompt: string
 * （或 AsyncIterable<SDKUserMessage>，但那是给交互式会话用的），
 * 而 Chat 模式每次调用都会把完整历史重新拼一遍、且 stream: false，
 * 所以这里把历史渲染成一段转录、最后单独放本轮 user 输入。
 * 不用 SDK 的 session resume：Cyrene 自己管历史，两边都管会打架。
 */
function renderPrompt(messages: WireMessage[]): string {
  const turns = messages.filter(m => m.role === "user" || m.role === "assistant");
  const last = turns[turns.length - 1];
  const history = turns.slice(0, -1);

  const current = last ? flattenContent(last.content) : "";
  if (history.length === 0) return current;

  const transcript = history
    .map(m => `${m.role === "user" ? "用户" : "你"}：${flattenContent(m.content)}`)
    .filter(line => line.length > 3)
    .join("\n");

  if (!transcript) return current;
  return `以下是你和用户此前的对话：\n\n${transcript}\n\n---\n\n用户现在说：${current}`;
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
  });
  res.end(body);
}

/** Anthropic 的错误信封，让 adapter 的报错路径拿到可读文案。 */
function sendError(res: ServerResponse, status: number, message: string): void {
  sendJson(res, status, { type: "error", error: { type: "invalid_request_error", message } });
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("请求体超过 8MB 上限"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

/** 定长比较，避免把 token 比较写成可计时的短路比较。 */
function tokenMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function extractToken(req: IncomingMessage): string {
  const apiKey = req.headers["x-api-key"];
  if (typeof apiKey === "string" && apiKey) return apiKey;
  const auth = req.headers.authorization;
  if (typeof auth === "string" && auth.startsWith("Bearer ")) return auth.slice(7);
  return "";
}

/**
 * 跑一次 Agent SDK query，收集 assistant 文本 + usage。
 *
 * settingSources: [] 是刻意的——SDK 缺省会加载 ~/.claude/settings.json 和
 * CLAUDE.md。对一个扮演角色的聊天人格来说那是噪音，而且会把用户的开发笔记
 * 灌进桌宠的上下文里。这里要完全隔离。
 * allowedTools: [] 保证它不会去读写文件系统——Chat 模式本来就不该有工具。
 */
async function runQuery(
  prompt: string,
  systemPrompt: string | undefined,
  model: string | undefined,
  abortSignal: AbortSignal,
): Promise<{ text: string; input: number; output: number; subscription: string | null }> {
  let text = "";
  let input = 0;
  let output = 0;
  let subscription: string | null = null;

  const stream = query({
    prompt,
    options: {
      ...(model ? { model } : {}),
      ...(systemPrompt ? { systemPrompt } : {}),
      maxTurns: MAX_TURNS,
      allowedTools: [],
      settingSources: [],
      abortController: toAbortController(abortSignal),
    },
  });

  for await (const message of stream) {
    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if (block.type === "text" && typeof block.text === "string") text += block.text;
      }
      const usage = message.message.usage;
      if (usage) {
        input += usage.input_tokens ?? 0;
        output += usage.output_tokens ?? 0;
      }
    } else if (message.type === "result") {
      // subscription_type: 'pro' | 'max' | ... | null（null = 走的是 API Key）。
      // 拿它来确认订阅确实生效了，启动日志里会打出来。
      subscription = (message as { subscription_type?: string | null }).subscription_type ?? null;
    }
  }

  return { text: text.trim(), input, output, subscription };
}

/** chat-loop 通过 fetch signal 取消；把它接到 SDK 的 abortController 上。 */
function toAbortController(signal: AbortSignal): AbortController {
  const controller = new AbortController();
  if (signal.aborted) controller.abort();
  else signal.addEventListener("abort", () => controller.abort(), { once: true });
  return controller;
}

async function handleMessages(
  req: IncomingMessage,
  res: ServerResponse,
  token: string,
): Promise<void> {
  if (!tokenMatches(extractToken(req), token)) {
    sendError(res, 401, "Claude Code 桥 token 不匹配：请把设置里的 API Key 换成启动日志里的 token。");
    return;
  }

  let body: WireRequest;
  try {
    body = JSON.parse(await readBody(req)) as WireRequest;
  } catch (e) {
    sendError(res, 400, `请求体解析失败：${e instanceof Error ? e.message : String(e)}`);
    return;
  }

  // Work 模式硬拦。见文件头"边界"一节。
  if (Array.isArray(body.tools) && body.tools.length > 0) {
    sendError(
      res,
      400,
      "Claude Code（订阅）只支持 Chat 模式。Work 模式需要厂商侧 function calling，" +
        "而 Agent SDK 自带 agent loop，会绕开 Cyrene 的 Action Gate 和 Execution Policy。" +
        "请把 Work 模式切到配 API Key 的 Claude（Anthropic）。",
    );
    return;
  }
  if (body.tool_choice !== undefined) {
    sendError(res, 400, "Claude Code（订阅）不支持 tool_choice：这是 Work 模式路径，请改用 API Key 厂商。");
    return;
  }
  if (body.stream === true) {
    // Chat 模式当前是 stream: false（chat-loop.ts），走到这里说明调用方变了。
    sendError(res, 400, "Claude Code 桥暂不支持流式：Chat 模式当前走非流式路径。");
    return;
  }

  const abort = new AbortController();
  res.on("close", () => abort.abort());

  try {
    const result = await runQuery(
      renderPrompt(body.messages ?? []),
      body.system,
      body.model,
      abort.signal,
    );

    if (!result.text) {
      sendError(res, 502, "Claude Code 没有返回任何文本（可能是订阅额度用尽或会话被中断）。");
      return;
    }

    // 回一个 Anthropic Messages 形状，anthropic-adapter.parseResponse 直接吃。
    sendJson(res, 200, {
      id: `msg_bridge_${randomBytes(8).toString("hex")}`,
      type: "message",
      role: "assistant",
      model: body.model ?? "claude-code-subscription",
      content: [{ type: "text", text: result.text }],
      stop_reason: "end_turn",
      stop_sequence: null,
      usage: { input_tokens: result.input, output_tokens: result.output },
    });
  } catch (e) {
    if (abort.signal.aborted) return; // 调用方已经断开，没人等这个响应
    sendError(res, 502, `Claude Code 调用失败：${e instanceof Error ? e.message : String(e)}`);
  }
}

/**
 * 起桥。返回的 baseUrl / token 直接填进设置里的"Base URL"和"API Key"。
 * 端口用 0 让内核分配，避免和用户机器上别的服务撞。
 */
export function startClaudeCodeBridge(): Promise<ClaudeCodeBridgeHandle> {
  const token = randomBytes(24).toString("hex");

  const server: Server = createServer((req, res) => {
    if (req.method !== "POST" || !req.url?.startsWith("/v1/messages")) {
      sendError(res, 404, "Claude Code 桥只提供 POST /v1/messages。");
      return;
    }
    void handleMessages(req, res, token).catch(e => {
      if (!res.headersSent) {
        sendError(res, 500, `桥内部错误：${e instanceof Error ? e.message : String(e)}`);
      }
    });
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    // 只绑回环：这个端口不该被局域网看见。
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (address === null || typeof address === "string") {
        reject(new Error("[ClaudeCodeBridge] 拿不到监听端口"));
        return;
      }
      resolve({
        baseUrl: `http://127.0.0.1:${address.port}/v1`,
        token,
        port: address.port,
        close: () => new Promise<void>(done => server.close(() => done())),
      });
    });
  });
}
