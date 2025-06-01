// src/hooks/useStudentData.ts

import { useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  useStudentAttendanceStats,
  useStudentAttendance,
} from "@/services/attendanceService";
import { useSubjectsForGroup } from "@/services/subjectService";
import { useGroupById } from "@/services/groupeServise";
import { getScheduleBySpecialization } from "@/data/mockSchedule";
import { getWeekDates, getWeekDayFromDate } from "@/utils/dates";
import { WeekDay } from "@/types";

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

  // Расписание
  const weekSchedule = useMemo(() => {
    return getScheduleBySpecialization(group?.specialization);
  }, [group?.specialization]);

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
    groupLoading || subjectsLoading || statsLoading || historyLoading;

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
  };
}

/**
 * Хук для работы с расписанием
 */
export function useStudentSchedule() {
  const { group } = useAuthStore();
  const today = new Date();

  const weekSchedule = useMemo(() => {
    return getScheduleBySpecialization(group?.specialization);
  }, [group?.specialization]);

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
