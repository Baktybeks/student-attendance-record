// src/hooks/useAuth.ts (Исправленная версия с перенаправлением)

import { useAuthStore } from "@/store/authStore";
import {
  useCurrentUser,
  useLogin,
  useLogout,
  useRegister,
} from "@/services/authService";
import { usePermissions } from "@/utils/permissions";
import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation"; // Добавляем импорт
import { toast } from "react-toastify";
import { UserRole } from "@/types";

// Типы для хука
interface AuthHookReturn {
  // Состояние пользователя
  user: any;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isActive: boolean;

  // Действия аутентификации
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    studentId?: string,
    phone?: string
  ) => Promise<any>;
  clearError: () => void;

  // Статусы операций
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  isRegistering: boolean;
  isCheckingAuth: boolean;

  // Проверки ролей
  isSuper: boolean;
  isManager: boolean;
  isTechnician: boolean;
  isRequester: boolean;

  // Проверки прав доступа
  canManageUsers: boolean;
  canManageRequests: boolean;
  canAssignTechnicians: boolean;
  canViewAllRequests: boolean;
  canCreateRequests: boolean;
  canUpdateRequestStatus: boolean;
}

// Функция-помощник для безопасной проверки типа
const isNotActivatedUser = (user: any): user is { notActivated: true } => {
  return (
    user !== null &&
    user !== undefined &&
    typeof user === "object" &&
    "notActivated" in user
  );
};

const isValidUser = (user: any): boolean => {
  return (
    user !== null &&
    user !== undefined &&
    typeof user === "object" &&
    !("notActivated" in user)
  );
};

