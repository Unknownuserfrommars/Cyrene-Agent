import React from "react";
import { Moon, Sun } from "lucide-react";
import type { UiTheme } from "../../../shared/ui-theme";

interface ThemeToggleProps {
  value: UiTheme;
  onChange: (theme: UiTheme) => void;
}

/** Chat V2 的本地主题预览开关；持久化接线留给后续功能阶段。 */
export function ThemeToggle({ value, onChange }: ThemeToggleProps) {
  const isLight = value === "pearl-white";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLight}
      aria-label={isLight ? "切换到深色主题" : "切换到浅色主题"}
      title={isLight ? "切换到深色主题" : "切换到浅色主题"}
      className={`theme-toggle ${isLight ? "theme-toggle--light" : ""}`}
      onClick={() => onChange(isLight ? "classic" : "pearl-white")}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        <Moon size={12} strokeWidth={2} />
      </span>
      <span className="theme-toggle__icon" aria-hidden="true">
        <Sun size={12} strokeWidth={2} />
      </span>
      <span className="theme-toggle__thumb" aria-hidden="true" />
    </button>
  );
}
