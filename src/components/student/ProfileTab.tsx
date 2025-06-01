// src/components/student/ProfileTab.tsx

"use client";

import React from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  BookOpen,
  Users,
  Edit,
  Settings,
  Download,
  Bell,
  ArrowRight,
  Shield,
  FileText,
  BarChart3,
} from "lucide-react";
import { toast } from "react-toastify";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/utils/dates";
import { generateAvatarColor } from "@/utils/format";

interface ProfileTabProps {
  user: any;
  group: any;
  attendanceStats?: any;
}

export function ProfileTab({ user, group, attendanceStats }: ProfileTabProps) {
  const avatarColor = generateAvatarColor(user?.name || "");

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "edit":
        toast.info("Перенаправляем на страницу редактирования профиля...");
        break;
      case "password":
        toast.info("Смена пароля будет доступна на странице профиля");
        break;
      case "certificate":
        toast.info("Генерируем справку об обучении...");
        break;
      case "notifications":
        toast.info("Настройки уведомлений доступны на странице профиля");
        break;
      case "support":
        toast.info("Перенаправляем в службу поддержки...");
        break;
      default:
        toast.info("Функция в разработке");
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Мой профиль</h2>
        <Link href="/student/profile">
          <Button variant="primary" icon={<Edit className="w-4 h-4" />}>
            Редактировать профиль
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          {/* Личная карточка */}
          <Card padding="md">
            <div className="flex items-start space-x-6">
              <div
                className={`w-20 h-20 ${avatarColor} rounded-full flex items-center justify-center`}
              >
                <span className="text-2xl font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {user?.name}
                    </h3>
                    <p className="text-slate-600">Студент</p>
                  </div>
                  <Badge variant={user?.isActive ? "success" : "warning"}>
                    {user?.isActive ? "Активен" : "Неактивен"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-900">{user?.email}</span>
                  </div>

                  {user?.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-900">{user.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-900">
                      Регистрация: {formatDate(user?.$createdAt, "short")}
                    </span>
                  </div>

                  {user?.studentId && (
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-900 font-mono">
                        {user.studentId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Академическая информация */}
          <Card padding="md">
            <h3 className="text-lg font-medium text-slate-900 mb-4">
              Академическая информация
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Группа
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-900">
                    {group?.name || "Не назначена"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Код группы
                </label>
                <div className="mt-1">
                  <span className="text-sm text-slate-900 font-mono">
                    {group?.code || "—"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Курс
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-900">
                    {group?.course || "—"} курс
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Специальность
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-900">
                    {group?.specialization || "Не указана"}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Быстрые действия */}
          <Card padding="md">
            <h3 className="text-lg font-medium text-slate-900 mb-4">
              Быстрые действия
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleQuickAction("certificate")}
                icon={<FileText className="w-4 h-4" />}
                className="justify-start"
              >
                Скачать справку
              </Button>

              <Button
                variant="outline"
                onClick={() => handleQuickAction("password")}
                icon={<Shield className="w-4 h-4" />}
                className="justify-start"
              >
                Сменить пароль
              </Button>

              <Button
                variant="outline"
                onClick={() => handleQuickAction("notifications")}
                icon={<Bell className="w-4 h-4" />}
                className="justify-start"
              >
                Уведомления
              </Button>

              <Button
                variant="outline"
                onClick={() => handleQuickAction("support")}
                icon={<Mail className="w-4 h-4" />}
                className="justify-start"
              >
                Поддержка
              </Button>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <Link href="/student/profile">
                <Button
                  variant="primary"
                  fullWidth
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Перейти к полному профилю
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Краткая статистика */}
          {attendanceStats && (
            <Card padding="md">
              <h3 className="text-lg font-medium text-slate-900 mb-4">
                Моя успеваемость
              </h3>

              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-purple-600">
                  {Math.round(attendanceStats.attendanceRate || 0)}%
                </div>
                <div className="text-sm text-slate-500">Посещаемость</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">
                      Присутствовал
                    </span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {attendanceStats.presentCount || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">Отсутствовал</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {attendanceStats.absentCount || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">Опозданий</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {attendanceStats.lateCount || 0}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                fullWidth
                size="sm"
                className="mt-4"
                icon={<BarChart3 className="w-4 h-4" />}
                onClick={() =>
                  toast.info("Переключаемся на вкладку Посещаемость")
                }
              >
                Подробная статистика
              </Button>
            </Card>
          )}

          {/* Настройки аккаунта */}
          <Card padding="md">
            <h3 className="text-lg font-medium text-slate-900 mb-4">
              Настройки аккаунта
            </h3>

            <div className="space-y-3">
              <Link href="/student/profile">
                <Button
                  variant="outline"
                  fullWidth
                  size="sm"
                  icon={<User className="w-4 h-4" />}
                  className="justify-start"
                >
                  Личные данные
                </Button>
              </Link>

              <Button
                variant="outline"
                fullWidth
                size="sm"
                onClick={() => handleQuickAction("password")}
                icon={<Shield className="w-4 h-4" />}
                className="justify-start"
              >
                Безопасность
              </Button>

              <Button
                variant="outline"
                fullWidth
                size="sm"
                onClick={() => handleQuickAction("notifications")}
                icon={<Bell className="w-4 h-4" />}
                className="justify-start"
              >
                Уведомления
              </Button>

              <Button
                variant="outline"
                fullWidth
                size="sm"
                onClick={() => handleQuickAction("export")}
                icon={<Download className="w-4 h-4" />}
                className="justify-start"
              >
                Экспорт данных
              </Button>
            </div>
          </Card>

          {/* Информация о системе */}
          <Card padding="md">
            <h3 className="text-lg font-medium text-slate-900 mb-4">
              Информация
            </h3>

            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Версия</span>
                <span className="font-mono">1.0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Последнее обновление</span>
                <span>01.06.2025</span>
              </div>
              <div className="flex items-center justify-between">
                <span>ID пользователя</span>
                <span className="font-mono">{user?.$id?.slice(-8)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                fullWidth
                size="sm"
                onClick={() => handleQuickAction("support")}
                icon={<Mail className="w-4 h-4" />}
              >
                Связаться с поддержкой
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