export function useAuth(): AuthHookReturn {
  const { user, setUser, clearUser } = useAuthStore();
  const router = useRouter(); // Добавляем router

  // React Query хуки
  const {
    data: currentUser,
    isLoading: isCheckingAuth,
    error: authError,
    refetch: refetchCurrentUser,
  } = useCurrentUser();

  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const registerMutation = useRegister();
  const permissions = usePermissions();

  // Безопасная синхронизация состояния Zustand с React Query
  useEffect(() => {
    try {
      // Проверяем, что currentUser определен и является объектом
      if (currentUser !== undefined && isValidUser(currentUser)) {
        setUser(currentUser);
      } else if (
        currentUser === null ||
        currentUser === undefined ||
        isNotActivatedUser(currentUser)
      ) {
        clearUser();
      }
    } catch (error) {
      console.error("Ошибка при синхронизации пользователя:", error);
      clearUser();
    }
  }, [currentUser, setUser, clearUser]);

  // Мемоизированные функции для компонентов
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const user = await loginMutation.mutateAsync({ email, password });
        setUser(user);
        return user;
      } catch (error: any) {
        clearUser();

        // Обработка специфичных ошибок входа
        const message = error?.message || "Неизвестная ошибка при входе";

        if (
          message.includes("не активирован") ||
          message.includes("not activated")
        ) {
          // Не показываем toast для неактивированных аккаунтов,
          // это обрабатывается в компоненте
        } else if (
          message.includes("Неверный") ||
          message.includes("Invalid")
        ) {
          toast.error("❌ Неверный email или пароль", {
            position: "top-center",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else {
          toast.error(`❌ ${message}`, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }

        throw error;
      }
    },
    [loginMutation, setUser, clearUser]
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
      clearUser();

      // Перенаправляем на страницу входа
      router.push("/login");

      toast.success("👋 Вы успешно вышли из системы", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error: any) {
      // Даже при ошибке очищаем локальное состояние и перенаправляем
      clearUser();
      router.push("/login");

      console.warn("Ошибка при выходе, но сессия очищена:", error);
      toast.warning("⚠️ Произошла ошибка при выходе, но сессия очищена", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [logoutMutation, clearUser, router]);

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role: UserRole,
      studentId?: string,
      phone?: string
    ) => {
      try {
        const result = await registerMutation.mutateAsync({
          name,
          email,
          password,
          role,
          studentId,
          phone,
        });

        // Если первый пользователь (супер-админ), автоматически авторизуем
        if (result.isFirstUser) {
          setUser(result.user);
        }

        return result;
      } catch (error: any) {
        // Детализированная обработка ошибок регистрации
        const message = error?.message || "Неизвестная ошибка при регистрации";

        if (
          message.includes("уже существует") ||
          message.includes("already exists")
        ) {
          toast.error("📧 Пользователь с таким email уже зарегистрирован", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else if (message.includes("пароль") || message.includes("password")) {
          toast.error("🔒 Пароль должен содержать минимум 8 символов", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else if (message.includes("email") || message.includes("Email")) {
          toast.error("📧 Некорректный формат email адреса", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else {
          toast.error(`❌ Ошибка регистрации: ${message}`, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }

        throw error;
      }
    },
    [registerMutation, setUser]
  );

  const clearError = useCallback(() => {
    // Сбрасываем ошибки мутаций, если нужно
    loginMutation.reset();
    logoutMutation.reset();
    registerMutation.reset();
  }, [loginMutation, logoutMutation, registerMutation]);

  // Обработка ошибок аутентификации
  useEffect(() => {
    if (authError && !isCheckingAuth) {
      console.error("Ошибка аутентификации:", authError);

      // Показываем toast только при серьезных ошибках
      if (authError.message && !authError.message.includes("401")) {
        toast.error("🔐 Проблема с аутентификацией. Попробуйте войти заново", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  }, [authError, isCheckingAuth]);

  // Вычисляемые свойства состояния
  const isAuthenticated = !!user;
  const isActive = user?.isActive === true;
  const loading =
    isCheckingAuth ||
    loginMutation.isPending ||
    logoutMutation.isPending ||
    registerMutation.isPending;

  // Объединенные ошибки
  const error =
    authError?.message ||
    loginMutation.error?.message ||
    logoutMutation.error?.message ||
    registerMutation.error?.message ||
    null;

  // Проверки ролей
  const isSuper = user?.role === UserRole.ADMIN;
  const isManager = user?.role === UserRole.TEACHER;
  const isTechnician = user?.role === UserRole.TEACHER;
  const isRequester = user?.role === UserRole.STUDENT;

  return {
    // Состояние пользователя
    user,
    loading,
    error,
    isAuthenticated,
    isActive,

    // Действия аутентификации
    login,
    logout,
    register,
    clearError,

    // Статусы операций
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isRegistering: registerMutation.isPending,
    isCheckingAuth,

    // Проверки ролей (адаптированы для системы посещаемости)
    isSuper,
    isManager,
    isTechnician,
    isRequester,

    // Проверки прав доступа (из usePermissions)
    canManageUsers: permissions.canManageUsers,
    canManageRequests: permissions.canCreateClasses,
    canAssignTechnicians: permissions.canAssignTeachers,
    canViewAllRequests: permissions.canViewAllAttendance,
    canCreateRequests: permissions.canCreateClasses,
    canUpdateRequestStatus: permissions.canUpdateAttendance,
  };
}

// Дополнительные хуки для удобства

// Хук для проверки конкретной роли
export function useRole(requiredRole: UserRole): boolean {
  const { user } = useAuth();
  return user?.role === requiredRole;
}

// Хук для проверки нескольких ролей
export function useRoles(allowedRoles: UserRole[]): boolean {
  const { user } = useAuth();
  return user ? allowedRoles.includes(user.role) : false;
}

// Хук для защищенных действий
export function useProtectedAction(
  requiredPermission: keyof ReturnType<typeof usePermissions>
) {
  const permissions = usePermissions();

  return useCallback(
    (action: () => void | Promise<void>) => {
      if (permissions[requiredPermission]) {
        return action();
      } else {
        toast.error("❌ У вас нет прав для выполнения этого действия", {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    },
    [permissions, requiredPermission]
  );
}

// Хук для автообновления токена
export function useAuthRefresh() {
  const { data: currentUser, refetch: refetchCurrentUser } = useCurrentUser();

  useEffect(() => {
    // Проверяем сессию каждые 15 минут
    const interval = setInterval(() => {
      refetchCurrentUser();
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refetchCurrentUser]);
}

// Хук для отслеживания времени неактивности
export function useIdleTimer(
  onIdle: () => void,
  timeoutMs: number = 30 * 60 * 1000
) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(onIdle, timeoutMs);
    };

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    // Устанавливаем начальный таймер
    resetTimer();

    // Добавляем слушатели событий
    events.forEach((event) => {
      document.addEventListener(event, resetTimer, true);
    });

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [isAuthenticated, onIdle, timeoutMs]);
}

// Хук для уведомлений о статусе аутентификации
export function useAuthNotifications() {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Проверяем, что мы в браузере
    if (typeof window === "undefined") return;

    if (isAuthenticated && user) {
      // Уведомление при успешном входе (только при первой загрузке)
      const hasShownWelcome = sessionStorage.getItem("auth_welcome_shown");
      if (!hasShownWelcome) {
        toast.success(`Добро пожаловать, ${user.name}!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        sessionStorage.setItem("auth_welcome_shown", "true");
      }
    } else {
      // Очищаем флаг при выходе
      sessionStorage.removeItem("auth_welcome_shown");
    }
  }, [isAuthenticated, user]);
}
