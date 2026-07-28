import React from "react";
import { Send, Paperclip, Shield, Image } from "lucide-react";

interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
  onAttach?: () => void;
  onScreenshot?: () => void;
}

/** 底部输入框：多行文本 + 工具栏 + 发送按钮。 */
export function Composer({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = "输入消息...",
  onAttach,
  onScreenshot,
}: ComposerProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const canSend = !disabled && value.trim().length > 0;

  /** 自动调整高度 */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSubmit();
    }
  };

  return (
    <footer className="composer">
      <div className="composer__input-row">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="composer__textarea"
        />
        <button
          disabled={!canSend}
          onClick={onSubmit}
          className={`composer__send-btn ${canSend ? "composer__send-btn--active" : "composer__send-btn--disabled"}`}
        >
          <Send size={15} />
        </button>
      </div>
      <div className="composer__toolbar">
        <button
          className="composer__toolbar-btn"
          onClick={onAttach}
          title="附件"
          aria-label="附件"
        >
          <Paperclip size={15} />
        </button>
        <button
          className="composer__toolbar-btn"
          onClick={onScreenshot}
          title="截图"
          aria-label="截图"
        >
          <Image size={15} />
        </button>
        <button
          className="composer__toolbar-btn"
          title="权限档位"
          aria-label="权限档位"
        >
          <Shield size={15} />
        </button>
      </div>
    </footer>
  );
}
