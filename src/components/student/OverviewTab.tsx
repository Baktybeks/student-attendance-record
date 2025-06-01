// src/components/student/OverviewTab.tsx

"use client";

import React from "react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  TrendingUp,
  TrendingDown,
  MapPin,
  Clock,
  User,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/utils/dates";
import { formatPercentage } from "@/utils/format";
import { AttendanceStatus, getAttendanceStatusLabel } from "@/types";

interface OverviewTabProps {
  user: any;
  group: any;
  subjects: any[];
  attendanceStats: any;
  attendanceHistory: any[];
  todaysSchedule: any[];
  today: Date;
}

export function OverviewTab({
  user,
  group,
  subjects,
  attendanceStats,
  attendanceHistory,
  todaysSchedule,
  today,
}: OverviewTabProps) {
  const attendanceRate = attendanceStats?.attendanceRate || 0;

  return (
    <div className="space-y-8">
      {/* Приветствие */}
      <Card padding="md">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Добро пожаловать, {user?.name?.split(" ")[0]}!
              </h1>
              <p className="text-purple-100">
                Сегодня у вас {todaysSchedule.length} занятий. Ваша
                посещаемость: {formatPercentage(attendanceRate)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {Math.round(attendanceRate)}%
              </div>
              <div className="text-sm text-purple-100">Посещаемость</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Посещено занятий"
          value={attendanceStats?.presentCount || 0}
          icon={CheckCircle}
          color="bg-emerald-500"
          trend={`+${attendanceStats?.presentCount || 0} всего`}
          trendUp={true}
        />
        <StatCard
          title="Пропущено"
          value={attendanceStats?.absentCount || 0}
          icon={XCircle}
          color="bg-red-500"
          trend={`${attendanceStats?.absentCount || 0} всего`}
          trendUp={false}
        />
        <StatCard
          title="Опозданий"
          value={attendanceStats?.lateCount || 0}
          icon={AlertCircle}
          color="bg-orange-500"
          trend={`${attendanceStats?.lateCount || 0} всего`}
        />
        <StatCard
          title="Изучаемых предметов"
          value={subjects.length}
          icon={BookOpen}
          color="bg-blue-500"
          trend={`В ${group?.course || 0} семестре`}
          trendUp={true}
        />
      </div>

      {/* Расписание на сегодня */}
      <Card padding="md">
        <div className="border-b border-slate-200 pb-4 mb-6">
          <h3 className="text-lg font-medium text-slate-900">
            Расписание на сегодня (
            {today.toLocaleDateString("ru-RU", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
            )
          </h3>
        </div>

        {todaysSchedule.length > 0 ? (
          <div className="space-y-4">
            {todaysSchedule.map((item, index) => (
              <ScheduleItem key={index} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-slate-900 mb-2">
              Свободный день
            </h4>
            <p className="text-slate-600">На сегодня у вас нет занятий</p>
          </div>
        )}
      </Card>

      {/* Последние отметки посещаемости */}
      <Card padding="md">
        <div className="border-b border-slate-200 pb-4 mb-6">
          <h3 className="text-lg font-medium text-slate-900">
            Недавняя посещаемость
          </h3>
        </div>

        {attendanceHistory.length > 0 ? (
          <div className="space-y-3">
            {attendanceHistory.slice(0, 5).map((record, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-slate-500">
                    {formatDate(record.$createdAt, "short")}
                  </div>
                  <div className="text-sm font-medium text-slate-900">
                    Занятие #{record.classId.slice(-6)}
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
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
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
  value: number;
  icon: React.ElementType;
  color: string;
  trend?: string;
  trendUp?: boolean;
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  trendUp,
}: StatCardProps) {
  return (
    <Card padding="md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {trend && (
            <p className="text-sm text-slate-500 mt-1 flex items-center">
              {trendUp !== undefined &&
                (trendUp ? (
                  <TrendingUp className="w-4 h-4 mr-1 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1 text-red-500" />
                ))}
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
}

// Компонент элемента расписания
interface ScheduleItemProps {
  item: {
    time: string;
    subject: string;
    teacher: string;
    classroom: string;
    type: string;
  };
}

function ScheduleItem({ item }: ScheduleItemProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="text-center">
          <div className="text-sm font-medium text-slate-900">
            {item.time.split("-")[0]}
          </div>
          <div className="text-xs text-slate-500">
            {item.time.split("-")[1]}
          </div>
        </div>
        <div className="w-px h-12 bg-slate-200"></div>
        <div>
          <h4 className="text-sm font-medium text-slate-900">{item.subject}</h4>
          <p className="text-sm text-slate-600">{item.teacher}</p>
          <div className="flex items-center space-x-2 mt-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-500">{item.classroom}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <Badge
          variant={
            item.type === "Лекция"
              ? "primary"
              : item.type === "Практика"
              ? "success"
              : "secondary"
          }
        >
          {item.type}
        </Badge>
      </div>
    </div>
  );
}
