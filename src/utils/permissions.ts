import { User, UserRole } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { useMemo } from "react";

/**
 * Система прав доступа
 */

// Определение прав доступа
export enum Permission {
  // Управление пользователями
  CREATE_USER = "create_user",
  READ_USER = "read_user",
  UPDATE_USER = "update_user",
  DELETE_USER = "delete_user",
  ACTIVATE_USER = "activate_user",
  DEACTIVATE_USER = "deactivate_user",

  // Управление группами
  CREATE_GROUP = "create_group",
  READ_GROUP = "read_group",
  UPDATE_GROUP = "update_group",
  DELETE_GROUP = "delete_group",

  // Управление предметами
  CREATE_SUBJECT = "create_subject",
  READ_SUBJECT = "read_subject",
  UPDATE_SUBJECT = "update_subject",
  DELETE_SUBJECT = "delete_subject",
  ASSIGN_TEACHER = "assign_teacher",

  // Управление расписанием
  CREATE_SCHEDULE = "create_schedule",
  READ_SCHEDULE = "read_schedule",
  UPDATE_SCHEDULE = "update_schedule",
  DELETE_SCHEDULE = "delete_schedule",

  // Управление занятиями
  CREATE_CLASS = "create_class",
  READ_CLASS = "read_class",
  UPDATE_CLASS = "update_class",
  DELETE_CLASS = "delete_class",
  CANCEL_CLASS = "cancel_class",

  // Посещаемость
  MARK_ATTENDANCE = "mark_attendance",
  READ_ATTENDANCE = "read_attendance",
  UPDATE_ATTENDANCE = "update_attendance",
  READ_ALL_ATTENDANCE = "read_all_attendance",
  READ_OWN_ATTENDANCE = "read_own_attendance",

  // Статистика и отчеты
  VIEW_STATISTICS = "view_statistics",
  VIEW_REPORTS = "view_reports",
  EXPORT_DATA = "export_data",

  // Системные права
  ACCESS_ADMIN_PANEL = "access_admin_panel",
  MANAGE_SETTINGS = "manage_settings",
  VIEW_LOGS = "view_logs",
}

// Роли и их права
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Полный доступ ко всем функциям
    Permission.CREATE_USER,
    Permission.READ_USER,
    Permission.UPDATE_USER,
    Permission.DELETE_USER,
    Permission.ACTIVATE_USER,
    Permission.DEACTIVATE_USER,

    Permission.CREATE_GROUP,
    Permission.READ_GROUP,
    Permission.UPDATE_GROUP,
    Permission.DELETE_GROUP,

    Permission.CREATE_SUBJECT,
    Permission.READ_SUBJECT,
    Permission.UPDATE_SUBJECT,
    Permission.DELETE_SUBJECT,
    Permission.ASSIGN_TEACHER,

    Permission.CREATE_SCHEDULE,
    Permission.READ_SCHEDULE,
    Permission.UPDATE_SCHEDULE,
    Permission.DELETE_SCHEDULE,

    Permission.CREATE_CLASS,
    Permission.READ_CLASS,
    Permission.UPDATE_CLASS,
    Permission.DELETE_CLASS,
    Permission.CANCEL_CLASS,

    Permission.MARK_ATTENDANCE,
    Permission.READ_ATTENDANCE,
    Permission.UPDATE_ATTENDANCE,
    Permission.READ_ALL_ATTENDANCE,

    Permission.VIEW_STATISTICS,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA,

    Permission.ACCESS_ADMIN_PANEL,
    Permission.MANAGE_SETTINGS,
    Permission.VIEW_LOGS,
  ],

  [UserRole.TEACHER]: [
    // Чтение пользователей (студентов)
    Permission.READ_USER,

    // Чтение групп и предметов
    Permission.READ_GROUP,
    Permission.READ_SUBJECT,

    // Чтение расписания
    Permission.READ_SCHEDULE,

    // Управление занятиями (только своими)
    Permission.READ_CLASS,
    Permission.UPDATE_CLASS,
    Permission.CANCEL_CLASS,

    // Посещаемость
    Permission.MARK_ATTENDANCE,
    Permission.READ_ATTENDANCE,
    Permission.UPDATE_ATTENDANCE,
    Permission.READ_ALL_ATTENDANCE, // Для своих предметов

    // Статистика
    Permission.VIEW_STATISTICS,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA,
  ],

  [UserRole.STUDENT]: [
    // Чтение собственных данных
    Permission.READ_USER, // Только свой профиль

    // Чтение группы и предметов
    Permission.READ_GROUP,
    Permission.READ_SUBJECT,

    // Чтение расписания
    Permission.READ_SCHEDULE,

    // Чтение занятий
    Permission.READ_CLASS,

    // Собственная посещаемость
    Permission.READ_OWN_ATTENDANCE,

    // Ограниченная статистика
    Permission.VIEW_STATISTICS, // Только своя
  ],
};

