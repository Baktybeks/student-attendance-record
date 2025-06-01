// src/components/admin/GroupsManagement.tsx

"use client";

import React, { useState } from "react";
import {
  useAllGroups,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  useActivateGroup,
  useDeactivateGroup,
  useGroupStats,
} from "@/services/groupeServise";
import { Group, CreateGroupDto } from "@/types";
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  GraduationCap,
  BookOpen,
  Calendar,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { COURSES, SPECIALIZATIONS } from "@/utils";

export const GroupsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const { data: groups = [], isLoading } = useAllGroups();
  const { data: stats } = useGroupStats();
  const createGroupMutation = useCreateGroup();
  const updateGroupMutation = useUpdateGroup();
  const deleteGroupMutation = useDeleteGroup();
  const activateGroupMutation = useActivateGroup();
  const deactivateGroupMutation = useDeactivateGroup();

  // Фильтрация групп
  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.specialization.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse =
      courseFilter === "all" || group.course === courseFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && group.isActive) ||
      (statusFilter === "inactive" && !group.isActive);

    return matchesSearch && matchesCourse && matchesStatus;
  });

  const handleCreateGroup = async (groupData: CreateGroupDto) => {
    try {
      await createGroupMutation.mutateAsync(groupData);
      toast.success("Группа создана успешно");
      setShowCreateModal(false);
    } catch (error: any) {
      toast.error(`Ошибка создания группы: ${error.message}`);
    }
  };

  const handleUpdateGroup = async (groupData: Partial<Group>) => {
    if (!selectedGroup) return;

    try {
      await updateGroupMutation.mutateAsync({
        id: selectedGroup.$id,
        updates: groupData,
      });
      toast.success("Группа обновлена успешно");
      setShowEditModal(false);
      setSelectedGroup(null);
    } catch (error: any) {
      toast.error(`Ошибка обновления группы: ${error.message}`);
    }
  };

  const handleToggleGroupStatus = async (group: Group) => {
    try {
      if (group.isActive) {
        await deactivateGroupMutation.mutateAsync(group.$id);
        toast.success("Группа деактивирована");
      } else {
        await activateGroupMutation.mutateAsync(group.$id);
        toast.success("Группа активирована");
      }
    } catch (error: any) {
      toast.error(`Ошибка изменения статуса: ${error.message}`);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту группу?")) return;

    try {
      await deleteGroupMutation.mutateAsync(groupId);
      toast.success("Группа удалена");
    } catch (error: any) {
      toast.error(`Ошибка удаления группы: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600">Загрузка групп...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и действия */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Управление группами
          </h2>
          <p className="text-slate-600 mt-1">
            Всего групп: {stats?.total || 0}, активных: {stats?.active || 0}
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="w-4 h-4" />}
          variant="primary"
        >
          Добавить группу
        </Button>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Всего групп
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
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
                  Средний размер
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {Math.round(stats.averageStudentsPerGroup)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Неактивных</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.inactive}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Фильтры и поиск */}
      <Card padding="md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Поиск по названию, коду, специальности..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />

          <Select
            value={courseFilter}
            onChange={(value) =>
              setCourseFilter(value === "all" ? "all" : Number(value))
            }
            options={[
              { value: "all", label: "Все курсы" },
              ...COURSES.map((course) => ({
                value: course.value,
                label: course.label,
              })),
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

      {/* Список групп */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <GroupCard
            key={group.$id}
            group={group}
            onView={() => {
              setSelectedGroup(group);
              setShowDetailsModal(true);
            }}
            onEdit={() => {
              setSelectedGroup(group);
              setShowEditModal(true);
            }}
            onToggleStatus={() => handleToggleGroupStatus(group)}
            onDelete={() => handleDeleteGroup(group.$id)}
          />
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <Card padding="lg">
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Группы не найдены
            </h3>
            <p className="text-slate-600">
              {searchTerm || courseFilter !== "all" || statusFilter !== "all"
                ? "Попробуйте изменить критерии поиска"
                : "Начните с создания первой группы"}
            </p>
            {!searchTerm &&
              courseFilter === "all" &&
              statusFilter === "all" && (
                <Button
                  className="mt-4"
                  onClick={() => setShowCreateModal(true)}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Создать группу
                </Button>
              )}
          </div>
        </Card>
      )}

      {/* Модальные окна */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateGroup}
        isLoading={createGroupMutation.isPending}
      />

      <EditGroupModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedGroup(null);
        }}
        group={selectedGroup}
        onSubmit={handleUpdateGroup}
        isLoading={updateGroupMutation.isPending}
      />

      <GroupDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedGroup(null);
        }}
        group={selectedGroup}
      />
    </div>
  );
};

// Компонент карточки группы
interface GroupCardProps {
  group: Group;
  onView: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  return (
    <Card hover padding="md" className="relative">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{group.name}</h3>
          <p className="text-sm text-slate-600">{group.code}</p>
        </div>
        <Badge variant={group.isActive ? "success" : "warning"}>
          {group.isActive ? "Активна" : "Неактивна"}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-slate-600">
          <GraduationCap className="w-4 h-4 mr-2" />
          {group.course} курс
        </div>
        <div className="flex items-center text-sm text-slate-600">
          <BookOpen className="w-4 h-4 mr-2" />
          {group.specialization}
        </div>
        <div className="flex items-center text-sm text-slate-600">
          <Users className="w-4 h-4 mr-2" />
          {group.studentsCount || 0} студентов
        </div>
      </div>

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
            className={group.isActive ? "text-orange-600" : "text-emerald-600"}
          >
            {group.isActive ? (
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

// Модальное окно создания группы
interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateGroupDto) => Promise<void>;
  isLoading: boolean;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<CreateGroupDto>({
    name: "",
    code: "",
    course: 1,
    specialization: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({
      name: "",
      code: "",
      course: 1,
      specialization: "",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Создать группу" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Название группы"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Информационные технологии-301"
        />

        <Input
          label="Код группы"
          value={formData.code}
          onChange={(e) =>
            setFormData({ ...formData, code: e.target.value.toUpperCase() })
          }
          required
          placeholder="ИТ-301"
          helperText="Формат: XX-000 (например, ИТ-301)"
        />

        <Select
          label="Курс"
          value={formData.course}
          onChange={(value) =>
            setFormData({ ...formData, course: Number(value) })
          }
          options={COURSES.map((course) => ({
            value: course.value,
            label: course.label,
          }))}
        />

        <Select
          label="Специальность"
          value={formData.specialization}
          onChange={(value) =>
            setFormData({ ...formData, specialization: value as string })
          }
          options={SPECIALIZATIONS.map((spec) => ({
            value: spec,
            label: spec,
          }))}
          searchable
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

// Модальное окно редактирования группы
interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
  onSubmit: (data: Partial<Group>) => Promise<void>;
  isLoading: boolean;
}

const EditGroupModal: React.FC<EditGroupModalProps> = ({
  isOpen,
  onClose,
  group,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<Partial<Group>>({});

  React.useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        code: group.code,
        course: group.course,
        specialization: group.specialization,
      });
    }
  }, [group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  if (!group) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Редактировать группу"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Название группы"
          value={formData.name || ""}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <Input
          label="Код группы"
          value={formData.code || ""}
          onChange={(e) =>
            setFormData({ ...formData, code: e.target.value.toUpperCase() })
          }
          required
        />

        <Select
          label="Курс"
          value={formData.course || 1}
          onChange={(value) =>
            setFormData({ ...formData, course: Number(value) })
          }
          options={COURSES.map((course) => ({
            value: course.value,
            label: course.label,
          }))}
        />

        <Select
          label="Специальность"
          value={formData.specialization || ""}
          onChange={(value) =>
            setFormData({ ...formData, specialization: value as string })
          }
          options={SPECIALIZATIONS.map((spec) => ({
            value: spec,
            label: spec,
          }))}
          searchable
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

// Модальное окно просмотра группы
interface GroupDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
}

const GroupDetailsModal: React.FC<GroupDetailsModalProps> = ({
  isOpen,
  onClose,
  group,
}) => {
  if (!group) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Информация о группе"
      size="lg"
    >
      <div className="space-y-6">
        {/* Основная информация */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            {group.name}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Код группы
              </label>
              <p className="mt-1 text-sm text-slate-900 font-mono">
                {group.code}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Курс
              </label>
              <p className="mt-1 text-sm text-slate-900">{group.course} курс</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Специальность
              </label>
              <p className="mt-1 text-sm text-slate-900">
                {group.specialization}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Количество студентов
              </label>
              <p className="mt-1 text-sm text-slate-900">
                {group.studentsCount || 0}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Статус
              </label>
              <div className="mt-1">
                <Badge variant={group.isActive ? "success" : "warning"}>
                  {group.isActive ? "Активна" : "Неактивна"}
                </Badge>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Дата создания
              </label>
              <p className="mt-1 text-sm text-slate-900">
                {new Date(group.$createdAt).toLocaleDateString("ru-RU", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div>
          <h4 className="text-lg font-medium text-slate-900 mb-3">
            Статистика
          </h4>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">
                  {group.studentsCount || 0}
                </p>
                <p className="text-sm text-slate-600">Студентов</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">0</p>
                <p className="text-sm text-slate-600">Предметов</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">0</p>
                <p className="text-sm text-slate-600">Занятий в неделю</p>
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
