// src/app/admin/page.tsx (Полная версия с управлением)

"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  useAllUsers,
  useUsersByRole,
  useActivateUser,
  useDeactivateUser,
} from "@/services/authService";
import { useAllGroups } from "@/services/groupeServise";
import { useAllSubjects } from "@/services/subjectService";
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
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "react-toastify";
import { LogoutButton } from "@/components/LogoutButton";

// Импорты компонентов управления
import {
  UsersManagement,
  GroupsManagement,
  SubjectsManagement,
  ScheduleManagement,
} from "@/components/admin";

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "groups" | "subjects" | "schedule"
  >("overview");

  const { data: allUsers = [], isLoading: usersLoading } = useAllUsers();
  const { data: students = [] } = useUsersByRole(UserRole.STUDENT);
  const { data: teachers = [] } = useUsersByRole(UserRole.TEACHER);
  const { data: groups = [] } = useAllGroups();
  const { data: subjects = [] } = useAllSubjects();

  // Статистика
  const stats = {
    totalUsers: allUsers.length,
    activeUsers: allUsers.filter((u) => u.isActive).length,
    totalStudents: students.length,
    totalTeachers: teachers.length,
    totalGroups: groups.length,
    totalSubjects: subjects.length,
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
              <LogoutButton />
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
                trend={`В ${stats.totalGroups} группах`}
              />
              <StatCard
                title="Преподавателей"
                value={stats.totalTeachers}
                icon={BookOpen}
                color="bg-orange-500"
                trend={`${stats.totalSubjects} предметов`}
              />
            </div>

            {/* Дополнительная статистика */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                title="Групп"
                value={stats.totalGroups}
                icon={Users}
                color="bg-indigo-500"
                trend="Активных групп"
              />
              <StatCard
                title="Предметов"
                value={stats.totalSubjects}
                icon={BookOpen}
                color="bg-cyan-500"
                trend="В учебном плане"
              />
              <StatCard
                title="Занятий сегодня"
                value={0}
                icon={Calendar}
                color="bg-pink-500"
                trend="По расписанию"
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
                onClick={() => setActiveTab("users")}
              />
              <QuickActionCard
                title="Создать группу"
                description="Добавить новую учебную группу"
                icon={Users}
                color="bg-emerald-500"
                onClick={() => setActiveTab("groups")}
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

        {activeTab === "groups" && <GroupsManagement />}

        {activeTab === "subjects" && <SubjectsManagement />}

        {activeTab === "schedule" && <ScheduleManagement />}
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
