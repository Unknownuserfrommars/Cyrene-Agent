import React from "react";

interface ChatLayoutProps {
  topBar: React.ReactNode;
  messageList: React.ReactNode;
  composer: React.ReactNode;
}

/** 聊天窗口三段式骨架：顶栏 + 消息流 + 输入框。 */
export function ChatLayout({ topBar, messageList, composer }: ChatLayoutProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        borderRadius: 32,
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: "var(--rb-bg-0)",
        color: "var(--rb-text-default)",
      }}
    >
      {topBar}
      {messageList}
      {composer}
    </div>
  );
}