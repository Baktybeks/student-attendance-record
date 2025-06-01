// src/components/teacher/TodayTab.tsx

"use client";

import React from "react";
import { Calendar, CheckCircle, BarChart3 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useClasses } from "@/services/attendanceService";
import { AttendanceStatus } from "@/types";
import { ClassCard } from "./ClassCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";

export const TodayTab: React.FC = () => {
  const { user } = useAuthStore();
  const today = new Date();

  // Получаем занятия преподавателя на сегодня
  const { data: todaysClasses = [], isLoading } = useClasses({
    teacherId: user?.$id,
    date: today.toISOString().split("T")[0],
  });

  // Примерные данные для демонстрации (заменить на реальные данные)
  const mockClasses = [
    {
      id: "1",
      subject: "Математический анализ",
      group: "ИТ-301",
      time: "09:00 - 10:30",
      classroom: "Аудитория 205",
      studentsCount: 25,
      attendanceMarked: false,
      stats: {
        present: 22,
        absent: 3,
        late: 0,
        total: 25,
        percentage: 88,
      },
      recentAttendance: [
        { name: "Иванов И.И.", status: AttendanceStatus.PRESENT },
        { name: "Петров П.П.", status: AttendanceStatus.ABSENT },
        { name: "Сидоров С.С.", status: AttendanceStatus.LATE },
      ],
    },
    {
      id: "2",
      subject: "Линейная алгебра",
      group: "ИТ-301",
      time: "11:45 - 13:15",
      classroom: "Аудитория 307",
      studentsCount: 25,
      attendanceMarked: true,
      stats: {
        present: 24,
        absent: 1,
        late: 0,
        total: 25,
        percentage: 96,
      },
      recentAttendance: [
        { name: "Козлов К.К.", status: AttendanceStatus.PRESENT },
        { name: "Федоров Ф.Ф.", status: AttendanceStatus.PRESENT },
        { name: "Морозов М.М.", status: AttendanceStatus.ABSENT },
      ],
    },
  ];

  const currentClasses = todaysClasses.length > 0 ? todaysClasses : mockClasses;

  const handleMarkAttendance = (classId: string) => {
    console.log("Marking attendance for class:", classId);
    // Здесь будет логика отметки посещаемости
  };

  const handleViewDetails = (classId: string) => {
    console.log("Viewing details for class:", classId);
    // Здесь будет логика просмотра деталей
  };

  const handleExportData = (classId: string) => {
    console.log("Exporting data for class:", classId);
    // Здесь будет логика экспорта
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
        </div>
        <LoadingSpinner size="lg" text="Загрузка расписания..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Заголовок дня */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Сегодня,{" "}
            {today.toLocaleDateString("ru-RU", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h1>
          <p className="text-slate-600 mt-1">
            {currentClasses.length > 0
              ? `У вас ${currentClasses.length} занятий на сегодня`
              : "Сегодня у вас нет занятий"}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900">
            {today.toLocaleDateString("ru-RU", { day: "2-digit" })}
          </div>
          <div className="text-sm text-slate-500">
            {today.toLocaleDateString("ru-RU", { month: "short" })}
          </div>
        </div>
      </div>

      {/* Занятия на сегодня */}
      {currentClasses.length > 0 ? (
        <>
          <div className="grid gap-6">
            {currentClasses.map((classItem, index) => (
              <ClassCard
                key={classItem.id || index}
                classItem={classItem}
                onMarkAttendance={handleMarkAttendance}
                onViewDetails={handleViewDetails}
                onExportData={handleExportData}
              />
            ))}
          </div>

          {/* Быстрая статистика */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card padding="md" hover>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Студентов присутствует
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {currentClasses.reduce(
                      (sum, cls) => sum + (cls.stats?.present || 0),
                      0
                    )}
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </Card>

            <Card padding="md" hover>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Средняя посещаемость
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {Math.round(
                      currentClasses.reduce(
                        (sum, cls) => sum + (cls.stats?.percentage || 0),
                        0
                      ) / currentClasses.length
                    )}
                    %
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card padding="md" hover>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Занятий проведено
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {
                      currentClasses.filter((cls) => cls.attendanceMarked)
                        .length
                    }{" "}
                    / {currentClasses.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <EmptyState
          icon={<Calendar className="w-12 h-12 text-slate-400" />}
          title="Свободный день"
          description="На сегодня у вас нет запланированных занятий. Хорошего отдыха!"
        />
      )}
    </div>
  );
};
