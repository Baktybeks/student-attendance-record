// src/components/admin/SubjectsManagement.tsx

"use client";

import React, { useState } from "react";
import {
  useAllSubjects,
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
  useActivateSubject,
  useDeactivateSubject,
  useAssignTeacherToSubject,
  useSubjectStats,
} from "@/services/subjectService";
import { useUsersByRole } from "@/services/authService";
import { useActiveGroups } from "@/services/groupeServise";
import { Subject, CreateSubjectDto, UserRole, User, Group } from "@/types";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Users,
  Clock,
  User as UserIcon,
  CheckCircle,
  XCircle,
  Calendar,
  BarChart3,
  GraduationCap,
} from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";

export const SubjectsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [teacherFilter, setTeacherFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const { data: subjects = [], isLoading } = useAllSubjects();
  const { data: teachers = [] } = useUsersByRole(UserRole.TEACHER);
  const { data: groups = [] } = useActiveGroups();
  const { data: stats } = useSubjectStats();

  const createSubjectMutation = useCreateSubject();
  const updateSubjectMutation = useUpdateSubject();
  const deleteSubjectMutation = useDeleteSubject();
  const activateSubjectMutation = useActivateSubject();
  const deactivateSubjectMutation = useDeactivateSubject();
  const assignTeacherMutation = useAssignTeacherToSubject();

  // Фильтрация предметов
  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subject.description &&
        subject.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTeacher =
      teacherFilter === "all" || subject.teacherId === teacherFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && subject.isActive) ||
      (statusFilter === "inactive" && !subject.isActive);

    return matchesSearch && matchesTeacher && matchesStatus;
  });

  const handleCreateSubject = async (subjectData: CreateSubjectDto) => {
    try {
      await createSubjectMutation.mutateAsync(subjectData);
      toast.success("Предмет создан успешно");
      setShowCreateModal(false);
    } catch (error: any) {
      toast.error(`Ошибка создания предмета: ${error.message}`);
    }
  };

  const handleUpdateSubject = async (subjectData: Partial<Subject>) => {
    if (!selectedSubject) return;

    try {
      await updateSubjectMutation.mutateAsync({
        id: selectedSubject.$id,
        updates: subjectData,
      });
      toast.success("Предмет обновлен успешно");
      setShowEditModal(false);
      setSelectedSubject(null);
    } catch (error: any) {
      toast.error(`Ошибка обновления предмета: ${error.message}`);
    }
  };

  const handleToggleSubjectStatus = async (subject: Subject) => {
    try {
      if (subject.isActive) {
        await deactivateSubjectMutation.mutateAsync(subject.$id);
        toast.success("Предмет деактивирован");
      } else {
        await activateSubjectMutation.mutateAsync(subject.$id);
        toast.success("Предмет активирован");
      }
    } catch (error: any) {
      toast.error(`Ошибка изменения статуса: ${error.message}`);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот предмет?")) return;

    try {
      await deleteSubjectMutation.mutateAsync(subjectId);
      toast.success("Предмет удален");
    } catch (error: any) {
      toast.error(`Ошибка удаления предмета: ${error.message}`);
    }
  };

  const handleAssignTeacher = async (subjectId: string, teacherId: string) => {
    try {
      await assignTeacherMutation.mutateAsync({ subjectId, teacherId });
      toast.success("Преподаватель назначен");
    } catch (error: any) {
      toast.error(`Ошибка назначения преподавателя: ${error.message}`);
    }
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find((t) => t.$id === teacherId);
    return teacher?.name || "Не назначен";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600">Загрузка предметов...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и действия */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Управление предметами
          </h2>
          <p className="text-slate-600 mt-1">
            Всего предметов: {stats?.total || 0}, активных: {stats?.active || 0}
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="w-4 h-4" />}
          variant="primary"
        >
          Добавить предмет
        </Button>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Всего предметов
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Активных</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.active}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Общее количество часов
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.totalHours}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Среднее часов
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {Math.round(stats.averageHours)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Фильтры и поиск */}
      <Card padding="md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Поиск по названию, коду, описанию..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
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
              { value: "unassigned", label: "Без преподавателя" },
            ]}
          />

          <Select
            value={statusFilter}
            onChange={(value) =>
              setStatusFilter(value as "all" | "active" | "inactive")
            }
            options={[
              { value: "all", label: "Все статусы" },
              { value: "active", label: "Активные" },
              { value: "inactive", label: "Неактивные" },
            ]}
          />

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Filter className="w-4 h-4" />}
            >
              Фильтры
            </Button>
            <Button variant="outline" size="sm">
              Экспорт
            </Button>
          </div>
        </div>
      </Card>

      {/* Список предметов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((subject) => (
          <SubjectCard
            key={subject.$id}
            subject={subject}
            teacherName={getTeacherName(subject.teacherId)}
            onView={() => {
              setSelectedSubject(subject);
              setShowDetailsModal(true);
            }}
            onEdit={() => {
              setSelectedSubject(subject);
              setShowEditModal(true);
            }}
            onToggleStatus={() => handleToggleSubjectStatus(subject)}
            onDelete={() => handleDeleteSubject(subject.$id)}
            onAssignTeacher={(teacherId) =>
              handleAssignTeacher(subject.$id, teacherId)
            }
            teachers={teachers}
          />
        ))}
      </div>

      {filteredSubjects.length === 0 && (
        <Card padding="lg">
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Предметы не найдены
            </h3>
            <p className="text-slate-600">
              {searchTerm || teacherFilter !== "all" || statusFilter !== "all"
                ? "Попробуйте изменить критерии поиска"
                : "Начните с создания первого предмета"}
            </p>
            {!searchTerm &&
              teacherFilter === "all" &&
              statusFilter === "all" && (
                <Button
                  className="mt-4"
                  onClick={() => setShowCreateModal(true)}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Создать предмет
                </Button>
              )}
          </div>
        </Card>
      )}

      {/* Модальные окна */}
      <CreateSubjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSubject}
        isLoading={createSubjectMutation.isPending}
        teachers={teachers}
        groups={groups}
      />

      <EditSubjectModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedSubject(null);
        }}
        subject={selectedSubject}
        onSubmit={handleUpdateSubject}
        isLoading={updateSubjectMutation.isPending}
        teachers={teachers}
        groups={groups}
      />

      <SubjectDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedSubject(null);
        }}
        subject={selectedSubject}
        teacherName={
          selectedSubject ? getTeacherName(selectedSubject.teacherId) : ""
        }
        groups={groups}
      />
    </div>
  );
};

