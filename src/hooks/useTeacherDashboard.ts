// src/hooks/useTeacherDashboard.ts

import { useState, useCallback, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useClasses } from "@/services/attendanceService";
import { useScheduleByTeacher } from "@/services/scheduleService";
import { AttendanceStatus } from "@/types";
import { toast } from "react-toastify";

interface TeacherStats {
  totalStudents: number;
  totalClasses: number;
  avgAttendance: number;
  classesCompleted: number;
  pendingClasses: number;
}

interface ClassWithStudents {
  id: string;
  subject: string;
  group: string;
  date: string;
  time: string;
  classroom: string;
  students: Array<{
    id: string;
    name: string;
    studentId: string;
    status?: AttendanceStatus;
    notes?: string;
  }>;
  attendanceMarked: boolean;
}

export const useTeacherDashboard = () => {
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [stats, setStats] = useState<TeacherStats>({
    totalStudents: 0,
    totalClasses: 0,
    avgAttendance: 0,
    classesCompleted: 0,
    pendingClasses: 0,
  });

  // Получаем данные от API
  const {
    data: todaysClasses = [],
    isLoading: isLoadingClasses,
    refetch: refetchClasses,
  } = useClasses({
    teacherId: user?.$id,
    date: selectedDate.toISOString().split("T")[0],
  });

  const { data: schedule = [], isLoading: isLoadingSchedule } =
    useScheduleByTeacher(user?.$id || "");

  // Вычисляем статистику
  const calculateStats = useCallback(() => {
    // Это примерная логика расчета статистики
    // В реальном приложении эти данные должны прийти от API
    const mockStats: TeacherStats = {
      totalStudents: 150,
      totalClasses: todaysClasses.length || 5,
      avgAttendance: 87.5,
      classesCompleted: Math.floor((todaysClasses.length || 5) * 0.6),
      pendingClasses: Math.ceil((todaysClasses.length || 5) * 0.4),
    };

    setStats(mockStats);
  }, [todaysClasses]);

  // Пересчитываем статистику при изменении данных
  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  // Отметка посещаемости для занятия
  const markAttendance = useCallback(
    async (
      classId: string,
      attendanceData: Array<{
        studentId: string;
        status: AttendanceStatus;
        notes?: string;
      }>
    ) => {
      try {
        // Здесь будет вызов API для сохранения посещаемости
        console.log("Marking attendance for class:", classId, attendanceData);

        // Имитируем задержку API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Обновляем локальные данные
        await refetchClasses();

        toast.success("Посещаемость успешно отмечена!");
        return true;
      } catch (error) {
        console.error("Error marking attendance:", error);
        toast.error("Ошибка при отметке посещаемости");
        return false;
      }
    },
    [refetchClasses]
  );

  // Получение студентов для занятия
  const getStudentsForClass = useCallback((classId: string) => {
    // Примерные данные студентов
    // В реальном приложении это должно прийти от API
    const mockStudents = [
      {
        id: "1",
        name: "Иванов Иван Иванович",
        studentId: "ST20240001",
        status: AttendanceStatus.PRESENT,
        notes: "",
      },
      {
        id: "2",
        name: "Петров Петр Петрович",
        studentId: "ST20240002",
        status: AttendanceStatus.ABSENT,
        notes: "Болен",
      },
      {
        id: "3",
        name: "Сидорова Анна Александровна",
        studentId: "ST20240003",
        status: AttendanceStatus.LATE,
        notes: "Опоздал на 15 минут",
      },
      {
        id: "4",
        name: "Козлов Константин Константинович",
        studentId: "ST20240004",
        status: AttendanceStatus.PRESENT,
        notes: "",
      },
      {
        id: "5",
        name: "Морозова Елена Викторовна",
        studentId: "ST20240005",
        status: AttendanceStatus.EXCUSED,
        notes: "Справка от врача",
      },
    ];

    return mockStudents;
  }, []);

  // Экспорт данных
  const exportAttendanceData = useCallback(
    async (
      format: "excel" | "csv" | "pdf",
      filters?: {
        dateFrom?: string;
        dateTo?: string;
        groupId?: string;
        subjectId?: string;
      }
    ) => {
      try {
        console.log("Exporting attendance data:", format, filters);

        // Имитируем генерацию файла
        await new Promise((resolve) => setTimeout(resolve, 2000));

        toast.success(
          `Данные экспортированы в формате ${format.toUpperCase()}`
        );
        return true;
      } catch (error) {
        console.error("Error exporting data:", error);
        toast.error("Ошибка при экспорте данных");
        return false;
      }
    },
    []
  );

  // Получение аналитических данных
  const getAnalyticsData = useCallback(() => {
    // Примерные аналитические данные
    return {
      weeklyAttendance: [
        { week: "Нед 1", attendance: 85.2 },
        { week: "Нед 2", attendance: 87.1 },
        { week: "Нед 3", attendance: 88.5 },
        { week: "Нед 4", attendance: 87.8 },
      ],
      groupPerformance: [
        { group: "ИТ-301", attendance: 89.2, trend: "up" },
        { group: "ИТ-201", attendance: 85.7, trend: "down" },
        { group: "ИТ-401", attendance: 88.1, trend: "stable" },
      ],
      subjectStats: [
        { subject: "Математический анализ", attendance: 91.2, classes: 16 },
        { subject: "Линейная алгебра", attendance: 85.8, classes: 14 },
        { subject: "Дискретная математика", attendance: 86.4, classes: 15 },
      ],
    };
  }, []);

  // Управление уведомлениями
  const sendNotification = useCallback(
    async (
      type: "low_attendance" | "missing_class" | "custom",
      recipients: string[],
      message: string
    ) => {
      try {
        console.log("Sending notification:", type, recipients, message);

        // Имитируем отправку уведомления
        await new Promise((resolve) => setTimeout(resolve, 1000));

        toast.success(
          `Уведомление отправлено ${recipients.length} получателям`
        );
        return true;
      } catch (error) {
        console.error("Error sending notification:", error);
        toast.error("Ошибка при отправке уведомления");
        return false;
      }
    },
    []
  );

  // Создание нового занятия
  const createClass = useCallback(
    async (classData: {
      subjectId: string;
      groupId: string;
      date: string;
      startTime: string;
      endTime: string;
      classroom: string;
      topic?: string;
    }) => {
      try {
        console.log("Creating new class:", classData);

        // Имитируем создание занятия
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Обновляем данные
        await refetchClasses();

        toast.success("Занятие успешно создано!");
        return true;
      } catch (error) {
        console.error("Error creating class:", error);
        toast.error("Ошибка при создании занятия");
        return false;
      }
    },
    [refetchClasses]
  );

  // Отмена занятия
  const cancelClass = useCallback(
    async (classId: string, reason: string) => {
      try {
        console.log("Canceling class:", classId, reason);

        // Имитируем отмену занятия
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Обновляем данные
        await refetchClasses();

        toast.success("Занятие отменено");
        return true;
      } catch (error) {
        console.error("Error canceling class:", error);
        toast.error("Ошибка при отмене занятия");
        return false;
      }
    },
    [refetchClasses]
  );

  return {
    // Данные
    user,
    stats,
    todaysClasses,
    schedule,
    selectedDate,

    // Состояния загрузки
    isLoadingClasses,
    isLoadingSchedule,

    // Действия
    setSelectedDate,
    markAttendance,
    getStudentsForClass,
    exportAttendanceData,
    getAnalyticsData,
    sendNotification,
    createClass,
    cancelClass,
    refetchClasses,

    // Утилиты
    calculateStats,
  };
};
