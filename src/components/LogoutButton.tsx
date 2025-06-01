// src/components/LogoutButton.tsx

"use client";

import React, { useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface LogoutButtonProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  className = "",
  iconOnly = false,
  size = "md",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`
        ${sizeClasses[size]}
        text-slate-400 hover:text-slate-600 
        rounded-lg hover:bg-slate-100 
        transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title="Выйти"
    >
      {isLoading ? (
        <div
          className={`${iconSizes[size]} border-2 border-slate-400 border-t-transparent rounded-full animate-spin`}
        />
      ) : (
        <>
          <LogOut className={iconSizes[size]} />
          {!iconOnly && size === "lg" && (
            <span className="ml-2 text-sm">Выйти</span>
          )}
        </>
      )}
    </button>
  );
};
