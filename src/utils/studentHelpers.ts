// src/utils/studentHelpers.ts

import { AttendanceStatus } from "@/types";

/**
 * Утилиты для работы с данными студента
 */

// Функция для определения цвета посещаемости
export const getAttendanceColor = (
  rate: number
): {
  color: string;
  bgColor: string;
  textColor: string;
  label: string;
} => {
  if (rate >= 95) {
    return {
      color: "emerald",
      bgColor: "bg-emerald-100",
      textColor: "text-emerald-700",
      label: "Отлично",
    };
  } else if (rate >= 85) {
    return {
      color: "blue",
      bgColor: "bg-blue-100",
      textColor: "text-blue-700",
      label: "Хорошо",
    };
  } else if (rate >= 70) {
    return {
      color: "orange",
      bgColor: "bg-orange-100",
      textColor: "text-orange-700",
      label: "Удовлетворительно",
    };
  } else {
    return {
      color: "red",
      bgColor: "bg-red-100",
      textColor: "text-red-700",
      label: "Требует внимания",
    };
  }
};

// Функция для получения иконки статуса посещаемости
export const getAttendanceIcon = (status: AttendanceStatus): string => {
  switch (status) {
    case AttendanceStatus.PRESENT:
      return "✅";
    case AttendanceStatus.ABSENT:
      return "❌";
    case AttendanceStatus.LATE:
      return "⏰";
    case AttendanceStatus.EXCUSED:
      return "ℹ️";
    default:
      return "❓";
  }
};

// Функция для форматирования времени занятия
export const formatClassTime = (
  timeRange: string
): {
  start: string;
  end: string;
  duration: number;
} => {
  const [start, end] = timeRange.split("-");

  // Вычисляем продолжительность в минутах
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  const duration = endMinutes - startMinutes;

  return {
    start: start.trim(),
    end: end.trim(),
    duration,
  };
};

// Вспомогательная функция для конвертации времени в минуты
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Функция для определения, идет ли сейчас занятие
export const isClassActive = (timeRange: string): boolean => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const { start, end } = formatClassTime(timeRange);

  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

// Функция для определения, скоро ли начнется занятие
export const isClassSoon = (
  timeRange: string,
  minutesBefore: number = 15
): boolean => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const { start } = formatClassTime(timeRange);

  const startMinutes = timeToMinutes(start);
  const timeDiff = startMinutes - currentMinutes;

  return timeDiff > 0 && timeDiff <= minutesBefore;
};

// Функция для получения следующего занятия
export const getNextClass = (todaySchedule: any[]): any | null => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    todaySchedule.find((item) => {
      const { start } = formatClassTime(item.time);
      const startMinutes = timeToMinutes(start);
      return startMinutes > currentMinutes;
    }) || null
  );
};

// Функция для получения времени до следующего занятия
export const getTimeUntilNextClass = (
  nextClass: any
): {
  hours: number;
  minutes: number;
  totalMinutes: number;
} => {
  if (!nextClass) {
    return { hours: 0, minutes: 0, totalMinutes: 0 };
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const { start } = formatClassTime(nextClass.time);
  const startMinutes = timeToMinutes(start);

  const totalMinutes = Math.max(0, startMinutes - currentMinutes);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return { hours, minutes, totalMinutes };
};

// Функция для генерации рекомендаций по посещаемости
export const getAttendanceRecommendations = (stats: {
  attendanceRate: number;
  absentCount: number;
  lateCount: number;
  totalClasses: number;
}): string[] => {
  const recommendations: string[] = [];

  if (stats.attendanceRate < 70) {
    recommendations.push(
      "🚨 Критически низкая посещаемость! Необходимо посещать все занятия"
    );
    recommendations.push("💬 Обратитесь к куратору группы за помощью");
  } else if (stats.attendanceRate < 85) {
    recommendations.push("⚠️ Старайтесь не пропускать занятия");
    recommendations.push("🎯 Цель: довести посещаемость до 90%+");
  } else if (stats.attendanceRate < 95) {
    recommendations.push("👍 Хорошая посещаемость! Стремитесь к 95%+");
  } else {
    recommendations.push("🏆 Отличная посещаемость! Так держать!");
  }

  if (stats.lateCount > 3) {
    recommendations.push("⏰ Постарайтесь приходить на занятия вовремя");
  }

  if (stats.absentCount > 0 && stats.totalClasses > 0) {
    const absentRate = (stats.absentCount / stats.totalClasses) * 100;
    if (absentRate > 10) {
      recommendations.push(
        "📚 Узнайте у одногруппников материал пропущенных занятий"
      );
    }
  }

  return recommendations;
};

// Функция для определения типа занятия по названию
export const getClassTypeInfo = (
  type: string
): {
  color: string;
  bgColor: string;
  icon: string;
  description: string;
} => {
  switch (type.toLowerCase()) {
    case "лекция":
      return {
        color: "blue",
        bgColor: "bg-blue-100",
        icon: "📖",
        description: "Теоретическое занятие",
      };
    case "практика":
      return {
        color: "green",
        bgColor: "bg-green-100",
        icon: "🛠️",
        description: "Практическая работа",
      };
    case "лабораторная":
      return {
        color: "purple",
        bgColor: "bg-purple-100",
        icon: "🔬",
        description: "Лабораторная работа",
      };
    case "семинар":
      return {
        color: "orange",
        bgColor: "bg-orange-100",
        icon: "💭",
        description: "Семинарское занятие",
      };
    default:
      return {
        color: "gray",
        bgColor: "bg-gray-100",
        icon: "📋",
        description: "Занятие",
      };
  }
};

// Функция для форматирования продолжительности
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} мин`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} ч`;
  }

  return `${hours} ч ${remainingMinutes} мин`;
};

// Функция для проверки, является ли день выходным
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // Воскресенье или суббота
};

// Функция для получения приветствия в зависимости от времени
export const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour < 6) return "Доброй ночи";
  if (hour < 12) return "Доброе утро";
  if (hour < 18) return "Добрый день";
  return "Добрый вечер";
};

// Функция для вычисления академического прогресса
export const calculateAcademicProgress = (stats: {
  attendanceRate: number;
  totalClasses: number;
  presentCount: number;
}): {
  progress: number;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  nextMilestone: number;
} => {
  const { attendanceRate, totalClasses } = stats;

  let level: "beginner" | "intermediate" | "advanced" | "expert";
  let nextMilestone: number;

  if (attendanceRate >= 95) {
    level = "expert";
    nextMilestone = 100;
  } else if (attendanceRate >= 85) {
    level = "advanced";
    nextMilestone = 95;
  } else if (attendanceRate >= 70) {
    level = "intermediate";
    nextMilestone = 85;
  } else {
    level = "beginner";
    nextMilestone = 70;
  }

  return {
    progress: attendanceRate,
    level,
    nextMilestone,
  };
};
