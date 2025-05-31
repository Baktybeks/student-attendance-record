import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "outline";
  size?: "sm" | "md" | "lg";
  rounded?: "sm" | "md" | "lg" | "full";
  className?: string;
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  dot?: boolean;
}

const variantClasses = {
  default: "bg-slate-100 text-slate-800 border-slate-200",
  primary: "bg-blue-100 text-blue-800 border-blue-200",
  secondary: "bg-slate-600 text-white border-slate-600",
  success: "bg-emerald-100 text-emerald-800 border-emerald-200",
  warning: "bg-orange-100 text-orange-800 border-orange-200",
  danger: "bg-red-100 text-red-800 border-red-200",
  info: "bg-cyan-100 text-cyan-800 border-cyan-200",
  outline: "bg-transparent text-slate-700 border-slate-300",
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

const roundedClasses = {
  sm: "rounded",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  rounded = "md",
  className = "",
  icon,
  removable = false,
  onRemove,
  dot = false,
}) => {
  const baseClasses =
    "inline-flex items-center font-medium border transition-colors";

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    roundedClasses[rounded],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      {dot && (
        <span
          className={`w-2 h-2 rounded-full mr-1.5 ${
            variant === "default"
              ? "bg-slate-400"
              : variant === "primary"
              ? "bg-blue-500"
              : variant === "secondary"
              ? "bg-slate-400"
              : variant === "success"
              ? "bg-emerald-500"
              : variant === "warning"
              ? "bg-orange-500"
              : variant === "danger"
              ? "bg-red-500"
              : variant === "info"
              ? "bg-cyan-500"
              : "bg-slate-400"
          }`}
        />
      )}

      {icon && !dot && <span className="mr-1">{icon}</span>}

      {children}

      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
          type="button"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

// Компонент для статуса с точкой
export const StatusBadge: React.FC<{
  status: "active" | "inactive" | "pending" | "error";
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}> = ({ status, children, size = "md" }) => {
  const statusConfig = {
    active: { variant: "success" as const, dot: true },
    inactive: { variant: "default" as const, dot: true },
    pending: { variant: "warning" as const, dot: true },
    error: { variant: "danger" as const, dot: true },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} size={size} dot={config.dot} rounded="full">
      {children}
    </Badge>
  );
};

// Компонент для счетчика уведомлений
export const NotificationBadge: React.FC<{
  count: number;
  max?: number;
  showZero?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "danger";
}> = ({
  count,
  max = 99,
  showZero = false,
  size = "sm",
  variant = "danger",
}) => {
  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <Badge
      variant={variant}
      size={size}
      rounded="full"
      className="min-w-[1.25rem] justify-center"
    >
      {displayCount}
    </Badge>
  );
};

// Компонент для отображения процентов
export const PercentageBadge: React.FC<{
  percentage: number;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}> = ({ percentage, size = "md", showIcon = false }) => {
  const getVariant = (percent: number) => {
    if (percent >= 90) return "success";
    if (percent >= 70) return "primary";
    if (percent >= 50) return "warning";
    return "danger";
  };

  const getIcon = (percent: number) => {
    if (percent >= 70) {
      return (
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      );
    }
    return (
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
        />
      </svg>
    );
  };

  return (
    <Badge
      variant={getVariant(percentage)}
      size={size}
      icon={showIcon ? getIcon(percentage) : undefined}
      rounded="md"
    >
      {percentage.toFixed(0)}%
    </Badge>
  );
};
