"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useStudentAttendanceStats } from "@/services/attendanceService";
import {
  AttendanceStatus,
  getAttendanceStatusLabel,
  getAttendanceStatusColor,
} from "@/types";
import {
  Calendar,
  Clock,
  BarChart3,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  LogOut,
  GraduationCap,
  MapPin,
  User,
  Award,
} from "lucide-react";
import toast from "react-hot-toast";

export default function StudentDashboard() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    "overview" | "schedule" | "attendance" | "profile"
  >("overview");

  // Получаем статистику посещаемости студента
  const { data: attendanceStats } = useStudentAttendanceStats(user?.$id || "");

  const handleLogout = () => {
    logout();
    toast.success("Успешный выход из системы");
  };

  const today = new Date();
  const currentWeekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - today.getDay() + i);
    return date;
  });

  // Мок данные для демонстрации
  const mockSchedule = [
    {
      time: "09:00 - 10:30",
      subject: "Математический анализ",
      teacher: "Иванова А.С.",
      classroom: "Аудитория 205",
      type: "Лекция",
    },
    {
      time: "10:45 - 12:15",
      subject: "Программирование",
      teacher: "Петров П.П.",
      classroom: "Аудитория 301",
      type: "Практика",
    },
    {
      time: "13:00 - 14:30",
      subject: "Физика",
      teacher: "Сидорова С.С.",
      classroom: "Аудитория 105",
      type: "Лабораторная",
    },
  ];

  const mockAttendanceHistory = [
    {
      date: "2024-01-15",
      subject: "Математический анализ",
      status: AttendanceStatus.PRESENT,
    },
    {
      date: "2024-01-15",
      subject: "Программирование",
      status: AttendanceStatus.PRESENT,
    },
    { date: "2024-01-14", subject: "Физика", status: AttendanceStatus.ABSENT },
    {
      date: "2024-01-14",
      subject: "Математический анализ",
      status: AttendanceStatus.LATE,
    },
    {
      date: "2024-01-13",
      subject: "Программирование",
      status: AttendanceStatus.PRESENT,
    },
  ];

  const attendanceRate = 85; // Процент посещаемости

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Хедер */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">
                  AttendTrack
                </span>
              </div>
              <div className="hidden md:flex items-center space-x-1 ml-8">
                <User className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-purple-600">
                  Личный кабинет
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500">
                  Студент • Группа ИТ-301
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Навигация */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { key: "overview", label: "Обзор", icon: BarChart3 },
              { key: "schedule", label: "Расписание", icon: Calendar },
              { key: "attendance", label: "Посещаемость", icon: CheckCircle },
              { key: "profile", label: "Профиль", icon: User },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === key
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Контент */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Приветствие */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-2">
                    Добро пожаловать, {user?.name?.split(" ")[0]}!
                  </h1>
                  <p className="text-purple-100">
                    Сегодня у вас {mockSchedule.length} занятия. Ваша
                    посещаемость: {attendanceRate}%
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{attendanceRate}%</div>
                  <div className="text-sm text-purple-100">Посещаемость</div>
                </div>
              </div>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Посещено занятий"
                value="42"
                icon={CheckCircle}
                color="bg-emerald-500"
                trend="+3 на этой неделе"
                trendUp={true}
              />
              <StatCard
                title="Пропущено"
                value="8"
                icon={XCircle}
                color="bg-red-500"
                trend="-1 с прошлой недели"
                trendUp={false}
              />
              <StatCard
                title="Опозданий"
                value="3"
                icon={AlertCircle}
                color="bg-orange-500"
                trend="Без изменений"
              />
              <StatCard
                title="Средний балл"
                value="4.2"
                icon={Award}
                color="bg-blue-500"
                trend="+0.2 за месяц"
                trendUp={true}
              />
            </div>

            {/* Расписание на сегодня */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-medium text-slate-900">
                  Расписание на сегодня (
                  {today.toLocaleDateString("ru-RU", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                  )
                </h3>
              </div>
              <div className="p-6">
                {mockSchedule.length > 0 ? (
                  <div className="space-y-4">
                    {mockSchedule.map((item, index) => (
                      <ScheduleItem key={index} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-slate-900 mb-2">
                      Свободный день
                    </h4>
                    <p className="text-slate-600">
                      На сегодня у вас нет занятий
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Последние отметки посещаемости */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-medium text-slate-900">
                  Недавняя посещаемость
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {mockAttendanceHistory.slice(0, 5).map((record, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-sm text-slate-500">
                          {new Date(record.date).toLocaleDateString("ru-RU")}
                        </div>
                        <div className="text-sm font-medium text-slate-900">
                          {record.subject}
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getAttendanceStatusColor(
                          record.status
                        )}`}
                      >
                        {getAttendanceStatusLabel(record.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "schedule" && (
          <ScheduleTab currentWeekDays={currentWeekDays} today={today} />
        )}

        {activeTab === "attendance" && (
          <AttendanceTab attendanceHistory={mockAttendanceHistory} />
        )}

        {activeTab === "profile" && <ProfileTab user={user} />}
      </main>
    </div>
  );
}

// Компонент карточки статистики
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  trend?: string;
  trendUp?: boolean;
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  trendUp,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {trend && (
            <p className="text-sm text-slate-500 mt-1 flex items-center">
              {trendUp !== undefined &&
                (trendUp ? (
                  <TrendingUp className="w-4 h-4 mr-1 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1 text-red-500" />
                ))}
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

// Компонент элемента расписания
interface ScheduleItemProps {
  item: {
    time: string;
    subject: string;
    teacher: string;
    classroom: string;
    type: string;
  };
}

function ScheduleItem({ item }: ScheduleItemProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="text-center">
          <div className="text-sm font-medium text-slate-900">
            {item.time.split(" - ")[0]}
          </div>
          <div className="text-xs text-slate-500">
            {item.time.split(" - ")[1]}
          </div>
        </div>
        <div className="w-px h-12 bg-slate-200"></div>
        <div>
          <h4 className="text-sm font-medium text-slate-900">{item.subject}</h4>
          <p className="text-sm text-slate-600">{item.teacher}</p>
          <div className="flex items-center space-x-2 mt-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-500">{item.classroom}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            item.type === "Лекция"
              ? "bg-blue-100 text-blue-800"
              : item.type === "Практика"
              ? "bg-emerald-100 text-emerald-800"
              : "bg-purple-100 text-purple-800"
          }`}
        >
          {item.type}
        </span>
      </div>
    </div>
  );
}

// Компонент вкладки расписания
function ScheduleTab({
  currentWeekDays,
  today,
}: {
  currentWeekDays: Date[];
  today: Date;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Расписание</h2>

      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Расписание на неделю
        </h3>
        <p className="text-slate-600">Функция в разработке</p>
      </div>
    </div>
  );
}

// Компонент вкладки посещаемости
function AttendanceTab({ attendanceHistory }: { attendanceHistory: any[] }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Моя посещаемость</h2>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-900">
            История посещений
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {attendanceHistory.map((record, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-slate-500">
                    {new Date(record.date).toLocaleDateString("ru-RU", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {record.subject}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${getAttendanceStatusColor(
                    record.status
                  )}`}
                >
                  {getAttendanceStatusLabel(record.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент вкладки профиля
function ProfileTab({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Мой профиль</h2>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-start space-x-6">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900">{user?.name}</h3>
            <p className="text-slate-600">Студент</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <p className="mt-1 text-sm text-slate-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Группа
                </label>
                <p className="mt-1 text-sm text-slate-900">ИТ-301</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Курс
                </label>
                <p className="mt-1 text-sm text-slate-900">3 курс</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Специальность
                </label>
                <p className="mt-1 text-sm text-slate-900">
                  Информационные технологии
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
