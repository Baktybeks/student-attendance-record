"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useAllUsers, useUsersByRole } from "@/services/authService";
import { UserRole, getRoleLabel } from "@/types";
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  UserCheck,
  UserX,
  TrendingUp,
  Clock,
  Shield,
  LogOut,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "groups" | "subjects" | "schedule"
  >("overview");

  const { data: allUsers = [], isLoading: usersLoading } = useAllUsers();
  const { data: students = [] } = useUsersByRole(UserRole.STUDENT);
  const { data: teachers = [] } = useUsersByRole(UserRole.TEACHER);

  const handleLogout = () => {
    logout();
    toast.success("Успешный выход из системы");
  };

  // Статистика
  const stats = {
    totalUsers: allUsers.length,
    activeUsers: allUsers.filter((u) => u.isActive).length,
    totalStudents: students.length,
    totalTeachers: teachers.length,
    pendingUsers: allUsers.filter((u) => !u.isActive).length,
  };

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
                <Shield className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-600">
                  Панель администратора
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500">
                  {getRoleLabel(user?.role!)}
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
              { key: "users", label: "Пользователи", icon: Users },
              { key: "groups", label: "Группы", icon: Users },
              { key: "subjects", label: "Предметы", icon: BookOpen },
              { key: "schedule", label: "Расписание", icon: Calendar },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === key
                    ? "border-blue-500 text-blue-600"
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
            {/* Карточки статистики */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Всего пользователей"
                value={stats.totalUsers}
                icon={Users}
                color="bg-blue-500"
                trend="+5% за месяц"
              />
              <StatCard
                title="Активных пользователей"
                value={stats.activeUsers}
                icon={UserCheck}
                color="bg-emerald-500"
                trend={`${(
                  (stats.activeUsers / stats.totalUsers) *
                  100
                ).toFixed(0)}% активности`}
              />
              <StatCard
                title="Студентов"
                value={stats.totalStudents}
                icon={GraduationCap}
                color="bg-purple-500"
                trend="В 3 группах"
              />
              <StatCard
                title="Преподавателей"
                value={stats.totalTeachers}
                icon={BookOpen}
                color="bg-orange-500"
                trend="5 предметов"
              />
            </div>

            {/* Ожидающие активации */}
            {stats.pendingUsers > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-6 h-6 text-yellow-600" />
                    <div>
                      <h3 className="text-lg font-medium text-yellow-800">
                        Ожидают активации
                      </h3>
                      <p className="text-yellow-700">
                        {stats.pendingUsers} пользователей ожидают активации
                        аккаунта
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("users")}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Просмотреть
                  </button>
                </div>
              </div>
            )}

            {/* Быстрые действия */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <QuickActionCard
                title="Добавить пользователя"
                description="Создать нового студента или преподавателя"
                icon={Plus}
                color="bg-blue-500"
                onClick={() => toast.success("Функция в разработке")}
              />
              <QuickActionCard
                title="Создать группу"
                description="Добавить новую учебную группу"
                icon={Users}
                color="bg-emerald-500"
                onClick={() => toast.success("Функция в разработке")}
              />
              <QuickActionCard
                title="Настроить расписание"
                description="Управление расписанием занятий"
                icon={Calendar}
                color="bg-purple-500"
                onClick={() => setActiveTab("schedule")}
              />
            </div>

            {/* Недавняя активность */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-medium text-slate-900 mb-4">
                Недавняя активность
              </h3>
              <div className="space-y-4">
                {[
                  {
                    action: "Новый пользователь зарегистрирован",
                    user: "Иван Петров",
                    time: "2 часа назад",
                  },
                  {
                    action: "Создана группа",
                    user: "ИТ-301",
                    time: "5 часов назад",
                  },
                  {
                    action: "Обновлено расписание",
                    user: "Математика",
                    time: "1 день назад",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {item.action}
                      </p>
                      <p className="text-sm text-slate-500">{item.user}</p>
                    </div>
                    <span className="text-xs text-slate-400">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <UsersManagement
            users={allUsers}
            isLoading={usersLoading}
            pendingCount={stats.pendingUsers}
          />
        )}

        {activeTab === "groups" && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Управление группами
            </h3>
            <p className="text-slate-600">Функция в разработке</p>
          </div>
        )}

        {activeTab === "subjects" && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Управление предметами
            </h3>
            <p className="text-slate-600">Функция в разработке</p>
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Управление расписанием
            </h3>
            <p className="text-slate-600">Функция в разработке</p>
          </div>
        )}
      </main>
    </div>
  );
}

// Компонент карточки статистики
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  trend?: string;
}

function StatCard({ title, value, icon: Icon, color, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          {trend && (
            <p className="text-sm text-slate-500 mt-1 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
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

// Компонент быстрого действия
interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  onClick: () => void;
}

function QuickActionCard({
  title,
  description,
  icon: Icon,
  color,
  onClick,
}: QuickActionCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className={`inline-flex p-3 rounded-lg ${color} mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}

// Компонент управления пользователями
interface UsersManagementProps {
  users: any[];
  isLoading: boolean;
  pendingCount: number;
}

function UsersManagement({
  users,
  isLoading,
  pendingCount,
}: UsersManagementProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600">Загрузка пользователей...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">
          Управление пользователями
        </h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Добавить пользователя</span>
        </button>
      </div>

      {pendingCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">
              {pendingCount} пользователей ожидают активации
            </span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-900">
            Все пользователи ({users.length})
          </h3>
        </div>
        <div className="divide-y divide-slate-200">
          {users.map((user) => (
            <div
              key={user.$id}
              className="px-6 py-4 flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-slate-600">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {user.name}
                  </p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.role === UserRole.ADMIN
                      ? "bg-red-100 text-red-800"
                      : user.role === UserRole.TEACHER
                      ? "bg-blue-100 text-blue-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {getRoleLabel(user.role)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {user.isActive ? (
                  <span className="flex items-center text-emerald-600">
                    <UserCheck className="w-4 h-4 mr-1" />
                    Активен
                  </span>
                ) : (
                  <span className="flex items-center text-yellow-600">
                    <UserX className="w-4 h-4 mr-1" />
                    Ожидает активации
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
