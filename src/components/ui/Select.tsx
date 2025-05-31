import React from "react";
import { ChevronDown, Check } from "lucide-react";

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  variant?: "default" | "filled" | "outlined";
  size?: "sm" | "md" | "lg";
  multiple?: boolean;
  searchable?: boolean;
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

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Выберите...",
  label,
  error,
  helperText,
  disabled = false,
  fullWidth = false,
  variant = "default",
  size = "md",
  multiple = false,
  searchable = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const selectRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selectId = React.useId();
  const hasError = !!error;

  // Закрытие при клике вне компонента
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Фильтрация опций при поиске
  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchTerm) return options;

    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm, searchable]);

  // Получение выбранной опции
  const selectedOption = React.useMemo(() => {
    return options.find((option) => option.value === value);
  }, [options, value]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (searchable && !isOpen) {
        // Фокус на поле поиска при открытии
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  };

  const handleSelect = (optionValue: string | number) => {
    onChange?.(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const baseClasses =
    "relative rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  const widthClass = fullWidth ? "w-full" : "";
  const errorClass = hasError
    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
    : variantClasses[variant];

  const selectClasses = [
    baseClasses,
    errorClass,
    sizeClasses[size],
    widthClass,
    disabled ? "cursor-not-allowed" : "cursor-pointer",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={fullWidth ? "w-full" : ""}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          {label}
        </label>
      )}

      <div ref={selectRef} className="relative">
        <div
          id={selectId}
          className={selectClasses}
          onClick={handleToggle}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleToggle();
            }
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className={selectedOption ? "text-slate-900" : "text-slate-500"}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {searchable && (
              <div className="p-2 border-b border-slate-200">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Поиск..."
                  className="w-full px-3 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            <div className="py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-slate-500">
                  {searchTerm ? "Ничего не найдено" : "Нет вариантов"}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 flex items-center justify-between ${
                      option.disabled ? "opacity-50 cursor-not-allowed" : ""
                    } ${
                      option.value === value
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-900"
                    }`}
                    onClick={() => {
                      if (!option.disabled) {
                        handleSelect(option.value);
                      }
                    }}
                  >
                    <span>{option.label}</span>
                    {option.value === value && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                ))
              )}
            </div>
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

// Простой нативный Select для случаев, когда нужна простота
interface NativeSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const NativeSelect: React.FC<NativeSelectProps> = ({
  options,
  label,
  error,
  helperText,
  fullWidth = false,
  className = "",
  ...props
}) => {
  const selectId = React.useId();
  const hasError = !!error;

  const baseClasses =
    "rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm pr-10 bg-white";
  const widthClass = fullWidth ? "w-full" : "";
  const errorClass = hasError
    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
    : "border border-slate-300 focus:border-blue-500 focus:ring-blue-500";

  const selectClasses = [baseClasses, errorClass, widthClass, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={fullWidth ? "w-full" : ""}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          {label}
        </label>
      )}

      <select {...props} id={selectId} className={selectClasses}>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

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
