// src/hooks/useStudentData.ts

// src/hooks/useStudentData.ts

import { useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  useStudentAttendanceStats,
  useStudentAttendance,
} from "@/services/attendanceService"; // Используем существующий сервис
import { useSubjectsForGroup } from "@/services/subjectService"; // Используем существующий сервис
import { useGroupById } from "@/services/groupeServise";
import { useScheduleByGroup } from "@/services/scheduleService";
import { useTeachersMap } from "@/hooks/useTeachers"; // Используем ваш существующий хук
import { getWeekDates, getWeekDayFromDate } from "@/utils/dates";
import { WeekDay, Schedule, Subject, User } from "@/types";

// Интерфейс для преобразованного расписания
interface TransformedScheduleItem {
  time: string;
  subject: string;
  teacher: string;
  classroom: string;
  type: "Лекция" | "Практика" | "Лабораторная" | "Семинар";
}

type TransformedWeekSchedule = Record<WeekDay, TransformedScheduleItem[]>;

/**
 * Хук для получения всех данных студента
 */
export function useStudentData() {
  const { user } = useAuthStore();
  const today = new Date();

  // Основные данные
  const { data: group, isLoading: groupLoading } = useGroupById(
    user?.groupId || ""
  );
  const { data: subjects = [], isLoading: subjectsLoading } =
    useSubjectsForGroup(user?.groupId || "");
  const { data: attendanceStats, isLoading: statsLoading } =
    useStudentAttendanceStats(user?.$id || "");
  const { data: attendanceHistory = [], isLoading: historyLoading } =
    useStudentAttendance(user?.$id || "");

  // Реальные данные расписания из API
  const { data: realScheduleData = [], isLoading: scheduleLoading } =
    useScheduleByGroup(user?.groupId || "");

  // Получаем уникальные ID преподавателей из расписания
  const teacherIds = useMemo(() => {
    return [...new Set(realScheduleData.map((schedule) => schedule.teacherId))];
  }, [realScheduleData]);

  // Получаем карту преподавателей (id -> name)
  const teachersMap = useTeachersMap(teacherIds);

  // Преобразование расписания в нужный формат
  const weekSchedule = useMemo(() => {
    // Используем только реальные данные из API
    return transformScheduleToWeekFormat(
      realScheduleData,
      subjects,
      teachersMap
    );
  }, [realScheduleData, subjects, teachersMap]);

  const todaysSchedule = useMemo(() => {
    const todayWeekDay = getWeekDayFromDate(today);
    return weekSchedule[todayWeekDay] || [];
  }, [weekSchedule, today]);

  const weekDates = useMemo(() => {
    return getWeekDates(today);
  }, [today]);

  // Статистика
  const stats = useMemo(() => {
    const rate = attendanceStats?.attendanceRate || 0;

    let performance: "excellent" | "good" | "satisfactory" | "poor";
    if (rate >= 95) performance = "excellent";
    else if (rate >= 85) performance = "good";
    else if (rate >= 70) performance = "satisfactory";
    else performance = "poor";

    return {
      attendanceRate: rate,
      performance,
      totalClasses: attendanceStats?.totalClasses || 0,
      presentCount: attendanceStats?.presentCount || 0,
      absentCount: attendanceStats?.absentCount || 0,
      lateCount: attendanceStats?.lateCount || 0,
      excusedCount: attendanceStats?.excusedCount || 0,
    };
  }, [attendanceStats]);

  const isLoading =
    groupLoading ||
    subjectsLoading ||
    statsLoading ||
    historyLoading ||
    scheduleLoading;

  return {
    // Пользователь и группа
    user,
    group,
    subjects,

    // Расписание
    weekSchedule,
    todaysSchedule,
    weekDates,
    today,

    // Посещаемость
    attendanceStats: stats,
    attendanceHistory,

    // Состояние загрузки
    isLoading,

    // Флаги
    hasScheduleToday: todaysSchedule.length > 0,
    hasAttendanceData: attendanceHistory.length > 0,
    isGroupAssigned: !!group,
    hasScheduleData: realScheduleData.length > 0, // Есть ли данные расписания
    noScheduleData: !scheduleLoading && realScheduleData.length === 0, // Нет данных после загрузки
  };
}

