// src/components/teacher/ClassEditor.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  Users,
  Save,
  X,
  AlertTriangle,
  Copy,
  Repeat,
  Settings,
} from "lucide-react";
import { WeekDay, getWeekDayLabel } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate, parseTime, formatTime } from "@/utils/dates";
import { toast } from "react-toastify";

interface ClassData {
  id?: string;
  subjectId: string;
  subjectName?: string;
  groupId: string;
  groupName?: string;
  date: string;
  startTime: string;
  endTime: string;
  classroom: string;
  topic?: string;
  type: "lecture" | "seminar" | "practice" | "lab" | "exam" | "test";
  notes?: string;
  isRecurring?: boolean;
  recurringPattern?: {
    frequency: "weekly" | "biweekly";
    endDate?: string;
    weekType?: "all" | "odd" | "even";
  };
}

interface ClassEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classData: ClassData) => Promise<void>;
  editingClass?: ClassData | null;
  availableSubjects: Array<{ id: string; name: string }>;
  availableGroups: Array<{ id: string; name: string }>;
  availableClassrooms: string[];
}

export const ClassEditor: React.FC<ClassEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  editingClass,
  availableSubjects = [],
  availableGroups = [],
  availableClassrooms = [],
}) => {
  const [formData, setFormData] = useState<ClassData>({
    subjectId: "",
    groupId: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:30",
    classroom: "",
    topic: "",
    type: "lecture",
    notes: "",
    isRecurring: false,
    recurringPattern: {
      frequency: "weekly",
      weekType: "all",
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);

  // Инициализация формы при редактировании
  useEffect(() => {
    if (editingClass) {
      setFormData({
        ...editingClass,
        recurringPattern: editingClass.recurringPattern || {
          frequency: "weekly",
          weekType: "all",
        },
      });
      setShowAdvanced(!!editingClass.isRecurring);
    } else {
      // Сброс формы для нового занятия
      setFormData({
        subjectId: "",
        groupId: "",
        date: new Date().toISOString().split("T")[0],
        startTime: "09:00",
        endTime: "10:30",
        classroom: "",
        topic: "",
        type: "lecture",
        notes: "",
        isRecurring: false,
        recurringPattern: {
          frequency: "weekly",
          weekType: "all",
        },
      });
      setShowAdvanced(false);
    }
    setErrors({});
    setConflicts([]);
  }, [editingClass, isOpen]);

  const classTypes = [
    { value: "lecture", label: "Лекция", color: "blue" },
    { value: "seminar", label: "Семинар", color: "green" },
    { value: "practice", label: "Практика", color: "orange" },
    { value: "lab", label: "Лабораторная", color: "purple" },
    { value: "exam", label: "Экзамен", color: "red" },
    { value: "test", label: "Зачет", color: "yellow" },
  ];

  const timeSlots = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.subjectId) newErrors.subjectId = "Выберите предмет";
    if (!formData.groupId) newErrors.groupId = "Выберите группу";
    if (!formData.date) newErrors.date = "Укажите дату";
    if (!formData.startTime) newErrors.startTime = "Укажите время начала";
    if (!formData.endTime) newErrors.endTime = "Укажите время окончания";
    if (!formData.classroom.trim()) newErrors.classroom = "Укажите аудиторию";

    // Проверка времени
    if (formData.startTime && formData.endTime) {
      const start = parseTime(formData.startTime);
      const end = parseTime(formData.endTime);

      if (start && end) {
        const startMinutes = start.hours * 60 + start.minutes;
        const endMinutes = end.hours * 60 + end.minutes;

        if (endMinutes <= startMinutes) {
          newErrors.endTime =
            "Время окончания должно быть позже времени начала";
        }

        if (endMinutes - startMinutes < 30) {
          newErrors.endTime =
            "Минимальная продолжительность занятия - 30 минут";
        }
      }
    }

    // Проверка даты
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today && !editingClass) {
        newErrors.date = "Нельзя создать занятие в прошлом";
      }
    }

    // Проверка повторяющихся занятий
    if (formData.isRecurring && formData.recurringPattern?.endDate) {
      const endDate = new Date(formData.recurringPattern.endDate);
      const startDate = new Date(formData.date);

      if (endDate <= startDate) {
        newErrors.recurringEndDate =
          "Дата окончания должна быть позже даты начала";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkConflicts = async () => {
    // Здесь будет логика проверки конфликтов расписания
    // Пока используем примерную проверку
    const mockConflicts: string[] = [];

    if (
      formData.classroom === "Аудитория 205" &&
      formData.startTime === "09:00"
    ) {
      mockConflicts.push(
        "Аудитория 205 уже занята в 09:00-10:30 (Математический анализ, ИТ-201)"
      );
    }

    if (formData.groupId && formData.startTime === "11:00") {
      mockConflicts.push("У группы уже есть занятие в это время");
    }

    setConflicts(mockConflicts);
    return mockConflicts.length === 0;
  };

  const updateFormData = (field: keyof ClassData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Очистка ошибки при изменении поля
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Автоматическое вычисление времени окончания
    if (field === "startTime" && value) {
      const start = parseTime(value as string);
      if (start) {
        const endMinutes = start.hours * 60 + start.minutes + 90; // 1.5 часа по умолчанию
        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;

        if (endHours < 24) {
          setFormData((prev) => ({
            ...prev,
            endTime: formatTime(endHours, endMins),
          }));
        }
      }
    }
  };

  const updateRecurringPattern = (
    field: keyof NonNullable<ClassData["recurringPattern"]>,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      recurringPattern: {
        ...prev.recurringPattern!,
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Пожалуйста, исправьте ошибки в форме");
      return;
    }

    setIsLoading(true);

    try {
      // Проверяем конфликты только для новых занятий
      if (!editingClass) {
        const hasConflicts = !(await checkConflicts());
        if (hasConflicts && conflicts.length > 0) {
          toast.warning(
            "Обнаружены конфликты расписания. Проверьте предупреждения."
          );
          setIsLoading(false);
          return;
        }
      }

      // Подготавливаем данные для сохранения
      const dataToSave: ClassData = {
        ...formData,
        subjectName: availableSubjects.find((s) => s.id === formData.subjectId)
          ?.name,
        groupName: availableGroups.find((g) => g.id === formData.groupId)?.name,
      };

      await onSave(dataToSave);
      toast.success(editingClass ? "Занятие обновлено!" : "Занятие создано!");
      onClose();
    } catch (error) {
      toast.error("Ошибка при сохранении занятия");
      console.error("Save error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyClass = () => {
    const nextWeek = new Date(formData.date);
    nextWeek.setDate(nextWeek.getDate() + 7);

    setFormData((prev) => ({
      ...prev,
      id: undefined, // Убираем ID для создания копии
      date: nextWeek.toISOString().split("T")[0],
    }));

    toast.info("Занятие скопировано на следующую неделю");
  };

  const getDuration = () => {
    const start = parseTime(formData.startTime);
    const end = parseTime(formData.endTime);

    if (start && end) {
      const duration =
        end.hours * 60 + end.minutes - (start.hours * 60 + start.minutes);
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;

      if (hours > 0 && minutes > 0) {
        return `${hours} ч ${minutes} мин`;
      } else if (hours > 0) {
        return `${hours} ч`;
      } else {
        return `${minutes} мин`;
      }
    }

    return "";
  };

  const selectedSubject = availableSubjects.find(
    (s) => s.id === formData.subjectId
  );
  const selectedGroup = availableGroups.find((g) => g.id === formData.groupId);
  const selectedType = classTypes.find((t) => t.value === formData.type);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingClass ? "Редактирование занятия" : "Создание занятия"}
      size="lg"
      closeOnOverlayClick={false}
    >
      <div className="space-y-6">
        {/* Основная информация */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            options={[
              { value: "", label: "Выберите предмет" },
              ...availableSubjects.map((subject) => ({
                value: subject.id,
                label: subject.name,
              })),
            ]}
            value={formData.subjectId}
            onChange={(value) => updateFormData("subjectId", value)}
            label="Предмет *"
            error={errors.subjectId}
            fullWidth
          />

          <Select
            options={[
              { value: "", label: "Выберите группу" },
              ...availableGroups.map((group) => ({
                value: group.id,
                label: group.name,
              })),
            ]}
            value={formData.groupId}
            onChange={(value) => updateFormData("groupId", value)}
            label="Группа *"
            error={errors.groupId}
            fullWidth
          />
        </div>

        {/* Дата и время */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => updateFormData("date", e.target.value)}
            label="Дата *"
            error={errors.date}
            fullWidth
          />

          <Select
            options={timeSlots.map((time) => ({ value: time, label: time }))}
            value={formData.startTime}
            onChange={(value) => updateFormData("startTime", value)}
            label="Время начала *"
            error={errors.startTime}
            fullWidth
          />

          <Select
            options={timeSlots.map((time) => ({ value: time, label: time }))}
            value={formData.endTime}
            onChange={(value) => updateFormData("endTime", value)}
            label="Время окончания *"
            error={errors.endTime}
            fullWidth
          />
        </div>

        {/* Продолжительность */}
        {getDuration() && (
          <div className="text-sm text-slate-600">
            Продолжительность:{" "}
            <span className="font-medium">{getDuration()}</span>
          </div>
        )}

        {/* Аудитория и тип */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            value={formData.classroom}
            onChange={(e) => updateFormData("classroom", e.target.value)}
            label="Аудитория *"
            placeholder="Например: Аудитория 205"
            error={errors.classroom}
            leftIcon={<MapPin className="w-4 h-4" />}
            fullWidth
          />

          <Select
            options={classTypes.map((type) => ({
              value: type.value,
              label: type.label,
            }))}
            value={formData.type}
            onChange={(value) => updateFormData("type", value)}
            label="Тип занятия"
            fullWidth
          />
        </div>

        {/* Тема и примечания */}
        <div className="space-y-4">
          <Input
            value={formData.topic || ""}
            onChange={(e) => updateFormData("topic", e.target.value)}
            label="Тема занятия"
            placeholder="Краткое описание темы"
            leftIcon={<BookOpen className="w-4 h-4" />}
            fullWidth
          />

          <Textarea
            value={formData.notes || ""}
            onChange={(e) => updateFormData("notes", e.target.value)}
            label="Примечания"
            placeholder="Дополнительная информация о занятии"
            rows={3}
            fullWidth
          />
        </div>

        {/* Конфликты */}
        {conflicts.length > 0 && (
          <Card padding="md" className="border-orange-200 bg-orange-50">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-800 mb-2">
                  Обнаружены конфликты:
                </h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  {conflicts.map((conflict, index) => (
                    <li key={index}>• {conflict}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Расширенные настройки */}
        <div className="border-t pt-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <Settings className="w-4 h-4" />
            <span>Дополнительные настройки</span>
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isRecurring || false}
                  onChange={(e) =>
                    updateFormData("isRecurring", e.target.checked)
                  }
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">
                  Повторяющееся занятие
                </span>
              </label>

              {formData.isRecurring && (
                <div className="pl-6 space-y-4 border-l-2 border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      options={[
                        { value: "weekly", label: "Каждую неделю" },
                        { value: "biweekly", label: "Каждые две недели" },
                      ]}
                      value={formData.recurringPattern?.frequency || "weekly"}
                      onChange={(value) =>
                        updateRecurringPattern("frequency", value)
                      }
                      label="Частота повторения"
                      fullWidth
                    />

                    <Select
                      options={[
                        { value: "all", label: "Каждую неделю" },
                        { value: "odd", label: "Нечетные недели" },
                        { value: "even", label: "Четные недели" },
                      ]}
                      value={formData.recurringPattern?.weekType || "all"}
                      onChange={(value) =>
                        updateRecurringPattern("weekType", value)
                      }
                      label="Тип недели"
                      fullWidth
                    />
                  </div>

                  <Input
                    type="date"
                    value={formData.recurringPattern?.endDate || ""}
                    onChange={(e) =>
                      updateRecurringPattern("endDate", e.target.value)
                    }
                    label="Дата окончания повторений"
                    error={errors.recurringEndDate}
                    fullWidth
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Предварительный просмотр */}
        {selectedSubject && selectedGroup && (
          <Card padding="md" className="bg-slate-50">
            <h4 className="font-medium text-slate-900 mb-3">
              Предварительный просмотр:
            </h4>
            <div className="flex items-center flex-wrap gap-2">
              <Badge variant="primary">{selectedSubject.name}</Badge>
              <Badge variant="outline">{selectedGroup.name}</Badge>
              {selectedType && (
                <Badge variant="secondary">{selectedType.label}</Badge>
              )}
              <span className="text-sm text-slate-600">
                {formatDate(new Date(formData.date), "short")} в{" "}
                {formData.startTime}-{formData.endTime}
              </span>
              <span className="text-sm text-slate-600">
                ({formData.classroom})
              </span>
            </div>
          </Card>
        )}

        {/* Кнопки действий */}
        <div className="flex justify-between pt-4 border-t">
          <div className="flex space-x-2">
            {editingClass && (
              <Button
                variant="outline"
                onClick={handleCopyClass}
                icon={<Copy className="w-4 h-4" />}
                disabled={isLoading}
              >
                Копировать
              </Button>
            )}
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Отмена
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={isLoading}
              icon={<Save className="w-4 h-4" />}
            >
              {editingClass ? "Обновить" : "Создать"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
