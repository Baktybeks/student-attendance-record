import { UserRole, AttendanceStatus, WeekDay } from "@/types";

/**
 * Константы приложения
 */

// Роли и их приоритеты
export const ROLE_PRIORITIES = {
  [UserRole.ADMIN]: 3,
  [UserRole.TEACHER]: 2,
  [UserRole.STUDENT]: 1,
} as const;

// Цвета для ролей
export const ROLE_COLORS = {
  [UserRole.ADMIN]: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200",
  },
  [UserRole.TEACHER]: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-200",
  },
  [UserRole.STUDENT]: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    border: "border-purple-200",
  },
} as const;

// Цвета для статусов посещаемости
export const ATTENDANCE_COLORS = {
  [AttendanceStatus.PRESENT]: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-200",
    icon: "text-emerald-600",
  },
  [AttendanceStatus.ABSENT]: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200",
    icon: "text-red-600",
  },
  [AttendanceStatus.LATE]: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    border: "border-orange-200",
    icon: "text-orange-600",
  },
  [AttendanceStatus.EXCUSED]: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-200",
    icon: "text-blue-600",
  },
} as const;

// Дни недели для сортировки
export const WEEKDAY_ORDER = {
  [WeekDay.MONDAY]: 1,
  [WeekDay.TUESDAY]: 2,
  [WeekDay.WEDNESDAY]: 3,
  [WeekDay.THURSDAY]: 4,
  [WeekDay.FRIDAY]: 5,
  [WeekDay.SATURDAY]: 6,
  [WeekDay.SUNDAY]: 7,
} as const;

// Учебное время
export const ACADEMIC_YEAR = {
  START_MONTH: 9, // Сентябрь
  END_MONTH: 6, // Июнь
  SEMESTER_1_END: 1, // Январь
  SEMESTER_2_START: 2, // Февраль
} as const;

// Временные слоты для занятий
export const TIME_SLOTS = [
  { start: "08:00", end: "09:30", label: "1 пара (08:00-09:30)" },
  { start: "09:45", end: "11:15", label: "2 пара (09:45-11:15)" },
  { start: "11:30", end: "13:00", label: "3 пара (11:30-13:00)" },
  { start: "13:45", end: "15:15", label: "4 пара (13:45-15:15)" },
  { start: "15:30", end: "17:00", label: "5 пара (15:30-17:00)" },
  { start: "17:15", end: "18:45", label: "6 пара (17:15-18:45)" },
  { start: "19:00", end: "20:30", label: "7 пара (19:00-20:30)" },
] as const;

// Курсы обучения
export const COURSES = [
  { value: 1, label: "1 курс" },
  { value: 2, label: "2 курс" },
  { value: 3, label: "3 курс" },
  { value: 4, label: "4 курс" },
  { value: 5, label: "5 курс" },
  { value: 6, label: "6 курс" },
] as const;

// Специализации
export const SPECIALIZATIONS = [
  "Информационные технологии",
  "Программная инженерия",
  "Компьютерные науки",
  "Кибербезопасность",
  "Экономика",
  "Менеджмент",
  "Маркетинг",
  "Финансы",
  "Юриспруденция",
  "Международные отношения",
  "Медицина",
  "Стоматология",
  "Фармация",
  "Архитектура",
  "Строительство",
  "Машиностроение",
] as const;

// Типы недель
export const WEEK_TYPES = [
  { value: "all", label: "Каждую неделю" },
  { value: "odd", label: "Нечетная неделя" },
  { value: "even", label: "Четная неделя" },
] as const;

// Типы занятий
export const CLASS_TYPES = [
  { value: "lecture", label: "Лекция", color: "blue" },
  { value: "seminar", label: "Семинар", color: "green" },
  { value: "practice", label: "Практика", color: "orange" },
  { value: "lab", label: "Лабораторная", color: "purple" },
  { value: "exam", label: "Экзамен", color: "red" },
  { value: "test", label: "Зачет", color: "yellow" },
] as const;

// Лимиты приложения
export const LIMITS = {
  MAX_FILE_SIZE_MB: 10,
  MAX_STUDENTS_PER_GROUP: 50,
  MAX_GROUPS_PER_SUBJECT: 10,
  MAX_HOURS_PER_SUBJECT: 500,
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_NOTES_LENGTH: 500,
  PAGINATION_PAGE_SIZE: 20,
  PAGINATION_MAX_SIZE: 100,
} as const;