/**
 * Хук для работы с расписанием
 */
export function useStudentSchedule() {
  const { user } = useAuthStore();
  const { data: group } = useGroupById(user?.groupId || "");
  const { data: subjects = [] } = useSubjectsForGroup(user?.groupId || "");
  const { data: realScheduleData = [] } = useScheduleByGroup(
    user?.groupId || ""
  );

  // Получаем уникальные ID преподавателей из расписания
  const teacherIds = useMemo(() => {
    return [...new Set(realScheduleData.map((schedule) => schedule.teacherId))];
  }, [realScheduleData]);

  // Получаем карту преподавателей (id -> name)
  const teachersMap = useTeachersMap(teacherIds);

  const today = new Date();

  const weekSchedule = useMemo(() => {
    // Используем только реальные данные из API
    return transformScheduleToWeekFormat(
      realScheduleData,
      subjects,
      teachersMap
    );
  }, [realScheduleData, subjects, teachersMap]);

  const getScheduleForDay = (day: WeekDay) => {
    return weekSchedule[day] || [];
  };

  const getScheduleForDate = (date: Date) => {
    const day = getWeekDayFromDate(date);
    return getScheduleForDay(day);
  };

  const todaysSchedule = useMemo(() => {
    return getScheduleForDate(today);
  }, [today, weekSchedule]);

  const nextClass = useMemo(() => {
    const todaySchedule = getScheduleForDate(today);
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    return todaySchedule.find((item) => {
      const startTime = item.time.split("-")[0];
      return startTime > currentTime;
    });
  }, [today, weekSchedule]);

  const weekStats = useMemo(() => {
    const days = Object.values(WeekDay);
    let totalClasses = 0;
    let daysWithClasses = 0;

    days.forEach((day) => {
      const daySchedule = getScheduleForDay(day);
      if (daySchedule.length > 0) {
        daysWithClasses++;
        totalClasses += daySchedule.length;
      }
    });

    return {
      totalClasses,
      daysWithClasses,
      averageClassesPerDay:
        daysWithClasses > 0
          ? Math.round((totalClasses / daysWithClasses) * 10) / 10
          : 0,
    };
  }, [weekSchedule]);

  return {
    weekSchedule,
    todaysSchedule,
    nextClass,
    weekStats,
    getScheduleForDay,
    getScheduleForDate,
  };
}

/**
 * Функция для преобразования данных расписания из API в формат для UI
 */
function transformScheduleToWeekFormat(
  scheduleData: Schedule[],
  subjects: Subject[],
  teachersMap: Map<string, string>
): TransformedWeekSchedule {
  // Инициализируем пустое расписание
  const weekSchedule: TransformedWeekSchedule = {
    [WeekDay.MONDAY]: [],
    [WeekDay.TUESDAY]: [],
    [WeekDay.WEDNESDAY]: [],
    [WeekDay.THURSDAY]: [],
    [WeekDay.FRIDAY]: [],
    [WeekDay.SATURDAY]: [],
    [WeekDay.SUNDAY]: [],
  };

  // Если нет данных, возвращаем пустое расписание
  if (!scheduleData || scheduleData.length === 0) {
    return weekSchedule;
  }

  scheduleData.forEach((schedule) => {
    // Находим предмет по ID
    const subject = subjects.find((s) => s.$id === schedule.subjectId);

    // Получаем имя преподавателя из карты
    const teacherName =
      teachersMap.get(schedule.teacherId) || "Преподаватель не назначен";

    // Определяем тип занятия (можно расширить логику)
    const lessonType = determineLessonType(subject?.name || "");

    const transformedItem: TransformedScheduleItem = {
      time: `${schedule.startTime}-${schedule.endTime}`,
      subject: subject?.name || "Предмет не найден",
      teacher: teacherName,
      classroom: schedule.classroom,
      type: lessonType,
    };

    weekSchedule[schedule.dayOfWeek].push(transformedItem);
  });

  // Сортируем расписание по времени для каждого дня
  Object.keys(weekSchedule).forEach((day) => {
    weekSchedule[day as WeekDay].sort((a, b) => {
      const timeA = a.time.split("-")[0];
      const timeB = b.time.split("-")[0];
      return timeA.localeCompare(timeB);
    });
  });

  return weekSchedule;
}

