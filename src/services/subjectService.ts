import { ID, Query } from "appwrite";
import { databases, appwriteConfig } from "@/constants/appwriteConfig";
import { Subject, CreateSubjectDto } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// API функции для работы с предметами
export const subjectApi = {
  // Получить все предметы
  getAllSubjects: async (): Promise<Subject[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.subjects,
        [Query.orderAsc("name")]
      );
      return response.documents as unknown as Subject[];
    } catch (error) {
      console.error("Ошибка при получении предметов:", error);
      return [];
    }
  },

  // Получить активные предметы
  getActiveSubjects: async (): Promise<Subject[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.subjects,
        [Query.equal("isActive", true), Query.orderAsc("name")]
      );
      return response.documents as unknown as Subject[];
    } catch (error) {
      console.error("Ошибка при получении активных предметов:", error);
      return [];
    }
  },

  // Получить предмет по ID
  getSubjectById: async (id: string): Promise<Subject | null> => {
    try {
      const response = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.subjects,
        id
      );
      return response as unknown as Subject;
    } catch (error) {
      console.error("Ошибка при получении предмета:", error);
      return null;
    }
  },

  // Получить предметы преподавателя
  getSubjectsByTeacher: async (teacherId: string): Promise<Subject[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.subjects,
        [
          Query.equal("teacherId", teacherId),
          Query.equal("isActive", true),
          Query.orderAsc("name"),
        ]
      );
      return response.documents as unknown as Subject[];
    } catch (error) {
      console.error("Ошибка при получении предметов преподавателя:", error);
      return [];
    }
  },

  // Получить предметы для группы
  getSubjectsForGroup: async (groupId: string): Promise<Subject[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.subjects,
        [Query.equal("isActive", true), Query.orderAsc("name")]
      );

      const subjects = response.documents as unknown as Subject[];

      // Фильтруем предметы, которые преподаются данной группе
      return subjects.filter((subject) => subject.groupIds.includes(groupId));
    } catch (error) {
      console.error("Ошибка при получении предметов для группы:", error);
      return [];
    }
  },

  // Создать предмет
  createSubject: async (data: CreateSubjectDto): Promise<Subject> => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.subjects,
        ID.unique(),
        {
          ...data,
          isActive: true,
        }
      );
      return response as unknown as Subject;
    } catch (error: any) {
      if (error.code === 409) {
        throw new Error("Предмет с таким кодом уже существует");
      }
      console.error("Ошибка при создании предмета:", error);
      throw error;
    }
  },

  // Обновить предмет
  updateSubject: async (
    id: string,
    updates: Partial<Subject>
  ): Promise<Subject> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.subjects,
        id,
        updates
      );
      return response as unknown as Subject;
    } catch (error) {
      console.error("Ошибка при обновлении предмета:", error);
      throw error;
    }
  },

  // Деактивировать предмет
  deactivateSubject: async (id: string): Promise<Subject> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.subjects,
        id,
        { isActive: false }
      );
      return response as unknown as Subject;
    } catch (error) {
      console.error("Ошибка при деактивации предмета:", error);
      throw error;
    }
  },

  // Активировать предмет
  activateSubject: async (id: string): Promise<Subject> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.subjects,
        id,
        { isActive: true }
      );
      return response as unknown as Subject;
    } catch (error) {
      console.error("Ошибка при активации предмета:", error);
      throw error;
    }
  },

  // Удалить предмет
  deleteSubject: async (id: string): Promise<boolean> => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.subjects,
        id
      );
      return true;
    } catch (error) {
      console.error("Ошибка при удалении предмета:", error);
      throw error;
    }
  },

  // Добавить группу к предмету
  addGroupToSubject: async (
    subjectId: string,
    groupId: string
  ): Promise<Subject> => {
    try {
      const subject = await subjectApi.getSubjectById(subjectId);
      if (!subject) {
        throw new Error("Предмет не найден");
      }

      const updatedGroupIds = [...subject.groupIds];
      if (!updatedGroupIds.includes(groupId)) {
        updatedGroupIds.push(groupId);
      }

      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.subjects,
        subjectId,
        { groupIds: updatedGroupIds }
      );
      return response as unknown as Subject;
    } catch (error) {
      console.error("Ошибка при добавлении группы к предмету:", error);
      throw error;
    }
  },

  // Удалить группу из предмета
  removeGroupFromSubject: async (
    subjectId: string,
    groupId: string
  ): Promise<Subject> => {
    try {
      const subject = await subjectApi.getSubjectById(subjectId);
      if (!subject) {
        throw new Error("Предмет не найден");
      }

      const updatedGroupIds = subject.groupIds.filter((id) => id !== groupId);

      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.subjects,
        subjectId,
        { groupIds: updatedGroupIds }
      );
      return response as unknown as Subject;
    } catch (error) {
      console.error("Ошибка при удалении группы из предмета:", error);
      throw error;
    }
  },

  // Назначить преподавателя к предмету
  assignTeacherToSubject: async (
    subjectId: string,
    teacherId: string
  ): Promise<Subject> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.subjects,
        subjectId,
        { teacherId }
      );
      return response as unknown as Subject;
    } catch (error) {
      console.error("Ошибка при назначении преподавателя:", error);
      throw error;
    }
  },

  // Поиск предметов
  searchSubjects: async (searchTerm: string): Promise<Subject[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.subjects,
        [Query.orderAsc("name")]
      );

      const subjects = response.documents as unknown as Subject[];
      const searchLower = searchTerm.toLowerCase();

      return subjects.filter(
        (subject) =>
          subject.name.toLowerCase().includes(searchLower) ||
          subject.code.toLowerCase().includes(searchLower) ||
          (subject.description &&
            subject.description.toLowerCase().includes(searchLower))
      );
    } catch (error) {
      console.error("Ошибка при поиске предметов:", error);
      return [];
    }
  },

  // Получить статистику предметов
  getSubjectStats: async (): Promise<{
    total: number;
    active: number;
    inactive: number;
    averageHours: number;
    byTeacher: Record<string, number>;
    totalHours: number;
  }> => {
    try {
      const subjects = await subjectApi.getAllSubjects();

      const active = subjects.filter((s) => s.isActive).length;
      const inactive = subjects.length - active;

      const totalHours = subjects.reduce(
        (sum, subject) => sum + subject.hoursTotal,
        0
      );
      const averageHours =
        subjects.length > 0 ? totalHours / subjects.length : 0;

      const byTeacher = subjects.reduce((acc, subject) => {
        acc[subject.teacherId] = (acc[subject.teacherId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total: subjects.length,
        active,
        inactive,
        averageHours: Math.round(averageHours * 100) / 100,
        byTeacher,
        totalHours,
      };
    } catch (error) {
      console.error("Ошибка при получении статистики предметов:", error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        averageHours: 0,
        byTeacher: {},
        totalHours: 0,
      };
    }
  },
};

// React Query ключи
export const subjectKeys = {
  all: ["subjects"] as const,
  lists: () => [...subjectKeys.all, "list"] as const,
  active: () => [...subjectKeys.all, "active"] as const,
  byTeacher: (teacherId: string) =>
    [...subjectKeys.all, "teacher", teacherId] as const,
  byGroup: (groupId: string) => [...subjectKeys.all, "group", groupId] as const,
  detail: (id: string) => [...subjectKeys.all, "detail", id] as const,
  search: (term: string) => [...subjectKeys.all, "search", term] as const,
  stats: () => [...subjectKeys.all, "stats"] as const,
};

// React Query хуки
export const useAllSubjects = () => {
  return useQuery({
    queryKey: subjectKeys.lists(),
    queryFn: subjectApi.getAllSubjects,
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

export const useActiveSubjects = () => {
  return useQuery({
    queryKey: subjectKeys.active(),
    queryFn: subjectApi.getActiveSubjects,
    staleTime: 1000 * 60 * 10, // 10 минут
  });
};

export const useSubjectById = (id: string) => {
  return useQuery({
    queryKey: subjectKeys.detail(id),
    queryFn: () => subjectApi.getSubjectById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

export const useSubjectsByTeacher = (teacherId: string) => {
  return useQuery({
    queryKey: subjectKeys.byTeacher(teacherId),
    queryFn: () => subjectApi.getSubjectsByTeacher(teacherId),
    enabled: !!teacherId,
    staleTime: 1000 * 60 * 10, // 10 минут
  });
};

export const useSubjectsForGroup = (groupId: string) => {
  return useQuery({
    queryKey: subjectKeys.byGroup(groupId),
    queryFn: () => subjectApi.getSubjectsForGroup(groupId),
    enabled: !!groupId,
    staleTime: 1000 * 60 * 10, // 10 минут
  });
};

export const useCreateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subjectApi.createSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all });
    },
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Subject> }) =>
      subjectApi.updateSubject(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all });
      queryClient.invalidateQueries({
        queryKey: subjectKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subjectApi.deleteSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all });
    },
  });
};

