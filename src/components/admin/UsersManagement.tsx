// src/components/admin/UsersManagement.tsx

"use client";

import React, { useState } from "react";
import {
  useAllUsers,
  useActivateUser,
  useDeactivateUser,
  useRegister,
} from "@/services/authService";
import { UserRole, getRoleLabel, User, CreateUserDto } from "@/types";
import {
  Users,
  Plus,
  Search,
  Filter,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";

interface UsersManagementProps {
  users: User[];
  isLoading: boolean;
  pendingCount: number;
}

export const UsersManagement: React.FC<UsersManagementProps> = ({
  users,
  isLoading,
  pendingCount,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const activateUserMutation = useActivateUser();
  const deactivateUserMutation = useDeactivateUser();
  const registerMutation = useRegister();

  // Фильтрация пользователей
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.studentId &&
        user.studentId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleActivateUser = async (userId: string) => {
    try {
      await activateUserMutation.mutateAsync(userId);
      toast.success("Пользователь активирован");
    } catch (error: any) {
      toast.error(`Ошибка активации: ${error.message}`);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      await deactivateUserMutation.mutateAsync(userId);
      toast.success("Пользователь деактивирован");
    } catch (error: any) {
      toast.error(`Ошибка деактивации: ${error.message}`);
    }
  };

  const handleCreateUser = async (userData: CreateUserDto) => {
    try {
      await registerMutation.mutateAsync(userData);
      toast.success("Пользователь создан");
      setShowCreateModal(false);
    } catch (error: any) {
      toast.error(`Ошибка создания: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600">Загрузка пользователей...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и действия */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Управление пользователями
          </h2>
          <p className="text-slate-600 mt-1">
            Всего пользователей: {users.length}, активных:{" "}
            {users.filter((u) => u.isActive).length}
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="w-4 h-4" />}
          variant="primary"
        >
          Добавить пользователя
        </Button>
      </div>

      {/* Предупреждение о неактивных пользователях */}
      {pendingCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Требуется внимание
              </h3>
              <p className="text-sm text-yellow-700">
                {pendingCount} пользователей ожидают активации
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Фильтры и поиск */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Поиск по имени, email, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />

          <Select
            value={roleFilter}
            onChange={(value) => setRoleFilter(value as UserRole | "all")}
            options={[
              { value: "all", label: "Все роли" },
              { value: UserRole.ADMIN, label: "Администраторы" },
              { value: UserRole.TEACHER, label: "Преподаватели" },
              { value: UserRole.STUDENT, label: "Студенты" },
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
      </div>

      {/* Список пользователей */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-900">
            Пользователи ({filteredUsers.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Пользователь
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Роль
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Дата регистрации
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredUsers.map((user) => (
                <tr key={user.$id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-slate-600">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-slate-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {user.email}
                        </div>
                        {user.studentId && (
                          <div className="text-xs text-slate-400">
                            ID: {user.studentId}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant={
                        user.role === UserRole.ADMIN
                          ? "danger"
                          : user.role === UserRole.TEACHER
                          ? "primary"
                          : "secondary"
                      }
                    >
                      {getRoleLabel(user.role)}
                    </Badge>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.isActive ? (
                        <Badge
                          variant="success"
                          icon={<CheckCircle className="w-3 h-3" />}
                        >
                          Активен
                        </Badge>
                      ) : (
                        <Badge
                          variant="warning"
                          icon={<Clock className="w-3 h-3" />}
                        >
                          Ожидает активации
                        </Badge>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(user.$createdAt).toLocaleDateString("ru-RU")}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        icon={<Eye className="w-3 h-3" />}
                      >
                        Просмотр
                      </Button>

                      {!user.isActive ? (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleActivateUser(user.$id)}
                          loading={activateUserMutation.isPending}
                          icon={<UserCheck className="w-3 h-3" />}
                        >
                          Активировать
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="warning"
                          onClick={() => handleDeactivateUser(user.$id)}
                          loading={deactivateUserMutation.isPending}
                          icon={<UserX className="w-3 h-3" />}
                        >
                          Деактивировать
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Пользователи не найдены
              </h3>
              <p className="text-slate-600">
                {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                  ? "Попробуйте изменить критерии поиска"
                  : "Начните с создания первого пользователя"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно создания пользователя */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
        isLoading={registerMutation.isPending}
      />

      {/* Модальное окно просмотра пользователя */}
      <UserDetailsModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        user={selectedUser}
        onActivate={handleActivateUser}
        onDeactivate={handleDeactivateUser}
      />
    </div>
  );
};

// Компонент модального окна создания пользователя
interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserDto) => Promise<void>;
  isLoading: boolean;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<CreateUserDto>({
    name: "",
    email: "",
    password: "",
    role: UserRole.STUDENT,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация формы
    if (!formData.name.trim()) {
      toast.error("Введите полное имя");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Введите email");
      return;
    }
    if (!formData.password || formData.password.length < 8) {
      toast.error("Пароль должен содержать минимум 8 символов");
      return;
    }

    await onSubmit(formData);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: UserRole.STUDENT,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Создать пользователя"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Полное имя"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Иванов Иван Иванович"
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="user@university.edu"
        />

        <Select
          label="Роль"
          value={formData.role}
          onChange={(value) =>
            setFormData({ ...formData, role: value as UserRole })
          }
          options={[
            { value: UserRole.STUDENT, label: "Студент" },
            { value: UserRole.TEACHER, label: "Преподаватель" },
            { value: UserRole.ADMIN, label: "Администратор" },
          ]}
        />

        {formData.role === UserRole.STUDENT && (
          <Input
            label="Студенческий билет"
            value={formData.studentId || ""}
            onChange={(e) =>
              setFormData({ ...formData, studentId: e.target.value })
            }
            placeholder="ST202401001"
          />
        )}

        <Input
          label="Пароль"
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          placeholder="Минимум 8 символов"
          helperText="Пароль будет отправлен пользователю на email"
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

// Компонент модального окна просмотра пользователя
interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onActivate: (userId: string) => Promise<void>;
  onDeactivate: (userId: string) => Promise<void>;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  user,
  onActivate,
  onDeactivate,
}) => {
  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Профиль пользователя"
      size="lg"
    >
      <div className="space-y-6">
        {/* Основная информация */}
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold text-slate-600">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900">{user.name}</h3>
            <p className="text-slate-600">{user.email}</p>
            <div className="flex items-center space-x-4 mt-2">
              <Badge
                variant={
                  user.role === UserRole.ADMIN
                    ? "danger"
                    : user.role === UserRole.TEACHER
                    ? "primary"
                    : "secondary"
                }
              >
                {getRoleLabel(user.role)}
              </Badge>
              <Badge variant={user.isActive ? "success" : "warning"}>
                {user.isActive ? "Активен" : "Неактивен"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Детальная информация */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              ID пользователя
            </label>
            <p className="mt-1 text-sm text-slate-900 font-mono">{user.$id}</p>
          </div>

          {user.studentId && (
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Студенческий билет
              </label>
              <p className="mt-1 text-sm text-slate-900">{user.studentId}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Дата регистрации
            </label>
            <p className="mt-1 text-sm text-slate-900">
              {new Date(user.$createdAt).toLocaleDateString("ru-RU", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Последнее обновление
            </label>
            <p className="mt-1 text-sm text-slate-900">
              {new Date(user.$updatedAt).toLocaleDateString("ru-RU", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Действия */}
        <div className="flex justify-between pt-4 border-t border-slate-200">
          <div className="flex space-x-3">
            {!user.isActive ? (
              <Button
                variant="success"
                onClick={() => onActivate(user.$id)}
                icon={<UserCheck className="w-4 h-4" />}
              >
                Активировать
              </Button>
            ) : (
              <Button
                variant="warning"
                onClick={() => onDeactivate(user.$id)}
                icon={<UserX className="w-4 h-4" />}
              >
                Деактивировать
              </Button>
            )}
            <Button variant="outline" icon={<Edit className="w-4 h-4" />}>
              Редактировать
            </Button>
          </div>

          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </div>
    </Modal>
  );
};
