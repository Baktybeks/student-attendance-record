import { ID, Query } from "appwrite";
import { account, databases, appwriteConfig } from "@/constants/appwriteConfig";
import { User, UserRole, CreateUserDto, RegisterResult } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// API функции
export const authApi = {
  // Получить текущего пользователя
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const appwriteUser = await account.get();

      if (!appwriteUser) return null;

      // Получаем профиль пользователя из базы данных
      const userProfile = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        appwriteUser.$id
      );

      const user = userProfile as unknown as User;

      if (!user.isActive) {
        throw new Error("Аккаунт не активирован");
      }

      return user;
    } catch (error: any) {
      if (error.code === 401) {
        return null;
      }
      throw error;
    }
  },

  // Авторизация
  login: async (email: string, password: string): Promise<User> => {
    try {
      await account.createEmailPasswordSession(email, password);
      const user = await authApi.getCurrentUser();

      if (!user) {
        throw new Error("Не удалось получить данные пользователя");
      }

      return user;
    } catch (error: any) {
      if (error.code === 401) {
        throw new Error("Неверный email или пароль");
      }
      throw error;
    }
  },

  // Выход из системы
  logout: async (): Promise<void> => {
    try {
      await account.deleteSession("current");
    } catch (error) {
      // Игнорируем ошибки при выходе
      console.warn("Ошибка при выходе:", error);
    }
  },

  // Проверка, является ли пользователь первым (для автоматического назначения админом)
  checkIsFirstUser: async (): Promise<boolean> => {
    try {
      console.log("Проверяем, является ли пользователь первым...");

      // Сначала пробуем использовать API роут
      try {
        const response = await fetch("/api/check-admins");
        if (response.ok) {
          const data = await response.json();
          console.log("Результат проверки через API:", data);
          return data.isFirstUser;
        }
      } catch (apiError) {
        console.warn(
          "API роут недоступен, используем прямой запрос:",
          apiError
        );
      }

      // Если API роут не работает, делаем прямой запрос к базе данных
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        [Query.equal("role", UserRole.ADMIN), Query.limit(1)]
      );

      console.log("Найдено администраторов в базе:", response.total);

      const isFirstUser = response.total === 0;
      console.log("Является ли первым пользователем:", isFirstUser);

      return isFirstUser;
    } catch (error) {
      console.error("Ошибка при проверке первого пользователя:", error);

      // При ошибке проверяем общее количество пользователей
      try {
        const allUsers = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.collections.users,
          [Query.limit(1)]
        );

        const isFirstUser = allUsers.total === 0;
        console.log(
          "Общее количество пользователей:",
          allUsers.total,
          "Первый пользователь:",
          isFirstUser
        );
        return isFirstUser;
      } catch (fallbackError) {
        console.error(
          "Ошибка при проверке общего количества пользователей:",
          fallbackError
        );
        return false; // По умолчанию не считаем первым пользователем при ошибке
      }
    }
  },

  // Регистрация
  // Регистрация (улучшенная версия с подробным логированием)
  register: async (data: CreateUserDto): Promise<RegisterResult> => {
    try {
      const { name, email, password, role, studentId, groupId, phone } = data;

      console.log("Начинаем регистрацию пользователя:", { name, email, role });

      // Проверяем, является ли это первым пользователем
      const isFirstUser = await authApi.checkIsFirstUser();
      console.log("Результат проверки первого пользователя:", isFirstUser);

      // Первый пользователь автоматически становится админом
      const userRole = isFirstUser ? UserRole.ADMIN : role;
      const isActive = isFirstUser; // Первый пользователь сразу активен

      console.log("Назначенная роль:", userRole, "Активен:", isActive);

      // Создаем аккаунт в Appwrite Auth
      console.log("Создаем аккаунт в Appwrite Auth...");
      const appwriteUser = await account.create(
        ID.unique(),
        email,
        password,
        name
      );
      console.log("Аккаунт создан в Auth, ID:", appwriteUser.$id);

      // Создаем профиль пользователя в базе данных
      console.log("Создаем профиль в базе данных...");
      const userProfileData = {
        name,
        email,
        role: userRole,
        isActive,
        studentId: studentId || null,
        groupId: groupId || null,
        phone: phone || null,
      };

      console.log("Данные профиля:", userProfileData);

      const userProfile = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        appwriteUser.$id,
        userProfileData
      );

      console.log("Профиль создан:", userProfile.$id);

      const user = userProfile as unknown as User;

      const result = {
        user,
        isFirstUser,
      };

      console.log("Регистрация завершена успешно:", {
        userId: user.$id,
        isFirstUser,
        role: user.role,
      });

      return result;
    } catch (error: any) {
      console.error("Ошибка при регистрации:", error);

      // Детальный анализ ошибки
      if (error.code === 409) {
        console.error("Конфликт: пользователь уже существует");
        throw new Error("Пользователь с таким email уже существует");
      }

      if (error.code === 400) {
        console.error("Некорректные данные:", error.message);
        throw new Error("Некорректные данные для регистрации");
      }

      console.error("Неизвестная ошибка:", error.code, error.message);
      throw error;
    }
  },

  // Получить всех пользователей
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        [Query.orderDesc("$createdAt")]
      );

      return response.documents as unknown as User[];
    } catch (error) {
      console.error("Ошибка при получении пользователей:", error);
      return [];
    }
  },

  // Получить пользователей по роли
  getUsersByRole: async (role: UserRole): Promise<User[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        [
          Query.equal("role", role),
          Query.equal("isActive", true),
          Query.orderAsc("name"),
        ]
      );

      return response.documents as unknown as User[];
    } catch (error) {
      console.error(
        `Ошибка при получении пользователей с ролью ${role}:`,
        error
      );
      return [];
    }
  },

  // Активировать пользователя
  activateUser: async (userId: string): Promise<User> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        userId,
        { isActive: true }
      );

      return response as unknown as User;
    } catch (error) {
      console.error("Ошибка при активации пользователя:", error);
      throw error;
    }
  },

  // Деактивировать пользователя
  deactivateUser: async (userId: string): Promise<User> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        userId,
        { isActive: false }
      );

      return response as unknown as User;
    } catch (error) {
      console.error("Ошибка при деактивации пользователя:", error);
      throw error;
    }
  },

  // Обновить профиль пользователя
  updateUserProfile: async (
    userId: string,
    updates: Partial<User>
  ): Promise<User> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        userId,
        updates
      );

      return response as unknown as User;
    } catch (error) {
      console.error("Ошибка при обновлении профиля:", error);
      throw error;
    }
  },
};

