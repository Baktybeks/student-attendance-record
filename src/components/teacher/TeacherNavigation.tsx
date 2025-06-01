// src/components/teacher/TeacherNavigation.tsx

"use client";

import React from "react";
import { Calendar, Clock, Users, BarChart3 } from "lucide-react";

export type TabType = "today" | "schedule" | "attendance" | "analytics";

interface TeacherNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const navigationItems = [
  { key: "today" as TabType, label: "Сегодня", icon: Clock },
  { key: "schedule" as TabType, label: "Расписание", icon: Calendar },
  { key: "attendance" as TabType, label: "Посещаемость", icon: Users },
  { key: "analytics" as TabType, label: "Аналитика", icon: BarChart3 },
];

export const TeacherNavigation: React.FC<TeacherNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {navigationItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
