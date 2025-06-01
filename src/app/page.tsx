// src/app/page.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && user.isActive) {
      // Перенаправляем авторизованного пользователя на его дашборд
      switch (user.role) {
        case UserRole.ADMIN:
          router.push("/admin");
          break;
        case UserRole.TEACHER:
          router.push("/teacher");
          break;
        case UserRole.STUDENT:
          router.push("/student");
          break;
        default:
          router.push("/login");
      }
    } else {
      // Неавторизованного пользователя перенаправляем на страницу входа
      router.push("/login");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" text="Перенаправление..." />
    </div>
  );
}
