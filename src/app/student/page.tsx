// src/app/student/page.tsx (Финальная версия)

"use client";

import React, { useState, useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  useStudentAttendanceStats,
  useStudentAttendance,
} from "@/services/attendanceService";
import { useSubjectsForGroup } from "@/services/subjectService";
import { useGroupById } from "@/services/groupeServise";
import { useUsersByRole } from "@/services/authService";
import { UserRole, WeekDay } from "@/types";
import {
  Calendar,
  BarChart3,
  CheckCircle,
  User,
  GraduationCap,
} from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { getWeekDates, getWeekDayFromDate } from "@/utils/dates";
import { getScheduleBySpecialization } from "@/data/mockSchedule";

// Импортируем компоненты вкладок
import { OverviewTab } from "@/components/student/OverviewTab";
import { ScheduleTab } from "@/components/student/ScheduleTab";
import { AttendanceTab } from "@/components/student/AttendanceTab";
import { ProfileTab } from "@/components/student/ProfileTab";

type TabType = "overview" | "schedule" | "attendance" | "profile";

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Получаем данные студента
  const { data: group } = useGroupById(user?.groupId || "");
  const { data: subjects = [] } = useSubjectsForGroup(user?.groupId || "");
  const { data: teachers = [] } = useUsersByRole(UserRole.TEACHER);
  const { data: attendanceStats } = useStudentAttendanceStats(user?.$id || "");
  const { data: attendanceHistory = [] } = useStudentAttendance(
    user?.$id || ""
  );

  // Получаем данные для текущей недели
  const today = new Date();
  const weekDates = getWeekDates(today);

  // Генерируем расписание на основе специализации группы
  const weekSchedule = useMemo(() => {
    // Проверяем, есть ли реальные данные из API
    if (subjects.length > 0) {
      // TODO: Здесь будет логика для создания расписания из реальных данных
      console.log(
        "Найдены предметы:",
        subjects.map((s) => s.name)
      );
    }

    // Генерируем расписание на основе специализации группы
    const schedule = getScheduleBySpecialization(group?.specialization);
    console.log(
      "Сгенерировано расписание для специализации:",
      group?.specialization
    );
    return schedule;
  }, [subjects, group?.specialization]);

  // Получаем расписание на сегодня
  const todaysSchedule = useMemo(() => {
    const todayWeekDay = getWeekDayFromDate(today);
    const schedule = weekSchedule[todayWeekDay] || [];
    console.log(`Расписание на сегодня (${todayWeekDay}):`, schedule);
    return schedule;
  }, [weekSchedule, today]);

  const tabs = [
    {
      key: "overview" as const,
      label: "Обзор",
      icon: BarChart3,
      count: todaysSchedule.length > 0 ? todaysSchedule.length : undefined,
      description: "Общая информация и сегодняшние занятия",
    },
    {
      key: "schedule" as const,
      label: "Расписание",
      icon: Calendar,
      count: undefined,
      description: "Расписание занятий на неделю",
    },
    {
      key: "attendance" as const,
      label: "Посещаемость",
      icon: CheckCircle,
      count:
        attendanceHistory.length > 0 ? attendanceHistory.length : undefined,
      description: "Статистика и история посещений",
    },
    {
      key: "profile" as const,
      label: "Профиль",
      icon: User,
      count: undefined,
      description: "Личные данные и настройки",
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            user={user}
            group={group}
            subjects={subjects}
            attendanceStats={attendanceStats}
            attendanceHistory={attendanceHistory}
            todaysSchedule={todaysSchedule}
            today={today}
          />
        );
      case "schedule":
        return (
          <ScheduleTab
            weekSchedule={weekSchedule}
            weekDates={weekDates}
            today={today}
          />
        );
      case "attendance":
        return (
          <AttendanceTab
            attendanceHistory={attendanceHistory}
            attendanceStats={attendanceStats}
            subjects={subjects}
          />
        );
      case "profile":
        return (
          <ProfileTab
            user={user}
            group={group}
            attendanceStats={attendanceStats}
          />
        );
      default:
        return null;
    }
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
                  Студент • {group?.code || "Группа не назначена"}
                </p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Навигация по вкладкам */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map(({ key, label, icon: Icon, count, description }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === key
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
                title={description}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {count !== undefined && count > 0 && (
                  <span
                    className={`ml-1 px-2 py-1 text-xs rounded-full ${
                      activeTab === key
                        ? "bg-purple-100 text-purple-600"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Контент вкладок */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">{renderTabContent()}</div>
      </main>

      {/* Дебаг информация (только в development) */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 left-4 bg-slate-800 text-white p-3 rounded-lg text-xs max-w-xs">
          <div>Активная вкладка: {activeTab}</div>
          <div>Занятий сегодня: {todaysSchedule.length}</div>
          <div>Группа: {group?.code || "Не назначена"}</div>
          <div>Специализация: {group?.specialization || "Не указана"}</div>
        </div>
      )}
    </div>
  );
}
