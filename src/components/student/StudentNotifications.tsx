// src/components/student/StudentNotifications.tsx

"use client";

import React, { useState } from "react";
import {
  Bell,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  Settings,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useStudentNotifications } from "@/hooks/useStudentData";
import { getTimeUntilNextClass, isClassSoon } from "@/utils/studentHelpers";

interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  time?: string;
  actionText?: string;
  onAction?: () => void;
  dismissible?: boolean;
}

interface StudentNotificationsProps {
  todaysSchedule?: any[];
  nextClass?: any;
  className?: string;
}

export function StudentNotifications({
  todaysSchedule = [],
  nextClass,
  className = "",
}: StudentNotificationsProps) {
  const [dismissedNotifications, setDismissedNotifications] = useState<
    string[]
  >([]);
  const { notifications: systemNotifications } = useStudentNotifications();

  // Генерируем уведомления на основе расписания
  const generateNotifications = (): Notification[] => {
    const notifications: Notification[] = [];

    // Уведомление о следующем занятии
    if (nextClass) {
      const timeUntil = getTimeUntilNextClass(nextClass);
      const isSoon = isClassSoon(nextClass.time);

      notifications.push({
        id: "next-class",
        type: isSoon ? "warning" : "info",
        title: "Следующее занятие",
        message: `${nextClass.subject} через ${
          timeUntil.hours > 0 ? `${timeUntil.hours}ч ` : ""
        }${timeUntil.minutes}мин`,
        time: nextClass.time.split("-")[0],
        actionText: "Подробнее",
        onAction: () => {
          // Переход к расписанию
          console.log("Navigate to schedule");
        },
        dismissible: !isSoon,
      });
    }

    // Уведомление о количестве занятий сегодня
    if (todaysSchedule.length > 0) {
      notifications.push({
        id: "today-classes",
        type: "info",
        title: `Сегодня ${todaysSchedule.length} занятий`,
        message: "Проверьте расписание и будьте готовы к занятиям",
        actionText: "Расписание",
        onAction: () => {
          console.log("Navigate to schedule");
        },
        dismissible: true,
      });
    } else {
      notifications.push({
        id: "no-classes",
        type: "success",
        title: "Свободный день!",
        message: "Сегодня у вас нет запланированных занятий",
        dismissible: true,
      });
    }

    // Напоминание о проверке посещаемости
    const now = new Date();
    if (now.getDay() === 1) {
      // Понедельник
      notifications.push({
        id: "weekly-reminder",
        type: "info",
        title: "Начало недели",
        message: "Проверьте свою посещаемость за прошлую неделю",
        actionText: "Посещаемость",
        onAction: () => {
          console.log("Navigate to attendance");
        },
        dismissible: true,
      });
    }

    return notifications;
  };

  const allNotifications = generateNotifications().filter(
    (notification) => !dismissedNotifications.includes(notification.id)
  );

  const dismissNotification = (id: string) => {
    setDismissedNotifications((prev) => [...prev, id]);
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return <Info className="w-5 h-5 text-blue-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const getNotificationColors = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-900",
        };
      case "warning":
        return {
          bg: "bg-orange-50",
          border: "border-orange-200",
          text: "text-orange-900",
        };
      case "success":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          text: "text-emerald-900",
        };
      case "error":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-900",
        };
      default:
        return {
          bg: "bg-slate-50",
          border: "border-slate-200",
          text: "text-slate-900",
        };
    }
  };

  if (allNotifications.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-medium text-slate-900">Уведомления</h3>
          {allNotifications.length > 0 && (
            <Badge variant="primary" size="sm">
              {allNotifications.length}
            </Badge>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // Открыть настройки уведомлений
            console.log("Open notification settings");
          }}
          icon={<Settings className="w-4 h-4" />}
        >
          Настройки
        </Button>
      </div>

      <div className="space-y-3">
        {allNotifications.map((notification) => {
          const colors = getNotificationColors(notification.type);

          return (
            <Card
              key={notification.id}
              padding="none"
              className={`${colors.bg} ${colors.border} border`}
            >
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-medium ${colors.text}`}>
                        {notification.title}
                      </h4>

                      <div className="flex items-center space-x-2">
                        {notification.time && (
                          <div className="flex items-center space-x-1 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            <span>{notification.time}</span>
                          </div>
                        )}

                        {notification.dismissible && (
                          <button
                            onClick={() => dismissNotification(notification.id)}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className={`text-sm mt-1 ${colors.text} opacity-80`}>
                      {notification.message}
                    </p>

                    {notification.actionText && notification.onAction && (
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={notification.onAction}
                          className="text-xs"
                        >
                          {notification.actionText}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {allNotifications.length > 3 && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Показать все уведомления
              console.log("Show all notifications");
            }}
          >
            Показать все уведомления
          </Button>
        </div>
      )}
    </div>
  );
}

// Компонент для мини-уведомлений в хедере
export function NotificationBell({ count = 0 }: { count?: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 z-50">
          <Card padding="sm" className="shadow-lg">
            <div className="max-h-96 overflow-y-auto">
              <StudentNotifications />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