// React Query ключи
export const authKeys = {
  all: ["auth"] as const,
  currentUser: () => [...authKeys.all, "current"] as const,
  users: () => [...authKeys.all, "users"] as const,
  usersByRole: (role: UserRole) => [...authKeys.users(), role] as const,
};

// React Query хуки
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: authApi.getCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 минут
    retry: (failureCount, error: any) => {
      if (error?.code === 401) return false;
      return failureCount < 2;
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.currentUser(), user);
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.currentUser(), null);
      queryClient.clear();
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (result) => {
      // Если первый пользователь, сразу авторизуем его
      if (result.isFirstUser) {
        queryClient.setQueryData(authKeys.currentUser(), result.user);
      }
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
    },
  });
};

export const useAllUsers = () => {
  return useQuery({
    queryKey: authKeys.users(),
    queryFn: authApi.getAllUsers,
    staleTime: 1000 * 60 * 2, // 2 минуты
  });
};

export const useUsersByRole = (role: UserRole) => {
  return useQuery({
    queryKey: authKeys.usersByRole(role),
    queryFn: () => authApi.getUsersByRole(role),
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

export const useActivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.activateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
    },
  });
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.deactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
    },
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      updates,
    }: {
      userId: string;
      updates: Partial<User>;
    }) => authApi.updateUserProfile(userId, updates),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(authKeys.currentUser(), updatedUser);
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
    },
  });
};
