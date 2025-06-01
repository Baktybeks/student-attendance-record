// src/components/admin/ScheduleManagement.tsx

"use client";

import React, { useState } from "react";
import { useAllGroups } from "@/services/groupeServise";
import { useAllSubjects } from "@/services/subjectService";
import { useUsersByRole } from "@/services/authService";
import {
  WeekDay,
  getWeekDayLabel,
  UserRole,
  Schedule,
  CreateScheduleDto,
} from "@/types";
import { TIME_SLOTS, WEEK_TYPES } from "@/utils/constants";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Clock,
  Users,
  BookOpen,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  Download,
  Upload,
} from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export const ScheduleManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [teacherFilter, setTeacherFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    day: WeekDay;
    timeSlot: (typeof TIME_SLOTS)[0];
  } | null>(null);

  const { data: groups = [] } = useAllGroups();
  const { data: subjects = [] } = useAllSubjects();
  const { data: teachers = [] } = useUsersByRole(UserRole.TEACHER);

  // Мок данные расписания (в реальном приложении будут из API)
  const [scheduleData, setScheduleData] = useState<Schedule[]>([
    {
      $id: "1",
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
      $permissions: [],
      $databaseId: "",
      $collectionId: "",
      subjectId: "math-101",
      groupId: "it-301",
      teacherId: "teacher-1",
      dayOfWeek: WeekDay.MONDAY,
      startTime: "09:00",
      endTime: "10:30",
      classroom: "Ауд. 205",
      weekType: "all",
      isActive: true,
    },
    {
      $id: "2",
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
      $permissions: [],
      $databaseId: "",
      $collectionId: "",
      subjectId: "prog-101",
      groupId: "it-301",
      teacherId: "teacher-2",
      dayOfWeek: WeekDay.TUESDAY,
      startTime: "11:30",
      endTime: "13:00",
      classroom: "Лаб. 3",
      weekType: "all",
      isActive: true,
    },
  ]);

  const weekDays = Object.values(WeekDay);

  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay() + 1); // Понедельник

    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  };

  const weekDates = getWeekDates(selectedWeek);

  const getScheduleForSlot = (day: WeekDay, timeSlot: TimeSlot) => {
    return scheduleData.filter(
      (item) =>
        item.dayOfWeek === day &&
        item.startTime === timeSlot.start &&
        (groupFilter === "all" || item.groupId === groupFilter) &&
        (teacherFilter === "all" || item.teacherId === teacherFilter)
    );
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find((s) => s.$id === subjectId);
    return subject?.name || "Неизвестный предмет";
  };

  const getGroupName = (groupId: string) => {
    const group = groups.find((g) => g.$id === groupId);
    return group?.code || "Неизвестная группа";
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find((t) => t.$id === teacherId);
    return teacher?.name || "Неизвестный преподаватель";
  };

  const handleCreateSchedule = async (scheduleData: CreateScheduleDto) => {
    try {
      // В реальном приложении здесь будет вызов API
      const newSchedule: Schedule = {
        $id: Date.now().toString(),
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        $permissions: [],
        $databaseId: "",
        $collectionId: "",
        ...scheduleData,
        isActive: true,
      };

      setScheduleData((prev) => [...prev, newSchedule]);
      toast.success("Занятие добавлено в расписание");
      setShowCreateModal(false);
      setSelectedSlot(null);
    } catch (error: any) {
      toast.error(`Ошибка создания занятия: ${error.message}`);
    }
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    const scheduleToDelete = scheduleData.find((s) => s.$id === scheduleId);
    if (!scheduleToDelete) {
      toast.error("Занятие не найдено");
      return;
    }

    const subjectName = getSubjectName(scheduleToDelete.subjectId);
    const groupName = getGroupName(scheduleToDelete.groupId);
    const timeStr = `${scheduleToDelete.startTime}-${scheduleToDelete.endTime}`;

    if (
      !confirm(
        `Вы уверены, что хотите удалить занятие?\n\n` +
          `📚 Предмет: ${subjectName}\n` +
          `👥 Группа: ${groupName}\n` +
          `🕐 Время: ${timeStr}\n` +
          `📍 Аудитория: ${scheduleToDelete.classroom}\n\n` +
          `Это действие нельзя отменить.`
      )
    ) {
      return;
    }

    try {
      setScheduleData((prev) => prev.filter((item) => item.$id !== scheduleId));
      toast.success(`Занятие "${subjectName}" удалено из расписания`);
    } catch (error) {
      toast.error("Ошибка при удалении занятия");
      console.error("Delete error:", error);
    }
  };

  const handleBulkDelete = (scheduleIds: string[]) => {
    if (scheduleIds.length === 0) return;

    const count = scheduleIds.length;
    if (
      !confirm(
        `Удалить ${count} занятий из расписания? Это действие нельзя отменить.`
      )
    ) {
      return;
    }

    try {
      setScheduleData((prev) =>
        prev.filter((item) => !scheduleIds.includes(item.$id))
      );
      toast.success(`Удалено ${count} занятий из расписания`);
    } catch (error) {
      toast.error("Ошибка при массовом удалении");
      console.error("Bulk delete error:", error);
    }
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(selectedWeek.getDate() + (direction === "next" ? 7 : -7));
    setSelectedWeek(newDate);
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и действия */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Управление расписанием
          </h2>
          <p className="text-slate-600 mt-1">
            Планирование и управление учебным расписанием
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            icon={<Upload className="w-4 h-4" />}
            onClick={() => toast.info("Импорт расписания в разработке")}
          >
            Импорт
          </Button>
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={() => toast.info("Экспорт расписания в разработке")}
          >
            Экспорт
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            icon={<Plus className="w-4 h-4" />}
            variant="primary"
          >
            Добавить занятие
          </Button>
        </div>
      </div>

      {/* Фильтры и навигация */}
      <Card padding="md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Навигация по неделям */}
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigateWeek("prev")}
                icon={<ChevronLeft className="w-4 h-4" />}
              />
              <span className="text-sm font-medium px-4">
                {weekDates[0].toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "short",
                })}{" "}
                -{" "}
                {weekDates[6].toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigateWeek("next")}
                icon={<ChevronRight className="w-4 h-4" />}
              />
            </div>

            {/* Фильтры */}
            <Select
              value={groupFilter}
              onChange={(value) => setGroupFilter(value as string)}
              options={[
                { value: "all", label: "Все группы" },
                ...groups
                  .filter((g) => g.isActive)
                  .map((group) => ({
                    value: group.$id,
                    label: group.code,
                  })),
              ]}
              size="sm"
            />

            <Select
              value={teacherFilter}
              onChange={(value) => setTeacherFilter(value as string)}
              options={[
                { value: "all", label: "Все преподаватели" },
                ...teachers.map((teacher) => ({
                  value: teacher.$id,
                  label: teacher.name,
                })),
              ]}
              size="sm"
            />
          </div>

          {/* Переключатель вида */}
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant={viewMode === "grid" ? "primary" : "outline"}
              onClick={() => setViewMode("grid")}
              icon={<Grid className="w-4 h-4" />}
            >
              Сетка
            </Button>
            <Button
              size="sm"
              variant={viewMode === "list" ? "primary" : "outline"}
              onClick={() => setViewMode("list")}
              icon={<List className="w-4 h-4" />}
            >
              Список
            </Button>
          </div>
        </div>
      </Card>

      {/* Расписание */}
      {viewMode === "grid" ? (
        <div className="space-y-4">
          {/* Подсказка для пользователей */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-blue-600 text-xs">💡</span>
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Как управлять занятиями:</p>
                <ul className="text-xs space-y-1 text-blue-700">
                  <li>
                    • <strong>Добавить:</strong> Кликните на пустую ячейку в
                    сетке
                  </li>
                  <li>
                    • <strong>Редактировать/Удалить:</strong> Наведите курсор на
                    занятие или кликните правой кнопкой
                  </li>
                  <li>
                    • <strong>Быстрое удаление:</strong> Кликните на красную
                    кнопку корзины при наведении
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <ScheduleGrid
            weekDays={weekDays}
            weekDates={weekDates}
            timeSlots={TIME_SLOTS}
            getScheduleForSlot={getScheduleForSlot}
            getSubjectName={getSubjectName}
            getGroupName={getGroupName}
            getTeacherName={getTeacherName}
            onSlotClick={(day, timeSlot) => {
              setSelectedSlot({ day, timeSlot });
              setShowCreateModal(true);
            }}
            onScheduleEdit={(schedule) => {
              // setSelectedSchedule(schedule);
              // setShowEditModal(true);
              toast.info("Редактирование в разработке");
            }}
            onScheduleDelete={handleDeleteSchedule}
          />
        </div>
      ) : (
        <ScheduleList
          scheduleData={scheduleData.filter(
            (item) =>
              (groupFilter === "all" || item.groupId === groupFilter) &&
              (teacherFilter === "all" || item.teacherId === teacherFilter)
          )}
          getSubjectName={getSubjectName}
          getGroupName={getGroupName}
          getTeacherName={getTeacherName}
          onScheduleEdit={(schedule) =>
            toast.info("Редактирование в разработке")
          }
          onScheduleDelete={handleDeleteSchedule}
        />
      )}

      {/* Модальное окно создания занятия */}
      <CreateScheduleModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedSlot(null);
        }}
        onSubmit={handleCreateSchedule}
        isLoading={false}
        subjects={subjects.filter((s) => s.isActive)}
        groups={groups.filter((g) => g.isActive)}
        teachers={teachers}
        defaultSlot={selectedSlot}
      />
    </div>
  );
};