// Проверка наличия права у роли
export const roleHasPermission = (
  role: UserRole,
  permission: Permission
): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
};

// Проверка наличия права у пользователя
export const userHasPermission = (
  user: User | null,
  permission: Permission
): boolean => {
  if (!user || !user.isActive) return false;
  return roleHasPermission(user.role, permission);
};

// Проверка множественных прав
export const userHasAllPermissions = (
  user: User | null,
  permissions: Permission[]
): boolean => {
  return permissions.every((permission) => userHasPermission(user, permission));
};

export const userHasAnyPermission = (
  user: User | null,
  permissions: Permission[]
): boolean => {
  return permissions.some((permission) => userHasPermission(user, permission));
};

// Проверка доступа к ресурсу
export const canAccessResource = (
  user: User | null,
  resource: "admin" | "teacher" | "student" | "public",
  resourceOwner?: string
): boolean => {
  if (!user || !user.isActive) {
    return resource === "public";
  }

  switch (resource) {
    case "admin":
      return user.role === UserRole.ADMIN;

    case "teacher":
      return [UserRole.ADMIN, UserRole.TEACHER].includes(user.role);

    case "student":
      // Студент может получить доступ к своим ресурсам
      // Преподаватель и админ - ко всем студенческим ресурсам
      if (user.role === UserRole.STUDENT) {
        return !resourceOwner || resourceOwner === user.$id;
      }
      return [UserRole.ADMIN, UserRole.TEACHER].includes(user.role);

    case "public":
      return true;

    default:
      return false;
  }
};

// Проверка владения ресурсом
export const isResourceOwner = (
  user: User | null,
  resourceOwnerId: string
): boolean => {
  return user?.$id === resourceOwnerId;
};

// Проверка прав на посещаемость
export const canMarkAttendance = (
  user: User | null,
  classTeacherId?: string
): boolean => {
  if (!user || !user.isActive) return false;

  if (user.role === UserRole.ADMIN) return true;

  if (user.role === UserRole.TEACHER) {
    return !classTeacherId || classTeacherId === user.$id;
  }

  return false;
};

// Проверка прав на просмотр посещаемости
export const canViewAttendance = (
  user: User | null,
  targetStudentId?: string,
  classTeacherId?: string
): boolean => {
  if (!user || !user.isActive) return false;

  if (user.role === UserRole.ADMIN) return true;

  if (user.role === UserRole.TEACHER) {
    return !classTeacherId || classTeacherId === user.$id;
  }

  if (user.role === UserRole.STUDENT) {
    return !targetStudentId || targetStudentId === user.$id;
  }

  return false;
};

// Проверка прав на управление группой
export const canManageGroup = (
  user: User | null,
  groupId?: string
): boolean => {
  if (!user || !user.isActive) return false;

  return user.role === UserRole.ADMIN;
};

// Проверка прав на управление предметом
export const canManageSubject = (
  user: User | null,
  subjectTeacherId?: string
): boolean => {
  if (!user || !user.isActive) return false;

  if (user.role === UserRole.ADMIN) return true;

  if (user.role === UserRole.TEACHER) {
    return !subjectTeacherId || subjectTeacherId === user.$id;
  }

  return false;
};

// Интерфейс для хука usePermissions
interface PermissionsHook {
  // Пользователи
  canManageUsers: boolean;
  canActivateUsers: boolean;
  canDeactivateUsers: boolean;

  // Группы
  canCreateGroups: boolean;
  canUpdateGroups: boolean;
  canDeleteGroups: boolean;

  // Предметы
  canCreateSubjects: boolean;
  canUpdateSubjects: boolean;
  canDeleteSubjects: boolean;
  canAssignTeachers: boolean;

  // Расписание
  canCreateSchedule: boolean;
  canUpdateSchedule: boolean;
  canDeleteSchedule: boolean;

  // Занятия
  canCreateClasses: boolean;
  canUpdateClasses: boolean;
  canCancelClasses: boolean;

  // Посещаемость
  canMarkAttendance: boolean;
  canUpdateAttendance: boolean;
  canViewAllAttendance: boolean;
  canViewOwnAttendance: boolean;

