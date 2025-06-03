// src/services/classService.ts

import { ID, Query } from "appwrite";
import { databases, appwriteConfig } from "@/constants/appwriteConfig";
import {
  Class,
  ClassWithDetails,
  Schedule,
  Subject,
  Group,
  User,
  WeekDay,
  BaseDocument,
} from "@/types";
import { createHash } from "crypto";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// API функции для работы с занятиями
export const classApi = {
  // Получить все занятия с полными данными
  getClassesWithDetails: async (filters?: {
    teacherId?: string;
    groupId?: string;
    subjectId?: string;
    date?: string;
  }): Promise<ClassWithDetails[]> => {
    try {
      console.log("🔍 Запрос занятий с фильтрами:", filters);

      const queries: string[] = [
        Query.orderAsc("date"),
        Query.orderAsc("startTime"),
      ];

      if (filters?.teacherId) {
        queries.push(Query.equal("teacherId", filters.teacherId));
      }
      if (filters?.groupId) {
        queries.push(Query.equal("groupId", filters.groupId));
      }
      if (filters?.subjectId) {
        queries.push(Query.equal("subjectId", filters.subjectId));
      }
      if (filters?.date) {
        queries.push(Query.equal("date", filters.date));
      }

      // Получаем занятия
      const classesResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.classes,
        queries
      );

      console.log("📚 Найдено занятий в БД:", classesResponse.documents.length);

      if (
        classesResponse.documents.length === 0 &&
        filters?.date &&
        filters?.teacherId
      ) {
        // Если занятий нет, пытаемся сгенерировать их из расписания
        console.log("🔄 Генерируем занятия из расписания...");
        return await classApi.generateClassesFromSchedule(
          filters.teacherId,
          filters.date
        );
      }

      // Получаем связанные данные параллельно
      const [
        subjectsResponse,
        groupsResponse,
        usersResponse,
        scheduleResponse,
      ] = await Promise.all([
        databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.collections.subjects
        ),
        databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.collections.groups
        ),
        databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.collections.users
        ),
        databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.collections.schedule
        ),
      ]);

      // Создаем маппинги для быстрого поиска
      const subjectsMap = new Map(
        (subjectsResponse.documents as unknown as Subject[]).map((s) => [
          s.$id,
          s,
        ])
      );
      const groupsMap = new Map(
        (groupsResponse.documents as unknown as Group[]).map((g) => [g.$id, g])
      );
      const usersMap = new Map(
        (usersResponse.documents as unknown as User[]).map((u) => [u.$id, u])
      );
      const scheduleMap = new Map(
        (scheduleResponse.documents as unknown as Schedule[]).map((s) => [
          s.$id,
          s,
        ])
      );

      // Преобразуем занятия в ClassWithDetails
      const classesWithDetails: ClassWithDetails[] =
        classesResponse.documents.map((classDoc: any) => {
          const subject = subjectsMap.get(classDoc.subjectId);
          const group = groupsMap.get(classDoc.groupId);
          const teacher = usersMap.get(classDoc.teacherId);
          const schedule = scheduleMap.get(classDoc.scheduleId);

          return {
            ...classDoc,
            schedule: {
              ...schedule,
              subject,
              group,
              teacher,
            } as any,
          } as ClassWithDetails;
        });

      console.log(
        "✅ Обработано занятий с деталями:",
        classesWithDetails.length
      );
      return classesWithDetails;
    } catch (error) {
      console.error("❌ Ошибка при получении занятий:", error);
      return [];
    }
  },

  // Генерирует занятия из расписания для конкретной даты
  generateClassesFromSchedule: async (
    teacherId: string,
    date: string
  ): Promise<ClassWithDetails[]> => {
    try {
      console.log("🔄 Генерация занятий из расписания для:", {
        teacherId,
        date,
      });

      const targetDate = new Date(date);
      const dayOfWeek = classApi.getWeekDayFromDate(targetDate);
      const isOddWeek = classApi.isOddWeek(targetDate);

      console.log("📅 День недели:", dayOfWeek, "Нечетная неделя:", isOddWeek);

      // Получаем расписание на этот день
      const scheduleResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.schedule,
        [
          Query.equal("teacherId", teacherId),
          Query.equal("dayOfWeek", dayOfWeek),
          Query.equal("isActive", true),
          Query.orderAsc("startTime"),
        ]
      );

      console.log("📋 Найдено расписаний:", scheduleResponse.documents.length);

      // Фильтруем по типу недели
      const scheduleItems = (
        scheduleResponse.documents as unknown as Schedule[]
      ).filter((schedule) => {
        if (schedule.weekType === "all") return true;
        if (schedule.weekType === "odd" && isOddWeek) return true;
        if (schedule.weekType === "even" && !isOddWeek) return true;
        return false;
      });

      console.log("📋 После фильтрации по неделе:", scheduleItems.length);

      if (scheduleItems.length === 0) {
        return [];
      }

      // Получаем связанные данные
      const [subjectsResponse, groupsResponse, usersResponse] =
        await Promise.all([
          databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.subjects
          ),
          databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.groups
          ),
          databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.users
          ),
        ]);

      const subjectsMap = new Map(
        (subjectsResponse.documents as unknown as Subject[]).map((s) => [
          s.$id,
          s,
        ])
      );
      const groupsMap = new Map(
        (groupsResponse.documents as unknown as Group[]).map((g) => [g.$id, g])
      );
      const usersMap = new Map(
        (usersResponse.documents as unknown as User[]).map((u) => [u.$id, u])
      );

      // Создаем виртуальные занятия
      const virtualClasses: ClassWithDetails[] = scheduleItems.map(
        (schedule) => {
          const subject = subjectsMap.get(schedule.subjectId);
          const group = groupsMap.get(schedule.groupId);
          const teacher = usersMap.get(schedule.teacherId);
          const hash = createHash("md5")
            .update(`${schedule.$id}-${date}`)
            .digest("hex")
            .slice(0, 32); // md5 = 32 символа

          return {
            $id: `v-${hash}`,
            // $id: `v-${hash}`,

            // $id: `virtual-${schedule.$id}-${date}`,
            $createdAt: new Date().toISOString(),
            $updatedAt: new Date().toISOString(),
            $permissions: [],
            $databaseId: appwriteConfig.databaseId,
            $collectionId: appwriteConfig.collections.classes,
            scheduleId: schedule.$id,
            subjectId: schedule.subjectId,
            groupId: schedule.groupId,
            teacherId: schedule.teacherId,
            date: date,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            classroom: schedule.classroom,
            topic: undefined,
            isCompleted: false,
            isCanceled: false,
            notes: undefined,
            schedule: {
              ...schedule,
              subject,
              group,
              teacher,
            } as any,
          } as ClassWithDetails;
        }
      );

      console.log(
        "✅ Сгенерировано виртуальных занятий:",
        virtualClasses.length
      );
      return virtualClasses;
    } catch (error) {
      console.error("❌ Ошибка при генерации занятий из расписания:", error);
      return [];
    }
  },

  // Создать реальное занятие в БД
  createClass: async (
    classData: Omit<Class, keyof BaseDocument>
  ): Promise<Class> => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.classes,
        ID.unique(),
        {
          ...classData,
          isCompleted: false,
          isCanceled: false,
        }
      );

      return response as unknown as Class;
    } catch (error) {
      console.error("Ошибка при создании занятия:", error);
      throw error;
    }
  },

  // Обновить занятие
  updateClass: async (id: string, updates: Partial<Class>): Promise<Class> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.classes,
        id,
        updates
      );
      return response as unknown as Class;
    } catch (error) {
      console.error("Ошибка при обновлении занятия:", error);
      throw error;
    }
  },

  // Отметить занятие как завершенное
  completeClass: async (id: string): Promise<Class> => {
    return classApi.updateClass(id, { isCompleted: true });
  },

  // Отменить занятие
  cancelClass: async (id: string, notes?: string): Promise<Class> => {
    return classApi.updateClass(id, { isCanceled: true, notes });
  },

  // Вспомогательные функции
  getWeekDayFromDate: (date: Date): WeekDay => {
    const dayIndex = date.getDay();
    const dayMap: Record<number, WeekDay> = {
      1: WeekDay.MONDAY,
      2: WeekDay.TUESDAY,
      3: WeekDay.WEDNESDAY,
      4: WeekDay.THURSDAY,
      5: WeekDay.FRIDAY,
      6: WeekDay.SATURDAY,
      0: WeekDay.SUNDAY,
    };
    return dayMap[dayIndex];
  },

  isOddWeek: (date: Date): boolean => {
    // Определяем нечетную неделю относительно начала учебного года
    // Предполагаем, что учебный год начинается 1 сентября
    const year =
      date.getMonth() >= 8 ? date.getFullYear() : date.getFullYear() - 1;
    const startOfYear = new Date(year, 8, 1); // 1 сентября
    const diffTime = date.getTime() - startOfYear.getTime();
    const diffWeeks = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000));
    return diffWeeks % 2 === 0;
  },

  // Массовое создание занятий из расписания
  generateClassesForPeriod: async (
    startDate: string,
    endDate: string,
    teacherId?: string
  ): Promise<Class[]> => {
    try {
      const classes: Class[] = [];
      const start = new Date(startDate);
      const end = new Date(endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        const virtualClasses = await classApi.generateClassesFromSchedule(
          teacherId || "",
          dateStr
        );

        // Создаем реальные занятия в БД
        for (const virtualClass of virtualClasses) {
          const realClass = await classApi.createClass({
            scheduleId: virtualClass.scheduleId,
            subjectId: virtualClass.subjectId,
            groupId: virtualClass.groupId,
            teacherId: virtualClass.teacherId,
            date: virtualClass.date,
            startTime: virtualClass.startTime,
            endTime: virtualClass.endTime,
            classroom: virtualClass.classroom,
            topic: virtualClass.topic,
            isCompleted: false,
            isCanceled: false,
            notes: virtualClass.notes,
          });
          classes.push(realClass);
        }
      }

      return classes;
    } catch (error) {
      console.error("Ошибка при генерации занятий на период:", error);
      throw error;
    }
  },
};