// Компонент сетки расписания
interface ScheduleGridProps {
  weekDays: WeekDay[];
  weekDates: Date[];
  timeSlots: readonly TimeSlot[];
  getScheduleForSlot: (day: WeekDay, timeSlot: TimeSlot) => Schedule[];
  getSubjectName: (id: string) => string;
  getGroupName: (id: string) => string;
  getTeacherName: (id: string) => string;
  onSlotClick: (day: WeekDay, timeSlot: TimeSlot) => void;
  onScheduleEdit: (schedule: Schedule) => void;
  onScheduleDelete: (scheduleId: string) => void;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  weekDays,
  weekDates,
  timeSlots,
  getScheduleForSlot,
  getSubjectName,
  getGroupName,
  getTeacherName,
  onSlotClick,
  onScheduleEdit,
  onScheduleDelete,
}) => {
  return (
    <Card padding="none">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase w-24">
                Время
              </th>
              {weekDays.map((day, index) => (
                <th
                  key={day}
                  className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase"
                >
                  <div>
                    <div>{getWeekDayLabel(day)}</div>
                    <div className="text-slate-400 font-normal">
                      {weekDates[index]?.toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {timeSlots.map((timeSlot) => (
              <tr key={timeSlot.start}>
                <td className="px-4 py-6 text-sm font-medium text-slate-900 bg-slate-50">
                  <div>
                    <div>{timeSlot.start}</div>
                    <div className="text-xs text-slate-500">{timeSlot.end}</div>
                  </div>
                </td>
                {weekDays.map((day) => {
                  const schedules = getScheduleForSlot(day, timeSlot);
                  return (
                    <td
                      key={`${day}-${timeSlot.start}`}
                      className="px-2 py-2 text-sm relative"
                      style={{ minHeight: "120px" }}
                    >
                      <div
                        className="min-h-[100px] w-full border-2 border-dashed border-slate-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors flex flex-col"
                        onClick={() =>
                          schedules.length === 0 && onSlotClick(day, timeSlot)
                        }
                      >
                        {schedules.length === 0 ? (
                          <div className="flex-1 flex items-center justify-center text-slate-400 hover:text-blue-500">
                            <Plus className="w-5 h-5" />
                          </div>
                        ) : (
                          <div className="space-y-1 p-1">
                            {schedules.map((schedule) => (
                              <ScheduleCard
                                key={schedule.$id}
                                schedule={schedule}
                                subjectName={getSubjectName(schedule.subjectId)}
                                groupName={getGroupName(schedule.groupId)}
                                teacherName={getTeacherName(schedule.teacherId)}
                                onEdit={() => onScheduleEdit(schedule)}
                                onDelete={() => onScheduleDelete(schedule.$id)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// Компонент списка расписания
interface ScheduleListProps {
  scheduleData: Schedule[];
  getSubjectName: (id: string) => string;
  getGroupName: (id: string) => string;
  getTeacherName: (id: string) => string;
  onScheduleEdit: (schedule: Schedule) => void;
  onScheduleDelete: (scheduleId: string) => void;
}

const ScheduleList: React.FC<ScheduleListProps> = ({
  scheduleData,
  getSubjectName,
  getGroupName,
  getTeacherName,
  onScheduleEdit,
  onScheduleDelete,
}) => {
  const groupedByDay = scheduleData.reduce((acc, schedule) => {
    const day = schedule.dayOfWeek;
    if (!acc[day]) acc[day] = [];
    acc[day].push(schedule);
    return acc;
  }, {} as Record<WeekDay, Schedule[]>);

  return (
    <div className="space-y-6">
      {Object.values(WeekDay).map((day) => {
        const daySchedules = groupedByDay[day] || [];

        return (
          <Card key={day} padding="md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {getWeekDayLabel(day)} ({daySchedules.length} занятий)
            </h3>

            {daySchedules.length === 0 ? (
              <p className="text-slate-500 italic">Занятий нет</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {daySchedules
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((schedule) => (
                    <ScheduleCard
                      key={schedule.$id}
                      schedule={schedule}
                      subjectName={getSubjectName(schedule.subjectId)}
                      groupName={getGroupName(schedule.groupId)}
                      teacherName={getTeacherName(schedule.teacherId)}
                      onEdit={() => onScheduleEdit(schedule)}
                      onDelete={() => onScheduleDelete(schedule.$id)}
                      expanded
                    />
                  ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

// Компонент карточки занятия
interface ScheduleCardProps {
  schedule: Schedule;
  subjectName: string;
  groupName: string;
  teacherName: string;
  onEdit: () => void;
  onDelete: () => void;
  expanded?: boolean;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  subjectName,
  groupName,
  teacherName,
  onEdit,
  onDelete,
  expanded = false,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowContextMenu(true);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
    setShowContextMenu(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Удалить занятие "${subjectName}" для группы ${groupName}?`)) {
      onDelete();
    }
    setShowContextMenu(false);
  };

  return (
    <div
      className={`bg-blue-50 border border-blue-200 rounded-lg p-2 ${
        expanded ? "p-3" : ""
      } hover:shadow-sm transition-all relative group cursor-pointer select-none`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onContextMenu={handleContextMenu}
      onClick={() => setShowContextMenu(!showContextMenu)}
    >
      <div className="space-y-1">
        <div className="font-medium text-blue-900 text-xs leading-tight pr-6">
          {subjectName}
        </div>

        <div className="flex items-center text-xs text-blue-700">
          <Clock className="w-3 h-3 mr-1" />
          {schedule.startTime}-{schedule.endTime}
        </div>

        <div className="flex items-center text-xs text-blue-600">
          <Users className="w-3 h-3 mr-1" />
          {groupName}
        </div>

        {expanded && (
          <>
            <div className="flex items-center text-xs text-blue-600">
              <BookOpen className="w-3 h-3 mr-1" />
              {teacherName}
            </div>

            <div className="flex items-center text-xs text-blue-600">
              <MapPin className="w-3 h-3 mr-1" />
              {schedule.classroom}
            </div>

            {schedule.weekType !== "all" && (
              <Badge variant="outline" className="text-xs">
                {schedule.weekType === "odd"
                  ? "Нечетная неделя"
                  : "Четная неделя"}
              </Badge>
            )}

            {/* Расширенный режим - показываем кнопки всегда */}
            <div className="flex justify-end space-x-1 mt-2 pt-2 border-t border-blue-200">
              <Button
                size="sm"
                variant="outline"
                onClick={handleEdit}
                className="text-xs px-2 py-1 h-6"
              >
                <Edit className="w-3 h-3 mr-1" />
                Изменить
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDelete}
                className="text-xs px-2 py-1 h-6 text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Удалить
              </Button>
            </div>
          </>
        )}

        {!expanded && (
          <div className="text-xs text-blue-600 truncate">
            {schedule.classroom}
          </div>
        )}
      </div>

      {/* Кнопки при наведении - только в режиме сетки */}
      {!expanded && showActions && (
        <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded border shadow-sm">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleEdit}
            className="p-1 h-6 w-6 hover:bg-blue-50"
            title="Редактировать"
          >
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            className="p-1 h-6 w-6 text-red-600 hover:bg-red-50"
            title="Удалить"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Контекстное меню */}
      {!expanded && showContextMenu && (
        <div className="absolute top-8 right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-[120px]">
          <div className="py-1">
            <button
              onClick={handleEdit}
              className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center"
            >
              <Edit className="w-3 h-3 mr-2" />
              Редактировать
            </button>
            <button
              onClick={handleDelete}
              className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center"
            >
              <Trash2 className="w-3 h-3 mr-2" />
              Удалить
            </button>
          </div>
        </div>
      )}

      {/* Индикатор действий */}
      {!expanded && (
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
        </div>
      )}

      {/* Закрытие контекстного меню при клике вне */}
      {showContextMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowContextMenu(false)}
        />
      )}
    </div>
  );
};

// Модальное окно создания занятия
interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateScheduleDto) => Promise<void>;
  isLoading: boolean;
  subjects: any[];
  groups: any[];
  teachers: any[];
  defaultSlot?: { day: WeekDay; timeSlot: TimeSlot } | null;
}

const CreateScheduleModal: React.FC<CreateScheduleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  subjects,
  groups,
  teachers,
  defaultSlot,
}) => {
  const [formData, setFormData] = useState<CreateScheduleDto>({
    subjectId: "",
    groupId: "",
    teacherId: "",
    dayOfWeek: WeekDay.MONDAY,
    startTime: "09:00",
    endTime: "10:30",
    classroom: "",
    weekType: "all",
  });

  React.useEffect(() => {
    if (defaultSlot) {
      setFormData((prev) => ({
        ...prev,
        dayOfWeek: defaultSlot.day,
        startTime: defaultSlot.timeSlot.start,
        endTime: defaultSlot.timeSlot.end,
      }));
    }
  }, [defaultSlot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация формы
    if (!formData.subjectId) {
      toast.error("Выберите предмет");
      return;
    }
    if (!formData.groupId) {
      toast.error("Выберите группу");
      return;
    }
    if (!formData.teacherId) {
      toast.error("Выберите преподавателя");
      return;
    }
    if (!formData.classroom.trim()) {
      toast.error("Укажите аудиторию");
      return;
    }

    await onSubmit(formData);
    setFormData({
      subjectId: "",
      groupId: "",
      teacherId: "",
      dayOfWeek: WeekDay.MONDAY,
      startTime: "09:00",
      endTime: "10:30",
      classroom: "",
      weekType: "all",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Добавить занятие" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Предмет"
            value={formData.subjectId}
            onChange={(value) =>
              setFormData({ ...formData, subjectId: value as string })
            }
            options={subjects.map((subject) => ({
              value: subject.$id,
              label: `${subject.name} (${subject.code})`,
            }))}
            required
            placeholder="Выберите предмет"
          />

          <Select
            label="Группа"
            value={formData.groupId}
            onChange={(value) =>
              setFormData({ ...formData, groupId: value as string })
            }
            options={groups.map((group) => ({
              value: group.$id,
              label: `${group.name} (${group.code})`,
            }))}
            required
            placeholder="Выберите группу"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Преподаватель"
            value={formData.teacherId}
            onChange={(value) =>
              setFormData({ ...formData, teacherId: value as string })
            }
            options={teachers.map((teacher) => ({
              value: teacher.$id,
              label: teacher.name,
            }))}
            required
            placeholder="Выберите преподавателя"
          />

          <Select
            label="День недели"
            value={formData.dayOfWeek}
            onChange={(value) =>
              setFormData({ ...formData, dayOfWeek: value as WeekDay })
            }
            options={Object.values(WeekDay).map((day) => ({
              value: day,
              label: getWeekDayLabel(day),
            }))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Время начала"
            value={formData.startTime}
            onChange={(value) =>
              setFormData({ ...formData, startTime: value as string })
            }
            options={TIME_SLOTS.map((slot) => ({
              value: slot.start,
              label: slot.start,
            }))}
          />

          <Select
            label="Время окончания"
            value={formData.endTime}
            onChange={(value) =>
              setFormData({ ...formData, endTime: value as string })
            }
            options={TIME_SLOTS.map((slot) => ({
              value: slot.end,
              label: slot.end,
            }))}
          />

          <Input
            label="Аудитория"
            value={formData.classroom}
            onChange={(e) =>
              setFormData({ ...formData, classroom: e.target.value })
            }
            placeholder="Ауд. 205"
          />
        </div>

        <Select
          label="Тип недели"
          value={formData.weekType || "all"}
          onChange={(value) =>
            setFormData({
              ...formData,
              weekType: value as "odd" | "even" | "all",
            })
          }
          options={WEEK_TYPES}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose} type="button">
            Отмена
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={isLoading}
            icon={<Plus className="w-4 h-4" />}
          >
            Добавить
          </Button>
        </div>
      </form>
    </Modal>
  );
};
