// src/components/teacher/AttendanceModal.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  XCircle,
  Clock,
  AlertCircle,
  Save,
  Users,
  Calendar,
  BookOpen,
} from "lucide-react";
import { AttendanceStatus, User } from "@/types";
import { useStudentsByGroup } from "@/services/groupeStudentsServise";
import {
  useBulkMarkAttendance,
  useClassAttendance,
} from "@/services/attendanceService";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface AttendanceModalProps {
  classItem: {
    id: string;
    subject: string;
    group: string;
    time: string;
    classroom: string;
    studentsCount: number;
    groupId?: string; // Добавим для получения студентов
  };
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

interface StudentAttendance {
  student: User;
  status: AttendanceStatus;
  notes?: string;
}

export const AttendanceModalToday: React.FC<AttendanceModalProps> = ({
  classItem,
  isOpen,
  onClose,
  onSave,
}) => {
  const { user } = useAuthStore();
  const [attendanceData, setAttendanceData] = useState<StudentAttendance[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState("");

  // Получаем студентов группы
  const { data: groupStudents = [], isLoading: isLoadingStudents } =
    useStudentsByGroup(classItem.groupId || "");

  // Получаем текущую посещаемость (если уже отмечена)
  const { data: existingAttendance = [], isLoading: isLoadingAttendance } =
    useClassAttendance(classItem.id);

  // Хук для массовой отметки посещаемости
  const bulkMarkAttendance = useBulkMarkAttendance();

  // Инициализация данных посещаемости
  useEffect(() => {
    if (groupStudents.length > 0) {
      const existingMap = new Map(
        existingAttendance.map((att) => [att.studentId, att])
      );

      const initialAttendance: StudentAttendance[] = groupStudents.map(
        (student) => ({
          student,
          status:
            existingMap.get(student.$id)?.status || AttendanceStatus.PRESENT,
          notes: existingMap.get(student.$id)?.notes || "",
        })
      );

      setAttendanceData(initialAttendance);
    }
  }, [groupStudents, existingAttendance]);

  // Обновление статуса студента
  const updateStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceData((prev) =>
      prev.map((item) =>
        item.student.$id === studentId ? { ...item, status } : item
      )
    );
  };

  // Обновление заметок для студента
  const updateStudentNotes = (studentId: string, notes: string) => {
    setAttendanceData((prev) =>
      prev.map((item) =>
        item.student.$id === studentId ? { ...item, notes } : item
      )
    );
  };

  // Быстрая отметка всех как присутствующих
  const markAllPresent = () => {
    setAttendanceData((prev) =>
      prev.map((item) => ({ ...item, status: AttendanceStatus.PRESENT }))
    );
  };

  // Сохранение посещаемости
  const handleSave = async () => {
    if (!user?.$id) {
      console.error("Пользователь не авторизован");
      return;
    }

    setIsSaving(true);
    try {
      console.log("💾 Сохранение посещаемости для занятия:", classItem.id);

      const attendanceToSave = attendanceData.map((item) => ({
        studentId: item.student.$id,
        status: item.status,
        notes: item.notes || undefined,
      }));

      await bulkMarkAttendance.mutateAsync({
        classId: classItem.id,
        attendanceData: attendanceToSave,
        markedBy: user.$id,
      });

      console.log("✅ Посещаемость сохранена успешно");
      onSave?.();
      onClose();
    } catch (error) {
      console.error("❌ Ошибка при сохранении посещаемости:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Получение цвета для статуса
  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return "bg-green-100 text-green-800 border-green-200";
      case AttendanceStatus.ABSENT:
        return "bg-red-100 text-red-800 border-red-200";
      case AttendanceStatus.LATE:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case AttendanceStatus.EXCUSED:
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Получение иконки для статуса
  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return <Check className="w-4 h-4" />;
      case AttendanceStatus.ABSENT:
        return <XCircle className="w-4 h-4" />;
      case AttendanceStatus.LATE:
        return <Clock className="w-4 h-4" />;
      case AttendanceStatus.EXCUSED:
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Статистика
  const stats = {
    total: attendanceData.length,
    present: attendanceData.filter(
      (item) => item.status === AttendanceStatus.PRESENT
    ).length,
    absent: attendanceData.filter(
      (item) => item.status === AttendanceStatus.ABSENT
    ).length,
    late: attendanceData.filter((item) => item.status === AttendanceStatus.LATE)
      .length,
    excused: attendanceData.filter(
      (item) => item.status === AttendanceStatus.EXCUSED
    ).length,
  };

  const attendanceRate =
    stats.total > 0
      ? Math.round(((stats.present + stats.late) / stats.total) * 100)
      : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Отметка посещаемости
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{classItem.subject}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{classItem.group}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{classItem.time}</span>
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<X className="w-5 h-5" />}
          />
        </div>

        {/* Статистика */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {stats.total}
              </div>
              <div className="text-xs text-gray-600">Всего</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {stats.present}
              </div>
              <div className="text-xs text-gray-600">Присутствует</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600">
                {stats.absent}
              </div>
              <div className="text-xs text-gray-600">Отсутствует</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-yellow-600">
                {stats.late}
              </div>
              <div className="text-xs text-gray-600">Опоздал</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {stats.excused}
              </div>
              <div className="text-xs text-gray-600">Уважительная</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">
                {attendanceRate}%
              </div>
              <div className="text-xs text-gray-600">Посещаемость</div>
            </div>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="px-6 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700">
              Быстрые действия:
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={markAllPresent}
              className="text-green-600 hover:bg-green-50"
            >
              Все присутствуют
            </Button>
          </div>
        </div>

        {/* Список студентов */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoadingStudents || isLoadingAttendance ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" text="Загрузка студентов..." />
            </div>
          ) : attendanceData.length > 0 ? (
            <div className="space-y-3">
              {attendanceData.map((item, index) => (
                <Card
                  key={item.student.$id}
                  padding="sm"
                  className="hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.student.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.student.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Кнопки статусов */}
                      {Object.values(AttendanceStatus).map((status) => (
                        <button
                          key={status}
                          onClick={() =>
                            updateStudentStatus(item.student.$id, status)
                          }
                          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border transition-all ${
                            item.status === status
                              ? getStatusColor(status)
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {getStatusIcon(status)}
                          <span className="text-xs font-medium">
                            {status === AttendanceStatus.PRESENT &&
                              "Присутствует"}
                            {status === AttendanceStatus.ABSENT &&
                              "Отсутствует"}
                            {status === AttendanceStatus.LATE && "Опоздал"}
                            {status === AttendanceStatus.EXCUSED &&
                              "Уважительная"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Поле для заметок */}
                  {(item.status === AttendanceStatus.ABSENT ||
                    item.status === AttendanceStatus.EXCUSED ||
                    item.notes) && (
                    <div className="mt-3">
                      <input
                        type="text"
                        placeholder="Заметка (необязательно)..."
                        value={item.notes || ""}
                        onChange={(e) =>
                          updateStudentNotes(item.student.$id, e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                Студенты не найдены
              </h3>
              <p className="text-gray-600">
                В этой группе пока нет студентов или произошла ошибка загрузки.
              </p>
            </div>
          )}
        </div>

        {/* Футер с кнопками */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {attendanceData.length > 0 && (
              <>
                Отмечено:{" "}
                <span className="font-medium">
                  {stats.present + stats.late}
                </span>{" "}
                из <span className="font-medium">{stats.total}</span> студентов
              </>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || attendanceData.length === 0}
              icon={isSaving ? undefined : <Save className="w-4 h-4" />}
            >
              {isSaving ? "Сохранение..." : "Сохранить посещаемость"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
