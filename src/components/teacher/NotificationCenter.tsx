// src/components/teacher/NotificationCenter.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  BellOff,
  X,
  Check,
  AlertCircle,
  Info,
  Clock,
  Users,
  BookOpen,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Input";
import { formatDate } from "@/utils/dates";
import { toast } from "react-toastify";

interface Notification {
  id: string;
  type:
    | "low_attendance"
    | "missing_student"
    | "system"
    | "reminder"
    | "achievement";
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
  timestamp: string;
  read: boolean;
  actionRequired?: boolean;
  relatedEntity?: {
    type: "student" | "class" | "group";
    id: string;
    name: string;
  };
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onSendNotification?: (
    type: string,
    recipients: string[],
    message: string
  ) => Promise<void>;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onSendNotification,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "priority">("all");
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendForm, setSendForm] = useState({
    type: "custom",
    recipients: [] as string[],
    message: "",
  });

  // Примерные уведомления
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "low_attendance",
        title: "Низкая посещаемость",
        message: "У студента Морозов С.С. (ИТ-201) посещаемость упала до 60%",
        priority: "high",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: false,
        actionRequired: true,
        relatedEntity: {
          type: "student",
          id: "st1",
          name: "Морозов С.С.",
        },
      },
      {
        id: "2",
        type: "reminder",
        title: "Напоминание о занятии",
        message:
          "Через 30 минут начинается занятие по Математическому анализу в аудитории 205",
        priority: "medium",
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        read: false,
        relatedEntity: {
          type: "class",
          id: "class1",
          name: "Математический анализ",
        },
      },
      {
        id: "3",
        type: "achievement",
        title: "Поздравляем!",
        message: "Группа ИТ-301 показала 95% посещаемость в этом месяце",
        priority: "low",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: true,
        relatedEntity: {
          type: "group",
          id: "group1",
          name: "ИТ-301",
        },
      },
      {
        id: "4",
        type: "missing_student",
        title: "Отсутствие студента",
        message: "Кузнецова Е.В. отсутствует на 3-м занятии подряд",
        priority: "high",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        read: false,
        actionRequired: true,
        relatedEntity: {
          type: "student",
          id: "st2",
          name: "Кузнецова Е.В.",
        },
      },
      {
        id: "5",
        type: "system",
        title: "Обновление системы",
        message:
          "Система будет недоступна завтра с 02:00 до 04:00 для технического обслуживания",
        priority: "medium",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        read: true,
      },
    ];

    setNotifications(mockNotifications);
  }, []);

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "low_attendance":
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case "missing_student":
        return <Users className="w-5 h-5 text-red-600" />;
      case "system":
        return <Settings className="w-5 h-5 text-blue-600" />;
      case "reminder":
        return <Clock className="w-5 h-5 text-purple-600" />;
      case "achievement":
        return <Check className="w-5 h-5 text-green-600" />;
      default:
        return <Info className="w-5 h-5 text-slate-600" />;
    }
  };

  const getPriorityColor = (priority: Notification["priority"]) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50";
      case "medium":
        return "border-l-orange-500 bg-orange-50";
      case "low":
        return "border-l-green-500 bg-green-50";
      default:
        return "border-l-slate-500 bg-slate-50";
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((notif) => notif.id !== notificationId)
    );
  };

  const filteredNotifications = notifications.filter((notif) => {
    switch (filter) {
      case "unread":
        return !notif.read;
      case "priority":
        return notif.priority === "high";
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const priorityCount = notifications.filter(
    (n) => n.priority === "high"
  ).length;

  const handleSendNotification = async () => {
    if (!onSendNotification || !sendForm.message.trim()) return;

    try {
      await onSendNotification(
        sendForm.type,
        sendForm.recipients,
        sendForm.message
      );
      setShowSendModal(false);
      setSendForm({ type: "custom", recipients: [], message: "" });
      toast.success("Уведомление отправлено!");
    } catch (error) {
      toast.error("Ошибка при отправке уведомления");
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Центр уведомлений"
        size="lg"
      >
        <div className="space-y-4">
          {/* Заголовок и фильтры */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Select
                options={[
                  { value: "all", label: `Все (${notifications.length})` },
                  { value: "unread", label: `Непрочитанные (${unreadCount})` },
                  {
                    value: "priority",
                    label: `Приоритетные (${priorityCount})`,
                  },
                ]}
                value={filter}
                onChange={(value) => setFilter(value as any)}
              />
            </div>

            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  Прочитать все
                </Button>
              )}
              {onSendNotification && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowSendModal(true)}
                >
                  Отправить уведомление
                </Button>
              )}
            </div>
          </div>

          {/* Список уведомлений */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  padding="none"
                  className={`border-l-4 ${getPriorityColor(
                    notification.priority
                  )} ${!notification.read ? "ring-1 ring-blue-200" : ""}`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-medium text-slate-900">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <Badge variant="primary" size="sm">
                                Новое
                              </Badge>
                            )}
                            {notification.actionRequired && (
                              <Badge variant="warning" size="sm">
                                Требует действий
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                              {formatDate(
                                new Date(notification.timestamp),
                                "datetime"
                              )}
                            </span>
                            {notification.relatedEntity && (
                              <Badge variant="outline" size="sm">
                                {notification.relatedEntity.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 ml-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            title="Отметить как прочитанное"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissNotification(notification.id)}
                          title="Удалить"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <BellOff className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Нет уведомлений
                </h3>
                <p className="text-slate-600">
                  {filter === "unread"
                    ? "Все уведомления прочитаны"
                    : "У вас пока нет уведомлений"}
                </p>
              </div>
            )}
          </div>

          {/* Кнопка закрытия */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={onClose}>
              Закрыть
            </Button>
          </div>
        </div>
      </Modal>

      {/* Модал отправки уведомления */}
      <Modal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        title="Отправить уведомление"
        size="md"
      >
        <div className="space-y-4">
          <Select
            options={[
              { value: "custom", label: "Произвольное сообщение" },
              {
                value: "low_attendance",
                label: "Уведомление о низкой посещаемости",
              },
              {
                value: "missing_class",
                label: "Напоминание о пропущенном занятии",
              },
              { value: "reminder", label: "Напоминание о занятии" },
            ]}
            value={sendForm.type}
            onChange={(value) =>
              setSendForm((prev) => ({ ...prev, type: value as string }))
            }
            label="Тип уведомления"
            fullWidth
          />

          <Textarea
            label="Сообщение"
            placeholder="Введите текст уведомления..."
            value={sendForm.message}
            onChange={(e) =>
              setSendForm((prev) => ({ ...prev, message: e.target.value }))
            }
            rows={4}
            fullWidth
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowSendModal(false)}>
              Отмена
            </Button>
            <Button
              variant="primary"
              onClick={handleSendNotification}
              disabled={!sendForm.message.trim()}
            >
              Отправить
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
