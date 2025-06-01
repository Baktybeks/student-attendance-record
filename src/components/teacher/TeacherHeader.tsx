// src/components/teacher/TeacherHeader.tsx

"use client";

import React from "react";
import { GraduationCap, BookOpen } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { useAuthStore } from "@/store/authStore";

export const TeacherHeader: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">
                AttendTrack
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-1 ml-8">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-600">
                Панель преподавателя
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">Преподаватель</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
};