// Компонент карточки предмета
interface SubjectCardProps {
  subject: Subject;
  teacherName: string;
  onView: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onAssignTeacher: (teacherId: string) => void;
  teachers: User[];
}

const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  teacherName,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  onAssignTeacher,
  teachers,
}) => {
  const [showTeacherSelect, setShowTeacherSelect] = useState(false);

  return (
    <Card hover padding="md" className="relative">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {subject.name}
          </h3>
          <p className="text-sm text-slate-600 font-mono">{subject.code}</p>
        </div>
        <Badge variant={subject.isActive ? "success" : "warning"}>
          {subject.isActive ? "Активен" : "Неактивен"}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-slate-600">
          <UserIcon className="w-4 h-4 mr-2" />
          <span className="truncate">{teacherName}</span>
          {teacherName === "Не назначен" && (
            <Button
              size="sm"
              variant="ghost"
              className="ml-2"
              onClick={() => setShowTeacherSelect(!showTeacherSelect)}
            >
              Назначить
            </Button>
          )}
        </div>

        <div className="flex items-center text-sm text-slate-600">
          <Clock className="w-4 h-4 mr-2" />
          {subject.hoursTotal} часов
        </div>

        <div className="flex items-center text-sm text-slate-600">
          <Users className="w-4 h-4 mr-2" />
          {subject.groupIds.length} групп
        </div>

        {subject.description && (
          <p className="text-sm text-slate-600 line-clamp-2">
            {subject.description}
          </p>
        )}
      </div>

      {showTeacherSelect && (
        <div className="mb-4">
          <Select
            placeholder="Выберите преподавателя"
            onChange={(value) => {
              onAssignTeacher(value as string);
              setShowTeacherSelect(false);
            }}
            options={teachers.map((teacher) => ({
              value: teacher.$id,
              label: teacher.name,
            }))}
          />
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button size="sm" variant="ghost" onClick={onView}>
            <Eye className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleStatus}
            className={
              subject.isActive ? "text-orange-600" : "text-emerald-600"
            }
          >
            {subject.isActive ? (
              <XCircle className="w-3 h-3" />
            ) : (
              <CheckCircle className="w-3 h-3" />
            )}
          </Button>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          className="text-red-600"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </Card>
  );
};

// Модальное окно создания предмета
interface CreateSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSubjectDto) => Promise<void>;
  isLoading: boolean;
  teachers: User[];
  groups: Group[];
}

const CreateSubjectModal: React.FC<CreateSubjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  teachers,
  groups,
}) => {
  const [formData, setFormData] = useState<CreateSubjectDto>({
    name: "",
    code: "",
    teacherId: "",
    groupIds: [],
    hoursTotal: 0,
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({
      name: "",
      code: "",
      teacherId: "",
      groupIds: [],
      hoursTotal: 0,
      description: "",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Создать предмет" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Название предмета"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Математический анализ"
          />

          <Input
            label="Код предмета"
            value={formData.code}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value.toUpperCase() })
            }
            required
            placeholder="MATH101"
            helperText="Уникальный код предмета"
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
            placeholder="Выберите преподавателя"
          />

          <Input
            label="Количество часов"
            type="number"
            min="1"
            max="500"
            value={formData.hoursTotal}
            onChange={(e) =>
              setFormData({ ...formData, hoursTotal: Number(e.target.value) })
            }
            required
            placeholder="72"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Группы
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {groups.map((group) => (
              <label key={group.$id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.groupIds.includes(group.$id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        groupIds: [...formData.groupIds, group.$id],
                      });
                    } else {
                      setFormData({
                        ...formData,
                        groupIds: formData.groupIds.filter(
                          (id) => id !== group.$id
                        ),
                      });
                    }
                  }}
                  className="rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">{group.code}</span>
              </label>
            ))}
          </div>
        </div>

        <Textarea
          label="Описание"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Краткое описание предмета..."
          rows={3}
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
            Создать
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Модальное окно редактирования предмета
interface EditSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
  onSubmit: (data: Partial<Subject>) => Promise<void>;
  isLoading: boolean;
  teachers: User[];
  groups: Group[];
}

