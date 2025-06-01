// src/services/attendanceService.ts

import { ID, Query } from "appwrite";
import { databases, appwriteConfig } from "@/constants/appwriteConfig";
import {
  Attendance,
  MarkAttendanceDto,
  AttendanceFilters,
  AttendanceWithStudent,
  StudentAttendanceStats,
  AttendanceStatus,
  User,
  ClassWithDetails,
} from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const attendanceApi = {
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

  // Получить посещаемость для занятия с данными студентов
  getAttendanceForClass: async (
    classId: string
  ): Promise<AttendanceWithStudent[]> => {
    try {
      console.log("📊 Получение посещаемости для занятия:", classId);

      const attendanceResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.attendance,
        [Query.equal("classId", classId)]
      );

      if (attendanceResponse.documents.length === 0) {
        console.log("📊 Посещаемость не найдена для занятия:", classId);
        return [];
      }

      // Получаем данные студентов
      const studentsResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users
      );

      const studentsMap = new Map(
        (studentsResponse.documents as unknown as User[]).map((user) => [
          user.$id,
          user,
        ])
      );

      // Объединяем данные посещаемости с данными студентов
      const attendanceWithStudents: AttendanceWithStudent[] =
        attendanceResponse.documents.map((attendance: any) => ({
          ...attendance,
          student:
            studentsMap.get(attendance.studentId) ||
            ({
              $id: attendance.studentId,
              name: "Неизвестный студент",
              email: "",
              role: "student",
              isActive: true,
            } as any),
        }));

      console.log(
        "✅ Получена посещаемость с данными студентов:",
        attendanceWithStudents.length
      );
      return attendanceWithStudents;
    } catch (error) {
      console.error("❌ Ошибка при получении посещаемости:", error);
      return [];
    }
  },

  // Отметить посещаемость
  markAttendance: async (
    data: MarkAttendanceDto,
    markedBy: string
  ): Promise<Attendance> => {
    try {
      console.log("📝 Отметка посещаемости:", { data, markedBy });

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
        console.log("🔄 Обновление существующей записи посещаемости");
        const response = await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collections.attendance,
          existing.documents[0].$id,
          attendanceData
        );
        return response as unknown as Attendance;
      } else {
        // Создаем новую запись
        console.log("➕ Создание новой записи посещаемости");
        const response = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collections.attendance,
          ID.unique(),
          attendanceData
        );
        return response as unknown as Attendance;
      }
    } catch (error) {
      console.error("❌ Ошибка при отметке посещаемости:", error);
      throw error;
    }
  },

  // Получить статистику посещаемости студента
  getStudentAttendanceStats: async (
    studentId: string,
    filters?: { subjectId?: string; dateFrom?: string; dateTo?: string }
  ): Promise<StudentAttendanceStats> => {
    try {
      console.log("📈 Получение статистики посещаемости студента:", studentId);

      const queries: string[] = [Query.equal("studentId", studentId)];

      if (filters?.dateFrom) {
        queries.push(Query.greaterThanEqual("markedAt", filters.dateFrom));
      }
      if (filters?.dateTo) {
        queries.push(Query.lessThanEqual("markedAt", filters.dateTo));
      }

      const attendanceResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.attendance,
        queries
      );

      const attendanceRecords =
        attendanceResponse.documents as unknown as Attendance[];

      // Фильтрация по предмету через занятия (если нужно)
      let filteredRecords = attendanceRecords;
      if (filters?.subjectId) {
        // TODO: Здесь нужно будет добавить фильтрацию через связь с занятиями
        console.log("⚠️ Фильтрация по предмету пока не реализована");
      }

      const stats = {
        totalClasses: filteredRecords.length,
        presentCount: filteredRecords.filter(
          (a) => a.status === AttendanceStatus.PRESENT
        ).length,
        absentCount: filteredRecords.filter(
          (a) => a.status === AttendanceStatus.ABSENT
        ).length,
        lateCount: filteredRecords.filter(
          (a) => a.status === AttendanceStatus.LATE
        ).length,
        excusedCount: filteredRecords.filter(
          (a) => a.status === AttendanceStatus.EXCUSED
        ).length,
        attendanceRate: 0,
      };

      stats.attendanceRate =
        stats.totalClasses > 0
          ? ((stats.presentCount + stats.lateCount) / stats.totalClasses) * 100
          : 0;

      // Получаем данные студента
      let student: User;
      try {
        const studentResponse = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collections.users,
          studentId
        );
        student = studentResponse as unknown as User;
      } catch {
        student = {
          $id: studentId,
          name: "Неизвестный студент",
          email: "",
          role: "student",
          isActive: true,
        } as any;
      }

      console.log("✅ Получена статистика посещаемости:", stats);
      return { ...stats, student };
    } catch (error) {
      console.error("❌ Ошибка при получении статистики:", error);
      return {
        student: {
          $id: studentId,
          name: "Неизвестный студент",
          email: "",
          role: "student",
          isActive: true,
        } as any,
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
      console.log("📚 Получение посещаемости студента:", studentId);

      const queries: string[] = [
        Query.equal("studentId", studentId),
        Query.orderDesc("markedAt"),
      ];

      if (filters?.dateFrom) {
        queries.push(Query.greaterThanEqual("markedAt", filters.dateFrom));
      }
      if (filters?.dateTo) {
        queries.push(Query.lessThanEqual("markedAt", filters.dateTo));
      }
      if (filters?.status && filters.status.length > 0) {
        queries.push(Query.equal("status", filters.status));
      }

      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.attendance,
        queries
      );

      console.log(
        "✅ Получена посещаемость студента:",
        response.documents.length
      );
      return response.documents as unknown as Attendance[];
    } catch (error) {
      console.error("❌ Ошибка при получении посещаемости студента:", error);
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
      console.log("📝 Массовая отметка посещаемости для занятия:", classId);

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

      console.log("✅ Массовая отметка завершена:", results.length);
      return results;
    } catch (error) {
      console.error("❌ Ошибка при массовой отметке посещаемости:", error);
      throw error;
    }
  },

  // Получить сводную статистику посещаемости для группы/класса
  getClassAttendanceStats: async (
    classId: string
  ): Promise<{
    totalStudents: number;
    markedStudents: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    attendanceRate: number;
  }> => {
    try {
      console.log("📊 Получение статистики посещаемости класса:", classId);

      const attendanceRecords = await attendanceApi.getAttendanceForClass(
        classId
      );

      const stats = {
        totalStudents: attendanceRecords.length,
        markedStudents: attendanceRecords.length,
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
        stats.totalStudents > 0
          ? ((stats.presentCount + stats.lateCount) / stats.totalStudents) * 100
          : 0;

      console.log("✅ Получена статистика класса:", stats);
      return stats;
    } catch (error) {
      console.error("❌ Ошибка при получении статистики класса:", error);
      return {
        totalStudents: 0,
        markedStudents: 0,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        excusedCount: 0,
        attendanceRate: 0,
      };
    }
  },

  // Удалить запись посещаемости
  deleteAttendance: async (attendanceId: string): Promise<boolean> => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.attendance,
        attendanceId
      );
      console.log("✅ Запись посещаемости удалена:", attendanceId);
      return true;
    } catch (error) {
      console.error("❌ Ошибка при удалении записи посещаемости:", error);
      throw error;
    }
  },
};

