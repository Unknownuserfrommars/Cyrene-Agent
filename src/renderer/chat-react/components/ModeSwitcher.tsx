import React from "react";

export type ChatMode = "work" | "chat";

interface ModeSwitcherProps {
  value: ChatMode;
  onChange: (mode: ChatMode) => void;
}

/** 受控的 Work / Chat 分段选择器。 */
export function ModeSwitcher({ value, onChange }: ModeSwitcherProps) {
  const workRef = React.useRef<HTMLButtonElement>(null);
  const chatRef = React.useRef<HTMLButtonElement>(null);

  const selectAndFocus = (mode: ChatMode) => {
    onChange(mode);
    const target = mode === "work" ? workRef.current : chatRef.current;
    target?.focus();
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    mode: ChatMode,
  ) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      selectAndFocus(mode === "work" ? "chat" : "work");
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      selectAndFocus("work");
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      selectAndFocus("chat");
    }
  };

  return (
    <div className="mode-switcher" role="group" aria-label="运行模式">
      <ModeButton
        ref={workRef}
        active={value === "work"}
        label="Work"
        icon={<WorkIcon />}
        onClick={() => onChange("work")}
        onKeyDown={(event) => handleKeyDown(event, "work")}
      />
      <ModeButton
        ref={chatRef}
        active={value === "chat"}
        label="Chat"
        icon={<ChatIcon />}
        onClick={() => onChange("chat")}
        onKeyDown={(event) => handleKeyDown(event, "chat")}
      />
    </div>
  );
}

interface ModeButtonProps {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  onKeyDown: React.KeyboardEventHandler<HTMLButtonElement>;
}

const ModeButton = React.forwardRef<HTMLButtonElement, ModeButtonProps>(
  function ModeButton(
    { active, label, icon, onClick, onKeyDown },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={active}
        onClick={onClick}
        onKeyDown={onKeyDown}
        className={`mode-tab ${active ? "mode-tab--active" : ""}`}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  },
);

/** 复用 Chat V1 的显示器 SVG。 */
function WorkIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect
        x="3"
        y="3.5"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M7 16.5H13M10 13.5V16.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 复用 Chat V1 的对话气泡 SVG。 */
function ChatIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M16.5 9.25C16.5 12.43 13.59 15 10 15C9.22 15 8.47 14.88 7.78 14.65L4.5 16L5.35 13.17C4.2 12.16 3.5 10.78 3.5 9.25C3.5 6.07 6.41 3.5 10 3.5C13.59 3.5 16.5 6.07 16.5 9.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 9.25H7.51M10 9.25H10.01M12.5 9.25H12.51"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
