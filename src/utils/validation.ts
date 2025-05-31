/**
 * Утилиты для валидации данных
 */

/**
 * Проверка корректности email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Проверка силы пароля
 */
export const validatePassword = (
  password: string
): {
  isValid: boolean;
  errors: string[];
  strength: "weak" | "medium" | "strong";
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Пароль должен содержать минимум 8 символов");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Пароль должен содержать строчные буквы");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Пароль должен содержать заглавные буквы");
  }

  if (!/\d/.test(password)) {
    errors.push("Пароль должен содержать цифры");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Пароль должен содержать специальные символы");
  }

  // Определяем силу пароля
  let strength: "weak" | "medium" | "strong" = "weak";
  const criteriaCount = 5 - errors.length;

  if (criteriaCount >= 4 && password.length >= 12) {
    strength = "strong";
  } else if (criteriaCount >= 3 && password.length >= 8) {
    strength = "medium";
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
};

/**
 * Проверка телефонного номера (Кыргызстан)
 */
export const isValidKyrgyzPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, "");

  // Проверяем формат +996XXXXXXXXX или 0XXXXXXXXX
  return (
    (cleaned.startsWith("996") && cleaned.length === 12) ||
    (cleaned.startsWith("0") && cleaned.length === 10)
  );
};

/**
 * Проверка номера студенческого билета
 */
export const isValidStudentId = (studentId: string): boolean => {
  // Формат: ST + год + номер (например, ST202401001)
  const regex = /^ST\d{4}\d{5}$/;
  return regex.test(studentId);
};

/**
 * Проверка кода группы
 */
export const isValidGroupCode = (code: string): boolean => {
  // Формат: 2-3 буквы + дефис + 3 цифры (например, ИТ-301, ЭКОНОМ-201)
  const regex = /^[А-ЯЁA-Z]{2,8}-\d{3}$/i;
  return regex.test(code);
};

/**
 * Проверка кода предмета
 */
export const isValidSubjectCode = (code: string): boolean => {
  // Формат: MATH, PROG, PHYS и т.д. (2-8 букв)
  const regex = /^[A-Z]{2,8}$/;
  return regex.test(code.toUpperCase());
};

/**
 * Проверка времени в формате HH:MM
 */
export const isValidTime = (time: string): boolean => {
  const regex = /^([01]?\d|2[0-3]):([0-5]\d)$/;
  return regex.test(time);
};

/**
 * Проверка диапазона времени
 */
export const isValidTimeRange = (
  startTime: string,
  endTime: string
): boolean => {
  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    return false;
  }

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  return endMinutes > startMinutes;
};

/**
 * Проверка даты (не в прошлом)
 */
export const isValidFutureDate = (date: string | Date): boolean => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return dateObj >= today;
};

/**
 * Проверка возраста (для студентов)
 */
export const isValidStudentAge = (birthDate: string | Date): boolean => {
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();

  // Студенты обычно от 16 до 30 лет
  return age >= 16 && age <= 30;
};

/**
 * Проверка номера аудитории
 */
export const isValidClassroom = (classroom: string): boolean => {
  // Форматы: 101, Ауд. 101, Лаб-1, Спортзал
  const regex = /^([А-ЯЁ\w\s.-]+\d+|[А-ЯЁ\w\s-]+)$/i;
  return regex.test(classroom.trim());
};

/**
 * Проверка курса обучения
 */
export const isValidCourse = (course: number): boolean => {
  return course >= 1 && course <= 6;
};

/**
 * Проверка количества часов
 */
export const isValidHours = (hours: number): boolean => {
  return hours > 0 && hours <= 500; // Максимум 500 часов на предмет
};

/**
 * Очистка и валидация ввода
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, "") // Удаляем потенциально опасные символы
    .slice(0, 255); // Ограничиваем длину
};

/**
 * Проверка на запрещенные слова
 */
export const containsProfanity = (text: string): boolean => {
  const profanityWords = [
    "Идиот",
    // Добавьте сюда список запрещенных слов
    // Это базовая реализация, в продакшене используйте специализированные библиотеки
  ];

  const lowerText = text.toLowerCase();
  return profanityWords.some((word) => lowerText.includes(word));
};

/**
 * Валидация имени файла
 */
export const isValidFileName = (fileName: string): boolean => {
  // Проверяем на запрещенные символы в имени файла
  const invalidChars = /[<>:"/\\|?*]/;
  return (
    !invalidChars.test(fileName) &&
    fileName.length > 0 &&
    fileName.length <= 255
  );
};

/**
 * Проверка расширения файла
 */
export const isValidFileExtension = (
  fileName: string,
  allowedExtensions: string[]
): boolean => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension ? allowedExtensions.includes(extension) : false;
};

/**
 * Проверка размера файла
 */
export const isValidFileSize = (
  fileSize: number,
  maxSizeInMB: number
): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return fileSize <= maxSizeInBytes;
};

/**
 * Валидация URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ["http:", "https:"].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

/**
 * Проверка на пустое значение
 */
export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
};

/**
 * Проверка минимальной длины
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.trim().length >= minLength;
};

/**
 * Проверка максимальной длины
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

/**
 * Проверка на числовое значение
 */
export const isNumeric = (value: string): boolean => {
  return !isNaN(Number(value)) && !isNaN(parseFloat(value));
};

/**
 * Проверка диапазона чисел
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};
