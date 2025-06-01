// src/hooks/useTeachers.ts

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { databases, appwriteConfig } from "@/constants/appwriteConfig";
import { Query } from "appwrite";
import { User, UserRole } from "@/types";

// API функции для работы с преподавателями
export const teachersApi = {
  // Получить всех преподавателей
  getAllTeachers: async (): Promise<User[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        [
          Query.equal("role", UserRole.TEACHER),
          Query.equal("isActive", true),
          Query.orderAsc("name"),
        ]
      );
      return response.documents as unknown as User[];
    } catch (error) {
      console.error("Ошибка при получении преподавателей:", error);
      return [];
    }
  },

  // Получить преподавателя по ID
  getTeacherById: async (id: string): Promise<User | null> => {
    try {
      const response = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        id
      );
      const user = response as unknown as User;

      if (user.role === UserRole.TEACHER) {
        return user;
      }
      return null;
    } catch (error) {
      console.error("Ошибка при получении преподавателя:", error);
      return null;
    }
  },

  // Получить нескольких преподавателей по ID
  getTeachersByIds: async (ids: string[]): Promise<User[]> => {
    try {
      if (ids.length === 0) return [];

      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        [
          Query.equal("$id", ids),
          Query.equal("role", UserRole.TEACHER),
          Query.equal("isActive", true),
        ]
      );
      return response.documents as unknown as User[];
    } catch (error) {
      console.error("Ошибка при получении преподавателей по ID:", error);
      return [];
    }
  },
};

// React Query ключи
export const teachersKeys = {
  all: ["teachers"] as const,
  lists: () => [...teachersKeys.all, "list"] as const,
  detail: (id: string) => [...teachersKeys.all, "detail", id] as const,
  byIds: (ids: string[]) => [...teachersKeys.all, "byIds", ids.sort()] as const,
};

// React Query хуки
export const useAllTeachers = () => {
  return useQuery({
    queryKey: teachersKeys.lists(),
    queryFn: teachersApi.getAllTeachers,
    staleTime: 1000 * 60 * 10, // 10 минут
  });
};

export const useTeacherById = (id: string) => {
  return useQuery({
    queryKey: teachersKeys.detail(id),
    queryFn: () => teachersApi.getTeacherById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 15, // 15 минут
  });
};

export const useTeachersByIds = (ids: string[]) => {
  return useQuery({
    queryKey: teachersKeys.byIds(ids),
    queryFn: () => teachersApi.getTeachersByIds(ids),
    enabled: ids.length > 0,
    staleTime: 1000 * 60 * 15, // 15 минут
  });
};

// Хук для создания карты преподавателей (id -> name)
export const useTeachersMap = (teacherIds: string[]) => {
  const { data: teachers = [] } = useTeachersByIds(teacherIds);

  const teachersMap = useMemo(() => {
    const map = new Map<string, string>();
    teachers.forEach((teacher) => {
      map.set(teacher.$id, teacher.name);
    });
    return map;
  }, [teachers]);

  return teachersMap;
};
