// src/components/teacher/AnalyticsTab.tsx

"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Calendar,
  Award,
  AlertTriangle,
  Download,
  Filter,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { AttendanceStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { ComingSoonState } from "@/components/ui/EmptyState";
import { PercentageBadge } from "@/components/ui/Badge";

interface AnalyticsData {
  overview: {
    totalStudents: number;
    totalClasses: number;
    averageAttendance: number;
    trend: "up" | "down" | "stable";
    trendValue: number;
  };
  groupStats: Array<{
    group: string;
    totalStudents: number;
    averageAttendance: number;
    lastWeekAttendance: number;
    trend: "up" | "down" | "stable";
  }>;
  subjectStats: Array<{
    subject: string;
    totalClasses: number;
    averageAttendance: number;
    bestGroup: string;
    worstGroup: string;
  }>;
  weeklyTrends: Array<{
    week: string;
    attendance: number;
  }>;
  topPerformers: Array<{
    student: string;
    group: string;
    attendance: number;
  }>;
  needsAttention: Array<{
    student: string;
    group: string;
    attendance: number;
    issuesCount: number;
  }>;
}

export const AnalyticsTab: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");

  // Примерные данные для демонстрации
  const mockAnalyticsData: AnalyticsData = {
    overview: {
      totalStudents: 150,
      totalClasses: 45,
      averageAttendance: 87.5,
      trend: "up",
      trendValue: 3.2,
    },
    groupStats: [
      {
        group: "ИТ-301",
        totalStudents: 25,
        averageAttendance: 89.2,
        lastWeekAttendance: 92.0,
        trend: "up",
      },
      {
        group: "ИТ-201",
        totalStudents: 22,
        averageAttendance: 85.7,
        lastWeekAttendance: 82.1,
        trend: "down",
      },
      {
        group: "ИТ-401",
        totalStudents: 28,
        averageAttendance: 88.1,
        lastWeekAttendance: 87.9,
        trend: "stable",
      },
    ],
    subjectStats: [
      {
        subject: "Математический анализ",
        totalClasses: 16,
        averageAttendance: 91.2,
        bestGroup: "ИТ-301",
        worstGroup: "ИТ-201",
      },
      {
        subject: "Линейная алгебра",
        totalClasses: 14,
        averageAttendance: 85.8,
        bestGroup: "ИТ-401",
        worstGroup: "ИТ-201",
      },
      {
        subject: "Дискретная математика",
        totalClasses: 15,
        averageAttendance: 86.4,
        bestGroup: "ИТ-201",
        worstGroup: "ИТ-301",
      },
    ],
    weeklyTrends: [
      { week: "Нед 1", attendance: 85.2 },
      { week: "Нед 2", attendance: 87.1 },
      { week: "Нед 3", attendance: 88.5 },
      { week: "Нед 4", attendance: 87.8 },
    ],
    topPerformers: [
      { student: "Иванов Иван", group: "ИТ-301", attendance: 98.5 },
      { student: "Петрова Анна", group: "ИТ-401", attendance: 97.2 },
      { student: "Сидоров Петр", group: "ИТ-301", attendance: 96.8 },
      { student: "Козлова Мария", group: "ИТ-201", attendance: 95.1 },
      { student: "Федоров Олег", group: "ИТ-401", attendance: 94.7 },
    ],
    needsAttention: [
      {
        student: "Морозов Сергей",
        group: "ИТ-201",
        attendance: 62.3,
        issuesCount: 8,
      },
      {
        student: "Кузнецова Елена",
        group: "ИТ-301",
        attendance: 68.9,
        issuesCount: 6,
      },
      {
        student: "Попов Алексей",
        group: "ИТ-401",
        attendance: 71.2,
        issuesCount: 5,
      },
    ],
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 bg-slate-400 rounded-full" />;
    }
  };

  const getTrendColor = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "text-emerald-600";
      case "down":
        return "text-red-600";
      default:
        return "text-slate-600";
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-emerald-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-orange-600";
    return "text-red-600";
  };

  const handleExportReport = () => {
    console.log("Экспорт аналитического отчета");
    // Здесь будет логика экспорта отчета
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и фильтры */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Аналитика и статистика
          </h2>
          <p className="text-slate-600 mt-1">
            Подробная статистика посещаемости и успеваемости студентов
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Select
            options={[
              { value: "week", label: "За неделю" },
              { value: "month", label: "За месяц" },
              { value: "semester", label: "За семестр" },
              { value: "year", label: "За год" },
            ]}
            value={selectedPeriod}
            onChange={setSelectedPeriod}
          />

          <Button
            variant="primary"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportReport}
          >
            Экспорт отчета
          </Button>
        </div>
      </div>

      {/* Общая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card padding="md" className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Всего студентов
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {mockAnalyticsData.overview.totalStudents}
              </p>
              <div className="flex items-center mt-1">
                {getTrendIcon(mockAnalyticsData.overview.trend)}
                <span
                  className={`text-sm ml-1 ${getTrendColor(
                    mockAnalyticsData.overview.trend
                  )}`}
                >
                  {mockAnalyticsData.overview.trendValue}% за месяц
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Проведено занятий
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {mockAnalyticsData.overview.totalClasses}
              </p>
              <p className="text-sm text-slate-500 mt-1">в этом месяце</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Средняя посещаемость
              </p>
              <p
                className={`text-3xl font-bold ${getAttendanceColor(
                  mockAnalyticsData.overview.averageAttendance
                )}`}
              >
                {mockAnalyticsData.overview.averageAttendance}%
              </p>
              <div className="flex items-center mt-1">
                {getTrendIcon(mockAnalyticsData.overview.trend)}
                <span
                  className={`text-sm ml-1 ${getTrendColor(
                    mockAnalyticsData.overview.trend
                  )}`}
                >
                  +{mockAnalyticsData.overview.trendValue}%
                </span>
              </div>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <BarChart3 className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Требуют внимания
              </p>
              <p className="text-3xl font-bold text-red-600">
                {mockAnalyticsData.needsAttention.length}
              </p>
              <p className="text-sm text-slate-500 mt-1">студентов</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Статистика по группам */}
      <Card>
        <CardHeader>
          <CardTitle>Статистика по группам</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAnalyticsData.groupStats.map((group, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="font-medium text-slate-900">
                      {group.group}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {group.totalStudents} студентов
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Общая посещаемость</p>
                    <p
                      className={`text-lg font-bold ${getAttendanceColor(
                        group.averageAttendance
                      )}`}
                    >
                      {group.averageAttendance}%
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-slate-600">
                      За последнюю неделю
                    </p>
                    <div className="flex items-center justify-center space-x-1">
                      <p
                        className={`text-lg font-bold ${getAttendanceColor(
                          group.lastWeekAttendance
                        )}`}
                      >
                        {group.lastWeekAttendance}%
                      </p>
                      {getTrendIcon(group.trend)}
                    </div>
                  </div>

                  <PercentageBadge percentage={group.averageAttendance} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Топ студенты */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span>Лучшие студенты</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockAnalyticsData.topPerformers.map((student, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0
                          ? "bg-yellow-100 text-yellow-700"
                          : index === 1
                          ? "bg-slate-100 text-slate-700"
                          : index === 2
                          ? "bg-orange-100 text-orange-700"
                          : "bg-slate-50 text-slate-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {student.student}
                      </p>
                      <p className="text-sm text-slate-600">{student.group}</p>
                    </div>
                  </div>
                  <PercentageBadge percentage={student.attendance} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Студенты, требующие внимания */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>Требуют внимания</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockAnalyticsData.needsAttention.map((student, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {student.student}
                    </p>
                    <p className="text-sm text-slate-600">{student.group}</p>
                    <p className="text-xs text-red-600 mt-1">
                      {student.issuesCount} пропусков
                    </p>
                  </div>
                  <div className="text-right">
                    <PercentageBadge percentage={student.attendance} />
                    <p className="text-xs text-slate-500 mt-1">посещаемость</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Статистика по предметам */}
      <Card>
        <CardHeader>
          <CardTitle>Статистика по предметам</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAnalyticsData.subjectStats.map((subject, index) => (
              <div
                key={index}
                className="p-4 border border-slate-200 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-slate-900">
                    {subject.subject}
                  </h3>
                  <PercentageBadge percentage={subject.averageAttendance} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Проведено занятий:</span>
                    <span className="font-medium text-slate-900 ml-2">
                      {subject.totalClasses}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Лучшая группа:</span>
                    <span className="font-medium text-emerald-600 ml-2">
                      {subject.bestGroup}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Отстающая группа:</span>
                    <span className="font-medium text-red-600 ml-2">
                      {subject.worstGroup}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Заглушка для графиков */}
      <Card>
        <CardHeader>
          <CardTitle>Динамика посещаемости</CardTitle>
        </CardHeader>
        <CardContent>
          <ComingSoonState
            title="Графики и диаграммы"
            description="Интерактивные графики динамики посещаемости будут добавлены в следующих версиях"
          />
        </CardContent>
      </Card>
    </div>
  );
};
