// src/components/teacher/QuickActions.tsx

"use client";

import React, { useState } from "react";
import {
  Plus,
  Calendar,
  Users,
  BookOpen,
  Bell,
  Download,
  Settings,
  MessageCircle,
  ClipboardList,
  PieChart,
  FileText,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AttendanceModal } from "./AttendanceModalToday";
import { ExportModal } from "./ExportModal";
import { NotificationCenter } from "./NotificationCenter";
import { useTeacherDashboard } from "@/hooks/useTeacherDashboard";

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  badge?: string | number;
  disabled?: boolean;
}

interface QuickActionsProps {
  className?: string;
  compact?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  className = "",
  compact = false,
}) => {
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);

  const {
    stats,
    todaysClasses,
    markAttendance,
    getStudentsForClass,
    exportAttendanceData,
    sendNotification,
  } = useTeacherDashboard();

  const quickActions: QuickAction[] = [
    {
      id: "mark_attendance",
      label: "Отметить посещаемость",
      description: "Быстрая отметка для текущего занятия",
      icon: <ClipboardList className="w-5 h-5" />,
      color: "bg-blue-500 hover:bg-blue-600",
      onClick: () => {
        const currentClass = todaysClasses[0]; // Берем первое занятие как пример
        if (currentClass) {
          setSelectedClass(currentClass);
          setShowAttendanceModal(true);
        }
      },
      badge: stats.pendingClasses > 0 ? stats.pendingClasses : undefined,
      disabled: todaysClasses.length === 0,
    },
    {
      id: "create_class",
      label: "Создать занятие",
      description: "Добавить внеплановое занятие",
      icon: <Plus className="w-5 h-5" />,
      color: "bg-emerald-500 hover:bg-emerald-600",
      onClick: () => {
        // Здесь будет логика создания занятия
        console.log("Creating new class");
      },
    },
    {
      id: "view_schedule",
      label: "Расписание на неделю",
      description: "Просмотр недельного расписания",
      icon: <Calendar className="w-5 h-5" />,
      color: "bg-purple-500 hover:bg-purple-600",
      onClick: () => {
        // Переход к вкладке расписания
        console.log("Navigate to schedule");
      },
    },
    {
      id: "student_list",
      label: "Список студентов",
      description: "Управление группами и студентами",
      icon: <Users className="w-5 h-5" />,
      color: "bg-orange-500 hover:bg-orange-600",
      onClick: () => {
        console.log("View student list");
      },
      badge: stats.totalStudents,
    },
    {
      id: "quick_export",
      label: "Экспорт данных",
      description: "Быстрый экспорт посещаемости",
      icon: <Download className="w-5 h-5" />,
      color: "bg-indigo-500 hover:bg-indigo-600",
      onClick: () => setShowExportModal(true),
    },
    {
      id: "notifications",
      label: "Уведомления",
      description: "Центр уведомлений и сообщений",
      icon: <Bell className="w-5 h-5" />,
      color: "bg-red-500 hover:bg-red-600",
      onClick: () => setShowNotificationCenter(true),
      badge: 3, // Примерное количество непрочитанных
    },
    {
      id: "analytics",
      label: "Быстрая аналитика",
      description: "Статистика посещаемости",
      icon: <PieChart className="w-5 h-5" />,
      color: "bg-cyan-500 hover:bg-cyan-600",
      onClick: () => {
        console.log("View analytics");
      },
      badge: `${stats.avgAttendance}%`,
    },
    {
      id: "today_summary",
      label: "Сводка дня",
      description: "Отчет о сегодняшних занятиях",
      icon: <FileText className="w-5 h-5" />,
      color: "bg-teal-500 hover:bg-teal-600",
      onClick: () => {
        console.log("Generate daily summary");
      },
    },
  ];

  const handleMarkAttendance = async (
    attendanceData: Array<{
      studentId: string;
      status: any;
      notes?: string;
    }>
  ) => {
    if (selectedClass) {
      await markAttendance(selectedClass.id, attendanceData);
    }
  };

  const handleExport = async (options: any) => {
    await exportAttendanceData(options.format, options.filters);
  };

  const handleSendNotification = async (
    type: string,
    recipients: string[],
    message: string
  ) => {
    await sendNotification(type as any, recipients, message);
  };

  if (compact) {
    return (
      <>
        <div className={`flex flex-wrap gap-2 ${className}`}>
          {quickActions.slice(0, 4).map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
              className="relative"
            >
              {action.icon}
              <span className="ml-2">{action.label}</span>
              {action.badge && (
                <Badge
                  variant="danger"
                  size="sm"
                  className="absolute -top-2 -right-2 min-w-[1.5rem] h-6"
                >
                  {action.badge}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Модальные окна */}
        <AttendanceModal
          isOpen={showAttendanceModal}
          onClose={() => {
            setShowAttendanceModal(false);
            setSelectedClass(null);
          }}
          classInfo={selectedClass}
          students={selectedClass ? getStudentsForClass(selectedClass.id) : []}
          onSave={handleMarkAttendance}
        />

        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
          availableGroups={["ИТ-301", "ИТ-201", "ИТ-401"]}
          availableSubjects={[
            "Математический анализ",
            "Линейная алгебра",
            "Дискретная математика",
          ]}
        />

        <NotificationCenter
          isOpen={showNotificationCenter}
          onClose={() => setShowNotificationCenter(false)}
          onSendNotification={handleSendNotification}
        />
      </>
    );
  }

  return (
    <>
      <Card className={className}>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Быстрые действия
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`
                  relative p-4 rounded-lg text-white transition-all duration-200 
                  ${action.color} 
                  ${
                    action.disabled
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-lg hover:scale-105 active:scale-100"
                  }
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  {action.icon}
                  {action.badge && (
                    <Badge
                      variant="secondary"
                      size="sm"
                      className="bg-white text-slate-900"
                    >
                      {action.badge}
                    </Badge>
                  )}
                </div>

                <h4 className="font-medium text-sm mb-1 text-left">
                  {action.label}
                </h4>

                <p className="text-xs opacity-90 text-left">
                  {action.description}
                </p>
              </button>
            ))}
          </div>

          {/* Дополнительная информация */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {stats.classesCompleted}
                </div>
                <div className="text-xs text-slate-600">Занятий проведено</div>
              </div>

              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.pendingClasses}
                </div>
                <div className="text-xs text-slate-600">Ожидают отметки</div>
              </div>

              <div>
                <div className="text-2xl font-bold text-emerald-600">
                  {stats.avgAttendance}%
                </div>
                <div className="text-xs text-slate-600">
                  Средняя посещаемость
                </div>
              </div>

              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.totalStudents}
                </div>
                <div className="text-xs text-slate-600">Всего студентов</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Модальные окна */}
      <AttendanceModal
        isOpen={showAttendanceModal}
        onClose={() => {
          setShowAttendanceModal(false);
          setSelectedClass(null);
        }}
        classInfo={selectedClass}
        students={selectedClass ? getStudentsForClass(selectedClass.id) : []}
        onSave={handleMarkAttendance}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        availableGroups={["ИТ-301", "ИТ-201", "ИТ-401"]}
        availableSubjects={[
          "Математический анализ",
          "Линейная алгебра",
          "Дискретная математика",
        ]}
      />

      <NotificationCenter
        isOpen={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
        onSendNotification={handleSendNotification}
      />
    </>
  );
};
