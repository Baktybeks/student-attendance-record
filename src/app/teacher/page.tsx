"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useScheduleStore } from "@/store/scheduleStore";
import { useClasses } from "@/services/attendanceService";
import { UserRole, WeekDay, getWeekDayLabel, AttendanceStatus, getAttendanceStatusLabel, getAttendanceStatusColor } from "@/types";
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  GraduationCap,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";

export default function TeacherDashboard() {
  const { user, logout } = useAuthStore();
  const { selectedDate, setSelectedDate } = useScheduleStore();
  const [activeTab, setActiveTab] = useState<"today" | "schedule" | "attendance" | "analytics">("today");
  
  // Получаем занятия преподавателя
  const { data: todaysClasses = [], isLoading } = useClasses({
    teacherId: user?.$id,
    date: new Date().toISOString().split('T')[0]
  });

  const handleLogout = () => {
    logout();
    toast.success("Успешный выход из системы");
  };

  // Получаем дату сегодня и дни недели
  const today = new Date();
  const currentWeekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - today.getDay() + i);
    return date;
  });

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
                <span className="text-xl font-bold text-slate-900">AttendTrack</span>
              </div>
              <div className="hidden md:flex items-center space-x-1 ml-8">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-600">Панель преподавателя</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">Преподаватель</p>
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
              { key: "today", label: "Сегодня", icon: Clock },
              { key: "schedule", label: "Расписание", icon: Calendar },
              { key: "attendance", label: "Посещаемость", icon: Users },
              { key: "analytics", label: "Аналитика", icon: BarChart3 },
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
        {activeTab === "today" && (
          <div className="space-y-8">
            {/* Заголовок дня */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Сегодня, {today.toLocaleDateString('ru-RU', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h1>
                <p className="text-slate-600 mt-1">
                  {todaysClasses.length > 0 
                    ? `У вас ${todaysClasses.length} занятий на сегодня`
                    : "Сегодня у вас нет занятий"
                  }
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">
                  {today.toLocaleDateString('ru-RU', { day: '2-digit' })}
                </div>
                <div className="text-sm text-slate-500">
                  {today.toLocaleDateString('ru-RU', { month: 'short' })}
                </div>
              </div>
            </div>

            {/* Занятия на сегодня */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-slate-600">Загрузка расписания...</span>
              </div>
            ) : todaysClasses.length > 0 ? (
              <div className="grid gap-6">
                {todaysClasses.map((classItem, index) => (
                  <ClassCard key={index} classItem={classItem} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Свободный день</h3>
                <p className="text-slate-600">На сегодня у вас нет запланированных занятий</p>
              </div>
            )}

            {/* Быстрая статистика */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Студентов присутствует</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">24</p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Процент посещаемости</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">89%</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Расписание</h2>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-slate-700 px-4">
                  {today.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                </span>
                <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Календарь недели */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="grid grid-cols-7 gap-0 border-b border-slate-200">
                {currentWeekDays.map((date, index) => {
                  const isToday = date.toDateString() === today.toDateString();
                  return (
                    <div
                      key={index}
                      className={`p-4 text-center border-r border-slate-200 last:border-r-0 ${
                        isToday ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="text-xs text-slate-500 mb-1">
                        {getWeekDayLabel(Object.values(WeekDay)[index] || WeekDay.MONDAY)}
                      </div>
                      <div className={`text-lg font-medium ${
                        isToday ? "text-blue-600" : "text-slate-900"
                      }`}>
                        {date.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Временные слоты */}
              <div className="p-6">
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Расписание на неделю</h3>
                  <p className="text-slate-600">Функция в разработке</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "attendance" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Управление посещаемостью</h2>
            
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Посещаемость студентов</h3>
              <p className="text-slate-600">Функция в разработке</p>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Аналитика и статистика</h2>
            
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Статистика посещаемости</h3>
              <p className="text-slate-600">Функция в разработке</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Компонент карточки занятия
interface ClassCardProps {
  classItem: any; // TODO: заменить на правильный тип
}

function ClassCard({ classItem }: ClassCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);

  const handleMarkAttendance = () => {
    setAttendanceMarked(true);
    toast.success("Посещаемость отмечена");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-600">
                  09:00 - 10:30
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600">Аудитория 205</span>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Математический анализ
            </h3>
            
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>Группа ИТ-301</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>25 студентов</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {attendanceMarked ? (
              <div className="flex items-center space-x-2 text-emerald-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Отмечено</span>
              </div>
            ) : (
              <button
                onClick={handleMarkAttendance}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Отметить посещаемость
              </button>
            )}
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Статистика посещаемости */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-700">Статистика</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Присутствуют</span>
                    <span className="text-sm font-medium text-emerald-600">22</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Отсутствуют</span>
                    <span className="text-sm font-medium text-red-600">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Процент</span>
                    <span className="text-sm font-medium text-slate-900">88%</span>
                  </div>
                </div>
              </div>

              {/* Последние отметки */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-700">Последние отметки</h4>
                <div className="space-y-2">
                  {[
                    { name: "Иванов И.И.", status: AttendanceStatus.PRESENT },
                    { name: "Петров П.П.", status: AttendanceStatus.ABSENT },
                    { name: "Сидоров С.С.", status: AttendanceStatus.LATE },
                  ].map((student, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{student.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getAttendanceStatusColor(student.status)}`}>
                        {getAttendanceStatusLabel(student.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Действия */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-700">Действия</h4>
                <div className="space-y-2">
                  <button className="w-full bg-slate-100 text-slate-700 py-2 px-3 rounded-lg hover:bg-slate-200 transition-colors text-sm">
                    Просмотреть список
                  </button>
                  <button className="w-full bg-slate-100 text-slate-700 py-2 px-3 rounded-lg hover:bg-slate-200 transition-colors text-sm">
                    Экспорт в Excel
                  </button>
                  <button className="w-full bg-slate-100 text-slate-700 py-2 px-3 rounded-lg hover:bg-slate-200 transition-colors text-sm">
                    История изменений
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Занятий сегодня</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{todaysClasses.length}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-