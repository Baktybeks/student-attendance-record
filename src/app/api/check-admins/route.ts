// src/app/api/check-admins/route.ts (исправленная версия)

import { appwriteConfig } from "@/constants/appwriteConfig";
import { Client, Databases, Query } from "node-appwrite"; // Используем node-appwrite для серверной части
import { UserRole } from "@/types";

export async function GET() {
  try {
    // Используем серверный API ключ для доступа к базе данных
    const client = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId)
      .setKey(process.env.APPWRITE_API_KEY || ""); // Серверный API ключ

    const database = new Databases(client);

    console.log("Проверяем количество администраторов...");

    // Проверяем, есть ли пользователи с ролью ADMIN
    const adminCheck = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.collections.users,
      [Query.equal("role", UserRole.ADMIN)]
    );

    console.log("Найдено администраторов:", adminCheck.total);

    // Если нет администраторов, значит это первый пользователь
    const isFirstUser = adminCheck.total === 0;

    return Response.json({
      isFirstUser,
      adminCount: adminCheck.total,
      message: isFirstUser
        ? "Первый пользователь будет администратором"
        : "Администраторы уже существуют",
    });
  } catch (error) {
    console.error("Ошибка при проверке администраторов:", error);
    return Response.json(
      {
        error: "Ошибка сервера",
        message: error instanceof Error ? error.message : "Неизвестная ошибка",
        isFirstUser: false, // По умолчанию не первый пользователь при ошибке
      },
      { status: 500 }
    );
  }
}