// React Query ключи
export const classKeys = {
  all: ["classes"] as const,
  lists: () => [...classKeys.all, "list"] as const,
  withDetails: (filters?: any) =>
    [...classKeys.all, "withDetails", filters] as const,
  detail: (id: string) => [...classKeys.all, "detail", id] as const,
};

// React Query хуки
export const useClassesWithDetails = (filters?: {
  teacherId?: string;
  groupId?: string;
  subjectId?: string;
  date?: string;
}) => {
  return useQuery({
    queryKey: classKeys.withDetails(filters),
    queryFn: () => classApi.getClassesWithDetails(filters),
    staleTime: 1000 * 60 * 2, // 2 минуты для актуальных данных
    enabled: !!(filters?.teacherId || filters?.groupId), // Запрос только при наличии teacherId или groupId
  });
};

export const useCreateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classApi.createClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
    },
  });
};

export const useUpdateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Class> }) =>
      classApi.updateClass(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      queryClient.invalidateQueries({
        queryKey: classKeys.detail(variables.id),
      });
    },
  });
};

export const useCompleteClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classApi.completeClass,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      queryClient.invalidateQueries({ queryKey: classKeys.detail(id) });
    },
  });
};

export const useCancelClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      classApi.cancelClass(id, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
      queryClient.invalidateQueries({
        queryKey: classKeys.detail(variables.id),
      });
    },
  });
};

export const useGenerateClassesForPeriod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      startDate,
      endDate,
      teacherId,
    }: {
      startDate: string;
      endDate: string;
      teacherId?: string;
    }) => classApi.generateClassesForPeriod(startDate, endDate, teacherId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all });
    },
  });
};
