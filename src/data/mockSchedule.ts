// src/data/mockSchedule.ts

import { WeekDay } from "@/types";

export interface MockScheduleItem {
  time: string;
  subject: string;
  teacher: string;
  classroom: string;
  type: "Лекция" | "Практика" | "Лабораторная" | "Семинар";
}

export type MockWeekSchedule = Record<WeekDay, MockScheduleItem[]>;

// Базовые данные преподавателей
export const teachers = {
  mathematics: "Иванова А.С.",
  programming: "Петров П.П.",
  physics: "Сидорова С.С.",
  english: "Смирнова О.В.",
  history: "Козлова Н.И.",
  economics: "Морозов В.А.",
  chemistry: "Федорова Л.М.",
  philosophy: "Григорьев И.П.",
  sports: "Волков А.М.",
  literature: "Романова Е.Н.",
};

// Базовые данные аудиторий
export const classrooms = {
  lecture: ["Ауд. 101", "Ауд. 102", "Ауд. 201", "Ауд. 202", "Ауд. 205"],
  computer: ["Ауд. 301", "Ауд. 302", "Ауд. 303"],
  lab: ["Лаб. 105", "Лаб. 106", "Лаб. 107"],
  language: ["Ауд. 102", "Ауд. 103"],
  sports: ["Спортзал", "Стадион"],
};

// Временные слоты
export const timeSlots = [
  "08:00-09:30",
  "09:45-11:15",
  "11:30-13:00",
  "13:45-15:15",
  "15:30-17:00",
  "17:15-18:45",
];

// Функция для генерации расписания для группы ИТ-301
export const generateITGroupSchedule = (): MockWeekSchedule => {
  return {
    [WeekDay.MONDAY]: [
      {
        time: "09:00-10:30",
        subject: "Математический анализ",
        teacher: teachers.mathematics,
        classroom: "Ауд. 205",
        type: "Лекция",
      },
      {
        time: "10:45-12:15",
        subject: "Программирование",
        teacher: teachers.programming,
        classroom: "Ауд. 301",
        type: "Практика",
      },
      {
        time: "13:45-15:15",
        subject: "Английский язык",
        teacher: teachers.english,
        classroom: "Ауд. 102",
        type: "Семинар",
      },
    ],

    [WeekDay.TUESDAY]: [
      {
        time: "11:30-13:00",
        subject: "Физика",
        teacher: teachers.physics,
        classroom: "Лаб. 105",
        type: "Лабораторная",
      },
      {
        time: "13:45-15:15",
        subject: "Математический анализ",
        teacher: teachers.mathematics,
        classroom: "Ауд. 205",
        type: "Семинар",
      },
      {
        time: "15:30-17:00",
        subject: "Философия",
        teacher: teachers.philosophy,
        classroom: "Ауд. 201",
        type: "Лекция",
      },
    ],

    [WeekDay.WEDNESDAY]: [
      {
        time: "09:00-10:30",
        subject: "Программирование",
        teacher: teachers.programming,
        classroom: "Ауд. 301",
        type: "Лекция",
      },
      {
        time: "10:45-12:15",
        subject: "История",
        teacher: teachers.history,
        classroom: "Ауд. 201",
        type: "Лекция",
      },
      {
        time: "13:45-15:15",
        subject: "Экономика",
        teacher: teachers.economics,
        classroom: "Ауд. 202",
        type: "Семинар",
      },
    ],

    [WeekDay.THURSDAY]: [
      {
        time: "09:00-10:30",
        subject: "Физика",
        teacher: teachers.physics,
        classroom: "Ауд. 105",
        type: "Лекция",
      },
      {
        time: "11:30-13:00",
        subject: "Химия",
        teacher: teachers.chemistry,
        classroom: "Лаб. 106",
        type: "Лабораторная",
      },
      {
        time: "13:45-15:15",
        subject: "Программирование",
        teacher: teachers.programming,
        classroom: "Ауд. 302",
        type: "Лабораторная",
      },
      {
        time: "15:30-17:00",
        subject: "Английский язык",
        teacher: teachers.english,
        classroom: "Ауд. 102",
        type: "Практика",
      },
    ],

    [WeekDay.FRIDAY]: [
      {
        time: "10:45-12:15",
        subject: "История",
        teacher: teachers.history,
        classroom: "Ауд. 201",
        type: "Семинар",
      },
      {
        time: "13:45-15:15",
        subject: "Математический анализ",
        teacher: teachers.mathematics,
        classroom: "Ауд. 205",
        type: "Практика",
      },
      {
        time: "15:30-17:00",
        subject: "Литература",
        teacher: teachers.literature,
        classroom: "Ауд. 101",
        type: "Лекция",
      },
    ],

    [WeekDay.SATURDAY]: [
      {
        time: "09:00-10:30",
        subject: "Физическая культура",
        teacher: teachers.sports,
        classroom: "Спортзал",
        type: "Практика",
      },
      {
        time: "10:45-12:15",
        subject: "Экономика",
        teacher: teachers.economics,
        classroom: "Ауд. 202",
        type: "Практика",
      },
    ],

    [WeekDay.SUNDAY]: [],
  };
};