export const useActivateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subjectApi.activateSubject,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all });
      queryClient.invalidateQueries({ queryKey: subjectKeys.detail(id) });
    },
  });
};

export const useDeactivateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subjectApi.deactivateSubject,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all });
      queryClient.invalidateQueries({ queryKey: subjectKeys.detail(id) });
    },
  });
};

export const useAssignTeacherToSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      subjectId,
      teacherId,
    }: {
      subjectId: string;
      teacherId: string;
    }) => subjectApi.assignTeacherToSubject(subjectId, teacherId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all });
      queryClient.invalidateQueries({
        queryKey: subjectKeys.detail(variables.subjectId),
      });
      queryClient.invalidateQueries({
        queryKey: subjectKeys.byTeacher(variables.teacherId),
      });
    },
  });
};

export const useSearchSubjects = (searchTerm: string) => {
  return useQuery({
    queryKey: subjectKeys.search(searchTerm),
    queryFn: () => subjectApi.searchSubjects(searchTerm),
    enabled: searchTerm.length > 0,
    staleTime: 1000 * 60 * 2, // 2 минуты
  });
};

export const useSubjectStats = () => {
  return useQuery({
    queryKey: subjectKeys.stats(),
    queryFn: subjectApi.getSubjectStats,
    staleTime: 1000 * 60 * 15, // 15 минут
  });
};
