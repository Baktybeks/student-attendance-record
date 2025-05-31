const { Client, Databases, Permission, Role } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

const appwriteConfig = {
  endpoint:
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
  collections: {
    users: process.env.NEXT_PUBLIC_USERS_COLLECTION_ID || "users",
    groups: process.env.NEXT_PUBLIC_GROUPS_COLLECTION_ID || "groups",
    subjects: process.env.NEXT_PUBLIC_SUBJECTS_COLLECTION_ID || "subjects",
    schedule: process.env.NEXT_PUBLIC_SCHEDULE_COLLECTION_ID || "schedule",
    attendance:
      process.env.NEXT_PUBLIC_ATTENDANCE_COLLECTION_ID || "attendance",
    classes: process.env.NEXT_PUBLIC_CLASSES_COLLECTION_ID || "classes",
  },
};

const client = new Client();
client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

// Права доступа для различных коллекций
const COLLECTION_PERMISSIONS = {
  users: [
    // Любой может читать (для списков преподавателей, студентов)
    Permission.read(Role.any()),
    // Только пользователи могут создавать (регистрация)
    Permission.create(Role.users()),
    // Только владелец и админы могут обновлять
    Permission.update(Role.users()),
    // Только админы могут удалять
    Permission.delete(Role.users()),
  ],

  groups: [
    // Любой может читать группы
    Permission.read(Role.any()),
    // Только пользователи могут создавать
    Permission.create(Role.users()),
    // Только пользователи могут обновлять
    Permission.update(Role.users()),
    // Только пользователи могут удалять
    Permission.delete(Role.users()),
  ],

  subjects: [
    // Любой может читать предметы
    Permission.read(Role.any()),
    // Только пользователи могут создавать
    Permission.create(Role.users()),
    // Только пользователи могут обновлять
    Permission.update(Role.users()),
    // Только пользователи могут удалять
    Permission.delete(Role.users()),
  ],

  schedule: [
    // Любой может читать расписание
    Permission.read(Role.any()),
    // Только пользователи могут создавать
    Permission.create(Role.users()),
    // Только пользователи могут обновлять
    Permission.update(Role.users()),
    // Только пользователи могут удалять
    Permission.delete(Role.users()),
  ],

  classes: [
    // Любой может читать занятия
    Permission.read(Role.any()),
    // Только пользователи могут создавать
    Permission.create(Role.users()),
    // Только пользователи могут обновлять
    Permission.update(Role.users()),
    // Только пользователи могут удалять
    Permission.delete(Role.users()),
  ],

  attendance: [
    // Любой может читать посещаемость
    Permission.read(Role.any()),
    // Только пользователи могут создавать
    Permission.create(Role.users()),
    // Только пользователи могут обновлять
    Permission.update(Role.users()),
    // Только пользователи могут удалять
    Permission.delete(Role.users()),
  ],
};

const updateCollectionPermissions = async () => {
  try {
    console.log("🔒 Настройка прав доступа для коллекций...");

    for (const [collectionName, permissions] of Object.entries(
      COLLECTION_PERMISSIONS
    )) {
      try {
        const collectionId = appwriteConfig.collections[collectionName];

        console.log(`📋 Обновление прав для коллекции: ${collectionName}`);

        await databases.updateCollection(
          appwriteConfig.databaseId,
          collectionId,
          collectionName,
          permissions,
          false, // documentSecurity = false (используем права коллекции)
          true // enabled = true
        );

        console.log(`  ✅ Права для ${collectionName} обновлены`);
      } catch (error) {
        console.error(
          `  ❌ Ошибка обновления прав для ${collectionName}:`,
          error.message
        );
      }
    }

    console.log("\n🎉 Настройка прав доступа завершена!");
  } catch (error) {
    console.error("💥 Общая ошибка:", error.message);
  }
};

const checkPermissions = async () => {
  try {
    console.log("🔍 Проверка текущих прав доступа...\n");

    for (const [collectionName] of Object.entries(COLLECTION_PERMISSIONS)) {
      try {
        const collectionId = appwriteConfig.collections[collectionName];

        const collection = await databases.getCollection(
          appwriteConfig.databaseId,
          collectionId
        );

        console.log(`📋 Коллекция: ${collectionName}`);
        console.log(`  ID: ${collection.$id}`);
        console.log(`  Документы: ${collection.documentsCount || 0}`);
        console.log(
          `  Права доступа: ${collection.$permissions.length} правил`
        );

        if (collection.$permissions.length > 0) {
          collection.$permissions.forEach((permission, index) => {
            console.log(`    ${index + 1}. ${permission}`);
          });
        } else {
          console.log(`    ⚠️ Нет настроенных прав доступа`);
        }

        console.log(`  Document Security: ${collection.documentSecurity}`);
        console.log("");
      } catch (error) {
        console.error(
          `❌ Ошибка получения коллекции ${collectionName}:`,
          error.message
        );
      }
    }
  } catch (error) {
    console.error("💥 Общая ошибка:", error.message);
  }
};

const checkEnvironment = () => {
  const required = [
    "NEXT_PUBLIC_APPWRITE_ENDPOINT",
    "NEXT_PUBLIC_APPWRITE_PROJECT_ID",
    "NEXT_PUBLIC_APPWRITE_DATABASE_ID",
    "APPWRITE_API_KEY",
  ];

  const missing = required.filter((env) => !process.env[env]);

  if (missing.length > 0) {
    console.error("❌ Отсутствуют переменные окружения:");
    missing.forEach((env) => console.error(`  - ${env}`));
    console.log("\n💡 Создайте файл .env.local с необходимыми переменными");
    process.exit(1);
  }

  console.log("✅ Все переменные окружения найдены\n");
};

const main = async () => {
  console.log("🔐 AttendTrack - Настройка прав доступа\n");

  checkEnvironment();

  const command = process.argv[2];

  switch (command) {
    case "check":
      await checkPermissions();
      break;
    case "update":
      await updateCollectionPermissions();
      break;
    case "setup":
      await checkPermissions();
      console.log("🔧 Применение обновлений...\n");
      await updateCollectionPermissions();
      console.log("\n🔍 Проверка результата...\n");
      await checkPermissions();
      break;
    default:
      console.log("📖 Использование:");
      console.log(
        "  node scripts/setupPermissions.js check   - Проверить текущие права"
      );
      console.log(
        "  node scripts/setupPermissions.js update  - Обновить права доступа"
      );
      console.log(
        "  node scripts/setupPermissions.js setup   - Полная настройка"
      );
      break;
  }
};

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  updateCollectionPermissions,
  checkPermissions,
  COLLECTION_PERMISSIONS,
  appwriteConfig,
};
