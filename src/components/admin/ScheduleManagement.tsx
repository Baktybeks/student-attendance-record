"use client";

import React, { useState } from "react";
import {
  useAllSchedules,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
  useScheduleStats,
} from "@/services/scheduleService";
import { useActiveGroups } from "@/services/groupeServise";
import { useActiveSubjects } from "@/services/subjectService";
import { useUsersByRole } from "@/services/authService";
import {
  Schedule,
  CreateScheduleDto,
  WeekDay,
  WeekDayLabels,
  UserRole,
} from "@/types";
import { TIME_SLOTS, WEEK_TYPES } from "@/utils/constants";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Users,
  BookOpen,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { toast } from "react-toastify";

export function ScheduleManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDay, setSelectedDay] = useState<WeekDay | "all">("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  // Data fetching
  const { data: schedules = [], isLoading } = useAllSchedules();
  const { data: groups = [] } = useActiveGroups();
  const { data: subjects = [] } = useActiveSubjects();
  const { data: teachers = [] } = useUsersByRole(UserRole.TEACHER);
  const { data: stats } = useScheduleStats();

  // Mutations
  const createMutation = useCreateSchedule();
  const updateMutation = useUpdateSchedule();
  const deleteMutation = useDeleteSchedule();

  // Фильтрация расписаний
  const filteredSchedules = schedules.filter((schedule) => {
    const matchesSearch =
      searchTerm === "" ||
      schedule.classroom.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDay =
      selectedDay === "all" || schedule.dayOfWeek === selectedDay;
    const matchesGroup =
      selectedGroup === "all" || schedule.groupId === selectedGroup;

    return matchesSearch && matchesDay && matchesGroup;
  });

  // Группировка по дням недели
  const schedulesByDay = Object.values(WeekDay).reduce((acc, day) => {
    acc[day] = filteredSchedules
      .filter((s) => s.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {} as Record<WeekDay, Schedule[]>);

  const handleEdit = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setShowEditModal(true);
  };

  const handleDelete = async (schedule: Schedule) => {
    if (window.confirm(`Удалить расписание ${schedule.classroom}?`)) {
      try {
        await deleteMutation.mutateAsync(schedule.$id);
        toast.success("Расписание удалено");
      } catch (error: any) {
        toast.error(error.message || "Ошибка при удалении");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-slate-600">Загрузка расписания...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и статистика */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Управление расписанием
            </h2>
            <p className="text-slate-600 mt-1">
              Создание и редактирование расписания занятий
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить занятие</span>
          </button>
        </div>

        {/* Статистика */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Всего занятий"
              value={stats.total}
              icon={Calendar}
              color="bg-blue-500"
            />
            <StatCard
              title="Активных"
              value={stats.active}
              icon={CheckCircle}
              color="bg-emerald-500"
            />
            <StatCard
              title="Неактивных"
              value={stats.inactive}
              icon={XCircle}
              color="bg-red-500"
            />
            <StatCard
              title="Среднее в день"
              value={stats.avgClassesPerDay}
              icon={Clock}
              color="bg-purple-500"
            />
          </div>
        )}

        {/* Фильтры */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-48">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Поиск по аудитории..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value as WeekDay | "all")}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Все дни</option>
            {Object.values(WeekDay).map((day) => (
              <option key={day} value={day}>
                {WeekDayLabels[day]}
              </option>
            ))}
          </select>

          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Все группы</option>
            {groups.map((group) => (
              <option key={group.$id} value={group.$id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Расписание по дням */}
      <div className="space-y-6">
        {Object.values(WeekDay).map((day) => (
          <DayScheduleCard
            key={day}
            day={day}
            schedules={schedulesByDay[day]}
            groups={groups}
            subjects={subjects}
            teachers={teachers}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Модалы */}
      {showCreateModal && (
        <ScheduleModal
          title="Создать занятие"
          groups={groups}
          subjects={subjects}
          teachers={teachers}
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (data) => {
            try {
              await createMutation.mutateAsync(data);
              toast.success("Занятие добавлено в расписание");
              setShowCreateModal(false);
            } catch (error: any) {
              toast.error(error.message || "Ошибка при создании");
            }
          }}
          isLoading={createMutation.isPending}
        />
      )}

      {showEditModal && selectedSchedule && (
        <ScheduleModal
          title="Редактировать занятие"
          schedule={selectedSchedule}
          groups={groups}
          subjects={subjects}
          teachers={teachers}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSchedule(null);
          }}
          onSubmit={async (data) => {
            try {
              await updateMutation.mutateAsync({
                id: selectedSchedule.$id,
                updates: data,
              });
              toast.success("Расписание обновлено");
              setShowEditModal(false);
              setSelectedSchedule(null);
            } catch (error: any) {
              toast.error(error.message || "Ошибка при обновлении");
            }
          }}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
}

// Компонент статистики
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

// Компонент карточки дня
interface DayScheduleCardProps {
  day: WeekDay;
  schedules: Schedule[];
  groups: any[];
  subjects: any[];
  teachers: any[];
  onEdit: (schedule: Schedule) => void;
  onDelete: (schedule: Schedule) => void;
}

function DayScheduleCard({
  day,
  schedules,
  groups,
  subjects,
  teachers,
  onEdit,
  onDelete,
}: DayScheduleCardProps) {
  if (schedules.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
        <Calendar className="w-5 h-5 mr-2 text-blue-600" />
        {WeekDayLabels[day]} ({schedules.length} занятий)
      </h3>

      <div className="grid gap-4">
        {schedules.map((schedule) => {
          const group = groups.find((g) => g.$id === schedule.groupId);
          const subject = subjects.find((s) => s.$id === schedule.subjectId);
          const teacher = teachers.find((t) => t.$id === schedule.teacherId);

          return (
            <div
              key={schedule.$id}
              className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="flex items-center text-sm font-medium text-slate-900">
                      <Clock className="w-4 h-4 mr-1 text-blue-600" />
                      {schedule.startTime} - {schedule.endTime}
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin className="w-4 h-4 mr-1 text-orange-600" />
                      {schedule.classroom}
                    </div>
                    {schedule.weekType && schedule.weekType !== "all" && (
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                        {schedule.weekType === "odd" ? "Нечетная" : "Четная"}{" "}
                        неделя
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-slate-600">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {subject?.name || "Предмет не найден"}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {group?.name || "Группа не найдена"}
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {teacher?.name || "Преподаватель не найден"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      schedule.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {schedule.isActive ? "Активно" : "Неактивно"}
                  </span>

                  <button
                    onClick={() => onEdit(schedule)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    title="Редактировать"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDelete(schedule)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Компонент модального окна
interface ScheduleModalProps {
  title: string;
  schedule?: Schedule;
  groups: any[];
  subjects: any[];
  teachers: any[];
  onClose: () => void;
  onSubmit: (data: CreateScheduleDto) => Promise<void>;
  isLoading: boolean;
}

function ScheduleModal({
  title,
  schedule,
  groups,
  subjects,
  teachers,
  onClose,
  onSubmit,
  isLoading,
}: ScheduleModalProps) {
  const [formData, setFormData] = useState<CreateScheduleDto>({
    subjectId: schedule?.subjectId || "",
    groupId: schedule?.groupId || "",
    teacherId: schedule?.teacherId || "",
    dayOfWeek: schedule?.dayOfWeek || WeekDay.MONDAY,
    startTime: schedule?.startTime || "",
    endTime: schedule?.endTime || "",
    classroom: schedule?.classroom || "",
    weekType: schedule?.weekType || "all",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.subjectId) newErrors.subjectId = "Выберите предмет";
    if (!formData.groupId) newErrors.groupId = "Выберите группу";
    if (!formData.teacherId) newErrors.teacherId = "Выберите преподавателя";
    if (!formData.startTime) newErrors.startTime = "Укажите время начала";
    if (!formData.endTime) newErrors.endTime = "Укажите время окончания";
    if (!formData.classroom) newErrors.classroom = "Укажите аудиторию";

    if (formData.startTime && formData.endTime) {
      const start = formData.startTime.split(":").map(Number);
      const end = formData.endTime.split(":").map(Number);
      const startMinutes = start[0] * 60 + start[1];
      const endMinutes = end[0] * 60 + end[1];

      if (startMinutes >= endMinutes) {
        newErrors.endTime = "Время окончания должно быть больше времени начала";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    await onSubmit(formData);
  };

  // Фильтровать предметы для выбранного преподавателя
  const filteredSubjects = formData.teacherId
    ? subjects.filter((s) => s.teacherId === formData.teacherId)
    : subjects;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Преподаватель */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Преподаватель
            </label>
            <select
              value={formData.teacherId}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  teacherId: e.target.value,
                  subjectId: "", // Сбрасываем предмет при смене преподавателя
                }));
                setErrors((prev) => ({ ...prev, teacherId: "" }));
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.teacherId ? "border-red-500" : "border-slate-300"
              }`}
            >
              <option value="">Выберите преподавателя</option>
              {teachers.map((teacher) => (
                <option key={teacher.$id} value={teacher.$id}>
                  {teacher.name}
                </option>
              ))}
            </select>
            {errors.teacherId && (
              <p className="text-red-500 text-sm mt-1">{errors.teacherId}</p>
            )}
          </div>

          {/* Предмет */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Предмет
            </label>
            <select
              value={formData.subjectId}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, subjectId: e.target.value }));
                setErrors((prev) => ({ ...prev, subjectId: "" }));
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.subjectId ? "border-red-500" : "border-slate-300"
              }`}
              disabled={!formData.teacherId}
            >
              <option value="">Выберите предмет</option>
              {filteredSubjects.map((subject) => (
                <option key={subject.$id} value={subject.$id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
            {errors.subjectId && (
              <p className="text-red-500 text-sm mt-1">{errors.subjectId}</p>
            )}
          </div>

          {/* Группа */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Группа
            </label>
            <select
              value={formData.groupId}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, groupId: e.target.value }));
                setErrors((prev) => ({ ...prev, groupId: "" }));
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.groupId ? "border-red-500" : "border-slate-300"
              }`}
            >
              <option value="">Выберите группу</option>
              {groups.map((group) => (
                <option key={group.$id} value={group.$id}>
                  {group.name} - {group.course} курс
                </option>
              ))}
            </select>
            {errors.groupId && (
              <p className="text-red-500 text-sm mt-1">{errors.groupId}</p>
            )}
          </div>

          {/* День недели */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              День недели
            </label>
            <select
              value={formData.dayOfWeek}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  dayOfWeek: e.target.value as WeekDay,
                }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.values(WeekDay).map((day) => (
                <option key={day} value={day}>
                  {WeekDayLabels[day]}
                </option>
              ))}
            </select>
          </div>

          {/* Время */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Время начала
              </label>
              <select
                value={formData.startTime}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }));
                  setErrors((prev) => ({ ...prev, startTime: "" }));
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.startTime ? "border-red-500" : "border-slate-300"
                }`}
              >
                <option value="">Выберите время</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot.start} value={slot.start}>
                    {slot.start}
                  </option>
                ))}
              </select>
              {errors.startTime && (
                <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Время окончания
              </label>
              <select
                value={formData.endTime}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, endTime: e.target.value }));
                  setErrors((prev) => ({ ...prev, endTime: "" }));
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.endTime ? "border-red-500" : "border-slate-300"
                }`}
              >
                <option value="">Выберите время</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot.end} value={slot.end}>
                    {slot.end}
                  </option>
                ))}
              </select>
              {errors.endTime && (
                <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
              )}
            </div>
          </div>

          {/* Аудитория */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Аудитория
            </label>
            <input
              type="text"
              value={formData.classroom}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, classroom: e.target.value }));
                setErrors((prev) => ({ ...prev, classroom: "" }));
              }}
              placeholder="Номер аудитории"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.classroom ? "border-red-500" : "border-slate-300"
              }`}
            />
            {errors.classroom && (
              <p className="text-red-500 text-sm mt-1">{errors.classroom}</p>
            )}
          </div>

          {/* Тип недели */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Периодичность
            </label>
            <select
              value={formData.weekType}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  weekType: e.target.value as any,
                }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {WEEK_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Кнопки */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Сохранение..." : schedule ? "Обновить" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
