// src/components/student/NoScheduleData.tsx

"use client";

import React from "react";
import { Calendar, Database, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface NoScheduleDataProps {
  isLoading?: boolean;
  groupName?: string;
  onRefresh?: () => void;
}

export function NoScheduleData({
  isLoading = false,
  groupName,
  onRefresh,
}: NoScheduleDataProps) {
  if (isLoading) {
    return (
      <Card padding="lg" className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Загрузка расписания...
        </h3>
        <p className="text-slate-600">
          Получаем актуальное расписание из базы данных
        </p>
      </Card>
    );
  }

  return (
    <Card padding="lg" className="text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Database className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-medium text-slate-900 mb-2">
          Расписание не найдено
        </h3>
        <p className="text-slate-600 max-w-md mx-auto">
          {groupName
            ? `Для группы "${groupName}" пока не создано расписание занятий.`
            : "Расписание занятий пока не создано."}
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-left">
            <h4 className="text-sm font-medium text-yellow-800 mb-1">
              Что делать?
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Обратитесь к администратору для создания расписания</li>
              <li>• Проверьте, правильно ли указана ваша группа в профиле</li>
              <li>• Возможно, расписание находится в процессе создания</li>
            </ul>
          </div>
        </div>
      </div>

      {onRefresh && (
        <Button
          variant="outline"
          onClick={onRefresh}
          icon={<Calendar className="w-4 h-4" />}
        >
          Обновить
        </Button>
      )}
    </Card>
  );
}
