import React from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: "default" | "filled" | "outlined";
  inputSize?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  showPasswordToggle?: boolean;
}

const variantClasses = {
  default:
    "border border-slate-300 bg-white focus:border-blue-500 focus:ring-blue-500",
  filled: "border-0 bg-slate-100 focus:bg-white focus:ring-blue-500",
  outlined: "border-2 border-slate-300 bg-transparent focus:border-blue-500",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-4 py-3 text-base",
};

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = "default",
  inputSize = "md",
  fullWidth = false,
  showPasswordToggle = false,
  className = "",
  type = "text",
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [internalType, setInternalType] = React.useState(type);

  React.useEffect(() => {
    if (showPasswordToggle && type === "password") {
      setInternalType(showPassword ? "text" : "password");
    } else {
      setInternalType(type);
    }
  }, [showPassword, type, showPasswordToggle]);

  const inputId = React.useId();
  const hasError = !!error;
  const hasLeftIcon = !!leftIcon;
  const hasRightIcon = !!rightIcon || showPasswordToggle;

  const baseClasses =
    "rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const widthClass = fullWidth ? "w-full" : "";
  const errorClass = hasError
    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
    : variantClasses[variant];

  const paddingClass = `${sizeClasses[inputSize]} ${
    hasLeftIcon ? "pl-10" : ""
  } ${hasRightIcon ? "pr-10" : ""}`;

  const inputClasses = [
    baseClasses,
    errorClass,
    paddingClass,
    widthClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={fullWidth ? "w-full" : ""}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {hasLeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-slate-400">{leftIcon}</div>
          </div>
        )}

        <input
          {...props}
          id={inputId}
          type={internalType}
          className={inputClasses}
        />

        {hasRightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {showPasswordToggle && type === "password" ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            ) : (
              <div className="text-slate-400">{rightIcon}</div>
            )}
          </div>
        )}
      </div>

      {(error || helperText) && (
        <div className="mt-2">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!error && helperText && (
            <p className="text-sm text-slate-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
};

// Textarea компонент
interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: "default" | "filled" | "outlined";
  fullWidth?: boolean;
  resize?: "none" | "vertical" | "horizontal" | "both";
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  variant = "default",
  fullWidth = false,
  resize = "vertical",
  className = "",
  ...props
}) => {
  const textareaId = React.useId();
  const hasError = !!error;

  const baseClasses =
    "rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm";
  const widthClass = fullWidth ? "w-full" : "";
  const errorClass = hasError
    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
    : variantClasses[variant];
  const resizeClass = `resize-${resize}`;

  const textareaClasses = [
    baseClasses,
    errorClass,
    resizeClass,
    widthClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={fullWidth ? "w-full" : ""}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          {label}
        </label>
      )}

      <textarea {...props} id={textareaId} className={textareaClasses} />

      {(error || helperText) && (
        <div className="mt-2">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!error && helperText && (
            <p className="text-sm text-slate-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
};
