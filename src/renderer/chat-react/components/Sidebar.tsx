import React from "react";
import { ModeSwitcher, type ChatMode } from "./ModeSwitcher";
import { NavigationMenu, type NavItem } from "./NavigationMenu";
import { UserPanel } from "./UserPanel";

interface SidebarProps {
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  navItems: NavItem[];
  activeNavId?: string;
  onNavSelect: (id: string) => void;
  /** 会话/项目列表区域（由外部注入，方便后续接入 ConversationList） */
  children?: React.ReactNode;
  userName?: string;
  avatarUrl?: string;
  onSettings?: () => void;
}

/** 左侧导航栏：模式切换 + 导航菜单 + 会话列表 + 用户面板。 */
export function Sidebar({
  mode,
  onModeChange,
  navItems,
  activeNavId,
  onNavSelect,
  children,
  userName,
  avatarUrl,
  onSettings,
}: SidebarProps) {
  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        display: "flex",
        flexDirection: "column",
        background: "var(--rb-bg-1)",
        borderRight: "1px solid var(--rb-divider)",
        overflow: "hidden",
      }}
    >
      {/* 模式切换 */}
      <ModeSwitcher value={mode} onChange={onModeChange} />

      {/* 导航菜单 */}
      <NavigationMenu
        items={navItems}
        activeId={activeNavId}
        onSelect={onNavSelect}
      />

      {/* 分割线 */}
      <div
        style={{
          height: 1,
          margin: "4px 12px",
          background: "var(--rb-divider)",
        }}
      />

      {/* 会话/项目列表（弹性填充中间区域） */}
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

      {/* 底部用户面板 */}
      <UserPanel
        userName={userName}
        avatarUrl={avatarUrl}
        onSettings={onSettings}
      />
    </aside>
  );
}
