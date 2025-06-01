// src/components/teacher/AttendanceTab.tsx

"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Filter,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Edit3,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import {
  AttendanceStatus,
  getAttendanceStatusLabel,
  getAttendanceStatusColor,
} from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import { EmptyState, ComingSoonState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/utils/dates";

interface AttendanceRecord {
  id: string;
  student: {
    id: string;
    name: string;
    group: string;
  };
  subject: string;
  date: string;
  time: string;
  status: AttendanceStatus;
  notes?: string;
  markedBy: string;
  markedAt: string;
}

interface AttendanceSummary {
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
}

export const AttendanceTab: React.FC = () => {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState("week"); // week, month, custom
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Примерные данные для демонстрации
  const mockAttendanceData: AttendanceRecord[] = [
    {
      id: "1",
      student: { id: "st1", name: "Иванов Иван Иванович", group: "ИТ-301" },
      subject: "Математический анализ",
      date: "2024-12-20",
      time: "09:00",
      status: AttendanceStatus.PRESENT,
      markedBy: user?.name || "",
      markedAt: "2024-12-20T09:05:00Z",
    },
    {
      id: "2",
      student: { id: "st2", name: "Петров Петр Петрович", group: "ИТ-301" },
      subject: "Математический анализ",
      date: "2024-12-20",
      time: "09:00",
      status: AttendanceStatus.ABSENT,
      notes: "Болен",
      markedBy: user?.name || "",
      markedAt: "2024-12-20T09:05:00Z",
    },
    {
      id: "3",
      student: { id: "st3", name: "Сидоров Сидор Сидорович", group: "ИТ-301" },
      subject: "Линейная алгебра",
      date: "2024-12-20",
      time: "11:45",
      status: AttendanceStatus.LATE,
      notes: "Опоздал на 10 минут",
      markedBy: user?.name || "",
      markedAt: "2024-12-20T11:55:00Z",
    },
    {
      id: "4",
      student: {
        id: "st4",
        name: "Козлов Константин Константинович",
        group: "ИТ-201",
      },
      subject: "Дискретная математика",
      date: "2024-12-19",
      time: "14:00",
      status: AttendanceStatus.EXCUSED,
      notes: "Справка",
      markedBy: user?.name || "",
      markedAt: "2024-12-19T14:05:00Z",
    },
  ];

  // Фильтрация данных
  const filteredData = mockAttendanceData.filter((record) => {
    const matchesSearch =
      record.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup =
      selectedGroup === "all" || record.student.group === selectedGroup;
    const matchesSubject =
      selectedSubject === "all" || record.subject === selectedSubject;
    const matchesStatus =
      selectedStatus === "all" || record.status === selectedStatus;

    return matchesSearch && matchesGroup && matchesSubject && matchesStatus;
  });

  // Расчет статистики
  const calculateSummary = (records: AttendanceRecord[]): AttendanceSummary => {
    const totalClasses = records.length;
    const present = records.filter(
      (r) => r.status === AttendanceStatus.PRESENT
    ).length;
    const absent = records.filter(
      (r) => r.status === AttendanceStatus.ABSENT
    ).length;
    const late = records.filter(
      (r) => r.status === AttendanceStatus.LATE
    ).length;
    const excused = records.filter(
      (r) => r.status === AttendanceStatus.EXCUSED
    ).length;
    const attendanceRate =
      totalClasses > 0
        ? Math.round(((present + late) / totalClasses) * 100)
        : 0;

    return { totalClasses, present, absent, late, excused, attendanceRate };
  };

  const summary = calculateSummary(filteredData);

  // Получение уникальных значений для фильтров
  const availableGroups = [
    ...new Set(mockAttendanceData.map((r) => r.student.group)),
  ];
  const availableSubjects = [
    ...new Set(mockAttendanceData.map((r) => r.subject)),
  ];

  // Обработчики изменения значений для Select
  const handleGroupChange = (value: string | number) => {
    setSelectedGroup(String(value));
  };

  const handleSubjectChange = (value: string | number) => {
    setSelectedSubject(String(value));
  };

  const handleStatusChange = (value: string | number) => {
    setSelectedStatus(String(value));
  };

  const handleDateFilterChange = (value: string | number) => {
    setDateFilter(String(value));
  };

  // Колонки для таблицы
  const columns = [
    {
      key: "student",
      title: "Студент",
      dataIndex: "student",
      render: (student: any) => (
        <div>
          <div className="font-medium text-slate-900">{student.name}</div>
          <div className="text-sm text-slate-500">{student.group}</div>
        </div>
      ),
    },
    {
      key: "subject",
      title: "Предмет",
      dataIndex: "subject",
    },
    {
      key: "date",
      title: "Дата и время",
      render: (_: any, record: AttendanceRecord) => (
        <div>
          <div className="font-medium text-slate-900">
            {formatDate(new Date(record.date), "short")}
          </div>
          <div className="text-sm text-slate-500">{record.time}</div>
        </div>
      ),
    },
    {
      key: "status",
      title: "Статус",
      dataIndex: "status",
      render: (status: AttendanceStatus) => (
        <Badge
          variant={
            status === AttendanceStatus.PRESENT
              ? "success"
              : status === AttendanceStatus.LATE
              ? "warning"
              : status === AttendanceStatus.EXCUSED
              ? "info"
              : "danger"
          }
        >
          {getAttendanceStatusLabel(status)}
        </Badge>
      ),
    },
    {
      key: "notes",
      title: "Примечания",
      dataIndex: "notes",
      render: (notes: string) => (
        <span className="text-sm text-slate-600">{notes || "—"}</span>
      ),
    },
    {
      key: "actions",
      title: "Действия",
      render: (_: any, record: AttendanceRecord) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Eye className="w-4 h-4" />}
            onClick={() => {
              setSelectedRecord(record);
              setShowDetailsModal(true);
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Edit3 className="w-4 h-4" />}
            onClick={() => {
              // Здесь будет логика редактирования
              console.log("Edit record:", record.id);
            }}
          />
        </div>
      ),
    },
  ];

  const handleExport = () => {
    // Здесь будет логика экспорта
    console.log("Экспорт данных посещаемости");
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Управление посещаемостью
          </h2>
          <p className="text-slate-600 mt-1">
            Просмотр и управление записями посещаемости студентов
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Download className="w-4 h-4" />}
          onClick={handleExport}
        >
          Экспорт данных
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Всего записей</p>
              <p className="text-2xl font-bold text-slate-900">
                {summary.totalClasses}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Присутствуют</p>
              <p className="text-2xl font-bold text-emerald-600">
                {summary.present}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Отсутствуют</p>
              <p className="text-2xl font-bold text-red-600">
                {summary.absent}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Опоздали</p>
              <p className="text-2xl font-bold text-orange-600">
                {summary.late}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-400" />
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Посещаемость</p>
              <p className="text-2xl font-bold text-blue-600">
                {summary.attendanceRate}%
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </Card>
      </div>

      {/* Фильтры */}
      <Card padding="md">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Input
            placeholder="Поиск по студенту или предмету..."
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
            placeholder="Группа"
          />

          <Select
            options={[
              { value: "all", label: "Все предметы" },
              ...availableSubjects.map((subject) => ({
                value: subject,
                label: subject,
              })),
            ]}
            value={selectedSubject}
            onChange={handleSubjectChange}
            placeholder="Предмет"
          />

          <Select
            options={[
              { value: "all", label: "Все статусы" },
              { value: AttendanceStatus.PRESENT, label: "Присутствует" },
              { value: AttendanceStatus.ABSENT, label: "Отсутствует" },
              { value: AttendanceStatus.LATE, label: "Опоздал" },
              { value: AttendanceStatus.EXCUSED, label: "Уважительная" },
            ]}
            value={selectedStatus}
            onChange={handleStatusChange}
            placeholder="Статус"
          />

          <Select
            options={[
              { value: "week", label: "Эта неделя" },
              { value: "month", label: "Этот месяц" },
              { value: "custom", label: "Выбрать период" },
            ]}
            value={dateFilter}
            onChange={handleDateFilterChange}
            placeholder="Период"
          />
        </div>
      </Card>

      {/* Таблица данных */}
      {isLoading ? (
        <LoadingSpinner size="lg" text="Загрузка данных посещаемости..." />
      ) : filteredData.length > 0 ? (
        <Card padding="none">
          <Table
            columns={columns}
            data={filteredData}
            pagination={{
              current: 1,
              pageSize: 10,
              total: filteredData.length,
              onChange: (page, pageSize) => {
                console.log("Pagination change:", page, pageSize);
              },
            }}
          />
        </Card>
      ) : (
        <EmptyState
          icon={<Users className="w-12 h-12 text-slate-400" />}
          title="Нет данных"
          description="По выбранным фильтрам не найдено записей о посещаемости"
          action={{
            label: "Сбросить фильтры",
            onClick: () => {
              setSearchTerm("");
              setSelectedGroup("all");
              setSelectedSubject("all");
              setSelectedStatus("all");
              setDateFilter("week");
            },
          }}
        />
      )}

      {/* Модальное окно деталей */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedRecord(null);
        }}
        title="Детали записи посещаемости"
        size="md"
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Студент
                </label>
                <p className="text-slate-900">{selectedRecord.student.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Группа
                </label>
                <p className="text-slate-900">{selectedRecord.student.group}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Предмет
                </label>
                <p className="text-slate-900">{selectedRecord.subject}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Дата и время
                </label>
                <p className="text-slate-900">
                  {formatDate(new Date(selectedRecord.date), "short")} в{" "}
                  {selectedRecord.time}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Статус
                </label>
                <div className="mt-1">
                  <Badge
                    variant={
                      selectedRecord.status === AttendanceStatus.PRESENT
                        ? "success"
                        : selectedRecord.status === AttendanceStatus.LATE
                        ? "warning"
                        : selectedRecord.status === AttendanceStatus.EXCUSED
                        ? "info"
                        : "danger"
                    }
                  >
                    {getAttendanceStatusLabel(selectedRecord.status)}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Отметил
                </label>
                <p className="text-slate-900">{selectedRecord.markedBy}</p>
              </div>
            </div>

            {selectedRecord.notes && (
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Примечания
                </label>
                <p className="text-slate-900 mt-1">{selectedRecord.notes}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-700">
                Время отметки
              </label>
              <p className="text-slate-600 text-sm">
                {formatDate(new Date(selectedRecord.markedAt), "datetime")}
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedRecord(null);
                }}
              >
                Закрыть
              </Button>
              <Button
                variant="primary"
                icon={<Edit3 className="w-4 h-4" />}
                onClick={() => {
                  // Здесь будет логика редактирования
                  console.log("Edit record:", selectedRecord.id);
                }}
              >
                Редактировать
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
