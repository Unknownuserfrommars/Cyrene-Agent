// claude-code-bridge 的边界测试
//
// 重点不是"能不能聊天"（那要真订阅），而是三条硬边界：
//   1. 带 tools 的请求（= Work 模式）必须 400，不能静默返回一个错的结果
//   2. token 不对必须 401
//   3. 正常回复必须是 anthropic-adapter.parseResponse 吃得下的形状
// 第 3 条直接拿真的 AnthropicAdapter.parseResponse 来验，避免两边形状漂移。
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const queryMock = vi.fn();

vi.mock("@anthropic-ai/claude-agent-sdk", () => ({
  query: (...args: unknown[]) => queryMock(...args),
}));

import { startClaudeCodeBridge, type ClaudeCodeBridgeHandle } from "./claude-code-bridge";
import { AnthropicAdapter } from "./anthropic-adapter";
import { getCapabilityOrOpenAI } from "./capabilities";

/** 拿真实注册的 capability 建 adapter，顺带验证 capability 条目存在。 */
function adapter(): AnthropicAdapter {
  return new AnthropicAdapter("claude-code", getCapabilityOrOpenAI("Claude Code（订阅）"));
}

interface ErrorEnvelope {
  error: { message: string };
}

/** 把 SDK 的返回伪造成一个 async generator。 */
function fakeStream(text: string, input = 11, output = 22) {
  return (async function* () {
    yield {
      type: "assistant",
      message: {
        content: [{ type: "text", text }],
        usage: { input_tokens: input, output_tokens: output },
      },
    };
    yield { type: "result", subtype: "success", subscription_type: "max" };
  })();
}

let bridge: ClaudeCodeBridgeHandle;

async function post(body: unknown, token = bridge.token): Promise<Response> {
  return fetch(`${bridge.baseUrl}/messages`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": token },
    body: JSON.stringify(body),
  });
}

beforeEach(async () => {
  queryMock.mockReset();
  bridge = await startClaudeCodeBridge();
});

afterEach(async () => {
  await bridge.close();
});

describe("claude-code-bridge", () => {
  it("对带 tools 的请求返回 400，并说明该用哪个厂商", async () => {
    const res = await post({
      model: "claude-sonnet-4-6",
      messages: [{ role: "user", content: "帮我改文件" }],
      tools: [{ name: "write_file", input_schema: { type: "object" } }],
    });

    expect(res.status).toBe(400);
    const body = (await res.json()) as ErrorEnvelope;
    expect(body.error.message).toContain("只支持 Chat 模式");
    // 关键：绝不能因为拦截而顺手把 SDK 调起来
    expect(queryMock).not.toHaveBeenCalled();
  });

  it("对带 tool_choice 的请求返回 400", async () => {
    const res = await post({
      messages: [{ role: "user", content: "hi" }],
      tool_choice: { type: "any" },
    });
    expect(res.status).toBe(400);
    expect(queryMock).not.toHaveBeenCalled();
  });

  it("token 不匹配返回 401", async () => {
    const res = await post({ messages: [{ role: "user", content: "hi" }] }, "wrong-token");
    expect(res.status).toBe(401);
    expect(queryMock).not.toHaveBeenCalled();
  });

  it("非 /v1/messages 路径返回 404", async () => {
    const res = await fetch(`${bridge.baseUrl}/models`, { method: "POST" });
    expect(res.status).toBe(404);
  });

  it("正常回复的形状能被 AnthropicAdapter.parseResponse 解析", async () => {
    queryMock.mockReturnValue(fakeStream("我在呢。"));

    const res = await post({
      model: "claude-sonnet-4-6",
      system: "你是 Cyrene。",
      messages: [{ role: "user", content: "在吗" }],
    });
    expect(res.status).toBe(200);

    const parsed = adapter().parseResponse(await res.json());
    expect(parsed.text).toBe("我在呢。");
    expect(parsed.toolCalls).toEqual([]);
    expect(parsed.finishReason).toBe("stop");
    expect(parsed.usage).toEqual({ input: 11, output: 22 });
  });

  it("把 system 传给 systemPrompt，且不给 SDK 任何工具与磁盘设置", async () => {
    queryMock.mockReturnValue(fakeStream("好。"));

    await post({
      model: "claude-opus-4-8",
      system: "你是 Cyrene。",
      messages: [{ role: "user", content: "早" }],
    });

    const options = queryMock.mock.calls[0][0].options;
    expect(options.systemPrompt).toBe("你是 Cyrene。");
    expect(options.model).toBe("claude-opus-4-8");
    // 没有工具 = 不会碰文件系统；settingSources: [] = 不会把 CLAUDE.md 灌进人格
    expect(options.allowedTools).toEqual([]);
    expect(options.settingSources).toEqual([]);
  });

  it("多轮历史被渲染进 prompt，最后一轮单独提出来", async () => {
    queryMock.mockReturnValue(fakeStream("记得。"));

    await post({
      messages: [
        { role: "user", content: "我叫 Kevin" },
        { role: "assistant", content: "记住了" },
        { role: "user", content: "我叫什么" },
      ],
    });

    const prompt = queryMock.mock.calls[0][0].prompt as string;
    expect(prompt).toContain("我叫 Kevin");
    expect(prompt).toContain("记住了");
    expect(prompt).toContain("用户现在说：我叫什么");
  });

  it("SDK 没吐文本时返回 502 而不是空回复", async () => {
    queryMock.mockReturnValue(fakeStream(""));
    const res = await post({ messages: [{ role: "user", content: "hi" }] });
    expect(res.status).toBe(502);
  });
});
