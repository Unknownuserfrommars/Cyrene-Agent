import React from "react";

interface WorkspaceHeaderProps {
  mode: "work" | "chat";
  taskStatus?: string;
}

/** 顶部状态条：当前模式 + 任务状态。 */
export function WorkspaceHeader({ mode, taskStatus }: WorkspaceHeaderProps) {
  return (
    <div
      style={{
        height: 44,
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--rb-divider)",
        background: "var(--rb-divider-soft)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: "2px 10px",
            borderRadius: 999,
            background: "color-mix(in srgb, var(--rb-accent) 18%, transparent)",
            color: "var(--rb-accent)",
          }}
        >
          {mode === "work" ? "Work" : "Chat"}
        </span>
        <span style={{ fontSize: 12, color: "var(--rb-text-muted)" }}>
          {taskStatus ?? "空闲"}
        </span>
      </div>
      <div style={{ fontSize: 11, color: "var(--rb-text-faint)" }}>
        {/* 预留：Agent Activity 状态 */}
      </div>
    </div>
  );
}