// src/components/teacher/TodayTab.tsx

"use client";

import React, { useState } from "react";
import { Calendar, CheckCircle, BarChart3 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useClasses } from "@/services/attendanceService";
import { AttendanceStatus } from "@/types";
import { ClassCard } from "./ClassCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// Локальный интерфейс для ClassCard
interface ClassItem {
  id?: string;
  subject: string;
  group: string;
  time: string;
  classroom: string;
  studentsCount: number;
  attendanceMarked: boolean;
  stats?: {
    present: number;
    absent: number;
    late: number;
    total: number;
    percentage: number;
  };
  recentAttendance?: Array<{
    name: string;
    status: AttendanceStatus;
  }>;
}

export const TodayTab: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMockData, setShowMockData] = useState(false);

  // Получаем занятия преподавателя на выбранную дату
  const {
    data: todaysClasses = [],
    isLoading,
    error,
  } = useClasses({
    teacherId: user?.$id,
    date: selectedDate.toISOString().split("T")[0],
  });

  // Mock данные для тестирования
  const mockClasses: ClassItem[] = [
    {
      id: "mock-1",
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
      id: "mock-2",
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

  // Функция преобразования ClassWithDetails в ClassItem
  const convertToClassItem = (classData: any): ClassItem | null => {
    console.log("Converting class data:", classData);

    try {
      // Проверяем разные возможные структуры данных
      let subject = "Неизвестный предмет";
      let group = "Неизвестная группа";
      let time = "Время не указано";
      let classroom = "Не указана";

      // Вариант 1: Данные с вложенным schedule
      if (classData.schedule) {
        subject =
          classData.schedule.subject?.name ||
          classData.schedule.subjectName ||
          subject;
        group =
          classData.schedule.group?.name ||
          classData.schedule.groupName ||
          group;
      }
      // Вариант 2: Данные с прямыми полями
      else if (classData.subjectId || classData.subjectName) {
        subject =
          classData.subjectName ||
          classData.subject?.name ||
          classData.subjectId;
        group =
          classData.groupName || classData.group?.name || classData.groupId;
      }
      // Вариант 3: Уже готовые данные
      else if (classData.subject) {
        subject = classData.subject;
        group = classData.group;
      }

      // Обработка времени
      if (classData.startTime && classData.endTime) {
        time = `${classData.startTime} - ${classData.endTime}`;
      } else if (classData.time) {
        time = classData.time;
      }

      // Обработка аудитории
      if (classData.classroom) {
        classroom = classData.classroom;
      }

      const result: ClassItem = {
        id: classData.$id || classData.id || Math.random().toString(),
        subject,
        group,
        time,
        classroom,
        studentsCount: classData.studentsCount || 25,
        attendanceMarked:
          classData.isCompleted || classData.attendanceMarked || false,
        stats: {
          present: 0,
          absent: 0,
          late: 0,
          total: classData.studentsCount || 25,
          percentage: 0,
        },
        recentAttendance: [],
      };

      console.log("Converted to ClassItem:", result);
      return result;
    } catch (error) {
      console.error("Error converting class data:", error, classData);
      return null;
    }
  };

  // Используем реальные данные из API или mock данные для тестирования
  const convertedClasses = todaysClasses
    .map(convertToClassItem)
    .filter((item): item is ClassItem => item !== null);

  const currentClasses: ClassItem[] = showMockData
    ? mockClasses
    : convertedClasses;

  console.log("=== DEBUG INFO ===");
  console.log("Selected date:", selectedDate.toISOString().split("T")[0]);
  console.log("Raw API data:", todaysClasses);
  console.log("Converted classes:", convertedClasses);
  console.log("Using mock data:", showMockData);
  console.log("Final classes to show:", currentClasses);
  console.log("Is loading:", isLoading);
  console.log("API Error:", error);

  // Функция для изменения даты
  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
    setShowMockData(false); // Сбрасываем mock при смене даты
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

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

  return (
    <div className="space-y-8">
      {/* Заголовок дня с навигацией */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isToday ? "Сегодня" : "Расписание"},{" "}
            {selectedDate.toLocaleDateString("ru-RU", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h1>
          <p className="text-slate-600 mt-1">
            {isLoading
              ? "Загрузка расписания..."
              : currentClasses.length > 0
              ? `${showMockData ? "[ТЕСТ] " : ""}${
                  currentClasses.length
                } занятий на эту дату`
              : "Нет занятий на эту дату"}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Навигация по датам */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => changeDate(-1)}>
              ← Вчера
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
            >
              Сегодня
            </Button>
            <Button variant="outline" size="sm" onClick={() => changeDate(1)}>
              Завтра →
            </Button>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">
              {selectedDate.toLocaleDateString("ru-RU", { day: "2-digit" })}
            </div>
            <div className="text-sm text-slate-500">
              {selectedDate.toLocaleDateString("ru-RU", { month: "short" })}
            </div>
          </div>
        </div>
      </div>

      {/* Занятия на сегодня */}
      {isLoading ? (
        <div className="space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
          </div>
          <LoadingSpinner size="lg" text="Загрузка расписания..." />
        </div>
      ) : currentClasses.length > 0 ? (
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
                    {currentClasses.length > 0
                      ? Math.round(
                          currentClasses.reduce(
                            (sum, cls) => sum + (cls.stats?.percentage || 0),
                            0
                          ) / currentClasses.length
                        )
                      : 0}
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
        <div className="space-y-4">
          <EmptyState
            icon={<Calendar className="w-12 h-12 text-slate-400" />}
            title={
              convertedClasses.length === 0 && !isLoading
                ? "Нет занятий на эту дату"
                : "Свободный день"
            }
            description={
              convertedClasses.length === 0 && !isLoading
                ? `На ${
                    isToday ? "сегодня" : "эту дату"
                  } у вас нет запланированных занятий в системе. ${
                    selectedDate.getDay() === 0 || selectedDate.getDay() === 6
                      ? "Это выходной день."
                      : "Проверьте расписание или обратитесь к администратору."
                  }`
                : `На ${
                    isToday ? "сегодня" : "эту дату"
                  } у вас нет запланированных занятий. Хорошего отдыха!`
            }
            action={{
              label: "Показать тестовые данные",
              onClick: () => setShowMockData(true),
            }}
            secondaryAction={{
              label: "Проверить другую дату",
              onClick: () => changeDate(1),
            }}
          />

          {/* Панель диагностики */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-3">
              🔍 Диагностика проблемы
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-blue-800 mb-2">
                  Возможные причины:
                </p>
                <ul className="text-blue-700 space-y-1 text-xs">
                  <li>
                    •{" "}
                    {selectedDate.getDay() === 0 || selectedDate.getDay() === 6
                      ? "Выходной день (суббота/воскресенье)"
                      : "Нет занятий в этот день"}
                  </li>
                  <li>• Расписание не создано в системе</li>
                  <li>• Преподаватель не назначен на занятия</li>
                  <li>• Проблема с API запросом</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-blue-800 mb-2">
                  Что можно сделать:
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() =>
                      changeDate(
                        selectedDate.getDay() === 0
                          ? 1
                          : selectedDate.getDay() === 6
                          ? 2
                          : 1
                      )
                    }
                  >
                    Проверить следующий рабочий день
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => setShowMockData(true)}
                  >
                    Тестировать с примерами
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Отладочная информация */}
          <details className="mt-4">
            <summary className="cursor-pointer p-4 bg-gray-100 rounded-lg hover:bg-gray-200">
              <span className="font-medium text-gray-900">
                📋 Техническая информация
              </span>
            </summary>
            <div className="mt-2 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 space-y-2">
                <div>
                  <strong>Пользователь ID:</strong> {user?.$id || "не найден"}
                </div>
                <div>
                  <strong>Дата запроса:</strong>{" "}
                  {selectedDate.toISOString().split("T")[0]}
                </div>
                <div>
                  <strong>День недели:</strong>{" "}
                  {selectedDate.toLocaleDateString("ru-RU", {
                    weekday: "long",
                  })}
                </div>
                <div>
                  <strong>Загрузка:</strong> {isLoading ? "да" : "нет"}
                </div>
                <div>
                  <strong>Ошибка API:</strong> {error ? error.message : "нет"}
                </div>
                <div>
                  <strong>Занятий из API:</strong> {todaysClasses.length}
                </div>
                <div>
                  <strong>Успешно конвертировано:</strong>{" "}
                  {convertedClasses.length}
                </div>

                {todaysClasses.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium">
                      Сырые данные API
                    </summary>
                    <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-40 border">
                      {JSON.stringify(todaysClasses, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};