const EditSubjectModal: React.FC<EditSubjectModalProps> = ({
  isOpen,
  onClose,
  subject,
  onSubmit,
  isLoading,
  teachers,
  groups,
}) => {
  const [formData, setFormData] = useState<Partial<Subject>>({});

  React.useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name,
        code: subject.code,
        teacherId: subject.teacherId,
        groupIds: subject.groupIds,
        hoursTotal: subject.hoursTotal,
        description: subject.description,
      });
    }
  }, [subject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  if (!subject) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Редактировать предмет"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Название предмета"
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Код предмета"
            value={formData.code || ""}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value.toUpperCase() })
            }
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Преподаватель"
            value={formData.teacherId || ""}
            onChange={(value) =>
              setFormData({ ...formData, teacherId: value as string })
            }
            options={teachers.map((teacher) => ({
              value: teacher.$id,
              label: teacher.name,
            }))}
          />

          <Input
            label="Количество часов"
            type="number"
            min="1"
            max="500"
            value={formData.hoursTotal || 0}
            onChange={(e) =>
              setFormData({ ...formData, hoursTotal: Number(e.target.value) })
            }
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Группы
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {groups.map((group) => (
              <label key={group.$id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.groupIds?.includes(group.$id) || false}
                  onChange={(e) => {
                    const currentGroupIds = formData.groupIds || [];
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        groupIds: [...currentGroupIds, group.$id],
                      });
                    } else {
                      setFormData({
                        ...formData,
                        groupIds: currentGroupIds.filter(
                          (id) => id !== group.$id
                        ),
                      });
                    }
                  }}
                  className="rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">{group.code}</span>
              </label>
            ))}
          </div>
        </div>

        <Textarea
          label="Описание"
          value={formData.description || ""}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose} type="button">
            Отмена
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={isLoading}
            icon={<Edit className="w-4 h-4" />}
          >
            Сохранить
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Модальное окно просмотра предмета
interface SubjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
  teacherName: string;
  groups: Group[];
}

const SubjectDetailsModal: React.FC<SubjectDetailsModalProps> = ({
  isOpen,
  onClose,
  subject,
  teacherName,
  groups,
}) => {
  if (!subject) return null;

  const assignedGroups = groups.filter((group) =>
    subject.groupIds.includes(group.$id)
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Информация о предмете"
      size="lg"
    >
      <div className="space-y-6">
        {/* Основная информация */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            {subject.name}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Код предмета
              </label>
              <p className="mt-1 text-sm text-slate-900 font-mono">
                {subject.code}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Преподаватель
              </label>
              <p className="mt-1 text-sm text-slate-900">{teacherName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Количество часов
              </label>
              <p className="mt-1 text-sm text-slate-900">
                {subject.hoursTotal}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Статус
              </label>
              <div className="mt-1">
                <Badge variant={subject.isActive ? "success" : "warning"}>
                  {subject.isActive ? "Активен" : "Неактивен"}
                </Badge>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Дата создания
              </label>
              <p className="mt-1 text-sm text-slate-900">
                {new Date(subject.$createdAt).toLocaleDateString("ru-RU", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Последнее обновление
              </label>
              <p className="mt-1 text-sm text-slate-900">
                {new Date(subject.$updatedAt).toLocaleDateString("ru-RU", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Описание */}
        {subject.description && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Описание
            </label>
            <p className="text-sm text-slate-900 bg-slate-50 rounded-lg p-3">
              {subject.description}
            </p>
          </div>
        )}

        {/* Назначенные группы */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Назначенные группы ({assignedGroups.length})
          </label>
          {assignedGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assignedGroups.map((group) => (
                <div
                  key={group.$id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {group.name}
                    </p>
                    <p className="text-xs text-slate-600">
                      {group.code} • {group.course} курс
                    </p>
                  </div>
                  <Badge variant="outline">
                    {group.studentsCount || 0} студентов
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">Группы не назначены</p>
          )}
        </div>

        {/* Статистика */}
        <div>
          <h4 className="text-lg font-medium text-slate-900 mb-3">
            Статистика
          </h4>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">
                  {assignedGroups.length}
                </p>
                <p className="text-sm text-slate-600">Групп</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">
                  {assignedGroups.reduce(
                    (sum, group) => sum + (group.studentsCount || 0),
                    0
                  )}
                </p>
                <p className="text-sm text-slate-600">Студентов</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">0</p>
                <p className="text-sm text-slate-600">Занятий проведено</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200">
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </div>
    </Modal>
  );
};