// Форматы файлов
export const ALLOWED_FILE_FORMATS = {
  IMAGES: ["jpg", "jpeg", "png", "gif", "webp"],
  DOCUMENTS: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"],
  ARCHIVES: ["zip", "rar", "7z"],
} as const;

// URL-адреса
export const URLS = {
  PRIVACY_POLICY: "/privacy",
  TERMS_OF_SERVICE: "/terms",
  SUPPORT: "/support",
  DOCUMENTATION: "/docs",
  GITHUB: "https://github.com/your-username/attendtrack",
} as const;

// Сообщения
export const MESSAGES = {
  ERRORS: {
    NETWORK: "Ошибка сети. Проверьте подключение к интернету.",
    UNAUTHORIZED: "Необходимо войти в систему.",
    FORBIDDEN: "У вас нет прав для выполнения этого действия.",
    NOT_FOUND: "Запрашиваемый ресурс не найден.",
    SERVER_ERROR: "Ошибка сервера. Попробуйте позже.",
    VALIDATION: "Проверьте правильность введенных данных.",
  },
  SUCCESS: {
    SAVED: "Данные успешно сохранены",
    DELETED: "Удалено успешно",
    UPDATED: "Обновлено успешно",
    CREATED: "Создано успешно",
    LOGIN: "Вы успешно вошли в систему",
    LOGOUT: "Вы успешно вышли из системы",
  },
  CONFIRMATIONS: {
    DELETE: "Вы уверены, что хотите удалить?",
    LEAVE: "У вас есть несохраненные изменения. Покинуть страницу?",
    RESET: "Вы уверены, что хотите сбросить все данные?",
  },
} as const;

// Настройки уведомлений
export const NOTIFICATION_SETTINGS = {
  DURATION: {
    SUCCESS: 3000,
    ERROR: 5000,
    WARNING: 4000,
    INFO: 3000,
  },
  POSITION: "top-right" as const,
} as const;

// Статистические пороги
export const STATS_THRESHOLDS = {
  ATTENDANCE: {
    EXCELLENT: 95,
    GOOD: 85,
    SATISFACTORY: 70,
    POOR: 50,
  },
  PERFORMANCE: {
    HIGH: 90,
    MEDIUM: 70,
    LOW: 50,
  },
} as const;

// Цветовая схема для статистики
export const STATS_COLORS = {
  EXCELLENT: "text-emerald-600 bg-emerald-100",
  GOOD: "text-blue-600 bg-blue-100",
  SATISFACTORY: "text-orange-600 bg-orange-100",
  POOR: "text-red-600 bg-red-100",
} as const;

// Локализация
export const LOCALE_SETTINGS = {
  LANGUAGE: "ru-RU",
  CURRENCY: "KGS",
  TIMEZONE: "Asia/Bishkek",
  DATE_FORMAT: "dd.MM.yyyy",
  TIME_FORMAT: "HH:mm",
} as const;

// API конфигурация
export const API_CONFIG = {
  TIMEOUT: 10000, // 10 секунд
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 секунда
} as const;

// Кеш конфигурация
export const CACHE_CONFIG = {
  USER_DATA: 5 * 60 * 1000, // 5 минут
  SCHEDULE_DATA: 10 * 60 * 1000, // 10 минут
  ATTENDANCE_DATA: 2 * 60 * 1000, // 2 минуты
  STATIC_DATA: 60 * 60 * 1000, // 1 час
} as const;

// Регулярные выражения
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_KG: /^(\+996|0)(\d{9})$/,
  STUDENT_ID: /^ST\d{4}\d{5}$/,
  GROUP_CODE: /^[А-ЯЁA-Z]{2,8}-\d{3}$/i,
  SUBJECT_CODE: /^[A-Z]{2,8}$/,
  TIME: /^([01]?\d|2[0-3]):([0-5]\d)$/,
  PASSWORD:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const;

// Метаданные приложения
export const APP_METADATA = {
  NAME: "AttendTrack",
  VERSION: "1.0.0",
  DESCRIPTION: "Система учёта посещаемости студентов",
  AUTHOR: "AttendTrack Team",
  COPYRIGHT: "© 2024 AttendTrack. Все права защищены.",
} as const;
