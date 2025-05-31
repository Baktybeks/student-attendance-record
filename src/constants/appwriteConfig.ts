import { Client, Databases, Account, Query } from "appwrite";

// Конфигурация Appwrite
export const appwriteConfig = {
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
} as const;

// Создание клиента Appwrite
const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

export const databases = new Databases(client);
export const account = new Account(client);

export { Query };
export default client;
