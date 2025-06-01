import { ID, Query } from "appwrite";
import { databases, appwriteConfig } from "@/constants/appwriteConfig";
import {
  Class,
  Attendance,
  MarkAttendanceDto,
  AttendanceFilters,
  AttendanceWithStudent,
  ClassWithDetails,
  StudentAttendanceStats,
  AttendanceStatus,
  BaseDocument, // ИСПРАВЛЕНО: импорт из types
} from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const attendanceApi = {
  // Получить занятия по фильтрам
  getClasses: async (filters?: {
    teacherId?: string;
    groupId?: string;
    subjectId?: string;
    date?: string;
  }): Promise<ClassWithDetails[]> => {
    try {
      const queries: string[] = [Query.orderDesc("date")];

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

      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.classes,
        queries
      );

      // TODO: Добавить получение связанных данных (расписание, предмет, группа)
      return response.documents as unknown as ClassWithDetails[];
    } catch (error) {
      console.error("Ошибка при получении занятий:", error);
      return [];
    }
  },

  // Создать занятие
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

  // Получить посещаемость для занятия
  getAttendanceForClass: async (
    classId: string
  ): Promise<AttendanceWithStudent[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.attendance,
        [Query.equal("classId", classId)]
      );

      // TODO: Добавить получение данных студентов
      return response.documents as unknown as AttendanceWithStudent[];
    } catch (error) {
      console.error("Ошибка при получении посещаемости:", error);
      return [];
    }
  },

  // Отметить посещаемость
  markAttendance: async (
    data: MarkAttendanceDto,
    markedBy: string
  ): Promise<Attendance> => {
    try {
      const attendanceData = {
        ...data,
        markedAt: new Date().toISOString(),
        markedBy,
      };

      // Проверяем, есть ли уже запись о посещаемости
      const existing = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.attendance,
        [
          Query.equal("classId", data.classId),
          Query.equal("studentId", data.studentId),
        ]
      );

      if (existing.documents.length > 0) {
        // Обновляем существующую запись
        const response = await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collections.attendance,
          existing.documents[0].$id,
          attendanceData
        );
        return response as unknown as Attendance;
      } else {
        // Создаем новую запись
        const response = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collections.attendance,
          ID.unique(),
          attendanceData
        );
        return response as unknown as Attendance;
      }
    } catch (error) {
      console.error("Ошибка при отметке посещаемости:", error);
      throw error;
    }
  },

  // Получить статистику посещаемости студента
  getStudentAttendanceStats: async (
    studentId: string,
    filters?: { subjectId?: string; dateFrom?: string; dateTo?: string }
  ): Promise<StudentAttendanceStats> => {
    try {
      const queries: string[] = [Query.equal("studentId", studentId)];

      // TODO: Добавить фильтры по предмету и датам

      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.attendance,
        queries
      );

      const attendanceRecords = response.documents as unknown as Attendance[];

      const stats = {
        totalClasses: attendanceRecords.length,
        presentCount: attendanceRecords.filter(
          (a) => a.status === AttendanceStatus.PRESENT
        ).length,
        absentCount: attendanceRecords.filter(
          (a) => a.status === AttendanceStatus.ABSENT
        ).length,
        lateCount: attendanceRecords.filter(
          (a) => a.status === AttendanceStatus.LATE
        ).length,
        excusedCount: attendanceRecords.filter(
          (a) => a.status === AttendanceStatus.EXCUSED
        ).length,
        attendanceRate: 0,
      };

      stats.attendanceRate =
        stats.totalClasses > 0
          ? ((stats.presentCount + stats.lateCount) / stats.totalClasses) * 100
          : 0;

      return {
        ...stats,
        student: {} as any, // TODO: Получить данные студента
      };
    } catch (error) {
      console.error("Ошибка при получении статистики:", error);
      return {
        student: {} as any,
        totalClasses: 0,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        excusedCount: 0,
        attendanceRate: 0,
      };
    }
  },

  // Получить посещаемость студента
  getStudentAttendance: async (
    studentId: string,
    filters?: AttendanceFilters
  ): Promise<Attendance[]> => {
    try {
      const queries: string[] = [
        Query.equal("studentId", studentId),
        Query.orderDesc("$createdAt"),
      ];

      if (filters?.dateFrom) {
        queries.push(Query.greaterThanEqual("$createdAt", filters.dateFrom));
      }
      if (filters?.dateTo) {
        queries.push(Query.lessThanEqual("$createdAt", filters.dateTo));
      }
      if (filters?.status && filters.status.length > 0) {
        queries.push(Query.equal("status", filters.status));
      }

      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.attendance,
        queries
      );

      return response.documents as unknown as Attendance[];
    } catch (error) {
      console.error("Ошибка при получении посещаемости студента:", error);
      return [];
    }
  },

  // Массовая отметка посещаемости
  bulkMarkAttendance: async (
    classId: string,
    attendanceData: Array<{
      studentId: string;
      status: AttendanceStatus;
      notes?: string;
    }>,
    markedBy: string
  ): Promise<Attendance[]> => {
    try {
      const results = await Promise.all(
        attendanceData.map((data) =>
          attendanceApi.markAttendance(
            {
              classId,
              studentId: data.studentId,
              status: data.status,
              notes: data.notes,
            },
            markedBy
          )
        )
      );

      return results;
    } catch (error) {
      console.error("Ошибка при массовой отметке посещаемости:", error);
      throw error;
    }
  },
};