// Функция для генерации расписания для группы ЭК-201
export const generateEconomicsGroupSchedule = (): MockWeekSchedule => {
  return {
    [WeekDay.MONDAY]: [
      {
        time: "09:00-10:30",
        subject: "Микроэкономика",
        teacher: teachers.economics,
        classroom: "Ауд. 202",
        type: "Лекция",
      },
      {
        time: "10:45-12:15",
        subject: "Математика для экономистов",
        teacher: teachers.mathematics,
        classroom: "Ауд. 205",
        type: "Лекция",
      },
      {
        time: "13:45-15:15",
        subject: "Английский язык",
        teacher: teachers.english,
        classroom: "Ауд. 103",
        type: "Практика",
      },
    ],

    [WeekDay.TUESDAY]: [
      {
        time: "11:30-13:00",
        subject: "История экономики",
        teacher: teachers.history,
        classroom: "Ауд. 201",
        type: "Лекция",
      },
      {
        time: "13:45-15:15",
        subject: "Микроэкономика",
        teacher: teachers.economics,
        classroom: "Ауд. 202",
        type: "Семинар",
      },
    ],

    [WeekDay.WEDNESDAY]: [
      {
        time: "09:00-10:30",
        subject: "Философия",
        teacher: teachers.philosophy,
        classroom: "Ауд. 201",
        type: "Лекция",
      },
      {
        time: "10:45-12:15",
        subject: "Математика для экономистов",
        teacher: teachers.mathematics,
        classroom: "Ауд. 205",
        type: "Семинар",
      },
    ],

    [WeekDay.THURSDAY]: [
      {
        time: "13:45-15:15",
        subject: "Макроэкономика",
        teacher: teachers.economics,
        classroom: "Ауд. 202",
        type: "Лекция",
      },
      {
        time: "15:30-17:00",
        subject: "Английский язык",
        teacher: teachers.english,
        classroom: "Ауд. 103",
        type: "Семинар",
      },
    ],

    [WeekDay.FRIDAY]: [
      {
        time: "10:45-12:15",
        subject: "История экономики",
        teacher: teachers.history,
        classroom: "Ауд. 201",
        type: "Семинар",
      },
      {
        time: "13:45-15:15",
        subject: "Макроэкономика",
        teacher: teachers.economics,
        classroom: "Ауд. 202",
        type: "Семинар",
      },
    ],

    [WeekDay.SATURDAY]: [
      {
        time: "09:00-10:30",
        subject: "Физическая культура",
        teacher: teachers.sports,
        classroom: "Спортзал",
        type: "Практика",
      },
    ],

    [WeekDay.SUNDAY]: [],
  };
};

// Функция для получения расписания по специализации группы
export const getScheduleBySpecialization = (
  specialization?: string
): MockWeekSchedule => {
  if (!specialization) {
    return generateITGroupSchedule(); // По умолчанию
  }

  // Простая логика определения расписания по специализации
  if (
    specialization.toLowerCase().includes("информационные технологии") ||
    specialization.toLowerCase().includes("программирование") ||
    specialization.toLowerCase().includes("компьютер")
  ) {
    return generateITGroupSchedule();
  }

  if (
    specialization.toLowerCase().includes("экономика") ||
    specialization.toLowerCase().includes("менеджмент") ||
    specialization.toLowerCase().includes("финансы")
  ) {
    return generateEconomicsGroupSchedule();
  }

  // Для остальных специализаций возвращаем базовое IT расписание
  return generateITGroupSchedule();
};
