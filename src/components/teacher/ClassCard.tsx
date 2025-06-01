// src/components/teacher/ClassCard.tsx

"use client";

import React, { useState } from "react";
import {
  Clock,
  MapPin,
  Users,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  AttendanceStatus,
  getAttendanceStatusLabel,
  getAttendanceStatusColor,
} from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

// Временный интерфейс для занятия (пока нет полного типа)
interface ClassItem {
  id?: string;
  subject: string;
  group: string;
  time: string;
  classroom: string;
  studentsCount: number;
  attendanceMarked: boolean;
  stats?: {
    present: number;
    absent: number;
    late: number;
    total: number;
    percentage: number;
  };
  recentAttendance?: Array<{
    name: string;
    status: AttendanceStatus;
  }>;
}

interface ClassCardProps {
  classItem: ClassItem;
  onMarkAttendance?: (classId: string) => void;
  onViewDetails?: (classId: string) => void;
  onExportData?: (classId: string) => void;
  compact?: boolean;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  classItem,
  onMarkAttendance,
  onViewDetails,
  onExportData,
  compact = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMarkAttendance = () => {
    if (onMarkAttendance && classItem.id) {
      onMarkAttendance(classItem.id);
    } else {
      toast.success("Посещаемость отмечена успешно!");
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails && classItem.id) {
      onViewDetails(classItem.id);
    } else {
      toast.info("Функция просмотра деталей в разработке");
    }
  };

  const handleExportData = () => {
    if (onExportData && classItem.id) {
      onExportData(classItem.id);
    } else {
      toast.info("Экспорт в разработке");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Информация о времени и месте */}
            <div className="flex items-center space-x-4 mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-600">
                  {classItem.time}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600">
                  {classItem.classroom}
                </span>
              </div>
            </div>

            {/* Название предмета */}
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {classItem.subject}
            </h3>

            {/* Группа и количество студентов */}
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{classItem.group}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>{classItem.studentsCount} студентов</span>
              </div>
              {classItem.stats && (
                <Badge
                  variant={
                    classItem.stats.percentage >= 80
                      ? "success"
                      : classItem.stats.percentage >= 60
                      ? "warning"
                      : "danger"
                  }
                >
                  {classItem.stats.percentage}% посещаемость
                </Badge>
              )}
            </div>
          </div>

          {/* Действия */}
          <div className="flex items-center space-x-3">
            {classItem.attendanceMarked ? (
              <div className="flex items-center space-x-2 text-emerald-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Отмечено</span>
              </div>
            ) : (
              <Button
                onClick={handleMarkAttendance}
                variant="primary"
                size="sm"
              >
                Отметить посещаемость
              </Button>
            )}

            {!compact && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label={
                  isExpanded ? "Свернуть детали" : "Развернуть детали"
                }
              >
                <ChevronRight
                  className={`w-5 h-5 transition-transform ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                />
              </button>
            )}
          </div>
        </div>

        {/* Развернутая информация */}
        {isExpanded && !compact && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Статистика посещаемости */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-700">
                  Статистика
                </h4>
                <div className="space-y-2">
                  {classItem.stats ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">
                          Присутствуют
                        </span>
                        <span className="text-sm font-medium text-emerald-600">
                          {classItem.stats.present}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">
                          Отсутствуют
                        </span>
                        <span className="text-sm font-medium text-red-600">
                          {classItem.stats.absent}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Опоздали</span>
                        <span className="text-sm font-medium text-orange-600">
                          {classItem.stats.late}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Процент</span>
                        <span className="text-sm font-medium text-slate-900">
                          {classItem.stats.percentage}%
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-slate-500">
                      Статистика недоступна
                    </div>
                  )}
                </div>
              </div>

              {/* Последние отметки */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-700">
                  Последние отметки
                </h4>
                <div className="space-y-2">
                  {classItem.recentAttendance &&
                  classItem.recentAttendance.length > 0 ? (
                    classItem.recentAttendance.map((student, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-slate-600 truncate mr-2">
                          {student.name}
                        </span>
                        <Badge
                          variant={
                            student.status === AttendanceStatus.PRESENT
                              ? "success"
                              : student.status === AttendanceStatus.LATE
                              ? "warning"
                              : student.status === AttendanceStatus.EXCUSED
                              ? "info"
                              : "danger"
                          }
                          size="sm"
                        >
                          {getAttendanceStatusLabel(student.status)}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-slate-500">Нет данных</div>
                  )}
                </div>
              </div>

              {/* Действия */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-700">Действия</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={handleViewDetails}
                  >
                    Просмотреть список
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={handleExportData}
                  >
                    Экспорт в Excel
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={() => toast.info("История в разработке")}
                  >
                    История изменений
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
