// src/app/(auth)/register/page.tsx (Обновленная версия)

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRegister, useLogin } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types";
import {
  Eye,
  EyeOff,
  GraduationCap,
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";
import { SystemStatusDebug } from "@/components/SystemStatusDebug";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: UserRole.ADMIN, // По умолчанию админ для первого пользователя
    studentId: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstUser, setIsFirstUser] = useState<boolean | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  const router = useRouter();
  const { setUser } = useAuthStore();
  const registerMutation = useRegister();
  const loginMutation = useLogin();

  // Проверяем, является ли пользователь первым в системе
  useEffect(() => {
    const checkFirstUser = async () => {
      try {
        const response = await fetch("/api/check-admins");
        if (response.ok) {
          const data = await response.json();
          const isFirst = data.isFirstUser || data.adminCount === 0;
          setIsFirstUser(isFirst);

          // Если это первый пользователь, устанавливаем роль админа
          if (isFirst) {
            setFormData((prev) => ({ ...prev, role: UserRole.ADMIN }));
          } else {
            setFormData((prev) => ({ ...prev, role: UserRole.STUDENT }));
          }
        }
      } catch (error) {
        console.error("Ошибка проверки статуса:", error);
        // Если ошибка API, предполагаем что это первый пользователь
        setIsFirstUser(true);
        setFormData((prev) => ({ ...prev, role: UserRole.ADMIN }));
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkFirstUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Валидация пароля
    if (formData.password !== formData.confirmPassword) {
      toast.error("Пароли не совпадают");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Пароль должен содержать минимум 8 символов");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Отправляем данные для регистрации:", {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        studentId: formData.studentId,
      });

      const result = await registerMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        studentId:
          !isFirstUser && formData.studentId ? formData.studentId : undefined,
        phone: !isFirstUser && formData.phone ? formData.phone : undefined,
      });

      console.log("Результат регистрации:", result);

      if (result.isFirstUser || isFirstUser) {
        console.log("Первый пользователь зарегистрирован как администратор");
        toast.success(
          "🎉 Поздравляем! Вы стали первым администратором системы. Выполняется автоматический вход...",
          { autoClose: 5000 }
        );

        // Автоматически логиним первого пользователя
        try {
          console.log("Выполняем автоматический вход...");
          const loggedInUser = await loginMutation.mutateAsync({
            email: formData.email,
            password: formData.password,
          });

          console.log("Автоматический вход выполнен успешно:", loggedInUser);
          setUser(loggedInUser);

          // Небольшая задержка для показа уведомления
          setTimeout(() => {
            router.push("/admin");
          }, 2000);
        } catch (loginError) {
          console.error("Ошибка автоматического входа:", loginError);
          toast.warning(
            "Регистрация успешна, но произошла ошибка автоматического входа. Пожалуйста, войдите вручную."
          );
          router.push("/login");
        }
      } else {
        console.log("Обычный пользователь зарегистрирован, ожидает активации");
        toast.success(
          "✅ Регистрация успешна! Ваш аккаунт ожидает активации администратором. Вы получите уведомление на email после активации.",
          { autoClose: 7000 }
        );

        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (error: any) {
      console.error("Ошибка при регистрации:", error);

      const message = error?.message || "Ошибка при регистрации";

      if (message.includes("уже существует")) {
        toast.error("📧 Пользователь с таким email уже зарегистрирован");
      } else if (message.includes("некорректные данные")) {
        toast.error("❌ Проверьте правильность введенных данных");
      } else {
        toast.error(`❌ ${message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isCheckingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Проверка состояния системы...</p>
        </div>
      </div>
    );
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
          <p className="text-slate-600">
            {isFirstUser
              ? "Создание аккаунта администратора"
              : "Регистрация в системе"}
          </p>
        </div>

        {/* Форма регистрации */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ФИО - всегда первое поле */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Полное имя
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Иванов Иван Иванович"
                />
              </div>
            </div>

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
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder={
                    isFirstUser
                      ? "admin@university.edu"
                      : "student@university.edu"
                  }
                />
              </div>
            </div>

            {/* Роль - только для не-первых пользователей */}
            {!isFirstUser && (
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Роль
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                  >
                    <option value={UserRole.STUDENT}>Студент</option>
                    <option value={UserRole.TEACHER}>Преподаватель</option>
                    <option value={UserRole.ADMIN}>Администратор</option>
                  </select>
                </div>
              </div>
            )}

            {/* Студенческий билет - только для студентов и не для первого пользователя */}
            {!isFirstUser && formData.role === UserRole.STUDENT && (
              <div>
                <label
                  htmlFor="studentId"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Номер студенческого билета
                </label>
                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="ST202401001"
                />
              </div>
            )}

            {/* Телефон - только для не-первых пользователей */}
            {!isFirstUser && (
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Телефон (необязательно)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="+996 700 123 456"
                  />
                </div>
              </div>
            )}

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
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
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

            {/* Подтверждение пароля */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Подтвердите пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-11 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Кнопка регистрации */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>
                    {isFirstUser
                      ? "Создать аккаунт администратора"
                      : "Зарегистрироваться"}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Ссылка на вход */}
          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Уже есть аккаунт?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Войти
              </Link>
            </p>
          </div>

          {/* Информация о активации - только для не-первых пользователей */}
          {!isFirstUser && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                📝 Информация о регистрации:
              </h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>
                  • Студенты и преподаватели ожидают активации администратором
                </li>
                <li>• После активации вы получите уведомление на email</li>
              </ul>
            </div>
          )}

          {/* Информация для первого пользователя */}
          {isFirstUser && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h3 className="text-sm font-medium text-green-900 mb-2">
                🎉 Первый пользователь:
              </h3>
              <ul className="text-xs text-green-800 space-y-1">
                <li>• Вы станете администратором системы с полными правами</li>
                <li>• После регистрации будет выполнен автоматический вход</li>
                <li>• Вы сможете активировать других пользователей</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Компонент отладки (только в разработке) */}
      <SystemStatusDebug />
    </div>
  );
}
