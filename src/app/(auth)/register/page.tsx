// src/app/(auth)/register/page.tsx (Обновленная версия)

"use client";

import React, { useState } from "react";
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
import { toast } from "react-toastify"; // Обновленный импорт

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: UserRole.STUDENT,
    studentId: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { setUser } = useAuthStore();
  const registerMutation = useRegister();
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Валидация пароля
    if (formData.password !== formData.confirmPassword) {
      toast.error("Пароли не совпадают"); // Обновлено
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Пароль должен содержать минимум 8 символов"); // Обновлено
      setIsLoading(false);
      return;
    }

    try {
      const result = await registerMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        studentId: formData.studentId || undefined,
        phone: formData.phone || undefined,
      });

      if (result.isFirstUser) {
        toast.success(
          // Обновлено
          "Первый пользователь создан как Администратор! Выполняется автоматический вход..."
        );
        // Автоматически логиним первого пользователя
        try {
          await loginMutation.mutateAsync({
            email: formData.email,
            password: formData.password,
          });
          router.push("/admin");
        } catch (loginError) {
          console.error("Ошибка автоматического входа:", loginError);
          toast.info("Пожалуйста, войдите в систему"); // Обновлено
          router.push("/login");
        }
      } else {
        toast.success(
          // Обновлено
          "Регистрация успешна! Ожидайте активации вашего аккаунта администратором."
        );
        router.push("/login");
      }
    } catch (error: any) {
      toast.error(error.message || "Ошибка при регистрации"); // Обновлено
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
          <p className="text-slate-600">Регистрация в системе</p>
        </div>

        {/* Форма регистрации */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ФИО */}
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
                  placeholder="student@university.edu"
                />
              </div>
            </div>

            {/* Роль */}
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

            {/* Студенческий билет (только для студентов) */}
            {formData.role === UserRole.STUDENT && (
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

            {/* Телефон */}
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
                  <span>Зарегистрироваться</span>
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

          {/* Информация о активации */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              📝 Информация о регистрации:
            </h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>
                • Студенты и преподаватели ожидают активации администратором
              </li>
              <li>
                • Первый пользователь автоматически становится администратором
              </li>
              <li>• После активации вы получите уведомление на email</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
