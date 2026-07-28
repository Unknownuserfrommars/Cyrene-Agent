import React from "react";
import { WinButton, MinIcon, MaxIcon, RestoreIcon, CloseIcon } from "./WinButton";
import { ThemeToggle } from "./ThemeToggle";
import type { UiTheme } from "../../../shared/ui-theme";

interface TitleBarProps {
  title: string;
  badge?: string;
  isMaximized?: boolean;
  theme: UiTheme;
  onToggleTheme: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onClose: () => void;
}

/** 顶部拖拽标题栏：标题 + 角标 + 主题切换 + 窗口控制。 */
export function TitleBar({
  title,
  badge,
  isMaximized = false,
  theme,
  onToggleTheme,
  onMinimize,
  onToggleMaximize,
  onClose,
}: TitleBarProps) {
  return (
    <div className="title-bar">
      <div className="title-bar__left">
        <span className="title-bar__title">{title}</span>
        {badge && <span className="title-bar__badge">{badge}</span>}
      </div>

      <div className="title-bar__right">
        <ThemeToggle
          value={theme}
          onChange={onToggleTheme}
        />
        <WinButton onClick={onMinimize} ariaLabel="最小化" title="最小化">
          <MinIcon />
        </WinButton>
        <WinButton
          onClick={onToggleMaximize}
          ariaLabel={isMaximized ? "还原" : "最大化"}
          title={isMaximized ? "还原" : "最大化"}
        >
          {isMaximized ? <RestoreIcon /> : <MaxIcon />}
        </WinButton>
        <WinButton onClick={onClose} ariaLabel="关闭" title="关闭" variant="danger">
          <CloseIcon />
        </WinButton>
      </div>
    </div>
  );
}
