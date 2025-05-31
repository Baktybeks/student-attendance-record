// Роли пользователей
export enum UserRole {
  ADMIN = "admin",
  TEACHER = "teacher",
  STUDENT = "student",
}

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Администратор",
  [UserRole.TEACHER]: "Преподаватель",
  [UserRole.STUDENT]: "Студент",
};

// Статусы посещаемости
export enum AttendanceStatus {
  PRESENT = "present",
  ABSENT = "absent",
  LATE = "late",
  EXCUSED = "excused",
}

export const AttendanceStatusLabels: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: "Присутствует",
  [AttendanceStatus.ABSENT]: "Отсутствует",
  [AttendanceStatus.LATE]: "Опоздал",
  [AttendanceStatus.EXCUSED]: "Уважительная причина",
};

export const AttendanceStatusColors: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: "bg-green-100 text-green-800 border-green-200",
  [AttendanceStatus.ABSENT]: "bg-red-100 text-red-800 border-red-200",
  [AttendanceStatus.LATE]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [AttendanceStatus.EXCUSED]: "bg-blue-100 text-blue-800 border-blue-200",
};

// Дни недели
export enum WeekDay {
  MONDAY = "monday",
  TUESDAY = "tuesday",
  WEDNESDAY = "wednesday",
  THURSDAY = "thursday",
  FRIDAY = "friday",
  SATURDAY = "saturday",
  SUNDAY = "sunday",
}

export const WeekDayLabels: Record<WeekDay, string> = {
  [WeekDay.MONDAY]: "Понедельник",
  [WeekDay.TUESDAY]: "Вторник",
  [WeekDay.WEDNESDAY]: "Среда",
  [WeekDay.THURSDAY]: "Четверг",
  [WeekDay.FRIDAY]: "Пятница",
  [WeekDay.SATURDAY]: "Суббота",
  [WeekDay.SUNDAY]: "Воскресенье",
};

// Базовый интерфейс документа
export interface BaseDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
}

// Пользователь
export interface User extends BaseDocument {
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  studentId?: string; // Для студентов
  groupId?: string; // Для студентов
  phone?: string;
  avatar?: string;
}

// Группа студентов
export interface Group extends BaseDocument {
  name: string;
  code: string; // Уникальный код группы
  course: number; // Курс обучения
  specialization: string;
  isActive: boolean;
  studentsCount?: number;
}

// Предмет
export interface Subject extends BaseDocument {
  name: string;
  code: string; // Уникальный код предмета
  description?: string;
  teacherId: string;
  groupIds: string[]; // Группы, изучающие предмет
  isActive: boolean;
  hoursTotal: number; // Общее количество часов
}

// Расписание
export interface Schedule extends BaseDocument {
  subjectId: string;
  groupId: string;
  teacherId: string;
  dayOfWeek: WeekDay;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  classroom: string;
  weekType?: "odd" | "even" | "all"; // Четная/нечетная неделя
  isActive: boolean;
}

// Занятие (конкретная пара)
export interface Class extends BaseDocument {
  scheduleId: string;
  subjectId: string;
  groupId: string;
  teacherId: string;
  date: string; // ISO date
  startTime: string;
  endTime: string;
  classroom: string;
  topic?: string;
  isCompleted: boolean;
  isCanceled: boolean;
  notes?: string;
}

// Посещаемость
export interface Attendance extends BaseDocument {
  classId: string;
  studentId: string;
  status: AttendanceStatus;
  notes?: string;
  markedAt: string;
  markedBy: string; // ID преподавателя
}

// DTO для создания пользователя
export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  studentId?: string;
  groupId?: string;
  phone?: string;
}

// Результат регистрации
export interface RegisterResult {
  user: User;
  isFirstUser: boolean;
}

// DTO для создания группы
export interface CreateGroupDto {
  name: string;
  code: string;
  course: number;
  specialization: string;
}

// DTO для создания предмета
export interface CreateSubjectDto {
  name: string;
  code: string;
  description?: string;
  teacherId: string;
  groupIds: string[];
  hoursTotal: number;
}

// DTO для создания расписания
export interface CreateScheduleDto {
  subjectId: string;
  groupId: string;
  teacherId: string;
  dayOfWeek: WeekDay;
  startTime: string;
  endTime: string;
  classroom: string;
  weekType?: "odd" | "even" | "all";
}

// DTO для отметки посещаемости
export interface MarkAttendanceDto {
  classId: string;
  studentId: string;
  status: AttendanceStatus;
  notes?: string;
}

// Расширенные типы для отображения
export interface ScheduleWithDetails extends Schedule {
  subject: Subject;
  group: Group;
  teacher: User;
}

export interface ClassWithDetails extends Class {
  schedule: ScheduleWithDetails;
  attendanceList?: AttendanceWithStudent[];
}

export interface AttendanceWithStudent extends Attendance {
  student: User;
}

export interface AttendanceWithClass extends Attendance {
  class: ClassWithDetails;
}

// Статистика посещаемости
export interface AttendanceStats {
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceRate: number; // В процентах
}

export interface StudentAttendanceStats extends AttendanceStats {
  student: User;
  subject?: Subject;
}

export interface SubjectAttendanceStats extends AttendanceStats {
  subject: Subject;
  group: Group;
}

// Фильтры для запросов
export interface AttendanceFilters {
  studentId?: string;
  teacherId?: string;
  groupId?: string;
  subjectId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: AttendanceStatus[];
}

// Утилитарные функции
export const getRoleLabel = (role: UserRole): string => {
  return UserRoleLabels[role] || role;
};

export const getAttendanceStatusLabel = (status: AttendanceStatus): string => {
  return AttendanceStatusLabels[status] || status;
};

export const getAttendanceStatusColor = (status: AttendanceStatus): string => {
  return (
    AttendanceStatusColors[status] ||
    "bg-gray-100 text-gray-800 border-gray-200"
  );
};

export const getWeekDayLabel = (day: WeekDay): string => {
  return WeekDayLabels[day] || day;
};

// Проверка прав доступа
export const canManageUsers = (userRole: UserRole): boolean => {
  return userRole === UserRole.ADMIN;
};

export const canManageSchedule = (userRole: UserRole): boolean => {
  return userRole === UserRole.ADMIN;
};

export const canMarkAttendance = (userRole: UserRole): boolean => {
  return [UserRole.ADMIN, UserRole.TEACHER].includes(userRole);
};

export const canViewAllAttendance = (userRole: UserRole): boolean => {
  return [UserRole.ADMIN, UserRole.TEACHER].includes(userRole);
};
