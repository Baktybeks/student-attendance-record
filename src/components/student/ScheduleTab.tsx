// src/components/student/ScheduleTab.tsx

"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Download,
  Bell,
  User,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getWeekDayFromDate, formatDate } from "@/utils/dates";
import { WeekDay, getWeekDayLabel } from "@/types";

interface ScheduleTabProps {
  weekSchedule: Record<WeekDay, any[]>;
  weekDates: Date[];
  today: Date;
}

export function ScheduleTab({
  weekSchedule,
  weekDates,
  today,
}: ScheduleTabProps) {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const weekDays = Object.values(WeekDay);
  const currentWeekDates = getWeekDatesWithOffset(today, currentWeekOffset);
  const todayWeekDay = getWeekDayFromDate(today);

  // Функция для получения дат недели с учетом смещения
  function getWeekDatesWithOffset(baseDate: Date, weekOffset: number): Date[] {
    const dates: Date[] = [];
    const startOfWeek = new Date(baseDate);

    // Находим понедельник текущей недели
    const dayOfWeek = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    // Добавляем смещение в неделях
    startOfWeek.setDate(startOfWeek.getDate() + weekOffset * 7);

    // Генерируем даты для всех дней недели
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }

    return dates;
  }

  const handlePreviousWeek = () => {
    setCurrentWeekOffset((prev) => prev - 1);
  };

  const handleNextWeek = () => {
    setCurrentWeekOffset((prev) => prev + 1);
  };

  const handleCurrentWeek = () => {
    setCurrentWeekOffset(0);
  };

  const getWeekLabel = () => {
    if (currentWeekOffset === 0) return "Текущая неделя";
    if (currentWeekOffset === -1) return "Прошлая неделя";
    if (currentWeekOffset === 1) return "Следующая неделя";
    return currentWeekOffset > 0
      ? `+${currentWeekOffset} недель`
      : `${Math.abs(currentWeekOffset)} недель назад`;
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и действия */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Расписание</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("📄 Экспорт расписания в разработке")}
            icon={<Download className="w-4 h-4" />}
          >
            Экспорт
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("🔔 Уведомления в разработке")}
            icon={<Bell className="w-4 h-4" />}
          >
            Уведомления
          </Button>
        </div>
      </div>

      {/* Навигация по неделям */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousWeek}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Предыдущая
            </Button>

            {currentWeekOffset !== 0 && (
              <Button variant="primary" size="sm" onClick={handleCurrentWeek}>
                Текущая неделя
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextWeek}
              icon={<ChevronRight className="w-4 h-4" />}
            >
              Следующая
            </Button>
          </div>

          <div className="text-right">
            <h3 className="text-lg font-medium text-slate-900">
              {getWeekLabel()}
            </h3>
            <p className="text-sm text-slate-500">
              {currentWeekDates[0]?.toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "short",
              })}{" "}
              -{" "}
              {currentWeekDates[6]?.toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Календарь недели */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {weekDays.map((day, index) => {
                const dayDate = currentWeekDates[index];
                const isToday =
                  currentWeekOffset === 0 &&
                  dayDate?.toDateString() === today.toDateString();
                const isPast = dayDate && dayDate < today && !isToday;

                return (
                  <div
                    key={day}
                    className={`text-center p-3 rounded-lg border ${
                      isToday
                        ? "bg-purple-50 border-purple-200"
                        : isPast
                        ? "bg-slate-50 border-slate-200"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div
                      className={`font-medium text-sm ${
                        isToday ? "text-purple-700" : "text-slate-700"
                      }`}
                    >
                      {getWeekDayLabel(day)}
                    </div>
                    <div
                      className={`text-xs mt-1 ${
                        isToday ? "text-purple-600" : "text-slate-500"
                      }`}
                    >
                      {dayDate?.toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Расписание по дням */}
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, index) => {
                const daySchedule = weekSchedule[day] || [];
                const dayDate = currentWeekDates[index];
                const isToday =
                  currentWeekOffset === 0 &&
                  dayDate?.toDateString() === today.toDateString();

                return (
                  <div
                    key={day}
                    className={`min-h-[200px] p-2 rounded-lg border ${
                      isToday
                        ? "bg-purple-50 border-purple-200"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="space-y-2">
                      {daySchedule.length > 0 ? (
                        daySchedule.map((item: any, itemIndex: number) => (
                          <ScheduleCard
                            key={itemIndex}
                            item={item}
                            compact
                            isToday={isToday}
                          />
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-400">
                          <Calendar className="w-6 h-6 mx-auto mb-2" />
                          <span className="text-xs">Нет занятий</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Подробное расписание на выбранный день */}
      <Card padding="md">
        <div className="border-b border-slate-200 pb-4 mb-6">
          <h3 className="text-lg font-medium text-slate-900">
            {currentWeekOffset === 0 && todayWeekDay ? (
              <>Подробное расписание на сегодня</>
            ) : (
              <>Расписание на {getWeekDayLabel(WeekDay.MONDAY)}</>
            )}
          </h3>
        </div>

        {(() => {
          const targetDay =
            currentWeekOffset === 0 && todayWeekDay
              ? todayWeekDay
              : WeekDay.MONDAY;
          const targetSchedule = weekSchedule[targetDay] || [];

          return targetSchedule.length > 0 ? (
            <div className="space-y-4">
              {targetSchedule.map((item: any, index: number) => (
                <DetailedScheduleItem key={index} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-slate-900 mb-2">
                Нет занятий
              </h4>
              <p className="text-slate-600">
                На этот день занятий не запланировано
              </p>
            </div>
          );
        })()}
      </Card>

      {/* Легенда */}
      <Card padding="md">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Обозначения</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Badge variant="primary" size="sm">
              Лекция
            </Badge>
            <span className="text-sm text-slate-600">
              Теоретические занятия
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="success" size="sm">
              Практика
            </Badge>
            <span className="text-sm text-slate-600">Практические работы</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="warning" size="sm">
              Лабораторная
            </Badge>
            <span className="text-sm text-slate-600">Лабораторные работы</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" size="sm">
              Семинар
            </Badge>
            <span className="text-sm text-slate-600">Семинарские занятия</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Компонент компактной карточки расписания
function ScheduleCard({
  item,
  compact = false,
  isToday = false,
}: {
  item: any;
  compact?: boolean;
  isToday?: boolean;
}) {
  return (
    <div
      className={`${
        isToday
          ? "bg-purple-100 border-purple-200"
          : "bg-blue-50 border-blue-200"
      } border rounded-lg ${
        compact ? "p-2" : "p-3"
      } hover:shadow-sm transition-all`}
    >
      <div className="space-y-1">
        <div
          className={`font-medium ${
            isToday ? "text-purple-900" : "text-blue-900"
          } ${compact ? "text-xs" : "text-sm"} leading-tight`}
        >
          {item.subject}
        </div>

        <div
          className={`flex items-center ${compact ? "text-xs" : "text-sm"} ${
            isToday ? "text-purple-700" : "text-blue-700"
          }`}
        >
          <Clock className="w-3 h-3 mr-1" />
          {item.time}
        </div>

        {!compact && (
          <>
            <div
              className={`flex items-center text-xs ${
                isToday ? "text-purple-600" : "text-blue-600"
              }`}
            >
              <User className="w-3 h-3 mr-1" />
              {item.teacher}
            </div>

            <div
              className={`flex items-center text-xs ${
                isToday ? "text-purple-600" : "text-blue-600"
              }`}
            >
              <MapPin className="w-3 h-3 mr-1" />
              {item.classroom}
            </div>
          </>
        )}

        <div className="pt-1">
          <Badge
            variant={
              item.type === "Лекция"
                ? "primary"
                : item.type === "Практика"
                ? "success"
                : item.type === "Лабораторная"
                ? "warning"
                : "secondary"
            }
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

// Компонент детального элемента расписания
function DetailedScheduleItem({ item }: { item: any }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200">
      <div className="flex items-center space-x-4">
        <div className="text-center min-w-[60px]">
          <div className="text-sm font-medium text-slate-900">
            {item.time.split("-")[0]}
          </div>
          <div className="text-xs text-slate-500">
            {item.time.split("-")[1]}
          </div>
        </div>
        <div className="w-px h-12 bg-slate-200"></div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-slate-900 mb-1">
            {item.subject}
          </h4>
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>{item.teacher}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3" />
              <span>{item.classroom}</span>
            </div>
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
              : item.type === "Лабораторная"
              ? "warning"
              : "secondary"
          }
        >
          {item.type}
        </Badge>
      </div>
    </div>
  );
}
