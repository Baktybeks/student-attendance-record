// src/components/teacher/TodayTab.tsx

"use client";

import React, { useState } from "react";
import { Calendar, CheckCircle, BarChart3, RefreshCw } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useClassesWithDetails } from "@/services/classService";
import { AttendanceStatus, ClassWithDetails } from "@/types";
import { ClassCard } from "./ClassCard";
import { AttendanceModalToday } from "./AttendanceModalToday";
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
  groupId?: string; // Добавляем для модального окна
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
  const [attendanceModal, setAttendanceModal] = useState<{
    isOpen: boolean;
    classItem: ClassItem | null;
  }>({
    isOpen: false,
    classItem: null,
  });

  // Получаем занятия преподавателя на выбранную дату
  const {
    data: todaysClasses = [],
    isLoading,
    error,
    refetch,
  } = useClassesWithDetails({
    teacherId: user?.$id,
    date: selectedDate.toISOString().split("T")[0],
  });

  // Mock данные для тестирования
  const mockClasses: ClassItem[] = [
    {
      id: "mock-1",
      subject: "Математический анализ",
      group: "ИТ-301",
      groupId: "mock-group-1", // Добавляем groupId для тестирования
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
      groupId: "mock-group-1", // Добавляем groupId для тестирования
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
  const convertToClassItem = (classData: ClassWithDetails): ClassItem => {
    console.log("🔄 Конвертируем занятие:", classData);

    // Извлекаем данные из правильно структурированного объекта
    const subject = classData.schedule?.subject?.name || "Неизвестный предмет";
    const group =
      classData.schedule?.group?.name ||
      classData.schedule?.group?.code ||
      "Неизвестная группа";
    const time = `${classData.startTime} - ${classData.endTime}`;
    const classroom = classData.classroom || "Не указана";

    // Получаем количество студентов из группы
    const studentsCount = classData.schedule?.group?.studentsCount || 25;

    const result: ClassItem = {
      id: classData.$id,
      subject,
      group,
      time,
      classroom,
      studentsCount,
      attendanceMarked: classData.isCompleted || false,
      groupId: classData.groupId, // Добавляем groupId для модального окна
      stats: {
        present: 0,
        absent: 0,
        late: 0,
        total: studentsCount,
        percentage: 0,
      },
      recentAttendance: [],
    };

    console.log("✅ Конвертировано в ClassItem:", result);
    return result;
  };

  // Используем реальные данные из API или mock данные для тестирования
  const convertedClasses = todaysClasses.map(convertToClassItem);

  const currentClasses: ClassItem[] = showMockData
    ? mockClasses
    : convertedClasses;

  console.log("=== DEBUG INFO ===");
  console.log("👤 Пользователь ID:", user?.$id);
  console.log("📅 Выбранная дата:", selectedDate.toISOString().split("T")[0]);
  console.log(
    "🌍 День недели:",
    selectedDate.toLocaleDateString("ru-RU", { weekday: "long" })
  );
  console.log("📚 Сырые данные API:", todaysClasses);
  console.log("🔄 Конвертированные занятия:", convertedClasses);
  console.log("🎭 Используем mock данные:", showMockData);
  console.log("📊 Финальные занятия для отображения:", currentClasses);
  console.log("⏳ Загрузка:", isLoading);
  console.log("❌ Ошибка API:", error);

  // Функция для изменения даты
  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
    setShowMockData(false); // Сбрасываем mock при смене даты
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const handleMarkAttendance = (classId: string) => {
    console.log(
      "📝 Открытие модального окна посещаемости для занятия:",
      classId
    );

    const classItem = currentClasses.find((cls) => cls.id === classId);
    if (classItem) {
      setAttendanceModal({
        isOpen: true,
        classItem,
      });
    } else {
      console.error("❌ Занятие не найдено:", classId);
    }
  };

  const handleCloseAttendanceModal = () => {
    setAttendanceModal({
      isOpen: false,
      classItem: null,
    });
  };

  const handleSaveAttendance = () => {
    console.log("✅ Посещаемость сохранена, обновляем данные");
    // Обновляем данные после сохранения
    refetch();
  };

  const handleViewDetails = (classId: string) => {
    console.log("👁️ Просмотр деталей занятия:", classId);
    // Здесь будет логика просмотра деталей
  };

  const handleExportData = (classId: string) => {
    console.log("📤 Экспорт данных для занятия:", classId);
    // Здесь будет логика экспорта
  };

  const handleRefresh = () => {
    console.log("🔄 Обновление данных...");
    refetch();
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
          {/* Кнопка обновления */}
          <Button
            variant="outline"
            size="sm"
            icon={
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            }
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Обновить
          </Button>

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

      {/* Занятия на выбранную дату */}
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
                    Всего занятий
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {currentClasses.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
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
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </Card>

            <Card padding="md" hover>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Всего студентов
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {currentClasses.reduce(
                      (sum, cls) => sum + cls.studentsCount,
                      0
                    )}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <EmptyState
            icon={<Calendar className="w-12 h-12 text-slate-400" />}
            title={error ? "Ошибка загрузки данных" : "Нет занятий на эту дату"}
            description={
              error
                ? `Произошла ошибка при загрузке данных: ${
                    error.message || "Неизвестная ошибка"
                  }`
                : `На ${
                    isToday ? "сегодня" : "эту дату"
                  } у вас нет запланированных занятий. ${
                    selectedDate.getDay() === 0 || selectedDate.getDay() === 6
                      ? "Это выходной день."
                      : "Проверьте расписание или попробуйте другую дату."
                  }`
            }
            action={{
              label: showMockData
                ? "Скрыть тестовые данные"
                : "Показать тестовые данные",
              onClick: () => setShowMockData(!showMockData),
            }}
            secondaryAction={
              error
                ? {
                    label: "Попробовать снова",
                    onClick: handleRefresh,
                  }
                : {
                    label: "Проверить другую дату",
                    onClick: () => changeDate(1),
                  }
            }
          />

          {/* Панель диагностики */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-3">
              🔍 Информация о загрузке данных
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-blue-800 mb-2">
                  Статус системы:
                </p>
                <ul className="text-blue-700 space-y-1 text-xs">
                  <li>
                    • Пользователь: {user?.name || "Не определен"} (
                    {user?.role || "Без роли"})
                  </li>
                  <li>
                    • День недели:{" "}
                    {selectedDate.toLocaleDateString("ru-RU", {
                      weekday: "long",
                    })}
                  </li>
                  <li>
                    • Тип дня:{" "}
                    {selectedDate.getDay() === 0 || selectedDate.getDay() === 6
                      ? "Выходной"
                      : "Рабочий"}
                  </li>
                  <li>• Занятий в базе: {convertedClasses.length}</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-blue-800 mb-2">Действия:</p>
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
                    {selectedDate.getDay() === 0 || selectedDate.getDay() === 6
                      ? "Перейти к понедельнику"
                      : "Проверить следующий день"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => setShowMockData(true)}
                  >
                    Протестировать интерфейс
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Отладочная информация */}
          <details className="mt-4">
            <summary className="cursor-pointer p-4 bg-gray-100 rounded-lg hover:bg-gray-200">
              <span className="font-medium text-gray-900">
                🔧 Техническая информация (для разработчика)
              </span>
            </summary>
            <div className="mt-2 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 space-y-2">
                <div>
                  <strong>ID пользователя:</strong>{" "}
                  {user?.$id || "❌ Не найден"}
                </div>
                <div>
                  <strong>Дата запроса:</strong>{" "}
                  {selectedDate.toISOString().split("T")[0]}
                </div>
                <div>
                  <strong>Загрузка:</strong> {isLoading ? "✅ Да" : "❌ Нет"}
                </div>
                <div>
                  <strong>Ошибка:</strong>{" "}
                  {error ? `❌ ${error.message}` : "✅ Нет"}
                </div>
                <div>
                  <strong>Сырых занятий из API:</strong> {todaysClasses.length}
                </div>
                <div>
                  <strong>Успешно обработано:</strong> {convertedClasses.length}
                </div>

                {todaysClasses.length > 0 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer font-medium text-blue-600">
                      📋 Показать сырые данные API
                    </summary>
                    <pre className="mt-2 text-xs bg-white p-3 rounded overflow-auto max-h-60 border border-gray-200">
                      {JSON.stringify(todaysClasses, null, 2)}
                    </pre>
                  </details>
                )}

                {convertedClasses.length > 0 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer font-medium text-green-600">
                      ✅ Показать обработанные данные
                    </summary>
                    <pre className="mt-2 text-xs bg-white p-3 rounded overflow-auto max-h-60 border border-gray-200">
                      {JSON.stringify(convertedClasses, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </details>
        </div>
      )}

      {/* Модальное окно для отметки посещаемости */}
      {attendanceModal.isOpen && attendanceModal.classItem && (
        <AttendanceModalToday
          classItem={attendanceModal.classItem}
          isOpen={attendanceModal.isOpen}
          onClose={handleCloseAttendanceModal}
          onSave={handleSaveAttendance}
        />
      )}
    </div>
  );
};
