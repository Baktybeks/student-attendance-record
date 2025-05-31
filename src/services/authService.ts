import { ID, Query } from "appwrite";
import { account, databases, appwriteConfig } from "@/lib/appwrite";
import { User, UserRole, CreateUserDto } from "@/types";
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

  // Регистрация
  register: async (data: CreateUserDto): Promise<User> => {
    try {
      const { name, email, password, role, studentId, groupId, phone } = data;

      // Создаем аккаунт в Appwrite Auth
      const appwriteUser = await account.create(
        ID.unique(),
        email,
        password,
        name
      );

      // Создаем профиль пользователя в базе данных
      const userProfile = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        appwriteUser.$id,
        {
          name,
          email,
          role,
          isActive: role === UserRole.ADMIN, // Админы сразу активны
          studentId: studentId || null,
          groupId: groupId || null,
          phone: phone || null,
        }
      );

      return userProfile as unknown as User;
    } catch (error: any) {
      if (error.code === 409) {
        throw new Error("Пользователь с таким email уже существует");
      }
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
    onSuccess: () => {
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