  // Статистика
  canViewStatistics: boolean;
  canViewReports: boolean;
  canExportData: boolean;

  // Системные
  canAccessAdminPanel: boolean;
  canManageSettings: boolean;
  canViewLogs: boolean;

  // Роли
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;

  // Утилиты
  hasPermission: (permission: Permission) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  canAccess: (
    resource: "admin" | "teacher" | "student" | "public",
    owner?: string
  ) => boolean;
}

// Хук для проверки прав доступа
export const usePermissions = (): PermissionsHook => {
  const { user } = useAuthStore();

  return useMemo(
    () => ({
      // Пользователи
      canManageUsers: userHasPermission(user, Permission.CREATE_USER),
      canActivateUsers: userHasPermission(user, Permission.ACTIVATE_USER),
      canDeactivateUsers: userHasPermission(user, Permission.DEACTIVATE_USER),

      // Группы
      canCreateGroups: userHasPermission(user, Permission.CREATE_GROUP),
      canUpdateGroups: userHasPermission(user, Permission.UPDATE_GROUP),
      canDeleteGroups: userHasPermission(user, Permission.DELETE_GROUP),

      // Предметы
      canCreateSubjects: userHasPermission(user, Permission.CREATE_SUBJECT),
      canUpdateSubjects: userHasPermission(user, Permission.UPDATE_SUBJECT),
      canDeleteSubjects: userHasPermission(user, Permission.DELETE_SUBJECT),
      canAssignTeachers: userHasPermission(user, Permission.ASSIGN_TEACHER),

      // Расписание
      canCreateSchedule: userHasPermission(user, Permission.CREATE_SCHEDULE),
      canUpdateSchedule: userHasPermission(user, Permission.UPDATE_SCHEDULE),
      canDeleteSchedule: userHasPermission(user, Permission.DELETE_SCHEDULE),

      // Занятия
      canCreateClasses: userHasPermission(user, Permission.CREATE_CLASS),
      canUpdateClasses: userHasPermission(user, Permission.UPDATE_CLASS),
      canCancelClasses: userHasPermission(user, Permission.CANCEL_CLASS),

      // Посещаемость
      canMarkAttendance: userHasPermission(user, Permission.MARK_ATTENDANCE),
      canUpdateAttendance: userHasPermission(
        user,
        Permission.UPDATE_ATTENDANCE
      ),
      canViewAllAttendance: userHasPermission(
        user,
        Permission.READ_ALL_ATTENDANCE
      ),
      canViewOwnAttendance: userHasPermission(
        user,
        Permission.READ_OWN_ATTENDANCE
      ),

      // Статистика
      canViewStatistics: userHasPermission(user, Permission.VIEW_STATISTICS),
      canViewReports: userHasPermission(user, Permission.VIEW_REPORTS),
      canExportData: userHasPermission(user, Permission.EXPORT_DATA),

      // Системные
      canAccessAdminPanel: userHasPermission(
        user,
        Permission.ACCESS_ADMIN_PANEL
      ),
      canManageSettings: userHasPermission(user, Permission.MANAGE_SETTINGS),
      canViewLogs: userHasPermission(user, Permission.VIEW_LOGS),

      // Роли
      isAdmin: user?.role === UserRole.ADMIN,
      isTeacher: user?.role === UserRole.TEACHER,
      isStudent: user?.role === UserRole.STUDENT,

      // Утилиты
      hasPermission: (permission: Permission) =>
        userHasPermission(user, permission),
      hasAllPermissions: (permissions: Permission[]) =>
        userHasAllPermissions(user, permissions),
      hasAnyPermission: (permissions: Permission[]) =>
        userHasAnyPermission(user, permissions),
      canAccess: (
        resource: "admin" | "teacher" | "student" | "public",
        owner?: string
      ) => canAccessResource(user, resource, owner),
    }),
    [user]
  );
};

// Хук для проверки конкретного права
export const usePermission = (permission: Permission): boolean => {
  const { user } = useAuthStore();
  return useMemo(() => userHasPermission(user, permission), [user, permission]);
};

// Хук для проверки роли
export const useRole = (role: UserRole): boolean => {
  const { user } = useAuthStore();
  return useMemo(() => user?.role === role, [user, role]);
};

// Хук для проверки множественных ролей
export const useRoles = (roles: UserRole[]): boolean => {
  const { user } = useAuthStore();
  return useMemo(
    () => (user ? roles.includes(user.role) : false),
    [user, roles]
  );
};
