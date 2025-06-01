// src/components/teacher/StudentManager.tsx

"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  UserMinus,
  Edit3,
  Mail,
  Phone,
  GraduationCap,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  Download,
  Upload,
} from "lucide-react";
import { AttendanceStatus, UserRole } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PercentageBadge, StatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/utils/dates";
import { toast } from "react-toastify";

interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  phone?: string;
  group: string;
  enrollmentDate: string;
  isActive: boolean;
  attendance: {
    totalClasses: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    rate: number;
  };
  lastActivity: string;
  notes?: string;
}

interface StudentManagerProps {
  isOpen: boolean;
  onClose: () => void;
  groupId?: string;
  subjectId?: string;
}

export const StudentManager: React.FC<StudentManagerProps> = ({
  isOpen,
  onClose,
  groupId,
  subjectId,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(groupId || "all");
  const [attendanceFilter, setAttendanceFilter] = useState<
    "all" | "good" | "warning" | "critical"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Примерные данные студентов
  React.useEffect(() => {
    const mockStudents: Student[] = [
      {
        id: "1",
        name: "Иванов Иван Иванович",
        email: "ivanov@example.com",
        studentId: "ST20240001",
        phone: "+996700123456",
        group: "ИТ-301",
        enrollmentDate: "2024-09-01",
        isActive: true,
        attendance: {
          totalClasses: 45,
          present: 42,
          absent: 2,
          late: 1,
          excused: 0,
          rate: 95.6,
        },
        lastActivity: "2024-12-20T09:00:00Z",
        notes: "Отличный студент, активно участвует в занятиях",
      },
      {
        id: "2",
        name: "Петрова Анна Сергеевна",
        email: "petrova@example.com",
        studentId: "ST20240002",
        group: "ИТ-301",
        enrollmentDate: "2024-09-01",
        isActive: true,
        attendance: {
          totalClasses: 45,
          present: 38,
          absent: 5,
          late: 2,
          excused: 0,
          rate: 84.4,
        },
        lastActivity: "2024-12-19T14:30:00Z",
      },
      {
        id: "3",
        name: "Сидоров Петр Александрович",
        email: "sidorov@example.com",
        studentId: "ST20240003",
        phone: "+996700789012",
        group: "ИТ-201",
        enrollmentDate: "2024-09-01",
        isActive: true,
        attendance: {
          totalClasses: 42,
          present: 28,
          absent: 12,
          late: 2,
          excused: 0,
          rate: 66.7,
        },
        lastActivity: "2024-12-18T11:15:00Z",
        notes: "Требует дополнительного внимания",
      },
      {
        id: "4",
        name: "Морозова Елена Викторовна",
        email: "morozova@example.com",
        studentId: "ST20240004",
        group: "ИТ-401",
        enrollmentDate: "2023-09-01",
        isActive: false,
        attendance: {
          totalClasses: 38,
          present: 20,
          absent: 15,
          late: 3,
          excused: 0,
          rate: 52.6,
        },
        lastActivity: "2024-12-10T16:45:00Z",
        notes: "Академический отпуск",
      },
    ];

    setStudents(mockStudents);
  }, []);

  // Фильтрация студентов
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGroup =
        selectedGroup === "all" || student.group === selectedGroup;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && student.isActive) ||
        (statusFilter === "inactive" && !student.isActive);

      const matchesAttendance =
        attendanceFilter === "all" ||
        (attendanceFilter === "good" && student.attendance.rate >= 85) ||
        (attendanceFilter === "warning" &&
          student.attendance.rate >= 70 &&
          student.attendance.rate < 85) ||
        (attendanceFilter === "critical" && student.attendance.rate < 70);

      return (
        matchesSearch && matchesGroup && matchesStatus && matchesAttendance
      );
    });
  }, [students, searchTerm, selectedGroup, statusFilter, attendanceFilter]);

  // Статистика
  const stats = useMemo(() => {
    const total = filteredStudents.length;
    const active = filteredStudents.filter((s) => s.isActive).length;
    const avgAttendance =
      total > 0
        ? filteredStudents.reduce((sum, s) => sum + s.attendance.rate, 0) /
          total
        : 0;
    const criticalAttendance = filteredStudents.filter(
      (s) => s.attendance.rate < 70
    ).length;

    return {
      total,
      active,
      avgAttendance: Math.round(avgAttendance),
      criticalAttendance,
    };
  }, [filteredStudents]);

  const getAttendanceStatus = (rate: number) => {
    if (rate >= 85) return { color: "success", label: "Хорошо" };
    if (rate >= 70) return { color: "warning", label: "Внимание" };
    return { color: "danger", label: "Критично" };
  };

  const availableGroups = [...new Set(students.map((s) => s.group))];

  // Обработчики изменения значений для Select
  const handleGroupChange = (value: string | number) => {
    setSelectedGroup(String(value));
  };

  const handleStatusFilterChange = (value: string | number) => {
    setStatusFilter(String(value) as "all" | "active" | "inactive");
  };

  const handleAttendanceFilterChange = (value: string | number) => {
    setAttendanceFilter(
      String(value) as "all" | "good" | "warning" | "critical"
    );
  };

  // Колонки таблицы
  const columns = [
    {
      key: "student",
      title: "Студент",
      render: (_: any, student: Student) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
            {student.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <div className="font-medium text-slate-900">{student.name}</div>
            <div className="text-sm text-slate-500">{student.studentId}</div>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      title: "Контакты",
      render: (_: any, student: Student) => (
        <div>
          <div className="text-sm text-slate-900">{student.email}</div>
          {student.phone && (
            <div className="text-sm text-slate-500">{student.phone}</div>
          )}
        </div>
      ),
    },
    {
      key: "group",
      title: "Группа",
      dataIndex: "group",
      render: (group: string) => <Badge variant="outline">{group}</Badge>,
    },
    {
      key: "attendance",
      title: "Посещаемость",
      render: (_: any, student: Student) => {
        const status = getAttendanceStatus(student.attendance.rate);
        return (
          <div className="flex items-center space-x-2">
            <PercentageBadge percentage={student.attendance.rate} />
            <StatusBadge status={status.color as any}>
              {status.label}
            </StatusBadge>
          </div>
        );
      },
    },
    {
      key: "activity",
      title: "Последняя активность",
      render: (_: any, student: Student) => (
        <div className="text-sm text-slate-600">
          {formatDate(new Date(student.lastActivity), "datetime")}
        </div>
      ),
    },
    {
      key: "status",
      title: "Статус",
      render: (_: any, student: Student) => (
        <StatusBadge status={student.isActive ? "active" : "inactive"}>
          {student.isActive ? "Активен" : "Неактивен"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      title: "Действия",
      render: (_: any, student: Student) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedStudent(student);
              setShowStudentDetails(true);
            }}
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`mailto:${student.email}`)}
          >
            <Mail className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleBulkAction = async (action: string) => {
    setIsLoading(true);
    try {
      console.log(`Bulk action ${action} for students:`, selectedStudents);
      // Здесь будет логика массовых операций

      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(
        `${action} применен к ${selectedStudents.length} студентам`
      );
      setSelectedStudents([]);
      setShowBulkActions(false);
    } catch (error) {
      toast.error("Ошибка при выполнении операции");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportStudents = () => {
    const csv = [
      [
        "Имя",
        "Email",
        "Номер студента",
        "Группа",
        "Посещаемость",
        "Статус",
      ].join(","),
      ...filteredStudents.map((student) =>
        [
          student.name,
          student.email,
          student.studentId,
          student.group,
          `${student.attendance.rate}%`,
          student.isActive ? "Активен" : "Неактивен",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Управление студентами"
        size="full"
      >
        <div className="space-y-6">
          {/* Статистика */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card padding="md">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">
                  {stats.total}
                </div>
                <div className="text-sm text-slate-600">Всего студентов</div>
              </div>
            </Card>
            <Card padding="md">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {stats.active}
                </div>
                <div className="text-sm text-slate-600">Активных</div>
              </div>
            </Card>
            <Card padding="md">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.avgAttendance}%
                </div>
                <div className="text-sm text-slate-600">
                  Средняя посещаемость
                </div>
              </div>
            </Card>
            <Card padding="md">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stats.criticalAttendance}
                </div>
                <div className="text-sm text-slate-600">Требуют внимания</div>
              </div>
            </Card>
          </div>

          {/* Фильтры и действия */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Поиск студентов..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />

              <Select
                options={[
                  { value: "all", label: "Все группы" },
                  ...availableGroups.map((group) => ({
                    value: group,
                    label: group,
                  })),
                ]}
                value={selectedGroup}
                onChange={handleGroupChange}
              />

              <Select
                options={[
                  { value: "all", label: "Все статусы" },
                  { value: "active", label: "Активные" },
                  { value: "inactive", label: "Неактивные" },
                ]}
                value={statusFilter}
                onChange={handleStatusFilterChange}
              />

              <Select
                options={[
                  { value: "all", label: "Все уровни" },
                  { value: "good", label: "Хорошая (85%+)" },
                  { value: "warning", label: "Внимание (70-84%)" },
                  { value: "critical", label: "Критично (<70%)" },
                ]}
                value={attendanceFilter}
                onChange={handleAttendanceFilterChange}
              />
            </div>

            <div className="flex items-center space-x-2">
              {selectedStudents.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setShowBulkActions(true)}
                  icon={<MoreHorizontal className="w-4 h-4" />}
                >
                  Массовые действия ({selectedStudents.length})
                </Button>
              )}

              <Button
                variant="outline"
                onClick={handleExportStudents}
                icon={<Download className="w-4 h-4" />}
              >
                Экспорт
              </Button>
            </div>
          </div>

          {/* Таблица студентов */}
          {filteredStudents.length > 0 ? (
            <Card padding="none">
              <Table
                columns={columns}
                data={filteredStudents}
                selectable
                selectedRows={selectedStudents}
                onSelectionChange={setSelectedStudents}
                rowKey="id"
                pagination={{
                  current: 1,
                  pageSize: 10,
                  total: filteredStudents.length,
                  onChange: (page) => console.log("Page change:", page),
                }}
              />
            </Card>
          ) : (
            <EmptyState
              icon={<Users className="w-12 h-12 text-slate-400" />}
              title="Студенты не найдены"
              description="По выбранным фильтрам не найдено ни одного студента"
              action={{
                label: "Сбросить фильтры",
                onClick: () => {
                  setSearchTerm("");
                  setSelectedGroup("all");
                  setStatusFilter("all");
                  setAttendanceFilter("all");
                },
              }}
            />
          )}
        </div>
      </Modal>

      {/* Модал деталей студента */}
      {selectedStudent && (
        <Modal
          isOpen={showStudentDetails}
          onClose={() => {
            setShowStudentDetails(false);
            setSelectedStudent(null);
          }}
          title={`Профиль студента: ${selectedStudent.name}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-4">
                  Основная информация
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Полное имя
                    </label>
                    <p className="text-slate-900">{selectedStudent.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Номер студента
                    </label>
                    <p className="text-slate-900">
                      {selectedStudent.studentId}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Email
                    </label>
                    <p className="text-slate-900">{selectedStudent.email}</p>
                  </div>
                  {selectedStudent.phone && (
                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        Телефон
                      </label>
                      <p className="text-slate-900">{selectedStudent.phone}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Группа
                    </label>
                    <p className="text-slate-900">{selectedStudent.group}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-4">
                  Статистика посещаемости
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Всего занятий:</span>
                    <span className="font-medium">
                      {selectedStudent.attendance.totalClasses}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Присутствовал:</span>
                    <span className="font-medium text-emerald-600">
                      {selectedStudent.attendance.present}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Отсутствовал:</span>
                    <span className="font-medium text-red-600">
                      {selectedStudent.attendance.absent}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Опоздал:</span>
                    <span className="font-medium text-orange-600">
                      {selectedStudent.attendance.late}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-slate-600">Общая посещаемость:</span>
                    <PercentageBadge
                      percentage={selectedStudent.attendance.rate}
                    />
                  </div>
                </div>
              </div>
            </div>

            {selectedStudent.notes && (
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Примечания
                </h3>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">
                  {selectedStudent.notes}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowStudentDetails(false)}
              >
                Закрыть
              </Button>
              <Button
                variant="primary"
                onClick={() => window.open(`mailto:${selectedStudent.email}`)}
                icon={<Mail className="w-4 h-4" />}
              >
                Написать email
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Модал массовых действий */}
      <Modal
        isOpen={showBulkActions}
        onClose={() => setShowBulkActions(false)}
        title={`Массовые действия для ${selectedStudents.length} студентов`}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Выберите действие для применения к {selectedStudents.length}{" "}
            выбранным студентам:
          </p>

          <div className="grid grid-cols-1 gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => handleBulkAction("send_notification")}
              disabled={isLoading}
              icon={<Mail className="w-4 h-4" />}
            >
              Отправить уведомление
            </Button>

            <Button
              variant="outline"
              fullWidth
              onClick={() => handleBulkAction("export_data")}
              disabled={isLoading}
              icon={<Download className="w-4 h-4" />}
            >
              Экспортировать данные
            </Button>

            <Button
              variant="outline"
              fullWidth
              onClick={() => handleBulkAction("mark_inactive")}
              disabled={isLoading}
              icon={<UserMinus className="w-4 h-4" />}
            >
              Отметить как неактивные
            </Button>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowBulkActions(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
