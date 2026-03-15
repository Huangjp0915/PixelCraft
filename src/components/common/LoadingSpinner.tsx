import "./LoadingSpinner.css";

interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "medium" | "large";
}

function LoadingSpinner({ message = "加载中...", size = "medium" }: LoadingSpinnerProps) {
  return (
    <div className={`loading-spinner-container ${size}`}>
      <div className="loading-spinner"></div>
      {message && <div className="loading-message">{message}</div>}
    </div>
  );
}

export default LoadingSpinner;
