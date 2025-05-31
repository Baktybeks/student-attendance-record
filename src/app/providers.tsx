// src/app/providers.tsx (Обновленная версия с react-toastify)

"use client";

import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ToastContainer } from "react-toastify";
import { useAuthStore } from "@/store/authStore";
import { useCurrentUser } from "@/services/authService";

// Импортируем стили для react-toastify
import "react-toastify/dist/ReactToastify.css";

// Компонент для синхронизации Zustand с React Query
function AuthSync() {
  const { setUser, setLoading } = useAuthStore();
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    setLoading(isLoading);
    if (!isLoading) {
      setUser(user ?? null);
    }
  }, [user, isLoading, setUser, setLoading]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: (failureCount, error: any) => {
              if (error?.code === 401) return false;
              return failureCount < 2;
            },
            staleTime: 1000 * 60 * 5, // 5 минут
          },
        },
      })
  );

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
      {children}
      {isClient && process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}

      {/* ToastContainer для react-toastify */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="toast-container"
        style={{
          fontSize: "14px",
        }}
      />
    </QueryClientProvider>
  );
}
