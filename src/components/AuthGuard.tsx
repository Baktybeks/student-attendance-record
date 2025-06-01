// src/components/AuthGuard.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useCurrentUser } from "@/services/authService";
import { UserRole } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredRole,
  allowedRoles,
  redirectTo,
}) => {
  const router = useRouter();
  const { user, setUser, clearUser } = useAuthStore();
  const { data: currentUser, isLoading, error } = useCurrentUser();

  // Быстрое перенаправление при отсутствии пользователя в Zustand
  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Синхронизация с React Query
  useEffect(() => {
    if (!isLoading) {
      if (currentUser !== undefined && currentUser !== null) {
        setUser(currentUser);
      } else {
        clearUser();
        router.push("/login");
      }
    }
  }, [currentUser, isLoading, setUser, clearUser, router]);

  // Проверка активности пользователя
  useEffect(() => {
    if (user && !user.isActive) {
      clearUser();
      router.push("/login");
    }
  }, [user, clearUser, router]);

  // Перенаправление по ролям
  useEffect(() => {
    if (user && user.isActive) {
      // Проверяем права доступа
      if (requiredRole && user.role !== requiredRole) {
        router.push(getDefaultPathForRole(user.role));
        return;
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push(getDefaultPathForRole(user.role));
        return;
      }

      // Перенаправление на дефолтный путь для роли, если указан redirectTo
      if (redirectTo) {
        router.push(redirectTo);
      }
    }
  }, [user, requiredRole, allowedRoles, redirectTo, router]);

  // Показываем загрузку
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Проверка авторизации..." />
      </div>
    );
  }

  // Если пользователь не авторизован
  if (!user || !user.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Перенаправление..." />
      </div>
    );
  }

  // Если проверки прошли успешно
  return <>{children}</>;
};

// Вспомогательная функция для получения дефолтного пути по роли
function getDefaultPathForRole(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return "/admin";
    case UserRole.TEACHER:
      return "/teacher";
    case UserRole.STUDENT:
      return "/student";
    default:
      return "/login";
  }
}

// Специализированные компоненты для разных ролей
export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <AuthGuard requiredRole={UserRole.ADMIN}>{children}</AuthGuard>;

export const TeacherGuard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <AuthGuard allowedRoles={[UserRole.ADMIN, UserRole.TEACHER]}>
    {children}
  </AuthGuard>
);

export const StudentGuard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <AuthGuard allowedRoles={[UserRole.ADMIN, UserRole.STUDENT]}>
    {children}
  </AuthGuard>
);

// Хук для автоматического перенаправления на дашборд
export const useAutoRedirect = () => {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && user.isActive) {
      const defaultPath = getDefaultPathForRole(user.role);
      router.push(defaultPath);
    }
  }, [user, router]);
};