/**
 * Определение типа занятия по названию предмета
 */
function determineLessonType(
  subjectName: string
): "Лекция" | "Практика" | "Лабораторная" | "Семинар" {
  const name = subjectName.toLowerCase();

  if (name.includes("лабораторная") || name.includes("лаб.")) {
    return "Лабораторная";
  }

  if (name.includes("практика") || name.includes("практическая")) {
    return "Практика";
  }

  if (name.includes("семинар")) {
    return "Семинар";
  }

  // По умолчанию - лекция
  return "Лекция";
}

/**
 * Хук для аналитики посещаемости
 */
export function useAttendanceAnalytics(
  attendanceStats: any,
  attendanceHistory: any[]
) {
  const trends = useMemo(() => {
    if (!attendanceHistory || attendanceHistory.length === 0) {
      return {
        trend: "stable" as const,
        recentRate: 0,
        improvementNeeded: false,
      };
    }

    // Анализируем последние 10 записей
    const recent = attendanceHistory.slice(0, 10);
    const older = attendanceHistory.slice(10, 20);

    const recentPresent = recent.filter(
      (r) => r.status === "present" || r.status === "late"
    ).length;
    const olderPresent = older.filter(
      (r) => r.status === "present" || r.status === "late"
    ).length;

    const recentRate =
      recent.length > 0 ? (recentPresent / recent.length) * 100 : 0;
    const olderRate =
      older.length > 0 ? (olderPresent / older.length) * 100 : recentRate;

    let trend: "improving" | "declining" | "stable";
    if (recentRate > olderRate + 5) trend = "improving";
    else if (recentRate < olderRate - 5) trend = "declining";
    else trend = "stable";

    return {
      trend,
      recentRate,
      improvementNeeded: recentRate < 75,
    };
  }, [attendanceHistory]);

  const recommendations = useMemo(() => {
    const rate = attendanceStats?.attendanceRate || 0;
    const suggestions: string[] = [];

    if (rate < 70) {
      suggestions.push("Постарайтесь не пропускать занятия");
      suggestions.push("Обратитесь к преподавателю при наличии проблем");
    } else if (rate < 85) {
      suggestions.push("Хорошая посещаемость! Стремитесь к 90%+");
    } else if (rate < 95) {
      suggestions.push("Отлично! Немного больше усилий для 95%+");
    } else {
      suggestions.push("Превосходная посещаемость! Так держать!");
    }

    if (attendanceStats?.lateCount > 3) {
      suggestions.push("Постарайтесь приходить вовремя");
    }

    return suggestions;
  }, [attendanceStats]);

  return {
    trends,
    recommendations,
  };
}

/**
 * Хук для уведомлений студента
 */
export function useStudentNotifications() {
  const { todaysSchedule, nextClass } = useStudentSchedule();

  const notifications = useMemo(() => {
    const notifications: Array<{
      id: string;
      type: "info" | "warning" | "success";
      title: string;
      message: string;
      time?: string;
    }> = [];

    // Уведомление о следующем занятии
    if (nextClass) {
      notifications.push({
        id: "next-class",
        type: "info",
        title: "Следующее занятие",
        message: `${nextClass.subject} в ${nextClass.time.split("-")[0]}`,
        time: nextClass.time.split("-")[0],
      });
    }

    // Уведомление о количестве занятий сегодня
    if (todaysSchedule.length > 0) {
      notifications.push({
        id: "today-classes",
        type: "info",
        title: "Сегодня",
        message: `У вас ${todaysSchedule.length} занятий`,
      });
    } else {
      notifications.push({
        id: "no-classes",
        type: "success",
        title: "Свободный день",
        message: "Сегодня у вас нет занятий",
      });
    }

    return notifications;
  }, [todaysSchedule, nextClass]);

  return {
    notifications,
    hasUnread: notifications.length > 0,
  };
}
