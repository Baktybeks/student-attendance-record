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

const COLLECTION_SCHEMAS = {
  users: {
    name: { type: "string", required: true, size: 255 },
    email: { type: "email", required: true, size: 320 },
    role: {
      type: "enum",
      required: true,
      elements: ["admin", "teacher", "student"],
    },
    isActive: { type: "boolean", required: false, default: false },
    studentId: { type: "string", required: false, size: 50 },
    groupId: { type: "string", required: false, size: 36 },
    phone: { type: "string", required: false, size: 50 },
    avatar: { type: "url", required: false, size: 500 },
  },

  groups: {
    name: { type: "string", required: true, size: 255 },
    code: { type: "string", required: true, size: 50 },
    course: { type: "integer", required: true, min: 1, max: 6 },
    specialization: { type: "string", required: true, size: 255 },
    isActive: { type: "boolean", required: false, default: true },
    studentsCount: { type: "integer", required: false, min: 0, default: 0 },
  },

  subjects: {
    name: { type: "string", required: true, size: 255 },
    code: { type: "string", required: true, size: 50 },
    description: { type: "string", required: false, size: 1000 },
    teacherId: { type: "string", required: true, size: 36 },
    groupIds: { type: "string", required: true, array: true },
    isActive: { type: "boolean", required: false, default: true },
    hoursTotal: { type: "integer", required: true, min: 1 },
  },

  schedule: {
    subjectId: { type: "string", required: true, size: 36 },
    groupId: { type: "string", required: true, size: 36 },
    teacherId: { type: "string", required: true, size: 36 },
    dayOfWeek: {
      type: "enum",
      required: true,
      elements: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
    },
    startTime: { type: "string", required: true, size: 5 }, // HH:MM
    endTime: { type: "string", required: true, size: 5 }, // HH:MM
    classroom: { type: "string", required: true, size: 100 },
    weekType: {
      type: "enum",
      required: false,
      elements: ["odd", "even", "all"],
      default: "all",
    },
    isActive: { type: "boolean", required: false, default: true },
  },

  classes: {
    scheduleId: { type: "string", required: true, size: 36 },
    subjectId: { type: "string", required: true, size: 36 },
    groupId: { type: "string", required: true, size: 36 },
    teacherId: { type: "string", required: true, size: 36 },
    date: { type: "datetime", required: true },
    startTime: { type: "string", required: true, size: 5 },
    endTime: { type: "string", required: true, size: 5 },
    classroom: { type: "string", required: true, size: 100 },
    topic: { type: "string", required: false, size: 500 },
    isCompleted: { type: "boolean", required: false, default: false },
    isCanceled: { type: "boolean", required: false, default: false },
    notes: { type: "string", required: false, size: 1000 },
  },

  attendance: {
    classId: { type: "string", required: true, size: 36 },
    studentId: { type: "string", required: true, size: 36 },
    status: {
      type: "enum",
      required: true,
      elements: ["present", "absent", "late", "excused"],
    },
    notes: { type: "string", required: false, size: 500 },
    markedAt: { type: "datetime", required: true },
    markedBy: { type: "string", required: true, size: 36 },
  },
};

const COLLECTION_INDEXES = {
  users: [
    { key: "email", type: "unique" },
    { key: "role", type: "key" },
    { key: "isActive", type: "key" },
    { key: "groupId", type: "key" },
    { key: "studentId", type: "key" },
  ],

  groups: [
    { key: "code", type: "unique" },
    { key: "course", type: "key" },
    { key: "isActive", type: "key" },
  ],

  subjects: [
    { key: "code", type: "unique" },
    { key: "teacherId", type: "key" },
    { key: "isActive", type: "key" },
  ],

  schedule: [
    { key: "subjectId", type: "key" },
    { key: "groupId", type: "key" },
    { key: "teacherId", type: "key" },
    { key: "dayOfWeek", type: "key" },
    { key: "isActive", type: "key" },
  ],

  classes: [
    { key: "scheduleId", type: "key" },
    { key: "subjectId", type: "key" },
    { key: "groupId", type: "key" },
    { key: "teacherId", type: "key" },
    { key: "date", type: "key" },
    { key: "isCompleted", type: "key" },
    { key: "isCanceled", type: "key" },
  ],

  attendance: [
    { key: "classId", type: "key" },
    { key: "studentId", type: "key" },
    { key: "status", type: "key" },
    { key: "markedAt", type: "key" },
    { key: "markedBy", type: "key" },
    {
      key: "classId-studentId",
      type: "unique",
      attributes: ["classId", "studentId"],
    },
  ],
};

const client = new Client();
client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const createAttribute = async (databaseId, collectionId, key, schema) => {
  try {
    const attributeType = schema.type;
    let isRequired = schema.required || false;
    let defaultValue = schema.default;

    if (isRequired && defaultValue !== null && defaultValue !== undefined) {
      console.log(
        `    ⚠️ Исправление ${key}: required=true с default значением -> required=false`
      );
      isRequired = false;
    }

    switch (attributeType) {
      case "string":
        return await databases.createStringAttribute(
          databaseId,
          collectionId,
          key,
          schema.size || 255,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      case "email":
        return await databases.createEmailAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      case "enum":
        return await databases.createEnumAttribute(
          databaseId,
          collectionId,
          key,
          schema.elements,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      case "boolean":
        return await databases.createBooleanAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          defaultValue !== null && defaultValue !== undefined
            ? defaultValue
            : null,
          schema.array || false
        );

      case "datetime":
        return await databases.createDatetimeAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      case "integer":
        return await databases.createIntegerAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          schema.min || null,
          schema.max || null,
          defaultValue || null,
          schema.array || false
        );

      case "url":
        return await databases.createUrlAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      default:
        throw new Error(`Неподдерживаемый тип атрибута: ${attributeType}`);
    }
  } catch (error) {
    console.error(`Ошибка создания атрибута ${key}:`, error.message);
    throw error;
  }
};

