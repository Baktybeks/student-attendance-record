// src/app/(auth)/login/page.tsx (Исправленная версия)

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLogin } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types";
import { Eye, EyeOff, GraduationCap, LogIn, Mail, Lock } from "lucide-react";
import { toast } from "react-toastify";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const loginMutation = useLogin();

  // Если пользователь уже авторизован, перенаправляем его
  useEffect(() => {
    if (user && user.isActive) {
      const redirectPath = getDefaultPathForRole(user.role);
      console.log(
        "Пользователь уже авторизован, перенаправление на:",
        redirectPath
      );
      router.replace(redirectPath); // Используем replace вместо push
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Попытка входа:", email);

      const loggedInUser = await loginMutation.mutateAsync({ email, password });
      console.log("Пользователь авторизован:", loggedInUser);

      // Обновляем состояние
      setUser(loggedInUser);

      // Показываем уведомление
      toast.success(`Добро пожаловать, ${loggedInUser.name}!`);

      // Перенаправляем сразу
      const redirectPath = getDefaultPathForRole(loggedInUser.role);
      console.log("Перенаправление на:", redirectPath);
      router.replace(redirectPath); // Используем replace
    } catch (error: any) {
      console.error("Ошибка входа:", error);

      const message = error?.message || "Ошибка при входе";

      if (
        message.includes("не активирован") ||
        message.includes("not activated")
      ) {
        toast.warning("⚠️ Ваш аккаунт ожидает активации администратором", {
          position: "top-center",
          autoClose: 5000,
        });
      } else if (message.includes("Неверный") || message.includes("Invalid")) {
        toast.error("❌ Неверный email или пароль");
      } else {
        toast.error(`❌ ${message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для получения дефолтного пути по роли
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Логотип и заголовок */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4 shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            AttendTrack
          </h1>
          <p className="text-slate-600">Вход в систему учёта посещаемости</p>
        </div>

        {/* Форма входа */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email адрес
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="student@university.edu"
                />
              </div>
            </div>

            {/* Пароль */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Кнопка входа */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Войти</span>
                </>
              )}
            </button>
          </form>

          {/* Ссылка на регистрацию */}
          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Нет аккаунта?{" "}
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>

        {/* Роли системы */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-red-600 font-bold text-sm">А</span>
            </div>
            <h4 className="text-sm font-medium text-slate-700">
              Администратор
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Полное управление системой
            </p>
          </div>

          <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-bold text-sm">П</span>
            </div>
            <h4 className="text-sm font-medium text-slate-700">
              Преподаватель
            </h4>
            <p className="text-xs text-slate-500 mt-1">Отметка посещаемости</p>
          </div>

          <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-purple-600 font-bold text-sm">С</span>
            </div>
            <h4 className="text-sm font-medium text-slate-700">Студент</h4>
            <p className="text-xs text-slate-500 mt-1">Просмотр посещаемости</p>
          </div>
        </div>
      </div>
    </div>
  );
}
