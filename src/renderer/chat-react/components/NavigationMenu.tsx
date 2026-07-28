import React from "react";
import {
  Plus,
  LayoutDashboard,
  Puzzle,
  Clock,
  Globe,
} from "lucide-react";

/** 图标映射：根据 id 返回对应 lucide 图标。 */
const iconById: Record<string, React.ReactNode> = {
  "new-task": <Plus size={15} />,
  kanban: <LayoutDashboard size={15} />,
  plugins: <Puzzle size={15} />,
  scheduler: <Clock size={15} />,
  webbridge: <Globe size={15} />,
};

export interface NavItem {
  id: string;
  label: string;
  shortcut?: string;
}

interface NavigationMenuProps {
  items: NavItem[];
  activeId?: string;
  onSelect: (id: string) => void;
}

/** 左侧一级导航菜单。 */
export function NavigationMenu({ items, activeId, onSelect }: NavigationMenuProps) {
  return (
    <nav className="nav-menu">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={`nav-item ${activeId === item.id ? "nav-item--active" : ""}`}
        >
          <span className="nav-item__icon">
            {iconById[item.id] ?? <Plus size={15} />}
          </span>
          <span className="nav-item__label">{item.label}</span>
          {item.shortcut && (
            <span className="nav-item__shortcut">{item.shortcut}</span>
          )}
        </button>
      ))}
    </nav>
  );
}
