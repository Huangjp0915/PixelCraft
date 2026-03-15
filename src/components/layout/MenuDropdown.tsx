import { useState, useRef, useEffect } from "react";
import "./MenuDropdown.css";

export type MenuItem = 
  | {
      label: string;
      action: () => void;
      shortcut?: string;
      disabled?: boolean;
      separator?: false;
    }
  | {
      separator: true;
    };

interface MenuDropdownProps {
  label: string;
  items: MenuItem[];
}

function MenuDropdown({ label, items }: MenuDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (item: MenuItem) => {
    if ("separator" in item && item.separator) {
      return; // 分隔符不执行任何操作
    }
    if (!("separator" in item) && !item.disabled && item.action) {
      item.action();
      setIsOpen(false);
    }
  };

  return (
    <div className="menu-dropdown" ref={menuRef}>
      <button
        className={`menu-dropdown-trigger ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {label}
      </button>
      {isOpen && (
        <div className="menu-dropdown-content">
          {items.map((item, index) => {
            if (item.separator) {
              return <div key={`separator-${index}`} className="menu-separator" />;
            }
            return (
              <button
                key={index}
                className={`menu-item ${item.disabled ? "disabled" : ""}`}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
              >
                <span className="menu-item-label">{item.label}</span>
                {item.shortcut && (
                  <span className="menu-item-shortcut">{item.shortcut}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MenuDropdown;