const createIndex = async (databaseId, collectionId, indexConfig) => {
  try {
    return await databases.createIndex(
      databaseId,
      collectionId,
      indexConfig.key,
      indexConfig.type,
      indexConfig.attributes || [indexConfig.key],
      indexConfig.orders || ["ASC"]
    );
  } catch (error) {
    console.error(`Ошибка создания индекса ${indexConfig.key}:`, error.message);
    throw error;
  }
};

const setupCollections = async () => {
  try {
    console.log(
      "🚀 Начинаем создание коллекций для системы учёта посещаемости..."
    );
    console.log(
      "📋 Всего коллекций для создания:",
      Object.keys(COLLECTION_SCHEMAS).length
    );

    const databaseId = appwriteConfig.databaseId;

    if (!databaseId) {
      throw new Error("Database ID не найден! Проверьте переменные окружения.");
    }

    for (const [collectionName, schema] of Object.entries(COLLECTION_SCHEMAS)) {
      console.log(`\n📁 Создание коллекции: ${collectionName}`);

      try {
        const collectionId = appwriteConfig.collections[collectionName];

        const collection = await databases.createCollection(
          databaseId,
          collectionId,
          collectionName,
          [
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
          ],
          false
        );

        console.log(
          `  ✅ Коллекция ${collectionName} создана (ID: ${collectionId})`
        );

        console.log(`  📝 Добавление атрибутов...`);
        let attributeCount = 0;

        for (const [attributeKey, attributeSchema] of Object.entries(schema)) {
          try {
            await createAttribute(
              databaseId,
              collectionId,
              attributeKey,
              attributeSchema
            );
            attributeCount++;
            console.log(`    ✅ ${attributeKey} (${attributeSchema.type})`);

            await new Promise((resolve) => setTimeout(resolve, 1000));
          } catch (error) {
            console.error(`    ❌ ${attributeKey}: ${error.message}`);
          }
        }

        console.log(
          `  📊 Создано атрибутов: ${attributeCount}/${
            Object.keys(schema).length
          }`
        );

        if (COLLECTION_INDEXES[collectionName]) {
          console.log(`  🔍 Создание индексов...`);
          let indexCount = 0;

          for (const indexConfig of COLLECTION_INDEXES[collectionName]) {
            try {
              await createIndex(databaseId, collectionId, indexConfig);
              indexCount++;
              console.log(`    ✅ Индекс: ${indexConfig.key}`);

              await new Promise((resolve) => setTimeout(resolve, 1000));
            } catch (error) {
              console.error(
                `    ❌ Индекс ${indexConfig.key}: ${error.message}`
              );
            }
          }

          console.log(
            `  📈 Создано индексов: ${indexCount}/${COLLECTION_INDEXES[collectionName].length}`
          );
        }
      } catch (error) {
        console.error(
          `❌ Ошибка создания коллекции ${collectionName}:`,
          error.message
        );
      }
    }

    console.log("\n🎉 Настройка коллекций завершена!");
    console.log("🔗 Откройте консоль Appwrite для проверки результата.");
  } catch (error) {
    console.error("💥 Общая ошибка:", error.message);
    console.log("\n🔍 Проверьте:");
    console.log("- Переменные окружения в .env.local");
    console.log("- Права доступа API ключа");
    console.log("- Подключение к интернету");
  }
};

const resetCollections = async () => {
  try {
    console.log("🗑️ Удаление существующих коллекций...");

    const databaseId = appwriteConfig.databaseId;
    let deletedCount = 0;

    for (const [collectionName] of Object.entries(COLLECTION_SCHEMAS)) {
      try {
        const collectionId = appwriteConfig.collections[collectionName];
        await databases.deleteCollection(databaseId, collectionId);
        deletedCount++;
        console.log(`✅ ${collectionName} удалена`);
      } catch (error) {
        console.log(`⚠️ ${collectionName} не найдена или уже удалена`);
      }
    }

    console.log(`🧹 Удалено коллекций: ${deletedCount}`);
  } catch (error) {
    console.error("Ошибка при удалении коллекций:", error.message);
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

  console.log("✅ Все переменные окружения найдены");
};

const main = async () => {
  console.log("🎓 AttendTrack - Настройка базы данных\n");

  checkEnvironment();

  const command = process.argv[2];

  switch (command) {
    case "setup":
      await setupCollections();
      break;
    case "reset":
      await resetCollections();
      break;
    case "reset-setup":
      await resetCollections();
      console.log("\n⏳ Ожидание 3 секунды перед созданием...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await setupCollections();
      break;
    default:
      console.log("📖 Использование:");
      console.log(
        "  node scripts/setupCollections.js setup        - Создать коллекции"
      );
      console.log(
        "  node scripts/setupCollections.js reset        - Удалить коллекции"
      );
      console.log(
        "  node scripts/setupCollections.js reset-setup  - Пересоздать коллекции"
      );
      break;
  }
};

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  setupCollections,
  resetCollections,
  COLLECTION_SCHEMAS,
  COLLECTION_INDEXES,
  appwriteConfig,
};
