// src/app/student/page.tsx (Полная реализация)

"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  useStudentAttendanceStats,
  useStudentAttendance,
} from "@/services/attendanceService";
import { useSubjectsForGroup } from "@/services/subjectService";
import { useGroupById } from "@/services/groupeServise";
import { useUsersByRole } from "@/services/authService";
import {
  AttendanceStatus,
  getAttendanceStatusLabel,
  getAttendanceStatusColor,
  UserRole,
  WeekDay,
  getWeekDayLabel,
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
  GraduationCap,
  MapPin,
  User,
  Award,
  Phone,
  Mail,
  Edit,
  Download,
  Bell,
  Settings,
} from "lucide-react";
import { toast } from "react-toastify";
import { LogoutButton } from "@/components/LogoutButton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, getWeekDates, isToday } from "@/utils/dates";
import { formatPercentage } from "@/utils/format";

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    "overview" | "schedule" | "attendance" | "profile"
  >("overview");

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

  // Мок данные расписания на неделю (в реальном приложении будут из API)
  const weekSchedule = {
    [WeekDay.MONDAY]: [
      {
        time: "09:00-10:30",
        subject: "Математический анализ",
        teacher: "Иванова А.С.",
        classroom: "Ауд. 205",
        type: "Лекция",
      },
      {
        time: "10:45-12:15",
        subject: "Программирование",
        teacher: "Петров П.П.",
        classroom: "Ауд. 301",
        type: "Практика",
      },
    ],
    [WeekDay.TUESDAY]: [
      {
        time: "11:30-13:00",
        subject: "Физика",
        teacher: "Сидорова С.С.",
        classroom: "Ауд. 105",
        type: "Лабораторная",
      },
    ],
    [WeekDay.WEDNESDAY]: [
      {
        time: "09:00-10:30",
        subject: "Математический анализ",
        teacher: "Иванова А.С.",
        classroom: "Ауд. 205",
        type: "Лекция",
      },
    ],
    [WeekDay.THURSDAY]: [
      {
        time: "13:45-15:15",
        subject: "Программирование",
        teacher: "Петров П.П.",
        classroom: "Ауд. 301",
        type: "Практика",
      },
    ],
    [WeekDay.FRIDAY]: [
      {
        time: "10:45-12:15",
        subject: "Физика",
        teacher: "Сидорова С.С.",
        classroom: "Ауд. 105",
        type: "Лекция",
      },
    ],
    [WeekDay.SATURDAY]: [],
    [WeekDay.SUNDAY]: [],
  };

  const todaysSchedule = weekSchedule[getWeekDayFromDate(today)] || [];

  // Функция для получения дня недели из даты
  const getWeekDayFromDate = (date: Date): WeekDay => {
    const days = [
      WeekDay.SUNDAY,
      WeekDay.MONDAY,
      WeekDay.TUESDAY,
      WeekDay.WEDNESDAY,
      WeekDay.THURSDAY,
      WeekDay.FRIDAY,
      WeekDay.SATURDAY,
    ];
    return days[date.getDay()];
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
          <OverviewTab
            user={user}
            group={group}
            subjects={subjects}
            attendanceStats={attendanceStats}
            attendanceHistory={attendanceHistory}
            todaysSchedule={todaysSchedule}
            today={today}
          />
        )}

        {activeTab === "schedule" && (
          <ScheduleTab
            weekSchedule={weekSchedule}
            weekDates={weekDates}
            today={today}
          />
        )}

        {activeTab === "attendance" && (
          <AttendanceTab
            attendanceHistory={attendanceHistory}
            attendanceStats={attendanceStats}
            subjects={subjects}
          />
        )}

        {activeTab === "profile" && <ProfileTab user={user} group={group} />}
      </main>
    </div>
  );
}

