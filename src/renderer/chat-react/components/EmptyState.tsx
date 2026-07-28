import React from "react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  tag?: string;
}

/** 空态：居中展示欢迎信息。 */
export function EmptyState({ icon, title, subtitle, tag }: EmptyStateProps) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 12,
        opacity: 0.7,
        color: "var(--rb-text-muted)",
        padding: 40,
      }}
    >
      {icon && <div style={{ fontSize: 48 }}>{icon}</div>}
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "var(--rb-text-strong)" }}>{title}</h2>
      {subtitle && <p style={{ margin: 0, fontSize: 13, color: "var(--rb-text-faint)" }}>{subtitle}</p>}
      {tag && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: "1px 8px",
            borderRadius: 999,
            background: "color-mix(in srgb, var(--rb-accent) 22%, transparent)",
            color: "var(--rb-accent)",
          }}
        >
          {tag}
        </span>
      )}
    </div>
  );
}