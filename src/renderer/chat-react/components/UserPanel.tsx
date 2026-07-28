import React from "react";
import { Settings } from "lucide-react";

interface UserPanelProps {
  userName?: string;
  avatarUrl?: string;
  onSettings?: () => void;
}

/** 底部用户信息区：头像 + 用户名 + 设置入口。 */
export function UserPanel({ userName = "User", avatarUrl, onSettings }: UserPanelProps) {
  const [hover, setHover] = React.useState(false);

  return (
    <div
      style={{
        padding: "12px 14px",
        borderTop: "1px solid var(--rb-divider)",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      {/* 头像 */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: avatarUrl
            ? `url(${avatarUrl}) center/cover`
            : "linear-gradient(135deg, var(--rb-accent), #8b5cf6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          color: "#fff",
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {!avatarUrl && userName.charAt(0).toUpperCase()}
      </div>

      {/* 用户名 */}
      <span
        style={{
          flex: 1,
          fontSize: 13,
          fontWeight: 500,
          color: "var(--rb-text-strong)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {userName}
      </span>

      {/* 设置按钮 */}
      <button
        onClick={onSettings}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-label="设置"
        title="设置"
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "none",
          background: hover ? "var(--rb-glass-bg-hover)" : "transparent",
          color: "var(--rb-text-muted)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.15s, color 0.15s",
        }}
      >
        <Settings size={15} />
      </button>
    </div>
  );
}
