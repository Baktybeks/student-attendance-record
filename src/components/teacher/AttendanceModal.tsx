// src/components/teacher/AttendanceModal.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Save,
  X,
} from "lucide-react";
import { AttendanceStatus, getAttendanceStatusLabel } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Input";
import { toast } from "react-toastify";

interface Student {
  id: string;
  name: string;
  studentId: string;
  status?: AttendanceStatus;
  notes?: string;
}

interface ClassInfo {
  id: string;
  subject: string;
  group: string;
  date: string;
  time: string;
  classroom: string;
}

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  classInfo: ClassInfo | null;
  students: Student[];
  onSave: (
    attendanceData: Array<{
      studentId: string;
      status: AttendanceStatus;
      notes?: string;
    }>
  ) => Promise<void>;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  onClose,
  classInfo,
  students,
  onSave,
}) => {
  const [attendanceData, setAttendanceData] = useState<
    Record<
      string,
      {
        status: AttendanceStatus;
        notes: string;
      }
    >
  >({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [bulkAction, setBulkAction] = useState<AttendanceStatus | "">("");

  // Инициализация данных при открытии модала
  useEffect(() => {
    if (isOpen && students.length > 0) {
      const initialData: Record<
        string,
        {
          status: AttendanceStatus;
          notes: string;
        }
      > = {};

      students.forEach((student) => {
        initialData[student.id] = {
          status: student.status || AttendanceStatus.PRESENT,
          notes: student.notes || "",
        };
      });

      setAttendanceData(initialData);
    }
  }, [isOpen, students]);

  // Фильтрация студентов по поиску
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const updateStudentNotes = (studentId: string, notes: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes,
      },
    }));
  };

  const applyBulkAction = () => {
    if (!bulkAction) return;

    const updatedData = { ...attendanceData };
    filteredStudents.forEach((student) => {
      updatedData[student.id] = {
        ...updatedData[student.id],
        status: bulkAction as AttendanceStatus,
      };
    });

    setAttendanceData(updatedData);
    setBulkAction("");
    toast.success(
      `Статус "${getAttendanceStatusLabel(
        bulkAction as AttendanceStatus
      )}" применен к ${filteredStudents.length} студентам`
    );
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const attendanceEntries = Object.entries(attendanceData).map(
        ([studentId, data]) => ({
          studentId,
          status: data.status,
          notes: data.notes || undefined,
        })
      );

      await onSave(attendanceEntries);
      toast.success("Посещаемость успешно сохранена!");
      onClose();
    } catch (error) {
      toast.error("Ошибка при сохранении посещаемости");
      console.error("Error saving attendance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case AttendanceStatus.ABSENT:
        return <XCircle className="w-5 h-5 text-red-600" />;
      case AttendanceStatus.LATE:
        return <Clock className="w-5 h-5 text-orange-600" />;
      case AttendanceStatus.EXCUSED:
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return "border-emerald-200 bg-emerald-50";
      case AttendanceStatus.ABSENT:
        return "border-red-200 bg-red-50";
      case AttendanceStatus.LATE:
        return "border-orange-200 bg-orange-50";
      case AttendanceStatus.EXCUSED:
        return "border-blue-200 bg-blue-50";
      default:
        return "border-slate-200 bg-white";
    }
  };

  const statusOptions = [
    { value: AttendanceStatus.PRESENT, label: "Присутствует" },
    { value: AttendanceStatus.ABSENT, label: "Отсутствует" },
    { value: AttendanceStatus.LATE, label: "Опоздал" },
    { value: AttendanceStatus.EXCUSED, label: "Уважительная" },
  ];

  // Подсчет статистики
  const stats = Object.values(attendanceData).reduce((acc, data) => {
    acc[data.status] = (acc[data.status] || 0) + 1;
    return acc;
  }, {} as Record<AttendanceStatus, number>);

  const totalStudents = students.length;
  const presentCount =
    (stats[AttendanceStatus.PRESENT] || 0) +
    (stats[AttendanceStatus.LATE] || 0);
  const attendanceRate =
    totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  // Обработчики изменения значений для Select
  const handleBulkActionChange = (value: string | number) => {
    setBulkAction(String(value) as AttendanceStatus | "");
  };

  const handleStudentStatusChange =
    (studentId: string) => (value: string | number) => {
      updateStudentStatus(studentId, String(value) as AttendanceStatus);
    };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Отметка посещаемости"
      size="xl"
      closeOnOverlayClick={false}
    >
      <div className="space-y-6">
        {/* Информация о занятии */}
        {classInfo && (
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-medium text-slate-900 mb-2">
              {classInfo.subject}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
              <div>
                <span className="font-medium">Группа:</span> {classInfo.group}
              </div>
              <div>
                <span className="font-medium">Дата:</span> {classInfo.date}
              </div>
              <div>
                <span className="font-medium">Время:</span> {classInfo.time}
              </div>
              <div>
                <span className="font-medium">Аудитория:</span>{" "}
                {classInfo.classroom}
              </div>
            </div>
          </div>
        )}

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">
              {totalStudents}
            </div>
            <div className="text-sm text-slate-600">Всего</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {stats[AttendanceStatus.PRESENT] || 0}
            </div>
            <div className="text-sm text-slate-600">Присутствуют</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats[AttendanceStatus.ABSENT] || 0}
            </div>
            <div className="text-sm text-slate-600">Отсутствуют</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats[AttendanceStatus.LATE] || 0}
            </div>
            <div className="text-sm text-slate-600">Опоздали</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {attendanceRate}%
            </div>
            <div className="text-sm text-slate-600">Посещаемость</div>
          </div>
        </div>

        {/* Фильтры и массовые действия */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Поиск студента..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Select
              options={[
                { value: "", label: "Массовые действия" },
                ...statusOptions,
              ]}
              value={bulkAction}
              onChange={handleBulkActionChange}
              placeholder="Выберите действие"
            />
            <Button
              variant="outline"
              onClick={applyBulkAction}
              disabled={!bulkAction || filteredStudents.length === 0}
            >
              Применить
            </Button>
          </div>
        </div>

        {/* Список студентов */}
        <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-lg">
          <div className="space-y-2 p-4">
            {filteredStudents.map((student) => {
              const studentData = attendanceData[student.id];
              if (!studentData) return null;

              return (
                <div
                  key={student.id}
                  className={`border-2 rounded-lg p-4 transition-colors ${getStatusColor(
                    studentData.status
                  )}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(studentData.status)}
                      <div>
                        <h4 className="font-medium text-slate-900">
                          {student.name}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {student.studentId}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        studentData.status === AttendanceStatus.PRESENT
                          ? "success"
                          : studentData.status === AttendanceStatus.LATE
                          ? "warning"
                          : studentData.status === AttendanceStatus.EXCUSED
                          ? "info"
                          : "danger"
                      }
                    >
                      {getAttendanceStatusLabel(studentData.status)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      options={statusOptions}
                      value={studentData.status}
                      onChange={handleStudentStatusChange(student.id)}
                      fullWidth
                    />
                    <Input
                      placeholder="Примечания (необязательно)"
                      value={studentData.notes}
                      onChange={(e) =>
                        updateStudentNotes(student.id, e.target.value)
                      }
                      fullWidth
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              {searchTerm ? "Студенты не найдены" : "Нет студентов"}
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={isLoading}
            icon={<Save className="w-4 h-4" />}
          >
            Сохранить посещаемость
          </Button>
        </div>
      </div>
    </Modal>
  );
};