// Компонент вкладки обзора
function OverviewTab({
  user,
  group,
  subjects,
  attendanceStats,
  attendanceHistory,
  todaysSchedule,
  today,
}: {
  user: any;
  group: any;
  subjects: any[];
  attendanceStats: any;
  attendanceHistory: any[];
  todaysSchedule: any[];
  today: Date;
}) {
  const attendanceRate = attendanceStats?.attendanceRate || 0;

  return (
    <div className="space-y-8">
      {/* Приветствие */}
      <Card padding="md">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Добро пожаловать, {user?.name?.split(" ")[0]}!
              </h1>
              <p className="text-purple-100">
                Сегодня у вас {todaysSchedule.length} занятий. Ваша
                посещаемость: {formatPercentage(attendanceRate)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {Math.round(attendanceRate)}%
              </div>
              <div className="text-sm text-purple-100">Посещаемость</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Посещено занятий"
          value={attendanceStats?.presentCount || 0}
          icon={CheckCircle}
          color="bg-emerald-500"
          trend={`+${attendanceStats?.presentCount || 0} всего`}
          trendUp={true}
        />
        <StatCard
          title="Пропущено"
          value={attendanceStats?.absentCount || 0}
          icon={XCircle}
          color="bg-red-500"
          trend={`${attendanceStats?.absentCount || 0} всего`}
          trendUp={false}
        />
        <StatCard
          title="Опозданий"
          value={attendanceStats?.lateCount || 0}
          icon={AlertCircle}
          color="bg-orange-500"
          trend={`${attendanceStats?.lateCount || 0} всего`}
        />
        <StatCard
          title="Изучаемых предметов"
          value={subjects.length}
          icon={BookOpen}
          color="bg-blue-500"
          trend={`В ${group?.course || 0} семестре`}
          trendUp={true}
        />
      </div>

      {/* Расписание на сегодня */}
      <Card padding="md">
        <div className="border-b border-slate-200 pb-4 mb-6">
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

        {todaysSchedule.length > 0 ? (
          <div className="space-y-4">
            {todaysSchedule.map((item, index) => (
              <ScheduleItem key={index} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-slate-900 mb-2">
              Свободный день
            </h4>
            <p className="text-slate-600">На сегодня у вас нет занятий</p>
          </div>
        )}
      </Card>

      {/* Последние отметки посещаемости */}
      <Card padding="md">
        <div className="border-b border-slate-200 pb-4 mb-6">
          <h3 className="text-lg font-medium text-slate-900">
            Недавняя посещаемость
          </h3>
        </div>

        {attendanceHistory.length > 0 ? (
          <div className="space-y-3">
            {attendanceHistory.slice(0, 5).map((record, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-slate-500">
                    {formatDate(record.$createdAt, "short")}
                  </div>
                  <div className="text-sm font-medium text-slate-900">
                    Занятие #{record.classId.slice(-6)}
                  </div>
                </div>
                <Badge
                  variant={
                    record.status === AttendanceStatus.PRESENT
                      ? "success"
                      : record.status === AttendanceStatus.ABSENT
                      ? "danger"
                      : record.status === AttendanceStatus.LATE
                      ? "warning"
                      : "info"
                  }
                >
                  {getAttendanceStatusLabel(record.status)}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-slate-900 mb-2">
              Нет данных о посещаемости
            </h4>
            <p className="text-slate-600">
              Данные о посещаемости появятся после проведения занятий
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

// Компонент вкладки расписания
function ScheduleTab({
  weekSchedule,
  weekDates,
  today,
}: {
  weekSchedule: any;
  weekDates: Date[];
  today: Date;
}) {
  const [selectedWeek, setSelectedWeek] = useState(0);

  const weekDays = Object.values(WeekDay);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Расписание</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Экспорт расписания в разработке")}
            icon={<Download className="w-4 h-4" />}
          >
            Экспорт
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Уведомления в разработке")}
            icon={<Bell className="w-4 h-4" />}
          >
            Уведомления
          </Button>
        </div>
      </div>

      {/* Календарь недели */}
      <Card padding="none">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-900">
            Неделя{" "}
            {weekDates[0].toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "short",
            })}{" "}
            -{" "}
            {weekDates[6].toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "short",
            })}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {weekDays.map((day, index) => {
                  const dayDate = weekDates[index];
                  const isToday =
                    dayDate?.toDateString() === today.toDateString();

                  return (
                    <th
                      key={day}
                      className={`px-4 py-3 text-center text-sm font-medium text-slate-700 ${
                        isToday ? "bg-purple-50 text-purple-700" : ""
                      }`}
                    >
                      <div>
                        <div className="font-medium">
                          {getWeekDayLabel(day)}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {dayDate?.toLocaleDateString("ru-RU", {
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                {weekDays.map((day) => {
                  const daySchedule = weekSchedule[day] || [];

                  return (
                    <td
                      key={day}
                      className="px-2 py-4 align-top border-r border-slate-200 last:border-r-0"
                    >
                      <div className="space-y-2">
                        {daySchedule.length > 0 ? (
                          daySchedule.map((item: any, index: number) => (
                            <ScheduleCard key={index} item={item} compact />
                          ))
                        ) : (
                          <div className="text-center py-8 text-slate-400">
                            <Calendar className="w-6 h-6 mx-auto mb-2" />
                            <span className="text-xs">Нет занятий</span>
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Подробное расписание на сегодня */}
      <Card padding="md">
        <div className="border-b border-slate-200 pb-4 mb-6">
          <h3 className="text-lg font-medium text-slate-900">
            Подробное расписание на сегодня
          </h3>
        </div>

        {weekSchedule[getWeekDayFromDate(today)]?.length > 0 ? (
          <div className="space-y-4">
            {weekSchedule[getWeekDayFromDate(today)].map(
              (item: any, index: number) => (
                <ScheduleItem key={index} item={item} />
              )
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-slate-900 mb-2">
              Свободный день
            </h4>
            <p className="text-slate-600">На сегодня у вас нет занятий</p>
          </div>
        )}
      </Card>
    </div>
  );

  function getWeekDayFromDate(date: Date): WeekDay {
    const days = [
      WeekDay.SUNDAY,
      WeekDay.MONDAY,
      WeekDay.TUESDAY,
      WeekDay.WEDNESDAY,
      WeekDay.THURSDAY,
      WeekDay.FRIDAY,
      WeekDay.SATURDAY,
    ];
    return days[date.getDay()];
  }
}

// Компонент вкладки посещаемости
function AttendanceTab({
  attendanceHistory,
  attendanceStats,
  subjects,
}: {
  attendanceHistory: any[];
  attendanceStats: any;
  subjects: any[];
}) {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedSubject, setSelectedSubject] = useState("all");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Моя посещаемость</h2>
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="week">За неделю</option>
            <option value="month">За месяц</option>
            <option value="semester">За семестр</option>
            <option value="year">За год</option>
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="all">Все предметы</option>
            {subjects.map((subject) => (
              <option key={subject.$id} value={subject.$id}>
                {subject.name}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Экспорт посещаемости в разработке")}
            icon={<Download className="w-4 h-4" />}
          >
            Экспорт
          </Button>
        </div>
      </div>

      {/* Статистика посещаемости */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Общая посещаемость
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {Math.round(attendanceStats?.attendanceRate || 0)}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Присутствовал
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {attendanceStats?.presentCount || 0}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Отсутствовал</p>
              <p className="text-2xl font-bold text-slate-900">
                {attendanceStats?.absentCount || 0}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Опозданий</p>
              <p className="text-2xl font-bold text-slate-900">
                {attendanceStats?.lateCount || 0}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* История посещаемости */}
      <Card padding="md">
        <div className="border-b border-slate-200 pb-4 mb-6">
          <h3 className="text-lg font-medium text-slate-900">
            История посещений
          </h3>
        </div>

        {attendanceHistory.length > 0 ? (
          <div className="space-y-4">
            {attendanceHistory.map((record, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-slate-500">
                    {formatDate(record.$createdAt, "datetime")}
                  </div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      Занятие #{record.classId.slice(-6)}
                    </div>
                    {record.notes && (
                      <div className="text-xs text-slate-500 mt-1">
                        {record.notes}
                      </div>
                    )}
                  </div>
                </div>
                <Badge
                  variant={
                    record.status === AttendanceStatus.PRESENT
                      ? "success"
                      : record.status === AttendanceStatus.ABSENT
                      ? "danger"
                      : record.status === AttendanceStatus.LATE
                      ? "warning"
                      : "info"
                  }
                >
                  {getAttendanceStatusLabel(record.status)}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-slate-900 mb-2">
              Нет данных о посещаемости
            </h4>
            <p className="text-slate-600">
              Данные о посещаемости появятся после проведения занятий
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

// Компонент вкладки профиля
function ProfileTab({ user, group }: { user: any; group: any }) {
  const handleUpdateProfile = () => {
    toast.info("Редактирование профиля будет доступно в следующем обновлении");
  };

  const handleChangePassword = () => {
    toast.info("Смена пароля будет доступна в следующем обновлении");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Мой профиль</h2>
        <Button
          onClick={handleUpdateProfile}
          icon={<Edit className="w-4 h-4" />}
          variant="outline"
        >
          Редактировать
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная информация */}
        <div className="lg:col-span-2">
          <Card padding="md">
            <div className="flex items-start space-x-6">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {user?.name}
                </h3>
                <p className="text-slate-600 mb-4">Студент</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      Группа
                    </label>
                    <div className="mt-1">
                      <span className="text-sm text-slate-900">
                        {group?.name || "Не назначена"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Курс
                    </label>
                    <div className="mt-1">
                      <span className="text-sm text-slate-900">
                        {group?.course || "—"} курс
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Специальность
                    </label>
                    <div className="mt-1">
                      <span className="text-sm text-slate-900">
                        {group?.specialization || "Не указана"}
                      </span>
                    </div>
                  </div>

                  {user?.phone && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Телефон
                      </label>
                      <div className="mt-1 flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-900">
                          {user.phone}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex space-x-3">
                  <Button
                    onClick={handleUpdateProfile}
                    variant="primary"
                    icon={<Edit className="w-4 h-4" />}
                  >
                    Редактировать профиль
                  </Button>
                  <Button
                    onClick={handleChangePassword}
                    variant="outline"
                    icon={<Settings className="w-4 h-4" />}
                  >
                    Сменить пароль
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Дополнительная информация */}
        <div className="space-y-6">
          {/* Статистика профиля */}
          <Card padding="md">
            <h3 className="text-lg font-medium text-slate-900 mb-4">
              Статистика
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Дата регистрации</span>
                <span className="text-sm font-medium text-slate-900">
                  {formatDate(user?.$createdAt, "short")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Статус аккаунта</span>
                <Badge variant={user?.isActive ? "success" : "warning"}>
                  {user?.isActive ? "Активен" : "Неактивен"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">ID пользователя</span>
                <span className="text-xs font-mono text-slate-500">
                  {user?.$id?.slice(-8)}
                </span>
              </div>
            </div>
          </Card>

          {/* Быстрые действия */}
          <Card padding="md">
            <h3 className="text-lg font-medium text-slate-900 mb-4">
              Быстрые действия
            </h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => toast.info("Скачивание справки в разработке")}
                icon={<Download className="w-4 h-4" />}
              >
                Скачать справку
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => toast.info("Настройки уведомлений в разработке")}
                icon={<Bell className="w-4 h-4" />}
              >
                Настройки уведомлений
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => toast.info("Обратная связь в разработке")}
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

// Компонент карточки статистики
interface StatCardProps {
  title: string;
  value: number;
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
    <Card padding="md">
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
    </Card>
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
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="text-center">
          <div className="text-sm font-medium text-slate-900">
            {item.time.split("-")[0]}
          </div>
          <div className="text-xs text-slate-500">
            {item.time.split("-")[1]}
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
        <Badge
          variant={
            item.type === "Лекция"
              ? "primary"
              : item.type === "Практика"
              ? "success"
              : "secondary"
          }
        >
          {item.type}
        </Badge>
      </div>
    </div>
  );
}

// Компонент компактной карточки расписания
function ScheduleCard({
  item,
  compact = false,
}: {
  item: any;
  compact?: boolean;
}) {
  return (
    <div
      className={`bg-blue-50 border border-blue-200 rounded-lg ${
        compact ? "p-2" : "p-3"
      } hover:shadow-sm transition-all`}
    >
      <div className="space-y-1">
        <div
          className={`font-medium text-blue-900 ${
            compact ? "text-xs" : "text-sm"
          } leading-tight`}
        >
          {item.subject}
        </div>

        <div
          className={`flex items-center ${
            compact ? "text-xs" : "text-sm"
          } text-blue-700`}
        >
          <Clock className="w-3 h-3 mr-1" />
          {item.time}
        </div>

        {!compact && (
          <>
            <div className="flex items-center text-xs text-blue-600">
              <User className="w-3 h-3 mr-1" />
              {item.teacher}
            </div>

            <div className="flex items-center text-xs text-blue-600">
              <MapPin className="w-3 h-3 mr-1" />
              {item.classroom}
            </div>
          </>
        )}

        <div className="pt-1">
          <Badge
            variant="outline"
            size="sm"
            className={compact ? "text-xs px-1 py-0.5" : ""}
          >
            {item.type}
          </Badge>
        </div>
      </div>
    </div>
  );
}
