// src/components/teacher/ExportModal.tsx

"use client";

import React, { useState } from "react";
import {
  Download,
  FileText,
  Table,
  Image,
  Calendar,
  Filter,
  Settings,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/utils/dates";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => Promise<void>;
  availableGroups: string[];
  availableSubjects: string[];
}

interface ExportOptions {
  format: "excel" | "csv" | "pdf";
  dataType: "attendance" | "schedule" | "analytics" | "students";
  dateRange: {
    start: string;
    end: string;
  };
  filters: {
    groups: string[];
    subjects: string[];
    includeNotes: boolean;
    includeStats: boolean;
  };
  template?: "standard" | "detailed" | "summary";
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  availableGroups = [],
  availableSubjects = [],
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "excel",
    dataType: "attendance",
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 30 дней назад
      end: new Date().toISOString().split("T")[0], // сегодня
    },
    filters: {
      groups: [],
      subjects: [],
      includeNotes: true,
      includeStats: true,
    },
    template: "standard",
  });

  const [isExporting, setIsExporting] = useState(false);

  const formatOptions = [
    {
      value: "excel",
      label: "Excel (.xlsx)",
      icon: <Table className="w-4 h-4" />,
      description: "Подходит для анализа данных",
    },
    {
      value: "csv",
      label: "CSV (.csv)",
      icon: <FileText className="w-4 h-4" />,
      description: "Универсальный формат",
    },
    {
      value: "pdf",
      label: "PDF (.pdf)",
      icon: <Image className="w-4 h-4" />,
      description: "Для печати и отчетов",
    },
  ];

  const dataTypeOptions = [
    {
      value: "attendance",
      label: "Посещаемость",
      description: "Записи о посещении занятий",
    },
    {
      value: "schedule",
      label: "Расписание",
      description: "График занятий",
    },
    {
      value: "analytics",
      label: "Аналитика",
      description: "Статистика и отчеты",
    },
    {
      value: "students",
      label: "Студенты",
      description: "Список студентов и их данные",
    },
  ];

  const templateOptions = [
    {
      value: "standard",
      label: "Стандартный",
      description: "Основная информация",
    },
    {
      value: "detailed",
      label: "Подробный",
      description: "Вся доступная информация",
    },
    {
      value: "summary",
      label: "Сводка",
      description: "Только итоговые данные",
    },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(exportOptions);
      onClose();
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const updateExportOptions = (updates: Partial<ExportOptions>) => {
    setExportOptions((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const updateFilters = (updates: Partial<ExportOptions["filters"]>) => {
    setExportOptions((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...updates,
      },
    }));
  };

  const updateDateRange = (updates: Partial<ExportOptions["dateRange"]>) => {
    setExportOptions((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        ...updates,
      },
    }));
  };

  const resetToDefaults = () => {
    setExportOptions({
      format: "excel",
      dataType: "attendance",
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        end: new Date().toISOString().split("T")[0],
      },
      filters: {
        groups: [],
        subjects: [],
        includeNotes: true,
        includeStats: true,
      },
      template: "standard",
    });
  };

  const getEstimatedSize = () => {
    // Примерная логика расчета размера файла
    const baseSize = exportOptions.format === "pdf" ? 500 : 50; // KB
    const groupMultiplier = exportOptions.filters.groups.length || 1;
    const subjectMultiplier = exportOptions.filters.subjects.length || 1;
    const dateRangeDays =
      Math.abs(
        new Date(exportOptions.dateRange.end).getTime() -
          new Date(exportOptions.dateRange.start).getTime()
      ) /
      (1000 * 60 * 60 * 24);

    const estimated =
      baseSize * groupMultiplier * subjectMultiplier * (dateRangeDays / 30);

    if (estimated < 1024) return `~${Math.round(estimated)} KB`;
    return `~${Math.round(estimated / 1024)} MB`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Экспорт данных"
      size="lg"
      closeOnOverlayClick={false}
    >
      <div className="space-y-6">
        {/* Формат файла */}
        <div>
          <h3 className="text-sm font-medium text-slate-900 mb-3">
            Формат файла
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {formatOptions.map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  updateExportOptions({ format: option.value as any })
                }
                className={`p-3 border-2 rounded-lg text-left transition-colors ${
                  exportOptions.format === option.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {option.icon}
                  <span className="font-medium text-sm">{option.label}</span>
                </div>
                <p className="text-xs text-slate-600">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Тип данных */}
        <div>
          <h3 className="text-sm font-medium text-slate-900 mb-3">
            Тип данных
          </h3>
          <Select
            options={dataTypeOptions}
            value={exportOptions.dataType}
            onChange={(value) =>
              updateExportOptions({ dataType: value as any })
            }
            fullWidth
          />
        </div>

        {/* Период данных */}
        <div>
          <h3 className="text-sm font-medium text-slate-900 mb-3">
            Период данных
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              label="С"
              value={exportOptions.dateRange.start}
              onChange={(e) => updateDateRange({ start: e.target.value })}
              fullWidth
            />
            <Input
              type="date"
              label="По"
              value={exportOptions.dateRange.end}
              onChange={(e) => updateDateRange({ end: e.target.value })}
              fullWidth
            />
          </div>
        </div>

        {/* Фильтры */}
        <div>
          <h3 className="text-sm font-medium text-slate-900 mb-3">Фильтры</h3>
          <div className="space-y-3">
            <Select
              options={[
                { value: "", label: "Все группы" },
                ...availableGroups.map((group) => ({
                  value: group,
                  label: group,
                })),
              ]}
              value=""
              onChange={(value) => {
                if (
                  value &&
                  !exportOptions.filters.groups.includes(value as string)
                ) {
                  updateFilters({
                    groups: [...exportOptions.filters.groups, value as string],
                  });
                }
              }}
              placeholder="Добавить группу"
              fullWidth
            />

            {exportOptions.filters.groups.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {exportOptions.filters.groups.map((group) => (
                  <Badge
                    key={group}
                    variant="primary"
                    removable
                    onRemove={() => {
                      updateFilters({
                        groups: exportOptions.filters.groups.filter(
                          (g) => g !== group
                        ),
                      });
                    }}
                  >
                    {group}
                  </Badge>
                ))}
              </div>
            )}

            <Select
              options={[
                { value: "", label: "Все предметы" },
                ...availableSubjects.map((subject) => ({
                  value: subject,
                  label: subject,
                })),
              ]}
              value=""
              onChange={(value) => {
                if (
                  value &&
                  !exportOptions.filters.subjects.includes(value as string)
                ) {
                  updateFilters({
                    subjects: [
                      ...exportOptions.filters.subjects,
                      value as string,
                    ],
                  });
                }
              }}
              placeholder="Добавить предмет"
              fullWidth
            />

            {exportOptions.filters.subjects.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {exportOptions.filters.subjects.map((subject) => (
                  <Badge
                    key={subject}
                    variant="primary"
                    removable
                    onRemove={() => {
                      updateFilters({
                        subjects: exportOptions.filters.subjects.filter(
                          (s) => s !== subject
                        ),
                      });
                    }}
                  >
                    {subject}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Дополнительные опции */}
        <div>
          <h3 className="text-sm font-medium text-slate-900 mb-3">
            Дополнительные опции
          </h3>
          <div className="space-y-3">
            <Select
              options={templateOptions}
              value={exportOptions.template || "standard"}
              onChange={(value) =>
                updateExportOptions({ template: value as any })
              }
              label="Шаблон"
              fullWidth
            />

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportOptions.filters.includeNotes}
                  onChange={(e) =>
                    updateFilters({ includeNotes: e.target.checked })
                  }
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">
                  Включить примечания
                </span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportOptions.filters.includeStats}
                  onChange={(e) =>
                    updateFilters({ includeStats: e.target.checked })
                  }
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">
                  Включить статистику
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Предварительный просмотр настроек */}
        <Card padding="sm" className="bg-slate-50">
          <h4 className="text-sm font-medium text-slate-900 mb-2">
            Параметры экспорта
          </h4>
          <div className="text-xs text-slate-600 space-y-1">
            <div>
              Формат:{" "}
              {
                formatOptions.find((f) => f.value === exportOptions.format)
                  ?.label
              }
            </div>
            <div>
              Тип данных:{" "}
              {
                dataTypeOptions.find((d) => d.value === exportOptions.dataType)
                  ?.label
              }
            </div>
            <div>
              Период:{" "}
              {formatDate(new Date(exportOptions.dateRange.start), "short")} -{" "}
              {formatDate(new Date(exportOptions.dateRange.end), "short")}
            </div>
            <div>Группы: {exportOptions.filters.groups.length || "Все"}</div>
            <div>
              Предметы: {exportOptions.filters.subjects.length || "Все"}
            </div>
            <div>Примерный размер: {getEstimatedSize()}</div>
          </div>
        </Card>

        {/* Кнопки действий */}
        <div className="flex justify-between pt-4 border-t border-slate-200">
          <Button
            variant="ghost"
            onClick={resetToDefaults}
            icon={<Settings className="w-4 h-4" />}
          >
            Сбросить
          </Button>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} disabled={isExporting}>
              Отмена
            </Button>
            <Button
              variant="primary"
              onClick={handleExport}
              loading={isExporting}
              icon={<Download className="w-4 h-4" />}
            >
              Экспортировать
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
