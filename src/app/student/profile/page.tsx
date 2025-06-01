// src/app/student/profile/page.tsx (Полная версия)

"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useGroupById } from "@/services/groupeServise";
import { useSubjectsForGroup } from "@/services/subjectService";
import { useStudentAttendanceStats } from "@/services/attendanceService";
import { useUpdateUserProfile } from "@/services/authService";
import {
  User,
  Edit,
  Save,
  X,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  BookOpen,
  Award,
  Settings,
  Download,
  Bell,
  Shield,
  Camera,
  MapPin,
  Clock,
  BarChart3,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Users,
  Key,
  FileText,
  HelpCircle,
  Smartphone,
  Monitor,
  Globe,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/utils/dates";
import { formatPercentage, generateAvatarColor } from "@/utils/format";

export default function StudentProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] =
    useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Получаем данные
  const { data: group } = useGroupById(user?.groupId || "");
  const { data: subjects = [] } = useSubjectsForGroup(user?.groupId || "");
  const { data: attendanceStats } = useStudentAttendanceStats(user?.$id || "");
  const updateProfileMutation = useUpdateUserProfile();

  // Состояние формы редактирования
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    studentId: user?.studentId || "",
  });

  // Состояние смены пароля
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Настройки уведомлений
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    scheduleChanges: true,
    attendanceReports: true,
    gradeUpdates: true,
    weeklyReports: false,
    systemUpdates: true,
  });

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const updatedUser = await updateProfileMutation.mutateAsync({
        userId: user.$id,
        updates: editForm,
      });

      setUser(updatedUser);
      setIsEditing(false);
      toast.success("✅ Профиль успешно обновлен");
    } catch (error: any) {
      toast.error(`❌ Ошибка обновления профиля: ${error.message}`);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("❌ Пароли не совпадают");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("❌ Пароль должен содержать минимум 8 символов");
      return;
    }

    try {
      // В реальном приложении здесь будет вызов API для смены пароля
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Имитация запроса
      toast.success("✅ Пароль успешно изменен");
      setShowChangePasswordModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(`❌ Ошибка смены пароля: ${error.message}`);
    }
  };

  const handleDownloadData = () => {
    // Генерация и скачивание данных студента
    const data = {
      profile: {
        name: user?.name,
        email: user?.email,
        studentId: user?.studentId,
        phone: user?.phone,
        registrationDate: user?.$createdAt,
      },
      academic: {
        group: group?.name,
        groupCode: group?.code,
        course: group?.course,
        specialization: group?.specialization,
        subjects: subjects.map((s) => ({ name: s.name, code: s.code })),
      },
      attendance: attendanceStats,
      exportDate: new Date().toISOString(),
      version: "1.0.0",
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `student_data_${user?.studentId || user?.$id?.slice(-6)}_${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("📥 Данные экспортированы");
  };

  const handleDownloadCertificate = () => {
    // Имитация скачивания справки
    toast.info("📄 Генерируем справку об обучении...");
    setTimeout(() => {
      toast.success("✅ Справка готова к скачиванию");
    }, 2000);
  };

  const handleContactSupport = () => {
    // Имитация обращения в поддержку
    toast.info("📧 Перенаправляем в службу поддержки...");
  };

  const avatarColor = generateAvatarColor(user?.name || "");

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Навигация */}
        <div className="mb-6">
          <Link
            href="/student"
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Назад к дашборду
          </Link>
        </div>

        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Мой профиль</h1>
              <p className="text-slate-600 mt-1">
                Управляйте своими личными данными и настройками аккаунта
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowNotificationSettings(true)}
                icon={<Bell className="w-4 h-4" />}
              >
                Уведомления
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadData}
                icon={<Download className="w-4 h-4" />}
              >
                Экспорт данных
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowHelpModal(true)}
                icon={<HelpCircle className="w-4 h-4" />}
              >
                Помощь
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-6">
            {/* Личные данные */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Личная информация</CardTitle>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      icon={<Edit className="w-4 h-4" />}
                    >
                      Редактировать
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({
                            name: user?.name || "",
                            phone: user?.phone || "",
                            studentId: user?.studentId || "",
                          });
                        }}
                        icon={<X className="w-4 h-4" />}
                      >
                        Отмена
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveProfile}
                        loading={updateProfileMutation.isPending}
                        icon={<Save className="w-4 h-4" />}
                      >
                        Сохранить
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-6">
                  {/* Аватар */}
                  <div className="relative">
                    <div
                      className={`w-24 h-24 ${avatarColor} rounded-full flex items-center justify-center`}
                    >
                      <span className="text-3xl font-bold text-white">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <button
                      className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-slate-200 hover:bg-slate-50 transition-colors"
                      onClick={() =>
                        toast.info(
                          "Загрузка аватара будет доступна в следующем обновлении"
                        )
                      }
                    >
                      <Camera className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>

                  {/* Информация */}
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {isEditing ? (
                        <>
                          <Input
                            label="Полное имя"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            required
                          />
                          <Input
                            label="Номер студенческого билета"
                            value={editForm.studentId}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                studentId: e.target.value,
                              })
                            }
                            placeholder="ST202401001"
                          />
                          <Input
                            label="Телефон"
                            value={editForm.phone}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                phone: e.target.value,
                              })
                            }
                            placeholder="+996 700 123 456"
                          />
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-slate-700">
                              Полное имя
                            </label>
                            <div className="mt-1 flex items-center space-x-2">
                              <User className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-900">
                                {user?.name}
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700">
                              Email
                            </label>
                            <div className="mt-1 flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-900">
                                {user?.email}
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700">
                              Студенческий билет
                            </label>
                            <div className="mt-1">
                              <span className="text-sm text-slate-900 font-mono">
                                {user?.studentId || "Не указан"}
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700">
                              Телефон
                            </label>
                            <div className="mt-1 flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-900">
                                {user?.phone || "Не указан"}
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700">
                              Дата регистрации
                            </label>
                            <div className="mt-1 flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-900">
                                {formatDate(user?.$createdAt!, "long")}
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700">
                              Статус аккаунта
                            </label>
                            <div className="mt-1">
                              <Badge
                                variant={user?.isActive ? "success" : "warning"}
                              >
                                {user?.isActive ? "Активен" : "Неактивен"}
                              </Badge>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Академическая информация */}
            <Card>
              <CardHeader>
                <CardTitle>Академическая информация</CardTitle>
              </CardHeader>
              <CardContent>
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

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Изучаемых предметов
                    </label>
                    <div className="mt-1">
                      <span className="text-sm text-slate-900">
                        {subjects.length}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Одногруппников
                    </label>
                    <div className="mt-1">
                      <span className="text-sm text-slate-900">
                        {(group?.studentsCount || 1) - 1} человек
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Безопасность */}
            <Card>
              <CardHeader>
                <CardTitle>Безопасность и конфиденциальность</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-slate-900">
                        Пароль
                      </h4>
                      <p className="text-sm text-slate-500">
                        Последнее изменение:{" "}
                        {formatDate(user?.$updatedAt!, "short")}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowChangePasswordModal(true)}
                      icon={<Key className="w-4 h-4" />}
                    >
                      Изменить пароль
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-slate-900">
                        Двухфакторная аутентификация
                      </h4>
                      <p className="text-sm text-slate-500">
                        Дополнительная защита аккаунта
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toast.info(
                          "🔐 2FA будет доступна в следующем обновлении"
                        )
                      }
                      icon={<Shield className="w-4 h-4" />}
                    >
                      Настроить
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-slate-900">
                        История входов
                      </h4>
                      <p className="text-sm text-slate-500">
                        Просмотр активности аккаунта
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toast.info(
                          "📊 История входов будет доступна в следующем обновлении"
                        )
                      }
                      icon={<Monitor className="w-4 h-4" />}
                    >
                      Просмотреть
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Статистика посещаемости */}
            <Card>
              <CardHeader>
                <CardTitle>Моя успеваемость</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {Math.round(attendanceStats?.attendanceRate || 0)}%
                    </div>
                    <div className="text-sm text-slate-500">Посещаемость</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm text-slate-600">
                          Присутствовал
                        </span>
                      </div>
                      <span className="text-sm font-medium text-slate-900">
                        {attendanceStats?.presentCount || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <X className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-slate-600">
                          Отсутствовал
                        </span>
                      </div>
                      <span className="text-sm font-medium text-slate-900">
                        {attendanceStats?.absentCount || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-slate-600">
                          Опозданий
                        </span>
                      </div>
                      <span className="text-sm font-medium text-slate-900">
                        {attendanceStats?.lateCount || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-slate-600">
                          Уважительных
                        </span>
                      </div>
                      <span className="text-sm font-medium text-slate-900">
                        {attendanceStats?.excusedCount || 0}
                      </span>
                    </div>
                  </div>

                  <Link href="/student">
                    <Button
                      variant="outline"
                      fullWidth
                      size="sm"
                      icon={<BarChart3 className="w-4 h-4" />}
                    >
                      Подробная статистика
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Быстрые действия */}
            <Card>
              <CardHeader>
                <CardTitle>Быстрые действия</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    fullWidth
                    size="sm"
                    onClick={handleDownloadCertificate}
                    icon={<FileText className="w-4 h-4" />}
                  >
                    Скачать справку об обучении
                  </Button>

                  <Link href="/student">
                    <Button
                      variant="outline"
                      fullWidth
                      size="sm"
                      icon={<Calendar className="w-4 h-4" />}
                    >
                      Посмотреть расписание
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    fullWidth
                    size="sm"
                    onClick={() => setShowNotificationSettings(true)}
                    icon={<Bell className="w-4 h-4" />}
                  >
                    Настройки уведомлений
                  </Button>

                  <Button
                    variant="outline"
                    fullWidth
                    size="sm"
                    onClick={handleContactSupport}
                    icon={<Mail className="w-4 h-4" />}
                  >
                    Связаться с поддержкой
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Информация о системе */}
            <Card>
              <CardHeader>
                <CardTitle>О системе</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Версия системы</span>
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
                  <div className="flex items-center justify-between">
                    <span>Тип устройства</span>
                    <span>Веб-браузер</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Модальное окно смены пароля */}
        <Modal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
          title="Изменить пароль"
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Текущий пароль"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  currentPassword: e.target.value,
                })
              }
              showPasswordToggle
            />

            <Input
              label="Новый пароль"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })
              }
              showPasswordToggle
              helperText="Минимум 8 символов, включая заглавные и строчные буквы, цифры"
            />

            <Input
              label="Подтвердите новый пароль"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  confirmPassword: e.target.value,
                })
              }
              showPasswordToggle
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowChangePasswordModal(false)}
              >
                Отмена
              </Button>
              <Button
                variant="primary"
                onClick={handleChangePassword}
                icon={<Key className="w-4 h-4" />}
              >
                Изменить пароль
              </Button>
            </div>
          </div>
        </Modal>

        {/* Модальное окно настроек уведомлений */}
        <Modal
          isOpen={showNotificationSettings}
          onClose={() => setShowNotificationSettings(false)}
          title="Настройки уведомлений"
          size="md"
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">
                Способы доставки
              </h3>
              <div className="space-y-3">
                {[
                  {
                    key: "email",
                    label: "Email уведомления",
                    desc: "Получать уведомления на почту",
                    icon: <Mail className="w-4 h-4" />,
                  },
                  {
                    key: "sms",
                    label: "SMS уведомления",
                    desc: "Получать SMS на телефон",
                    icon: <Smartphone className="w-4 h-4" />,
                  },
                  {
                    key: "push",
                    label: "Push уведомления",
                    desc: "Уведомления в браузере",
                    icon: <Globe className="w-4 h-4" />,
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {item.label}
                        </div>
                        <div className="text-sm text-slate-500">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={
                        notifications[item.key as keyof typeof notifications]
                      }
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          [item.key]: e.target.checked,
                        })
                      }
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">
                Типы уведомлений
              </h3>
              <div className="space-y-3">
                {[
                  { key: "scheduleChanges", label: "Изменения в расписании" },
                  { key: "attendanceReports", label: "Отчеты о посещаемости" },
                  { key: "gradeUpdates", label: "Обновления оценок" },
                  { key: "weeklyReports", label: "Еженедельные отчеты" },
                  { key: "systemUpdates", label: "Обновления системы" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between"
                  >
                    <div className="text-sm font-medium text-slate-900">
                      {item.label}
                    </div>
                    <input
                      type="checkbox"
                      checked={
                        notifications[item.key as keyof typeof notifications]
                      }
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          [item.key]: e.target.checked,
                        })
                      }
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => setShowNotificationSettings(false)}
              >
                Отмена
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  toast.success("✅ Настройки уведомлений сохранены");
                  setShowNotificationSettings(false);
                }}
                icon={<Save className="w-4 h-4" />}
              >
                Сохранить
              </Button>
            </div>
          </div>
        </Modal>

        {/* Модальное окно помощи */}
        <Modal
          isOpen={showHelpModal}
          onClose={() => setShowHelpModal(false)}
          title="Помощь и поддержка"
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">
                Часто задаваемые вопросы
              </h3>
              <div className="space-y-4">
                <details className="group">
                  <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-slate-50 p-4 text-slate-900">
                    <h5 className="font-medium">Как изменить личные данные?</h5>
                    <div className="ml-1.5 flex h-5 w-5 flex-shrink-0 items-center justify-center">
                      <svg
                        className="block h-5 w-5 group-open:hidden"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <svg
                        className="hidden h-5 w-5 group-open:block"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20 12H4"
                        />
                      </svg>
                    </div>
                  </summary>
                  <div className="mt-4 px-4 pb-4">
                    <p className="text-sm text-slate-600">
                      Нажмите кнопку "Редактировать" в разделе "Личная
                      информация", внесите изменения и сохраните их.
                    </p>
                  </div>
                </details>

                <details className="group">
                  <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-slate-50 p-4 text-slate-900">
                    <h5 className="font-medium">
                      Как посмотреть свою посещаемость?
                    </h5>
                    <div className="ml-1.5 flex h-5 w-5 flex-shrink-0 items-center justify-center">
                      <svg
                        className="block h-5 w-5 group-open:hidden"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <svg
                        className="hidden h-5 w-5 group-open:block"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20 12H4"
                        />
                      </svg>
                    </div>
                  </summary>
                  <div className="mt-4 px-4 pb-4">
                    <p className="text-sm text-slate-600">
                      Перейдите на главную страницу и выберите вкладку
                      "Посещаемость" для просмотра детальной статистики.
                    </p>
                  </div>
                </details>

                <details className="group">
                  <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-slate-50 p-4 text-slate-900">
                    <h5 className="font-medium">
                      Как скачать справку об обучении?
                    </h5>
                    <div className="ml-1.5 flex h-5 w-5 flex-shrink-0 items-center justify-center">
                      <svg
                        className="block h-5 w-5 group-open:hidden"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <svg
                        className="hidden h-5 w-5 group-open:block"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20 12H4"
                        />
                      </svg>
                    </div>
                  </summary>
                  <div className="mt-4 px-4 pb-4">
                    <p className="text-sm text-slate-600">
                      Нажмите кнопку "Скачать справку об обучении" в разделе
                      "Быстрые действия".
                    </p>
                  </div>
                </details>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">
                Контактная информация
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    support@attendtrack.edu
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    +996 (555) 123-456
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    Пн-Пт: 9:00 - 18:00
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={handleContactSupport}
                icon={<Mail className="w-4 h-4" />}
              >
                Написать в поддержку
              </Button>
              <Button variant="primary" onClick={() => setShowHelpModal(false)}>
                Понятно
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
