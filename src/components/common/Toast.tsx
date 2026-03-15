import { useEffect, useState } from "react";
import "./Toast.css";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

function Toast({ message, type = "info", duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 触发进入动画
    setTimeout(() => setIsVisible(true), 10);
    
    // 自动关闭
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // 等待退出动画完成
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast toast-${type} ${isVisible ? "toast-visible" : ""}`}>
      <div className="toast-content">
        <span className="toast-icon">
          {type === "success" && "✓"}
          {type === "error" && "×"}
          {type === "warning" && "⚠"}
          {type === "info" && "ℹ"}
        </span>
        <span className="toast-message">{message}</span>
      </div>
    </div>
  );
}

export default Toast;
