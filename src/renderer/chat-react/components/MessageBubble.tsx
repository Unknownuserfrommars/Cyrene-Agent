import React from "react";

export type MessageRole = "user" | "model";

interface MessageBubbleProps {
  role: MessageRole;
  content: string;
  /** 流式输出中 */
  streaming?: boolean;
  /** 时间戳（毫秒） */
  timestamp?: number;
}

/** 单条消息气泡：用户右对齐、模型左对齐。 */
export function MessageBubble({ role, content, streaming, timestamp }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        padding: "4px 0",
      }}
    >
      <div
        style={{
          maxWidth: "72%",
          padding: "10px 16px",
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          background: isUser
            ? "linear-gradient(135deg, var(--rb-accent), #8b5cf6)"
            : "var(--rb-glass-bg)",
          color: isUser ? "#fff" : "var(--rb-text-default)",
          fontSize: 14,
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          position: "relative",
        }}
      >
        {content}
        {streaming && (
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 14,
              marginLeft: 4,
              background: "var(--rb-accent)",
              borderRadius: 1,
              opacity: 0.7,
              animation: "blink 1s step-end infinite",
            }}
          />
        )}
        {timestamp && !streaming && (
          <div
            style={{
              fontSize: 10,
              color: isUser ? "rgba(255,255,255,0.6)" : "var(--rb-text-faint)",
              marginTop: 4,
              textAlign: isUser ? "right" : "left",
            }}
          >
            {formatTime(timestamp)}
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}
