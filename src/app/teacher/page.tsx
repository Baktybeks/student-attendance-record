// src/app/teacher/page.tsx (Финальная версия)

"use client";

import React, { useState } from "react";
import {
  TeacherHeader,
  TeacherNavigation,
  TodayTab,
  ScheduleTab,
  AttendanceTab,
  AnalyticsTab,
  TabType,
} from "@/components/teacher";

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("today");

  // Поддержка горячих клавиш для переключения вкладок
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Используем Ctrl/Cmd + число для переключения вкладок
      if (
        (event.ctrlKey || event.metaKey) &&
        !event.shiftKey &&
        !event.altKey
      ) {
        switch (event.key) {
          case "1":
            event.preventDefault();
            setActiveTab("today");
            break;
          case "2":
            event.preventDefault();
            setActiveTab("schedule");
            break;
          case "3":
            event.preventDefault();
            setActiveTab("attendance");
            break;
          case "4":
            event.preventDefault();
            setActiveTab("analytics");
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case "today":
        return <TodayTab />;
      case "schedule":
        return <ScheduleTab />;
      case "attendance":
        return <AttendanceTab />;
      case "analytics":
        return <AnalyticsTab />;
      default:
        return <TodayTab />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Заголовок */}
      <TeacherHeader />

      {/* Навигация по вкладкам */}
      <TeacherNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Основной контент */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">{renderTabContent()}</div>
      </main>
    </div>
  );
}
