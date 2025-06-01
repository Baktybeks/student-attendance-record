// src/components/SystemStatusDebug.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useAllUsers } from "@/services/authService";
import { UserRole } from "@/types";
import {
  Shield,
  Users,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

export const SystemStatusDebug: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<{
    isFirstUser: boolean;
    adminCount: number;
    message: string;
  } | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const { data: allUsers = [], isLoading: usersLoading } = useAllUsers();

  const checkApiStatus = async () => {
    setIsChecking(true);
    setApiError(null);

    try {
      const response = await fetch("/api/check-admins");
      if (response.ok) {
        const data = await response.json();
        setApiStatus(data);
      } else {
        const errorData = await response.json();
        setApiError(errorData.message || "Ошибка API");
      }
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Ошибка сети");
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkApiStatus();
  }, []);

  const adminUsers = allUsers.filter((user) => user.role === UserRole.ADMIN);
  const activeAdmins = adminUsers.filter((user) => user.isActive);

  if (process.env.NODE_ENV === "production") {
    return null; // Не показываем в продакшене
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-white border border-slate-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-900 flex items-center">
          <Shield className="w-4 h-4 mr-2" />
          Статус системы
        </h3>
        <button
          onClick={checkApiStatus}
          disabled={isChecking}
          className="p-1 text-slate-400 hover:text-slate-600 rounded"
        >
          <RefreshCw
            className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      <div className="space-y-3 text-xs">
        {/* API статус */}
        <div className="flex items-center justify-between">
          <span className="text-slate-600">API /check-admins:</span>
          {apiError ? (
            <div className="flex items-center text-red-600">
              <AlertCircle className="w-3 h-3 mr-1" />
              Ошибка
            </div>
          ) : apiStatus ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Работает
            </div>
          ) : (
            <div className="text-orange-600">Проверяется...</div>
          )}
        </div>

        {apiStatus && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Первый пользователь:</span>
              <span
                className={
                  apiStatus.isFirstUser ? "text-green-600" : "text-slate-900"
                }
              >
                {apiStatus.isFirstUser ? "Да" : "Нет"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Админов (API):</span>
              <span className="text-slate-900">{apiStatus.adminCount}</span>
            </div>
          </>
        )}

        {apiError && (
          <div className="text-red-600 text-xs bg-red-50 p-2 rounded">
            {apiError}
          </div>
        )}

        {/* Статус из базы данных */}
        <div className="border-t border-slate-200 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Всего пользователей:</span>
            <span className="text-slate-900">
              {usersLoading ? "..." : allUsers.length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Админов (БД):</span>
            <span className="text-slate-900">
              {usersLoading ? "..." : adminUsers.length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Активных админов:</span>
            <span className="text-slate-900">
              {usersLoading ? "..." : activeAdmins.length}
            </span>
          </div>
        </div>

        {/* Рекомендации */}
        {!usersLoading && (
          <div className="bg-blue-50 p-2 rounded">
            <div className="text-blue-800 font-medium">Рекомендация:</div>
            <div className="text-blue-700">
              {allUsers.length === 0
                ? "Система пуста. Первый пользователь станет админом."
                : activeAdmins.length === 0
                ? "Нет активных админов. Активируйте администратора."
                : "Система настроена корректно."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
