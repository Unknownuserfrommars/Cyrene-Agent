import React from "react";

interface MessageListProps {
  emptyHint?: React.ReactNode;
  children?: React.ReactNode;
}

/** 消息列表：垂直滚动 + 内部 padding + 弹性高度。 */
export function MessageList({ emptyHint, children }: MessageListProps) {
  return (
    <main
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children ?? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 12,
            opacity: 0.5,
            color: "var(--rb-text-muted)",
          }}
        >
          {emptyHint ?? (
            <>
              <p style={{ fontSize: 14 }}>暂无消息</p>
              <p style={{ fontSize: 12, color: "var(--rb-text-faint)" }}>
                下一步：接入 AG-UI 事件流
              </p>
            </>
          )}
        </div>
      )}
    </main>
  );
}