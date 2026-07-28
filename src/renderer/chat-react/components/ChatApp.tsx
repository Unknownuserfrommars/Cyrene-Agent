import React from "react";
import { TitleBar } from "./TitleBar";
import { Sidebar } from "./Sidebar";
import { Workspace } from "./Workspace";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { MessageList } from "./MessageList";
import { MessageBubble, type MessageRole } from "./MessageBubble";
import { EmptyState } from "./EmptyState";
import { Composer } from "./Composer";
import type { ChatMode } from "./ModeSwitcher";
import type { NavItem } from "./NavigationMenu";
import type { UiTheme } from "../../../shared/ui-theme";

declare global {
  interface Window {
    cyreneV2?: {
      minimize: () => void;
      toggleMax: () => void;
      close: () => void;
    };
  }
}

/* ── 临时消息类型（后续接入 AG-UI 时替换为正式类型） ── */
interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  streaming?: boolean;
}

/* ── 默认导航项（只保留"新建任务"，其余等功能就绪后加回） ── */
const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: "new-task", label: "新建任务", shortcut: "⌘N" },
];

export function ChatApp() {
  const win = window.cyreneV2;

  /* ── 状态 ── */
  const [theme, setTheme] = React.useState<UiTheme>("classic");
  const [isMaximized, setIsMaximized] = React.useState(false);
  const [mode, setMode] = React.useState<ChatMode>("chat");
  const [activeNavId, setActiveNavId] = React.useState<string>("new-task");
  const [draft, setDraft] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);

  /* ── 主题同步 ── */
  React.useEffect(() => {
    document.documentElement.dataset.uiTheme = theme;
  }, [theme]);

  /* ── 发送消息（占位，后续接 AG-UI） ── */
  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setDraft("");

    // TODO: 调用 window.agui.run() 发送到后端
    // 临时：模拟模型回复
    setTimeout(() => {
      const modelMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "model",
        content: "（骨架占位）收到你的消息，AG-UI 接入后这里会显示真实回复。",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, modelMsg]);
    }, 500);
  };

  return (
    <div
      className="chat-v2-shell"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "var(--rb-text-default)",
      }}
    >
      {/* 顶栏（全宽） */}
      <TitleBar
        title="Cyrene Chat"
        badge="V2"
        isMaximized={isMaximized}
        theme={theme}
        onToggleTheme={() =>
          setTheme((t) => (t === "classic" ? "pearl-white" : "classic"))
        }
        onMinimize={() => win?.minimize()}
        onToggleMaximize={() => {
          win?.toggleMax();
          setIsMaximized((v) => !v);
        }}
        onClose={() => win?.close()}
      />

      {/* 主体：左侧 Sidebar + 右侧 Workspace */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <Sidebar
          mode={mode}
          onModeChange={setMode}
          navItems={DEFAULT_NAV_ITEMS}
          activeNavId={activeNavId}
          onNavSelect={setActiveNavId}
          userName="User"
          onSettings={() => {
            /* TODO: 打开设置窗口 */
          }}
        >
          {/* 会话列表占位 — 后续接入 ConversationList */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--rb-text-faint)",
              fontSize: 12,
            }}
          >
            暂无会话
          </div>
        </Sidebar>

        <Workspace
          header={<WorkspaceHeader mode={mode} />}
          composer={
            <Composer
              value={draft}
              onChange={setDraft}
              onSubmit={handleSend}
              placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
            />
          }
        >
          {messages.length === 0 ? (
            <EmptyState
              title="开始对话"
              subtitle="输入消息与 Cyrene 交流"
              tag="V2 Preview"
            />
          ) : (
            <MessageList>
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  timestamp={msg.timestamp}
                  streaming={msg.streaming}
                />
              ))}
            </MessageList>
          )}
        </Workspace>
      </div>
    </div>
  );
}
