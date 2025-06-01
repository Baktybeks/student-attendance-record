// src/components/teacher/ScheduleTab.tsx

"use client";

import React, { useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Filter,
  Download,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useScheduleByTeacher } from "@/services/scheduleService";
import { WeekDay, getWeekDayLabel } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { EmptyState, ComingSoonState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Badge } from "@/components/ui/Badge";
import { getWeekDates, formatDate } from "@/utils/dates";

interface ScheduleItem {
  id: string;
  subject: string;
  group: string;
  time: string;
  classroom: string;
  dayOfWeek: WeekDay;
  weekType: "all" | "odd" | "even";
  type?: "lecture" | "seminar" | "practice" | "lab";
}

export const ScheduleTab: React.FC = () => {
  const { user } = useAuthStore();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  // Получаем расписание преподавателя
  const { data: schedule = [], isLoading } = useScheduleByTeacher(
    user?.$id || ""
  );

  // Примерные данные для демонстрации
  const mockSchedule: ScheduleItem[] = [
    {
      id: "1",
      subject: "Математический анализ",
      group: "ИТ-301",
      time: "09:00 - 10:30",
      classroom: "Аудитория 205",
      dayOfWeek: WeekDay.MONDAY,
      weekType: "all",
      type: "lecture",
    },
    {
      id: "2",
      subject: "Линейная алгебра",
      group: "ИТ-301",
      time: "11:45 - 13:15",
      classroom: "Аудитория 307",
      dayOfWeek: WeekDay.MONDAY,
      weekType: "all",
      type: "seminar",
    },
    {
      id: "3",
      subject: "Дискретная математика",
      group: "ИТ-201",
      time: "14:00 - 15:30",
      classroom: "Аудитория 412",
      dayOfWeek: WeekDay.TUESDAY,
      weekType: "all",
      type: "practice",
    },
    {
      id: "4",
      subject: "Математический анализ",
      group: "ИТ-301",
      time: "09:00 - 10:30",
      classroom: "Аудитория 205",
      dayOfWeek: WeekDay.WEDNESDAY,
      weekType: "odd",
      type: "lecture",
    },
    {
      id: "5",
      subject: "Численные методы",
      group: "ИТ-401",
      time: "15:45 - 17:15",
      classroom: "Компьютерный класс 1",
      dayOfWeek: WeekDay.THURSDAY,
      weekType: "all",
      type: "lab",
    },
  ];

  const currentSchedule = schedule.length > 0 ? schedule : mockSchedule;
  const weekDates = getWeekDates(currentWeek);

  // Фильтрация расписания по группе
  const filteredSchedule =
    selectedGroup === "all"
      ? currentSchedule
      : currentSchedule.filter((item) => item.group === selectedGroup);

  // Группировка расписания по дням недели
  const scheduleByDay = filteredSchedule.reduce((acc, item) => {
    if (!acc[item.dayOfWeek]) {
      acc[item.dayOfWeek] = [];
    }
    acc[item.dayOfWeek].push(item);
    return acc;
  }, {} as Record<WeekDay, ScheduleItem[]>);

  // Сортировка занятий по времени
  Object.keys(scheduleByDay).forEach((day) => {
    scheduleByDay[day as WeekDay].sort((a, b) => a.time.localeCompare(b.time));
  });

  // Получение уникальных групп
  const availableGroups = [
    ...new Set(currentSchedule.map((item) => item.group)),
  ];

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  const getTypeColor = (type?: string) => {
    switch (type) {
      case "lecture":
        return "primary";
      case "seminar":
        return "success";
      case "practice":
        return "warning";
      case "lab":
        return "danger";
      default:
        return "default";
    }
  };

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case "lecture":
        return "Лекция";
      case "seminar":
        return "Семинар";
      case "practice":
        return "Практика";
      case "lab":
        return "Лабораторная";
      default:
        return "Занятие";
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Загрузка расписания..." />;
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и фильтры */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Расписание</h2>
          <p className="text-slate-600 mt-1">
            Ваше расписание занятий на неделю
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Фильтр по группам */}
          <Select
            options={[
              { value: "all", label: "Все группы" },
              ...availableGroups.map((group) => ({
                value: group,
                label: group,
              })),
            ]}
            value={selectedGroup}
            onChange={(value) => setSelectedGroup(value as string)}
            placeholder="Выберите группу"
          />

          {/* Экспорт */}
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={() => {
              // Здесь будет логика экспорта
              console.log("Экспорт расписания");
            }}
          >
            Экспорт
          </Button>
        </div>
      </div>

      {/* Навигация по неделям */}
      <Card padding="sm">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronLeft className="w-4 h-4" />}
            onClick={() => navigateWeek("prev")}
          >
            Предыдущая
          </Button>

          <div className="flex items-center space-x-4">
            <span className="text-lg font-medium text-slate-900">
              {formatDate(weekDates[0], "short")} -{" "}
              {formatDate(weekDates[6], "short")}
            </span>
            <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
              Текущая неделя
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronRight className="w-4 h-4" />}
            onClick={() => navigateWeek("next")}
          >
            Следующая
          </Button>
        </div>
      </Card>

      {/* Календарь недели */}
      {filteredSchedule.length > 0 ? (
        <div className="grid grid-cols-7 gap-4">
          {weekDates.map((date, index) => {
            const dayOfWeek =
              Object.values(WeekDay)[index === 0 ? 6 : index - 1]; // Корректировка для воскресенья
            const daySchedule = scheduleByDay[dayOfWeek] || [];
            const isToday =
              formatDate(date, "iso") === formatDate(new Date(), "iso");

            return (
              <Card
                key={index}
                padding="sm"
                className={`min-h-[200px] ${
                  isToday ? "ring-2 ring-blue-500" : ""
                }`}
              >
                {/* Заголовок дня */}
                <div className="text-center mb-3">
                  <div className="text-xs text-slate-500 mb-1">
                    {getWeekDayLabel(dayOfWeek)}
                  </div>
                  <div
                    className={`text-lg font-medium ${
                      isToday ? "text-blue-600" : "text-slate-900"
                    }`}
                  >
                    {date.getDate()}
                  </div>
                  {isToday && (
                    <Badge variant="primary" size="sm" className="mt-1">
                      Сегодня
                    </Badge>
                  )}
                </div>

                {/* Занятия */}
                <div className="space-y-2">
                  {daySchedule.map((scheduleItem) => (
                    <div
                      key={scheduleItem.id}
                      className="p-2 bg-slate-50 rounded border-l-3 border-l-blue-500 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <div className="text-xs font-medium text-slate-900 mb-1">
                        {scheduleItem.subject}
                      </div>

                      <div className="flex items-center space-x-1 text-xs text-slate-500 mb-1">
                        <Clock className="w-3 h-3" />
                        <span>{scheduleItem.time}</span>
                      </div>

                      <div className="flex items-center space-x-1 text-xs text-slate-500 mb-1">
                        <Users className="w-3 h-3" />
                        <span>{scheduleItem.group}</span>
                      </div>

                      <div className="flex items-center space-x-1 text-xs text-slate-500 mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>{scheduleItem.classroom}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge
                          variant={getTypeColor(scheduleItem.type)}
                          size="sm"
                        >
                          {getTypeLabel(scheduleItem.type)}
                        </Badge>

                        {scheduleItem.weekType !== "all" && (
                          <Badge variant="outline" size="sm">
                            {scheduleItem.weekType === "odd" ? "Нечет" : "Чет"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}

                  {daySchedule.length === 0 && (
                    <div className="text-center text-xs text-slate-400 py-4">
                      Нет занятий
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Calendar className="w-12 h-12 text-slate-400" />}
          title="Расписание не найдено"
          description={
            selectedGroup === "all"
              ? "У вас пока нет расписания на эту неделю"
              : `Нет занятий для группы ${selectedGroup} на эту неделю`
          }
          action={
            selectedGroup !== "all"
              ? {
                  label: "Показать все группы",
                  onClick: () => setSelectedGroup("all"),
                }
              : undefined
          }
        />
      )}

      {/* Статистика */}
      {filteredSchedule.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card padding="md">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {filteredSchedule.length}
              </div>
              <div className="text-sm text-slate-600">Занятий в неделю</div>
            </div>
          </Card>

          <Card padding="md">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {availableGroups.length}
              </div>
              <div className="text-sm text-slate-600">Групп</div>
            </div>
          </Card>

          <Card padding="md">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {Math.round(filteredSchedule.length * 1.5)}
              </div>
              <div className="text-sm text-slate-600">Часов в неделю</div>
            </div>
          </Card>

          <Card padding="md">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {
                  [...new Set(filteredSchedule.map((item) => item.classroom))]
                    .length
                }
              </div>
              <div className="text-sm text-slate-600">Аудиторий</div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
