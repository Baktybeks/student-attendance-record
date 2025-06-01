// src/components/student/AttendanceTab.tsx

"use client";

import React, { useState } from "react";
import {
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
} from "lucide-react";
import { toast } from "react-toastify";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/utils/dates";
import { AttendanceStatus, getAttendanceStatusLabel } from "@/types";

interface AttendanceTabProps {
  attendanceHistory: any[];
  attendanceStats: any;
  subjects: any[];
}

export function AttendanceTab({
  attendanceHistory,
  attendanceStats,
  subjects,
}: AttendanceTabProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Фильтрация данных посещаемости
  const filteredAttendance = attendanceHistory.filter((record) => {
    if (selectedSubject !== "all") {
      // TODO: добавить фильтрацию по предмету когда будут связанные данные
    }
    return true;
  });

  const getAttendanceGoal = (rate: number) => {
    if (rate >= 95)
      return { label: "Отлично", color: "text-emerald-600", icon: TrendingUp };
    if (rate >= 85)
      return { label: "Хорошо", color: "text-blue-600", icon: TrendingUp };
    if (rate >= 70)
      return {
        label: "Удовлетворительно",
        color: "text-orange-600",
        icon: TrendingUp,
      };
    return {
      label: "Требует внимания",
      color: "text-red-600",
      icon: TrendingDown,
    };
  };

  const goal = getAttendanceGoal(attendanceStats?.attendanceRate || 0);

  return (
    <div className="space-y-6">
      {/* Заголовок и фильтры */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Моя посещаемость</h2>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            icon={<Filter className="w-4 h-4" />}
          >
            Фильтры
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("📊 Экспорт посещаемости в разработке")}
            icon={<Download className="w-4 h-4" />}
          >
            Экспорт
          </Button>
        </div>
      </div>

      {/* Панель фильтров */}
      {showFilters && (
        <Card padding="md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Период
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="week">За неделю</option>
                <option value="month">За месяц</option>
                <option value="semester">За семестр</option>
                <option value="year">За год</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Предмет
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">Все предметы</option>
                {subjects.map((subject) => (
                  <option key={subject.$id} value={subject.$id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => toast.info("Фильтры применены")}
                className="w-full"
              >
                Применить
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Основная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Общая посещаемость"
          value={`${Math.round(attendanceStats?.attendanceRate || 0)}%`}
          icon={BarChart3}
          color="bg-purple-500"
          subtitle="от всех занятий"
          trend={goal.label}
          trendColor={goal.color}
        />

        <StatCard
          title="Присутствовал"
          value={attendanceStats?.presentCount || 0}
          icon={CheckCircle}
          color="bg-emerald-500"
          subtitle="занятий"
          trend="+2 за неделю"
          trendColor="text-emerald-600"
        />

        <StatCard
          title="Отсутствовал"
          value={attendanceStats?.absentCount || 0}
          icon={XCircle}
          color="bg-red-500"
          subtitle="занятий"
          trend={`${attendanceStats?.absentCount || 0} всего`}
          trendColor="text-red-600"
        />

        <StatCard
          title="Опозданий"
          value={attendanceStats?.lateCount || 0}
          icon={AlertCircle}
          color="bg-orange-500"
          subtitle="раз"
          trend={`${attendanceStats?.lateCount || 0} всего`}
          trendColor="text-orange-600"
        />
      </div>

      {/* Цель посещаемости */}
      <Card padding="md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Цель посещаемости
            </h3>
            <p className="text-sm text-slate-600">
              Стремитесь к посещаемости выше 90% для отличной успеваемости
            </p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${goal.color}`}>
              {Math.round(attendanceStats?.attendanceRate || 0)}%
            </div>
            <div
              className={`text-sm flex items-center justify-end ${goal.color}`}
            >
              <goal.icon className="w-4 h-4 mr-1" />
              {goal.label}
            </div>
          </div>
        </div>

        {/* Прогресс бар */}
        <div className="mt-4">
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(
                  attendanceStats?.attendanceRate || 0,
                  100
                )}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>90%</span>
            <span>100%</span>
          </div>
        </div>
      </Card>

      {/* Детальная статистика по статусам */}
      <Card padding="md">
        <h3 className="text-lg font-medium text-slate-900 mb-4">
          Детальная статистика
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-emerald-900">
              {attendanceStats?.presentCount || 0}
            </div>
            <div className="text-sm text-emerald-600">Присутствовал</div>
            <div className="text-xs text-emerald-500 mt-1">
              {attendanceStats?.totalClasses > 0
                ? Math.round(
                    ((attendanceStats?.presentCount || 0) /
                      attendanceStats.totalClasses) *
                      100
                  )
                : 0}
              % от всех
            </div>
          </div>

          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-900">
              {attendanceStats?.absentCount || 0}
            </div>
            <div className="text-sm text-red-600">Отсутствовал</div>
            <div className="text-xs text-red-500 mt-1">
              {attendanceStats?.totalClasses > 0
                ? Math.round(
                    ((attendanceStats?.absentCount || 0) /
                      attendanceStats.totalClasses) *
                      100
                  )
                : 0}
              % от всех
            </div>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <AlertCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-900">
              {attendanceStats?.lateCount || 0}
            </div>
            <div className="text-sm text-orange-600">Опозданий</div>
            <div className="text-xs text-orange-500 mt-1">
              {attendanceStats?.totalClasses > 0
                ? Math.round(
                    ((attendanceStats?.lateCount || 0) /
                      attendanceStats.totalClasses) *
                      100
                  )
                : 0}
              % от всех
            </div>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-900">
              {attendanceStats?.excusedCount || 0}
            </div>
            <div className="text-sm text-blue-600">Уважительных</div>
            <div className="text-xs text-blue-500 mt-1">
              {attendanceStats?.totalClasses > 0
                ? Math.round(
                    ((attendanceStats?.excusedCount || 0) /
                      attendanceStats.totalClasses) *
                      100
                  )
                : 0}
              % от всех
            </div>
          </div>
        </div>
      </Card>

      {/* История посещений */}
      <Card padding="md">
        <div className="border-b border-slate-200 pb-4 mb-6">
          <h3 className="text-lg font-medium text-slate-900">
            История посещений
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Последние отметки о посещаемости
          </p>
        </div>

        {filteredAttendance.length > 0 ? (
          <div className="space-y-3">
            {filteredAttendance.map((record, index) => (
              <AttendanceRecord key={index} record={record} />
            ))}

            {filteredAttendance.length > 10 && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => toast.info("Показать больше записей")}
                >
                  Показать больше
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-slate-900 mb-2">
              Нет данных о посещаемости
            </h4>
            <p className="text-slate-600">
              Данные о посещаемости появятся после проведения занятий
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

// Компонент карточки статистики
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
  trend?: string;
  trendColor?: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  trend,
  trendColor = "text-slate-500",
}: StatCardProps) {
  return (
    <Card padding="md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
          {trend && <p className={`text-xs mt-2 ${trendColor}`}>{trend}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
}

// Компонент записи о посещаемости
function AttendanceRecord({ record }: { record: any }) {
  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case AttendanceStatus.ABSENT:
        return <XCircle className="w-4 h-4 text-red-600" />;
      case AttendanceStatus.LATE:
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case AttendanceStatus.EXCUSED:
        return <Target className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200">
      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg border border-slate-200">
          {getStatusIcon(record.status)}
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-slate-900">
              Занятие #{record.classId?.slice(-6) || "N/A"}
            </span>
            <Calendar className="w-3 h-3 text-slate-400" />
            <span className="text-sm text-slate-500">
              {formatDate(record.$createdAt, "datetime")}
            </span>
          </div>

          {record.notes && (
            <p className="text-xs text-slate-500 mt-1">{record.notes}</p>
          )}
        </div>
      </div>

      <Badge
        variant={
          record.status === AttendanceStatus.PRESENT
            ? "success"
            : record.status === AttendanceStatus.ABSENT
            ? "danger"
            : record.status === AttendanceStatus.LATE
            ? "warning"
            : "info"
        }
      >
        {getAttendanceStatusLabel(record.status)}
      </Badge>
    </div>
  );
}
