/**
 * Форматирование имен и строк
 */

/**
 * Получить инициалы из полного имени
 */
export const getInitials = (name: string): string => {
  if (!name) return "";

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

/**
 * Сократить имя до Фамилия И.О.
 */
export const formatShortName = (fullName: string): string => {
  if (!fullName) return "";

  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];

  const [lastName, firstName, middleName] = parts;
  let result = lastName;

  if (firstName) {
    result += ` ${firstName.charAt(0).toUpperCase()}.`;
  }

  if (middleName) {
    result += `${middleName.charAt(0).toUpperCase()}.`;
  }

  return result;
};

/**
 * Капитализация первой буквы
 */
export const capitalize = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Капитализация всех слов
 */
export const capitalizeWords = (str: string): string => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
};

/**
 * Обрезать текст с многоточием
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
};

/**
 * Склонение слов в зависимости от числа
 */
export const pluralize = (
  count: number,
  singular: string,
  few: string,
  many: string
): string => {
  const absCount = Math.abs(count);
  const lastDigit = absCount % 10;
  const lastTwoDigits = absCount % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return many;
  }

  if (lastDigit === 1) {
    return singular;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return few;
  }

  return many;
};

/**
 * Форматирование чисел
 */

/**
 * Форматирование числа с разделителями тысяч
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("ru-RU").format(num);
};

/**
 * Форматирование процентов
 */
export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Форматирование валюты
 */
export const formatCurrency = (
  amount: number,
  currency: string = "KGS"
): string => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

/**
 * Форматирование размера файла
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Б";

  const k = 1024;
  const sizes = ["Б", "КБ", "МБ", "ГБ", "ТБ"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Форматирование телефонных номеров
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "";

  // Удаляем все не цифры
  const cleaned = phone.replace(/\D/g, "");

  // Если номер начинается с 996 (код Кыргызстана)
  if (cleaned.startsWith("996") && cleaned.length === 12) {
    return `+996 (${cleaned.slice(3, 6)}) ${cleaned.slice(
      6,
      9
    )}-${cleaned.slice(9, 11)}-${cleaned.slice(11)}`;
  }

  // Если номер начинается с 0 (местный формат)
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(
      7,
      9
    )}-${cleaned.slice(9)}`;
  }

  // Возвращаем как есть, если не подходит под форматы
  return phone;
};

/**
 * Маскирование email
 */
export const maskEmail = (email: string): string => {
  if (!email || !email.includes("@")) return email;

  const [username, domain] = email.split("@");
  if (username.length <= 2) return email;

  const maskedUsername =
    username.charAt(0) +
    "*".repeat(username.length - 2) +
    username.charAt(username.length - 1);
  return `${maskedUsername}@${domain}`;
};

/**
 * Генерация случайного цвета для аватара
 */
export const generateAvatarColor = (name: string): string => {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-sky-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-fuchsia-500",
    "bg-pink-500",
    "bg-rose-500",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

/**
 * Подсветка поискового запроса в тексте
 */
export const highlightSearchTerm = (
  text: string,
  searchTerm: string
): string => {
  if (!searchTerm) return text;

  const regex = new RegExp(`(${searchTerm})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
};

/**
 * Создание слага из строки
 */
export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Удаляем специальные символы
    .replace(/[\s_-]+/g, "-") // Заменяем пробелы и подчеркивания на дефисы
    .replace(/^-+|-+$/g, ""); // Удаляем дефисы в начале и конце
};

/**
 * Очистка строки от HTML тегов
 */
export const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, "");
};
