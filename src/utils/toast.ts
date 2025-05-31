import toast, { ToastOptions } from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import React from "react";

// Расширенные опции для toast
interface ExtendedToastOptions extends ToastOptions {
  description?: string;
}

// Базовые стили для разных типов уведомлений
const getToastStyles = (type: "success" | "error" | "warning" | "info") => {
  const baseStyles = {
    borderRadius: "8px",
    border: "1px solid",
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    maxWidth: "400px",
  };

  const typeStyles = {
    success: {
      backgroundColor: "#f0fdf4",
      borderColor: "#bbf7d0",
      color: "#15803d",
    },
    error: {
      backgroundColor: "#fef2f2",
      borderColor: "#fecaca",
      color: "#dc2626",
    },
    warning: {
      backgroundColor: "#fffbeb",
      borderColor: "#fed7aa",
      color: "#d97706",
    },
    info: {
      backgroundColor: "#eff6ff",
      borderColor: "#bfdbfe",
      color: "#2563eb",
    },
  };

  return {
    ...baseStyles,
    ...typeStyles[type],
  };
};

// Кастомные компоненты для toast
const createToastComponent = (
  type: "success" | "error" | "warning" | "info",
  message: string,
  description?: string
) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = icons[type];

  return React.createElement(
    "div",
    { style: getToastStyles(type) },
    React.createElement(Icon, { size: 18 }),
    React.createElement(
      "div",
      null,
      React.createElement("div", null, message),
      description &&
        React.createElement(
          "div",
          {
            style: {
              fontSize: "12px",
              opacity: 0.8,
              marginTop: "2px",
            },
          },
          description
        )
    )
  );
};

// Расширенный объект toast
export const Toast = {
  // Базовые методы из react-hot-toast
  success: (message: string, options?: ExtendedToastOptions) => {
    if (options?.description) {
      return toast.custom(
        createToastComponent("success", message, options.description),
        options
      );
    }
    return toast.success(message, options);
  },

  error: (message: string, options?: ExtendedToastOptions) => {
    if (options?.description) {
      return toast.custom(
        createToastComponent("error", message, options.description),
        options
      );
    }
    return toast.error(message, options);
  },

  // Новые методы
  info: (message: string, options?: ExtendedToastOptions) => {
    if (options?.description) {
      return toast.custom(
        createToastComponent("info", message, options.description),
        options
      );
    }
    return toast.custom(createToastComponent("info", message), {
      duration: 4000,
      ...options,
    });
  },

  warning: (message: string, options?: ExtendedToastOptions) => {
    if (options?.description) {
      return toast.custom(
        createToastComponent("warning", message, options.description),
        options
      );
    }
    return toast.custom(createToastComponent("warning", message), {
      duration: 4000,
      ...options,
    });
  },

  // Специальные методы
  loading: (message: string, options?: ToastOptions) => {
    return toast.loading(message, options);
  },

  promise: toast.promise,
  custom: toast.custom,
  dismiss: toast.dismiss,
  remove: toast.remove,

  // Утилиты
  dismissAll: () => toast.dismiss(),

  // Методы с иконками
  checkmark: (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      icon: "✅",
      ...options,
    });
  },

  rocket: (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      icon: "🚀",
      ...options,
    });
  },

  fire: (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      icon: "🔥",
      ...options,
    });
  },

  // Методы для конкретных действий
  saved: (message: string = "Данные сохранены", options?: ToastOptions) => {
    return Toast.success(message, {
      icon: "💾",
      duration: 2000,
      ...options,
    });
  },

  deleted: (message: string = "Успешно удалено", options?: ToastOptions) => {
    return Toast.success(message, {
      icon: "🗑️",
      duration: 2000,
      ...options,
    });
  },

  copied: (
    message: string = "Скопировано в буфер обмена",
    options?: ToastOptions
  ) => {
    return Toast.success(message, {
      icon: "📋",
      duration: 1500,
      ...options,
    });
  },

  uploaded: (message: string = "Файл загружен", options?: ToastOptions) => {
    return Toast.success(message, {
      icon: "📤",
      duration: 2000,
      ...options,
    });
  },

  networkError: (options?: ToastOptions) => {
    return Toast.error("Ошибка сети. Проверьте подключение к интернету.", {
      icon: "🌐",
      duration: 5000,
      ...options,
    });
  },

  unauthorized: (options?: ToastOptions) => {
    return Toast.error("Необходимо войти в систему", {
      icon: "🔐",
      duration: 4000,
      ...options,
    });
  },

  forbidden: (options?: ToastOptions) => {
    return Toast.error("У вас нет прав для выполнения этого действия", {
      icon: "🚫",
      duration: 4000,
      ...options,
    });
  },

  // Промисы с предустановленными сообщениями
  promiseSave: <T>(
    promise: Promise<T>,
    messages?: {
      loading?: string;
      success?: string;
      error?: string;
    }
  ) => {
    return toast.promise(promise, {
      loading: messages?.loading || "Сохранение...",
      success: messages?.success || "Успешно сохранено!",
      error: messages?.error || "Ошибка при сохранении",
    });
  },

  promiseDelete: <T>(
    promise: Promise<T>,
    messages?: {
      loading?: string;
      success?: string;
      error?: string;
    }
  ) => {
    return toast.promise(promise, {
      loading: messages?.loading || "Удаление...",
      success: messages?.success || "Успешно удалено!",
      error: messages?.error || "Ошибка при удалении",
    });
  },

  promiseUpload: <T>(
    promise: Promise<T>,
    messages?: {
      loading?: string;
      success?: string;
      error?: string;
    }
  ) => {
    return toast.promise(promise, {
      loading: messages?.loading || "Загрузка файла...",
      success: messages?.success || "Файл загружен!",
      error: messages?.error || "Ошибка загрузки файла",
    });
  },
};

// Экспортируем как дефолтный toast для обратной совместимости
export default Toast;

// Также экспортируем оригинальный toast для особых случаев
export { toast as originalToast };
