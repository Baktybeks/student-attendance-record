import { Query } from "appwrite";
import { databases, appwriteConfig } from "@/constants/appwriteConfig";
import { User, UserRole } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// API функции для работы со студентами в группах
export const groupStudentsApi = {
  // Получить студентов группы
  getStudentsByGroup: async (groupId: string): Promise<User[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        [
          Query.equal("role", UserRole.STUDENT),
          Query.equal("groupId", groupId),
          Query.equal("isActive", true),
          Query.orderAsc("name"),
        ]
      );
      return response.documents as unknown as User[];
    } catch (error) {
      console.error("Ошибка при получении студентов группы:", error);
      return [];
    }
  },

  // Получить студентов без группы
  getStudentsWithoutGroup: async (): Promise<User[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        [
          Query.equal("role", UserRole.STUDENT),
          Query.equal("isActive", true),
          Query.isNull("groupId"),
          Query.orderAsc("name"),
        ]
      );
      return response.documents as unknown as User[];
    } catch (error) {
      console.error("Ошибка при получении студентов без группы:", error);
      return [];
    }
  },

  // Добавить студента в группу
  addStudentToGroup: async (
    studentId: string,
    groupId: string
  ): Promise<User> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        studentId,
        { groupId }
      );
      return response as unknown as User;
    } catch (error) {
      console.error("Ошибка при добавлении студента в группу:", error);
      throw error;
    }
  },

  // Удалить студента из группы
  removeStudentFromGroup: async (studentId: string): Promise<User> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        studentId,
        { groupId: null }
      );
      return response as unknown as User;
    } catch (error) {
      console.error("Ошибка при удалении студента из группы:", error);
      throw error;
    }
  },

  // Перевести студента в другую группу
  transferStudent: async (
    studentId: string,
    newGroupId: string
  ): Promise<User> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        studentId,
        { groupId: newGroupId }
      );
      return response as unknown as User;
    } catch (error) {
      console.error("Ошибка при переводе студента:", error);
      throw error;
    }
  },

  // Массовое добавление студентов в группу
  bulkAddStudentsToGroup: async (
    studentIds: string[],
    groupId: string
  ): Promise<User[]> => {
    try {
      const results = await Promise.all(
        studentIds.map((studentId) =>
          groupStudentsApi.addStudentToGroup(studentId, groupId)
        )
      );
      return results;
    } catch (error) {
      console.error("Ошибка при массовом добавлении студентов:", error);
      throw error;
    }
  },

  // Обновить количество студентов в группе
  updateGroupStudentsCount: async (groupId: string): Promise<number> => {
    try {
      const students = await groupStudentsApi.getStudentsByGroup(groupId);
      const count = students.length;

      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.groups,
        groupId,
        { studentsCount: count }
      );

      return count;
    } catch (error) {
      console.error("Ошибка при обновлении количества студентов:", error);
      throw error;
    }
  },

  // Получить все группы со статистикой студентов
  getGroupsWithStudentStats: async () => {
    try {
      const groupsResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.groups,
        [Query.orderAsc("name")]
      );

      const groups = groupsResponse.documents;

      const groupsWithStats = await Promise.all(
        groups.map(async (group) => {
          const students = await groupStudentsApi.getStudentsByGroup(group.$id);
          return {
            ...group,
            studentsCount: students.length,
            students: students.slice(0, 5), // Первые 5 студентов для превью
          };
        })
      );

      return groupsWithStats;
    } catch (error) {
      console.error("Ошибка при получении групп со статистикой:", error);
      return [];
    }
  },
};

// React Query ключи
export const groupStudentsKeys = {
  all: ["groupStudents"] as const,
  byGroup: (groupId: string) =>
    [...groupStudentsKeys.all, "group", groupId] as const,
  withoutGroup: () => [...groupStudentsKeys.all, "withoutGroup"] as const,
  groupsWithStats: () => [...groupStudentsKeys.all, "groupsWithStats"] as const,
};

// React Query хуки
export const useStudentsByGroup = (groupId: string) => {
  return useQuery({
    queryKey: groupStudentsKeys.byGroup(groupId),
    queryFn: () => groupStudentsApi.getStudentsByGroup(groupId),
    enabled: !!groupId,
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

export const useStudentsWithoutGroup = () => {
  return useQuery({
    queryKey: groupStudentsKeys.withoutGroup(),
    queryFn: groupStudentsApi.getStudentsWithoutGroup,
    staleTime: 1000 * 60 * 2, // 2 минуты
  });
};

export const useGroupsWithStudentStats = () => {
  return useQuery({
    queryKey: groupStudentsKeys.groupsWithStats(),
    queryFn: groupStudentsApi.getGroupsWithStudentStats,
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

export const useAddStudentToGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      groupId,
    }: {
      studentId: string;
      groupId: string;
    }) => groupStudentsApi.addStudentToGroup(studentId, groupId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: groupStudentsKeys.byGroup(variables.groupId),
      });
      queryClient.invalidateQueries({
        queryKey: groupStudentsKeys.withoutGroup(),
      });
      queryClient.invalidateQueries({
        queryKey: groupStudentsKeys.groupsWithStats(),
      });
      // Обновляем количество студентов в группе
      groupStudentsApi.updateGroupStudentsCount(variables.groupId);
    },
  });
};

export const useRemoveStudentFromGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      groupId,
    }: {
      studentId: string;
      groupId?: string;
    }) => groupStudentsApi.removeStudentFromGroup(studentId),
    onSuccess: (_, variables) => {
      if (variables.groupId) {
        queryClient.invalidateQueries({
          queryKey: groupStudentsKeys.byGroup(variables.groupId),
        });
        // Обновляем количество студентов в группе
        groupStudentsApi.updateGroupStudentsCount(variables.groupId);
      }
      queryClient.invalidateQueries({
        queryKey: groupStudentsKeys.withoutGroup(),
      });
      queryClient.invalidateQueries({
        queryKey: groupStudentsKeys.groupsWithStats(),
      });
    },
  });
};

export const useTransferStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      oldGroupId,
      newGroupId,
    }: {
      studentId: string;
      oldGroupId?: string;
      newGroupId: string;
    }) => groupStudentsApi.transferStudent(studentId, newGroupId),
    onSuccess: (_, variables) => {
      // Инвалидируем данные для обеих групп
      if (variables.oldGroupId) {
        queryClient.invalidateQueries({
          queryKey: groupStudentsKeys.byGroup(variables.oldGroupId),
        });
        groupStudentsApi.updateGroupStudentsCount(variables.oldGroupId);
      }

      queryClient.invalidateQueries({
        queryKey: groupStudentsKeys.byGroup(variables.newGroupId),
      });
      queryClient.invalidateQueries({
        queryKey: groupStudentsKeys.withoutGroup(),
      });
      queryClient.invalidateQueries({
        queryKey: groupStudentsKeys.groupsWithStats(),
      });

      // Обновляем количество студентов в новой группе
      groupStudentsApi.updateGroupStudentsCount(variables.newGroupId);
    },
  });
};

export const useBulkAddStudentsToGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentIds,
      groupId,
    }: {
      studentIds: string[];
      groupId: string;
    }) => groupStudentsApi.bulkAddStudentsToGroup(studentIds, groupId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: groupStudentsKeys.byGroup(variables.groupId),
      });
      queryClient.invalidateQueries({
        queryKey: groupStudentsKeys.withoutGroup(),
      });
      queryClient.invalidateQueries({
        queryKey: groupStudentsKeys.groupsWithStats(),
      });
      // Обновляем количество студентов в группе
      groupStudentsApi.updateGroupStudentsCount(variables.groupId);
    },
  });
};
