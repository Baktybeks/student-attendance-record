import { ID, Query } from "appwrite";
import { databases, appwriteConfig } from "@/constants/appwriteConfig";
import { Group, CreateGroupDto } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// API функции для работы с группами
export const groupApi = {
  // Получить все группы
  getAllGroups: async (): Promise<Group[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.groups,
        [Query.orderAsc("name")]
      );
      return response.documents as unknown as Group[];
    } catch (error) {
      console.error("Ошибка при получении групп:", error);
      return [];
    }
  },

  // Получить активные группы
  getActiveGroups: async (): Promise<Group[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.groups,
        [Query.equal("isActive", true), Query.orderAsc("name")]
      );
      return response.documents as unknown as Group[];
    } catch (error) {
      console.error("Ошибка при получении активных групп:", error);
      return [];
    }
  },

  // Получить группу по ID
  getGroupById: async (id: string): Promise<Group | null> => {
    try {
      const response = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.groups,
        id
      );
      return response as unknown as Group;
    } catch (error) {
      console.error("Ошибка при получении группы:", error);
      return null;
    }
  },

  // Получить группы по курсу
  getGroupsByCourse: async (course: number): Promise<Group[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.groups,
        [
          Query.equal("course", course),
          Query.equal("isActive", true),
          Query.orderAsc("name"),
        ]
      );
      return response.documents as unknown as Group[];
    } catch (error) {
      console.error("Ошибка при получении групп по курсу:", error);
      return [];
    }
  },

  // Создать группу
  createGroup: async (data: CreateGroupDto): Promise<Group> => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.groups,
        ID.unique(),
        {
          ...data,
          isActive: true,
          studentsCount: 0,
        }
      );
      return response as unknown as Group;
    } catch (error: any) {
      if (error.code === 409) {
        throw new Error("Группа с таким кодом уже существует");
      }
      console.error("Ошибка при создании группы:", error);
      throw error;
    }
  },

  // Обновить группу
  updateGroup: async (id: string, updates: Partial<Group>): Promise<Group> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.groups,
        id,
        updates
      );
      return response as unknown as Group;
    } catch (error) {
      console.error("Ошибка при обновлении группы:", error);
      throw error;
    }
  },

  // Деактивировать группу
  deactivateGroup: async (id: string): Promise<Group> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.groups,
        id,
        { isActive: false }
      );
      return response as unknown as Group;
    } catch (error) {
      console.error("Ошибка при деактивации группы:", error);
      throw error;
    }
  },

  // Активировать группу
  activateGroup: async (id: string): Promise<Group> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.groups,
        id,
        { isActive: true }
      );
      return response as unknown as Group;
    } catch (error) {
      console.error("Ошибка при активации группы:", error);
      throw error;
    }
  },

  // Удалить группу
  deleteGroup: async (id: string): Promise<boolean> => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.groups,
        id
      );
      return true;
    } catch (error) {
      console.error("Ошибка при удалении группы:", error);
      throw error;
    }
  },

  // Обновить количество студентов в группе
  updateStudentsCount: async (
    groupId: string,
    count: number
  ): Promise<Group> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.groups,
        groupId,
        { studentsCount: count }
      );
      return response as unknown as Group;
    } catch (error) {
      console.error("Ошибка при обновлении количества студентов:", error);
      throw error;
    }
  },

  // Поиск групп по названию или коду
  searchGroups: async (searchTerm: string): Promise<Group[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.groups,
        [Query.orderAsc("name")]
      );

      const groups = response.documents as unknown as Group[];
      const searchLower = searchTerm.toLowerCase();

      return groups.filter(
        (group) =>
          group.name.toLowerCase().includes(searchLower) ||
          group.code.toLowerCase().includes(searchLower) ||
          group.specialization.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error("Ошибка при поиске групп:", error);
      return [];
    }
  },

  // Получить статистику групп
  getGroupStats: async (): Promise<{
    total: number;
    active: number;
    inactive: number;
    byCourse: Record<number, number>;
    averageStudentsPerGroup: number;
  }> => {
    try {
      const groups = await groupApi.getAllGroups();

      const active = groups.filter((g) => g.isActive).length;
      const inactive = groups.length - active;

      const byCourse = groups.reduce((acc, group) => {
        acc[group.course] = (acc[group.course] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const totalStudents = groups.reduce(
        (sum, group) => sum + (group.studentsCount || 0),
        0
      );
      const averageStudentsPerGroup =
        groups.length > 0 ? totalStudents / groups.length : 0;

      return {
        total: groups.length,
        active,
        inactive,
        byCourse,
        averageStudentsPerGroup:
          Math.round(averageStudentsPerGroup * 100) / 100,
      };
    } catch (error) {
      console.error("Ошибка при получении статистики групп:", error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        byCourse: {},
        averageStudentsPerGroup: 0,
      };
    }
  },
};

// React Query ключи
export const groupKeys = {
  all: ["groups"] as const,
  lists: () => [...groupKeys.all, "list"] as const,
  active: () => [...groupKeys.all, "active"] as const,
  byCourse: (course: number) => [...groupKeys.all, "course", course] as const,
  detail: (id: string) => [...groupKeys.all, "detail", id] as const,
  search: (term: string) => [...groupKeys.all, "search", term] as const,
  stats: () => [...groupKeys.all, "stats"] as const,
};

// React Query хуки
export const useAllGroups = () => {
  return useQuery({
    queryKey: groupKeys.lists(),
    queryFn: groupApi.getAllGroups,
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

export const useActiveGroups = () => {
  return useQuery({
    queryKey: groupKeys.active(),
    queryFn: groupApi.getActiveGroups,
    staleTime: 1000 * 60 * 10, // 10 минут
  });
};

export const useGroupById = (id: string) => {
  return useQuery({
    queryKey: groupKeys.detail(id),
    queryFn: () => groupApi.getGroupById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

export const useGroupsByCourse = (course: number) => {
  return useQuery({
    queryKey: groupKeys.byCourse(course),
    queryFn: () => groupApi.getGroupsByCourse(course),
    enabled: !!course,
    staleTime: 1000 * 60 * 10, // 10 минут
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: groupApi.createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Group> }) =>
      groupApi.updateGroup(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
      queryClient.invalidateQueries({
        queryKey: groupKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: groupApi.deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
    },
  });
};

export const useActivateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: groupApi.activateGroup,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(id) });
    },
  });
};

export const useDeactivateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: groupApi.deactivateGroup,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(id) });
    },
  });
};

export const useSearchGroups = (searchTerm: string) => {
  return useQuery({
    queryKey: groupKeys.search(searchTerm),
    queryFn: () => groupApi.searchGroups(searchTerm),
    enabled: searchTerm.length > 0,
    staleTime: 1000 * 60 * 2, // 2 минуты
  });
};

export const useGroupStats = () => {
  return useQuery({
    queryKey: groupKeys.stats(),
    queryFn: groupApi.getGroupStats,
    staleTime: 1000 * 60 * 15, // 15 минут
  });
};