// React Query ключи
export const attendanceKeys = {
  all: ["attendance"] as const,
  classAttendance: (classId: string) =>
    [...attendanceKeys.all, "class", classId] as const,
  studentAttendance: (studentId: string) =>
    [...attendanceKeys.all, "student", studentId] as const,
  studentStats: (studentId: string, filters?: any) =>
    [...attendanceKeys.studentAttendance(studentId), "stats", filters] as const,
  classStats: (classId: string) =>
    [...attendanceKeys.all, "classStats", classId] as const,
  classes: () => [...attendanceKeys.all, "classes"] as const,
  classesWithFilters: (filters?: any) =>
    [...attendanceKeys.classes(), filters] as const,
};

// React Query хуки
export const useClassAttendance = (classId: string) => {
  return useQuery({
    queryKey: attendanceKeys.classAttendance(classId),
    queryFn: () => attendanceApi.getAttendanceForClass(classId),
    staleTime: 1000 * 60 * 2, // 2 минуты
    enabled: !!classId,
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
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.classStats(variables.data.classId),
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
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.classStats(variables.classId),
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
    enabled: !!studentId,
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
    enabled: !!studentId,
  });
};

export const useClassAttendanceStats = (classId: string) => {
  return useQuery({
    queryKey: attendanceKeys.classStats(classId),
    queryFn: () => attendanceApi.getClassAttendanceStats(classId),
    staleTime: 1000 * 60 * 5, // 5 минут
    enabled: !!classId,
  });
};

export const useDeleteAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: attendanceApi.deleteAttendance,
    onSuccess: () => {
      // Инвалидируем все запросы посещаемости
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
};

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