// React Query ключи
export const attendanceKeys = {
  all: ["attendance"] as const,
  classes: () => [...attendanceKeys.all, "classes"] as const,
  classesWithFilters: (filters?: any) =>
    [...attendanceKeys.classes(), filters] as const,
  classAttendance: (classId: string) =>
    [...attendanceKeys.all, "class", classId] as const,
  studentAttendance: (studentId: string) =>
    [...attendanceKeys.all, "student", studentId] as const,
  studentStats: (studentId: string, filters?: any) =>
    [...attendanceKeys.studentAttendance(studentId), "stats", filters] as const,
};

// React Query хуки
export const useClasses = (filters?: {
  teacherId?: string;
  groupId?: string;
  subjectId?: string;
  date?: string;
}) => {
  return useQuery({
    queryKey: attendanceKeys.classesWithFilters(filters),
    queryFn: () => attendanceApi.getClasses(filters),
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

export const useCreateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: attendanceApi.createClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.classes() });
    },
  });
};

export const useClassAttendance = (classId: string) => {
  return useQuery({
    queryKey: attendanceKeys.classAttendance(classId),
    queryFn: () => attendanceApi.getAttendanceForClass(classId),
    staleTime: 1000 * 60 * 2, // 2 минуты
  });
};

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      markedBy,
    }: {
      data: MarkAttendanceDto;
      markedBy: string;
    }) => attendanceApi.markAttendance(data, markedBy),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.classAttendance(variables.data.classId),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.studentAttendance(variables.data.studentId),
      });
    },
  });
};

export const useBulkMarkAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      classId,
      attendanceData,
      markedBy,
    }: {
      classId: string;
      attendanceData: Array<{
        studentId: string;
        status: AttendanceStatus;
        notes?: string;
      }>;
      markedBy: string;
    }) => attendanceApi.bulkMarkAttendance(classId, attendanceData, markedBy),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.classAttendance(variables.classId),
      });
      // Инвалидируем статистику для всех студентов
      variables.attendanceData.forEach((item) => {
        queryClient.invalidateQueries({
          queryKey: attendanceKeys.studentAttendance(item.studentId),
        });
      });
    },
  });
};

export const useStudentAttendance = (
  studentId: string,
  filters?: AttendanceFilters
) => {
  return useQuery({
    queryKey: attendanceKeys.studentAttendance(studentId),
    queryFn: () => attendanceApi.getStudentAttendance(studentId, filters),
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

export const useStudentAttendanceStats = (
  studentId: string,
  filters?: { subjectId?: string; dateFrom?: string; dateTo?: string }
) => {
  return useQuery({
    queryKey: attendanceKeys.studentStats(studentId, filters),
    queryFn: () => attendanceApi.getStudentAttendanceStats(studentId, filters),
    staleTime: 1000 * 60 * 10, // 10 минут
  });
};
