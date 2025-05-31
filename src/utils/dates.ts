import { WeekDay } from "@/types";

/**
 * Форматирование даты в различные форматы
 */
export const formatDate = (
  date: Date | string,
  format: "short" | "long" | "iso" | "time" | "datetime" = "short"
): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return "Некорректная дата";
  }

  switch (format) {
    case "short":
      return dateObj.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    case "long":
      return dateObj.toLocaleDateString("ru-RU", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    case "iso":
      return dateObj.toISOString().split("T")[0];
    case "time":
      return dateObj.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });
    case "datetime":
      return dateObj.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    default:
      return dateObj.toLocaleDateString("ru-RU");
  }
};

/**
 * Получить день недели из даты
 */
export const getWeekDayFromDate = (date: Date): WeekDay => {
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

/**
 * Получить начало недели (понедельник)
 */
export const getStartOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Получить конец недели (воскресенье)
 */
export const getEndOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() + (7 - day);
  result.setDate(diff);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * Получить массив дат недели
 */
export const getWeekDates = (date: Date): Date[] => {
  const start = getStartOfWeek(date);
  const dates = [];

  for (let i = 0; i < 7; i++) {
    const weekDate = new Date(start);
    weekDate.setDate(start.getDate() + i);
    dates.push(weekDate);
  }

  return dates;
};

/**
 * Проверить, является ли дата сегодняшней
 */
export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const today = new Date();

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

/**
 * Проверить, является ли дата вчерашней
 */
export const isYesterday = (date: Date | string): boolean => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    dateObj.getDate() === yesterday.getDate() &&
    dateObj.getMonth() === yesterday.getMonth() &&
    dateObj.getFullYear() === yesterday.getFullYear()
  );
};

/**
 * Проверить, является ли дата завтрашней
 */
export const isTomorrow = (date: Date | string): boolean => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    dateObj.getDate() === tomorrow.getDate() &&
    dateObj.getMonth() === tomorrow.getMonth() &&
    dateObj.getFullYear() === tomorrow.getFullYear()
  );
};

/**
 * Получить относительную дату (сегодня, вчера, завтра или дату)
 */
export const getRelativeDate = (date: Date | string): string => {
  if (isToday(date)) return "Сегодня";
  if (isYesterday(date)) return "Вчера";
  if (isTomorrow(date)) return "Завтра";
  return formatDate(date, "short");
};

/**
 * Добавить дни к дате
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Вычесть дни из даты
 */
export const subtractDays = (date: Date, days: number): Date => {
  return addDays(date, -days);
};

/**
 * Получить разницу в днях между датами
 */
export const getDaysDifference = (date1: Date, date2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs(date1.getTime() - date2.getTime()) / oneDay);
};

/**
 * Проверить, находится ли дата в диапазоне
 */
export const isDateInRange = (
  date: Date,
  startDate: Date,
  endDate: Date
): boolean => {
  return date >= startDate && date <= endDate;
};

/**
 * Получить начало месяца
 */
export const getStartOfMonth = (date: Date): Date => {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Получить конец месяца
 */
export const getEndOfMonth = (date: Date): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  result.setDate(0);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * Парсинг времени в формате HH:MM
 */
export const parseTime = (
  timeString: string
): { hours: number; minutes: number } | null => {
  const match = timeString.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return { hours, minutes };
};

/**
 * Форматирование времени
 */
export const formatTime = (hours: number, minutes: number): string => {
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

/**
 * Сравнение времени
 */
export const compareTime = (time1: string, time2: string): number => {
  const t1 = parseTime(time1);
  const t2 = parseTime(time2);

  if (!t1 || !t2) return 0;

  const minutes1 = t1.hours * 60 + t1.minutes;
  const minutes2 = t2.hours * 60 + t2.minutes;

  return minutes1 - minutes2;
};

/**
 * Проверить, является ли год високосным
 */
export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

/**
 * Получить количество дней в месяце
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Получить номер недели в году
 */
export const getWeekNumber = (date: Date): number => {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
};
