import React from "react";

export type WinButtonVariant = "default" | "danger";

interface WinButtonProps {
  onClick: () => void;
  ariaLabel: string;
  title: string;
  variant?: WinButtonVariant;
  children: React.ReactNode;
}

/** 无边框窗口的窗口控制按钮：圆形毛玻璃包裹，hover 时高亮。 */
export function WinButton({
  onClick,
  ariaLabel,
  title,
  variant = "default",
  children,
}: WinButtonProps) {
  const baseColor = variant === "danger"
    ? "var(--rb-danger)"
    : "var(--rb-text-muted)";
  const hoverBg = variant === "danger"
    ? "color-mix(in srgb, var(--rb-danger-hover) 20%, transparent)"
    : "var(--rb-glass-bg-hover)";

  const [hover, setHover] = React.useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={ariaLabel}
      title={title}
      style={{
        width: 30,
        height: 30,
        border: "none",
        background: hover ? hoverBg : "var(--rb-glass-bg)",
        color: baseColor,
        cursor: "pointer",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        WebkitAppRegion: "no-drag",
        transition: "background 0.15s ease, color 0.15s ease",
      }}
    >
      {children}
    </button>
  );
}

/* ─── 内置 SVG 图标（与 V1 保持一致） ─── */

export const MinIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
    <line x1="2" y1="5" x2="8" y2="5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const MaxIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
    <rect x="2" y="2" width="6" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

export const RestoreIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
    <rect x="1.5" y="3" width="6" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
    <rect x="3" y="1.5" width="6" height="6" rx="1" fill="rgba(0,0,0,0)" stroke="currentColor" strokeWidth="1" />
  </svg>
);

export const CloseIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
    <line x1="2" y1="2" x2="8" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="8" y1="2" x2="2" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);