"use client";

import React, { useState } from "react";

// Модальное окно управления студентами группы

import {
  useAllGroups,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  useGroupStats,
} from "@/services/groupeServise";

import { Group, CreateGroupDto } from "@/types";
import { COURSES, SPECIALIZATIONS } from "@/utils/constants";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  GraduationCap,
  BookOpen,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import GroupStudentsModal from "./GroupStudentsModal";

export function GroupsManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<number | "all">("all");

  // Data fetching
  const { data: groups = [], isLoading } = useAllGroups();
  const { data: stats } = useGroupStats();

  // Mutations
  const createMutation = useCreateGroup();
  const updateMutation = useUpdateGroup();
  const deleteMutation = useDeleteGroup();

  // Фильтрация групп
  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      searchTerm === "" ||
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.specialization.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse =
      selectedCourse === "all" || group.course === selectedCourse;

    return matchesSearch && matchesCourse;
  });

  const handleEdit = (group: Group) => {
    setSelectedGroup(group);
    setShowEditModal(true);
  };

  const handleViewStudents = (group: Group) => {
    setSelectedGroup(group);
    setShowStudentsModal(true);
  };

  const handleDelete = async (group: Group) => {
    if (
      window.confirm(`Удалить группу ${group.name}? Это действие необратимо.`)
    ) {
      try {
        await deleteMutation.mutateAsync(group.$id);
        toast.success("Группа удалена");
      } catch (error: any) {
        toast.error(error.message || "Ошибка при удалении");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-slate-600">Загрузка групп...</span>
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
              Управление группами
            </h2>
            <p className="text-slate-600 mt-1">
              Создание и редактирование учебных групп
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Создать группу</span>
          </button>
        </div>

        {/* Статистика */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Всего групп"
              value={stats.total}
              icon={Users}
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
              title="Средний размер"
              value={Math.round(stats.averageStudentsPerGroup)}
              icon={GraduationCap}
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
                placeholder="Поиск по названию, коду или специализации..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <select
            value={selectedCourse}
            onChange={(e) =>
              setSelectedCourse(
                e.target.value === "all" ? "all" : Number(e.target.value)
              )
            }
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Все курсы</option>
            {COURSES.map((course) => (
              <option key={course.value} value={course.value}>
                {course.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Список групп */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            Группы ({filteredGroups.length})
          </h3>
        </div>

        <div className="divide-y divide-slate-200">
          {filteredGroups.map((group) => (
            <div
              key={group.$id}
              className="p-6 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Иконка группы */}
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                    {group.code}
                  </div>

                  {/* Информация о группе */}
                  <div>
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-slate-900">
                        {group.name}
                      </h4>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                        {group.course} курс
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          group.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {group.isActive ? "Активная" : "Неактивная"}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 mt-1 text-sm text-slate-600">
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {group.specialization}
                      </div>

                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {group.studentsCount || 0} студентов
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 mt-1">
                      Создана:{" "}
                      {new Date(group.$createdAt).toLocaleDateString("ru-RU")}
                    </div>
                  </div>
                </div>

                {/* Действия */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewStudents(group)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    title="Просмотреть студентов"
                  >
                    Студенты ({group.studentsCount || 0})
                  </button>

                  <button
                    onClick={() => handleEdit(group)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Редактировать"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(group)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredGroups.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Группы не найдены
              </h3>
              <p className="text-slate-600">
                {searchTerm || selectedCourse !== "all"
                  ? "Попробуйте изменить критерии поиска"
                  : "Создайте первую группу для начала работы"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Модалы */}
      {showCreateModal && (
        <GroupModal
          title="Создать группу"
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (data) => {
            try {
              await createMutation.mutateAsync(data);
              toast.success("Группа создана");
              setShowCreateModal(false);
            } catch (error: any) {
              toast.error(error.message || "Ошибка при создании");
            }
          }}
          isLoading={createMutation.isPending}
        />
      )}

      {showEditModal && selectedGroup && (
        <GroupModal
          title="Редактировать группу"
          group={selectedGroup}
          onClose={() => {
            setShowEditModal(false);
            setSelectedGroup(null);
          }}
          onSubmit={async (data) => {
            try {
              await updateMutation.mutateAsync({
                id: selectedGroup.$id,
                updates: data,
              });
              toast.success("Группа обновлена");
              setShowEditModal(false);
              setSelectedGroup(null);
            } catch (error: any) {
              toast.error(error.message || "Ошибка при обновлении");
            }
          }}
          isLoading={updateMutation.isPending}
        />
      )}

      {showStudentsModal && selectedGroup && (
        <GroupStudentsModal
          group={selectedGroup}
          onClose={() => {
            setShowStudentsModal(false);
            setSelectedGroup(null);
          }}
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

// Модальное окно группы
interface GroupModalProps {
  title: string;
  group?: Group;
  onClose: () => void;
  onSubmit: (data: CreateGroupDto) => Promise<void>;
  isLoading: boolean;
}

function GroupModal({
  title,
  group,
  onClose,
  onSubmit,
  isLoading,
}: GroupModalProps) {
  const [formData, setFormData] = useState<CreateGroupDto>({
    name: group?.name || "",
    code: group?.code || "",
    course: group?.course || 1,
    specialization: group?.specialization || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Введите название группы";
    if (!formData.code.trim()) newErrors.code = "Введите код группы";
    if (!formData.specialization.trim())
      newErrors.specialization = "Выберите специализацию";

    // Проверка формата кода группы
    if (formData.code && !/^[А-ЯЁA-Z]{2,8}-\d{3}$/i.test(formData.code)) {
      newErrors.code = "Код должен быть в формате АБВ-123";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Название */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Название группы
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, name: e.target.value }));
                setErrors((prev) => ({ ...prev, name: "" }));
              }}
              placeholder="Информационные технологии"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? "border-red-500" : "border-slate-300"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Код */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Код группы
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  code: e.target.value.toUpperCase(),
                }));
                setErrors((prev) => ({ ...prev, code: "" }));
              }}
              placeholder="ИТ-301"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.code ? "border-red-500" : "border-slate-300"
              }`}
            />
            {errors.code && (
              <p className="text-red-500 text-sm mt-1">{errors.code}</p>
            )}
            <p className="text-xs text-slate-500 mt-1">
              Формат: ИТ-301 (2-8 букв + дефис + 3 цифры)
            </p>
          </div>

          {/* Курс */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Курс обучения
            </label>
            <select
              value={formData.course}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  course: Number(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {COURSES.map((course) => (
                <option key={course.value} value={course.value}>
                  {course.label}
                </option>
              ))}
            </select>
          </div>

          {/* Специализация */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Специализация
            </label>
            <select
              value={formData.specialization}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  specialization: e.target.value,
                }));
                setErrors((prev) => ({ ...prev, specialization: "" }));
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.specialization ? "border-red-500" : "border-slate-300"
              }`}
            >
              <option value="">Выберите специализацию</option>
              {SPECIALIZATIONS.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
            {errors.specialization && (
              <p className="text-red-500 text-sm mt-1">
                {errors.specialization}
              </p>
            )}
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
              {isLoading ? "Сохранение..." : group ? "Обновить" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
