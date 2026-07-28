import React from "react";

interface WorkspaceProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  composer: React.ReactNode;
}

/** 右侧主工作区：顶部状态 + 消息区 + 输入框。 */
export function Workspace({ header, children, composer }: WorkspaceProps) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        overflow: "hidden",
        background: "transparent",
      }}
    >
      {/* 顶部模式/任务状态栏 */}
      {header}

      {/* 消息区（弹性填充） */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>

      {/* 输入框 */}
      {composer}
    </div>
  );
}
