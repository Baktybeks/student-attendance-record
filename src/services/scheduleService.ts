// src/services/scheduleService.ts

import { ID, Query } from "appwrite";
import { databases, appwriteConfig } from "@/constants/appwriteConfig";
import {
  Schedule,
  CreateScheduleDto,
  WeekDay,
  ScheduleWithDetails,
} from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// API функции для работы с расписанием
export const scheduleApi = {
  // Получить все расписания
  getAllSchedules: async (): Promise<Schedule[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.schedule,
        [Query.orderAsc("dayOfWeek"), Query.orderAsc("startTime")]
      );
      return response.documents as unknown as Schedule[];
    } catch (error) {
      console.error("Ошибка при получении расписания:", error);
      return [];
    }
  },

  // Получить активные расписания
  getActiveSchedules: async (): Promise<Schedule[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.schedule,
        [
          Query.equal("isActive", true),
          Query.orderAsc("dayOfWeek"),
          Query.orderAsc("startTime"),
        ]
      );
      return response.documents as unknown as Schedule[];
    } catch (error) {
      console.error("Ошибка при получении активного расписания:", error);
      return [];
    }
  },

  // Получить расписание по группе
  getScheduleByGroup: async (groupId: string): Promise<Schedule[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.schedule,
        [
          Query.equal("groupId", groupId),
          Query.equal("isActive", true),
          Query.orderAsc("dayOfWeek"),
          Query.orderAsc("startTime"),
        ]
      );
      return response.documents as unknown as Schedule[];
    } catch (error) {
      console.error("Ошибка при получении расписания группы:", error);
      return [];
    }
  },

  // Получить расписание преподавателя
  getScheduleByTeacher: async (teacherId: string): Promise<Schedule[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.schedule,
        [
          Query.equal("teacherId", teacherId),
          Query.equal("isActive", true),
          Query.orderAsc("dayOfWeek"),
          Query.orderAsc("startTime"),
        ]
      );
      return response.documents as unknown as Schedule[];
    } catch (error) {
      console.error("Ошибка при получении расписания преподавателя:", error);
      return [];
    }
  },

  // Получить расписание по предмету
  getScheduleBySubject: async (subjectId: string): Promise<Schedule[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.schedule,
        [
          Query.equal("subjectId", subjectId),
          Query.equal("isActive", true),
          Query.orderAsc("dayOfWeek"),
          Query.orderAsc("startTime"),
        ]
      );
      return response.documents as unknown as Schedule[];
    } catch (error) {
      console.error("Ошибка при получении расписания предмета:", error);
      return [];
    }
  },

  // Получить расписание на день
  getScheduleByDay: async (
    day: WeekDay,
    groupId?: string,
    teacherId?: string
  ): Promise<Schedule[]> => {
    try {
      const queries = [
        Query.equal("dayOfWeek", day),
        Query.equal("isActive", true),
        Query.orderAsc("startTime"),
      ];

      if (groupId) {
        queries.push(Query.equal("groupId", groupId));
      }

      if (teacherId) {
        queries.push(Query.equal("teacherId", teacherId));
      }

      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.schedule,
        queries
      );
      return response.documents as unknown as Schedule[];
    } catch (error) {
      console.error("Ошибка при получении расписания на день:", error);
      return [];
    }
  },

  // Создать элемент расписания
  createSchedule: async (data: CreateScheduleDto): Promise<Schedule> => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.schedule,
        ID.unique(),
        {
          ...data,
          isActive: true,
          weekType: data.weekType || "all",
        }
      );
      return response as unknown as Schedule;
    } catch (error: any) {
      if (error.code === 409) {
        throw new Error("Конфликт расписания - время уже занято");
      }
      console.error("Ошибка при создании расписания:", error);
      throw error;
    }
  },

  // Обновить элемент расписания
  updateSchedule: async (
    id: string,
    updates: Partial<Schedule>
  ): Promise<Schedule> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.schedule,
        id,
        updates
      );
      return response as unknown as Schedule;
    } catch (error) {
      console.error("Ошибка при обновлении расписания:", error);
      throw error;
    }
  },

  // Деактивировать элемент расписания
  deactivateSchedule: async (id: string): Promise<Schedule> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.schedule,
        id,
        { isActive: false }
      );
      return response as unknown as Schedule;
    } catch (error) {
      console.error("Ошибка при деактивации расписания:", error);
      throw error;
    }
  },

  // Активировать элемент расписания
  activateSchedule: async (id: string): Promise<Schedule> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.schedule,
        id,
        { isActive: true }
      );
      return response as unknown as Schedule;
    } catch (error) {
      console.error("Ошибка при активации расписания:", error);
      throw error;
    }
  },

  // Удалить элемент расписания
  deleteSchedule: async (id: string): Promise<boolean> => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.schedule,
        id
      );
      return true;
    } catch (error) {
      console.error("Ошибка при удалении расписания:", error);
      throw error;
    }
  },

  // Проверить конфликты расписания
  checkScheduleConflict: async (
    data: CreateScheduleDto | (Partial<Schedule> & { $id: string }),
    excludeId?: string
  ): Promise<{ hasConflict: boolean; conflictingSchedules: Schedule[] }> => {
    try {
      const queries = [
        Query.equal("dayOfWeek", data.dayOfWeek!),
        Query.equal("isActive", true),
      ];

      // Проверяем конфликт по группе ИЛИ преподавателю ИЛИ аудитории
      if (data.groupId) {
        queries.push(Query.equal("groupId", data.groupId));
      }

      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.schedule,
        queries
      );

      const existingSchedules = response.documents as unknown as Schedule[];

      // Фильтруем по времени и исключаем текущий элемент при редактировании
      const conflictingSchedules = existingSchedules.filter((schedule) => {
        if (excludeId && schedule.$id === excludeId) return false;

        // Проверяем пересечение времени
        const existingStart = timeToMinutes(schedule.startTime);
        const existingEnd = timeToMinutes(schedule.endTime);
        const newStart = timeToMinutes(data.startTime!);
        const newEnd = timeToMinutes(data.endTime!);

        const timeConflict =
          (newStart >= existingStart && newStart < existingEnd) ||
          (newEnd > existingStart && newEnd <= existingEnd) ||
          (newStart <= existingStart && newEnd >= existingEnd);

        if (!timeConflict) return false;

        // Проверяем конфликт ресурсов
        const sameGroup = schedule.groupId === data.groupId;
        const sameTeacher = schedule.teacherId === data.teacherId;
        const sameClassroom = schedule.classroom === data.classroom;

        return sameGroup || sameTeacher || sameClassroom;
      });

      return {
        hasConflict: conflictingSchedules.length > 0,
        conflictingSchedules,
      };
    } catch (error) {
      console.error("Ошибка при проверке конфликтов:", error);
      return { hasConflict: false, conflictingSchedules: [] };
    }
  },

  // Получить статистику расписания
  getScheduleStats: async (): Promise<{
    total: number;
    active: number;
    inactive: number;
    byDay: Record<WeekDay, number>;
    byWeekType: Record<string, number>;
    totalHoursPerWeek: number;
  }> => {
    try {
      const schedules = await scheduleApi.getAllSchedules();

      const active = schedules.filter((s) => s.isActive).length;
      const inactive = schedules.length - active;

      const byDay = schedules.reduce((acc, schedule) => {
        acc[schedule.dayOfWeek] = (acc[schedule.dayOfWeek] || 0) + 1;
        return acc;
      }, {} as Record<WeekDay, number>);

      const byWeekType = schedules.reduce((acc, schedule) => {
        const type = schedule.weekType || "all";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Подсчитываем общее количество часов в неделю
      const totalHoursPerWeek = schedules
        .filter((s) => s.isActive)
        .reduce((total, schedule) => {
          const duration = getScheduleDuration(schedule);
          const multiplier = schedule.weekType === "all" ? 1 : 0.5;
          return total + duration * multiplier;
        }, 0);

      return {
        total: schedules.length,
        active,
        inactive,
        byDay,
        byWeekType,
        totalHoursPerWeek: Math.round(totalHoursPerWeek * 10) / 10,
      };
    } catch (error) {
      console.error("Ошибка при получении статистики расписания:", error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        byDay: {} as Record<WeekDay, number>,
        byWeekType: {},
        totalHoursPerWeek: 0,
      };
    }
  },

  // Импорт расписания из CSV/Excel
  importSchedule: async (
    scheduleData: CreateScheduleDto[]
  ): Promise<{ success: number; errors: string[] }> => {
    const results = { success: 0, errors: [] as string[] };

    for (const [index, data] of scheduleData.entries()) {
      try {
        // Валидация данных
        if (!data.subjectId || !data.groupId || !data.teacherId) {
          results.errors.push(
            `Строка ${index + 1}: Отсутствуют обязательные поля`
          );
          continue;
        }

        // Проверка конфликтов
        const conflictCheck = await scheduleApi.checkScheduleConflict(data);
        if (conflictCheck.hasConflict) {
          results.errors.push(
            `Строка ${index + 1}: Конфликт расписания - время уже занято`
          );
          continue;
        }

        await scheduleApi.createSchedule(data);
        results.success++;
      } catch (error: any) {
        results.errors.push(
          `Строка ${index + 1}: ${error.message || "Неизвестная ошибка"}`
        );
      }
    }

    return results;
  },

  // Экспорт расписания в CSV
  exportSchedule: async (
    groupId?: string,
    teacherId?: string
  ): Promise<string> => {
    try {
      let schedules = await scheduleApi.getActiveSchedules();

      if (groupId) {
        schedules = schedules.filter((s) => s.groupId === groupId);
      }

      if (teacherId) {
        schedules = schedules.filter((s) => s.teacherId === teacherId);
      }

      // Формируем CSV
      const headers = [
        "День недели",
        "Время начала",
        "Время окончания",
        "Предмет",
        "Группа",
        "Преподаватель",
        "Аудитория",
        "Тип недели",
      ].join(",");

      const rows = schedules
        .map((schedule) =>
          [
            schedule.dayOfWeek,
            schedule.startTime,
            schedule.endTime,
            schedule.subjectId, // В реальном приложении здесь будет название предмета
            schedule.groupId, // В реальном приложении здесь будет код группы
            schedule.teacherId, // В реальном приложении здесь будет имя преподавателя
            schedule.classroom,
            schedule.weekType || "all",
          ].join(",")
        )
        .join("\n");

      return `${headers}\n${rows}`;
    } catch (error) {
      console.error("Ошибка при экспорте расписания:", error);
      throw error;
    }
  },
};

// Вспомогательные функции
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const getScheduleDuration = (schedule: Schedule): number => {
  const start = timeToMinutes(schedule.startTime);
  const end = timeToMinutes(schedule.endTime);
  return (end - start) / 60; // возвращаем в часах
};

// React Query ключи
export const scheduleKeys = {
  all: ["schedule"] as const,
  lists: () => [...scheduleKeys.all, "list"] as const,
  active: () => [...scheduleKeys.all, "active"] as const,
  byGroup: (groupId: string) =>
    [...scheduleKeys.all, "group", groupId] as const,
  byTeacher: (teacherId: string) =>
    [...scheduleKeys.all, "teacher", teacherId] as const,
  bySubject: (subjectId: string) =>
    [...scheduleKeys.all, "subject", subjectId] as const,
  byDay: (day: WeekDay, groupId?: string, teacherId?: string) =>
    [...scheduleKeys.all, "day", day, groupId, teacherId] as const,
  detail: (id: string) => [...scheduleKeys.all, "detail", id] as const,
  stats: () => [...scheduleKeys.all, "stats"] as const,
  conflicts: (data: any) => [...scheduleKeys.all, "conflicts", data] as const,
};

// React Query хуки
export const useAllSchedules = () => {
  return useQuery({
    queryKey: scheduleKeys.lists(),
    queryFn: scheduleApi.getAllSchedules,
    staleTime: 1000 * 60 * 10, // 10 минут
  });
};

export const useActiveSchedules = () => {
  return useQuery({
    queryKey: scheduleKeys.active(),
    queryFn: scheduleApi.getActiveSchedules,
    staleTime: 1000 * 60 * 15, // 15 минут
  });
};

export const useScheduleByGroup = (groupId: string) => {
  return useQuery({
    queryKey: scheduleKeys.byGroup(groupId),
    queryFn: () => scheduleApi.getScheduleByGroup(groupId),
    enabled: !!groupId,
    staleTime: 1000 * 60 * 15, // 15 минут
  });
};

export const useScheduleByTeacher = (teacherId: string) => {
  return useQuery({
    queryKey: scheduleKeys.byTeacher(teacherId),
    queryFn: () => scheduleApi.getScheduleByTeacher(teacherId),
    enabled: !!teacherId,
    staleTime: 1000 * 60 * 15, // 15 минут
  });
};

export const useScheduleBySubject = (subjectId: string) => {
  return useQuery({
    queryKey: scheduleKeys.bySubject(subjectId),
    queryFn: () => scheduleApi.getScheduleBySubject(subjectId),
    enabled: !!subjectId,
    staleTime: 1000 * 60 * 15, // 15 минут
  });
};

export const useScheduleByDay = (
  day: WeekDay,
  groupId?: string,
  teacherId?: string
) => {
  return useQuery({
    queryKey: scheduleKeys.byDay(day, groupId, teacherId),
    queryFn: () => scheduleApi.getScheduleByDay(day, groupId, teacherId),
    staleTime: 1000 * 60 * 10, // 10 минут
  });
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: scheduleApi.createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Schedule> }) =>
      scheduleApi.updateSchedule(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      queryClient.invalidateQueries({
        queryKey: scheduleKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: scheduleApi.deleteSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
};

export const useActivateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: scheduleApi.activateSchedule,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(id) });
    },
  });
};

export const useDeactivateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: scheduleApi.deactivateSchedule,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(id) });
    },
  });
};

export const useScheduleStats = () => {
  return useQuery({
    queryKey: scheduleKeys.stats(),
    queryFn: scheduleApi.getScheduleStats,
    staleTime: 1000 * 60 * 20, // 20 минут
  });
};

export const useCheckScheduleConflict = () => {
  return useMutation({
    mutationFn: ({
      data,
      excludeId,
    }: {
      data: CreateScheduleDto | (Partial<Schedule> & { $id: string });
      excludeId?: string;
    }) => scheduleApi.checkScheduleConflict(data, excludeId),
  });
};

export const useImportSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: scheduleApi.importSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
};

export const useExportSchedule = () => {
  return useMutation({
    mutationFn: ({
      groupId,
      teacherId,
    }: {
      groupId?: string;
      teacherId?: string;
    }) => scheduleApi.exportSchedule(groupId, teacherId),
  });
};
