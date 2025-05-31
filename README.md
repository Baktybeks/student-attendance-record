# AttendTrack - Система учёта посещаемости студентов

Современная веб-система для учёта посещаемости студентов, построенная на базе Next.js, Appwrite и TanStack Query.

## 🚀 Функциональность

### Роли пользователей

- **Администратор** - полное управление системой, пользователями, группами и расписанием
- **Преподаватель** - отметка посещаемости, просмотр статистики по своим предметам
- **Студент** - просмотр расписания и личной статистики посещаемости

### Основные возможности

- ✅ Аутентификация и разграничение прав доступа по ролям
- ✅ Управление пользователями, группами и предметами
- ✅ Создание и управление расписанием занятий
- ✅ Отметка посещаемости с различными статусами (присутствует, отсутствует, опоздал, уважительная причина)
- ✅ Статистика и аналитика посещаемости
- ✅ Адаптивный дизайн для всех устройств

## 🛠 Технологический стек

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4 с @tailwindcss/postcss
- **Backend**: Appwrite (BaaS) - база данных, аутентификация, авторизация
- **State Management**: Zustand для глобального состояния
- **Data Fetching**: TanStack React Query v5 для кеширования и синхронизации
- **UI Components**: Lucide React для иконок
- **Notifications**: React Hot Toast

## 📦 Установка и настройка

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd student-attendance-system
```

### 2. Установка зависимостей

```bash
npm install
# или
yarn install
# или
pnpm install
```

### 3. Настройка Appwrite

1. Создайте проект в [Appwrite Cloud](https://cloud.appwrite.io) или разверните локально
2. Создайте базу данных в вашем проекте
3. Получите API ключ с правами на создание коллекций

### 4. Настройка переменных окружения

Создайте файл `.env.local` на основе `.env.example`:

```bash
cp .env.example .env.local
```

Заполните следующие переменные:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id

# API Key для серверных операций
APPWRITE_API_KEY=your_api_key

# Collection IDs (можно оставить по умолчанию)
NEXT_PUBLIC_USERS_COLLECTION_ID=users
NEXT_PUBLIC_GROUPS_COLLECTION_ID=groups
NEXT_PUBLIC_SUBJECTS_COLLECTION_ID=subjects
NEXT_PUBLIC_SCHEDULE_COLLECTION_ID=schedule
NEXT_PUBLIC_ATTENDANCE_COLLECTION_ID=attendance
NEXT_PUBLIC_CLASSES_COLLECTION_ID=classes
```

### 5. Создание коллекций в базе данных

```bash
# Проверка подключения к Appwrite
npm run db:test

# Создание всех необходимых коллекций
npm run db:setup

# Или пересоздание коллекций (удаляет существующие!)
npm run db:reset-setup
```

### 6. Запуск приложения

```bash
npm run dev
```

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000)

## 🔐 Первый запуск

1. Откройте страницу входа: `http://localhost:3000/login`
2. Для демонстрации используйте демо аккаунты:
   - **Администратор**: `admin@demo.com / admin123`
   - **Преподаватель**: `teacher@demo.com / teacher123`
   - **Студент**: `student@demo.com / student123`

## 📊 Структура базы данных

### Коллекции

- **users** - Пользователи системы (студенты, преподаватели, администраторы)
- **groups** - Учебные группы
- **subjects** - Предметы и дисциплины
- **schedule** - Расписание занятий
- **classes** - Конкретные занятия (пары)
- **attendance** - Записи о посещаемости

### Схема данных

#### User (Пользователь)

```typescript
{
  name: string;           // ФИО пользователя
  email: string;          // Email (уникальный)
  role: "admin" | "teacher" | "student";
  isActive: boolean;      // Активен ли аккаунт
  studentId?: string;     // Номер студенческого билета
  groupId?: string;       // ID группы (для студентов)
  phone?: string;         // Номер телефона
  avatar?: string;        // Ссылка на аватар
}
```

#### Group (Группа)

```typescript
{
  name: string; // Название группы
  code: string; // Код группы (уникальный)
  course: number; // Курс обучения (1-6)
  specialization: string; // Специальность
  isActive: boolean; // Активна ли группа
  studentsCount: number; // Количество студентов
}
```

#### Subject (Предмет)

```typescript
{
  name: string;           // Название предмета
  code: string;           // Код предмета (уникальный)
  description?: string;   // Описание
  teacherId: string;      // ID преподавателя
  groupIds: string[];     // Массив ID групп
  isActive: boolean;      // Активен ли предмет
  hoursTotal: number;     // Общее количество часов
}
```

#### Attendance (Посещаемость)

```typescript
{
  classId: string;        // ID занятия
  studentId: string;      // ID студента
  status: "present" | "absent" | "late" | "excused";
  notes?: string;         // Заметки
  markedAt: string;       // Время отметки
  markedBy: string;       // ID преподавателя
}
```

## 🎨 Архитектура приложения

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Панель администратора
│   ├── teacher/           # Панель преподавателя
│   ├── student/           # Панель студента
│   ├── login/             # Страница входа
│   ├── register/          # Страница регистрации
│   ├── globals.css        # Глобальные стили
│   ├── layout.tsx         # Корневой layout
│   └── providers.tsx      # Провайдеры (React Query, Toast)
├── components/            # React компоненты
├── services/              # API сервисы и React Query хуки
│   ├── authService.ts     # Сервис аутентификации
│   └── attendanceService.ts # Сервис посещаемости
├── store/                 # Zustand хранилища
│   ├── authStore.ts       # Состояние аутентификации
│   └── scheduleStore.ts   # Состояние расписания
├── lib/                   # Конфигурация библиотек
│   └── appwrite.ts        # Конфигурация Appwrite
├── types/                 # TypeScript типы
│   └── index.ts           # Основные типы системы
└── middleware.ts          # Next.js middleware для защиты маршрутов
```

## 🔒 Система прав доступа

### Маршруты по ролям

- `/admin/*` - Только администраторы
- `/teacher/*` - Администраторы и преподаватели
- `/student/*` - Администраторы и студенты
- `/login`, `/register` - Публичные страницы

### Права на действия

| Действие                    | Администратор | Преподаватель | Студент |
| --------------------------- | ------------- | ------------- | ------- |
| Управление пользователями   | ✅            | ❌            | ❌      |
| Создание групп и предметов  | ✅            | ❌            | ❌      |
| Управление расписанием      | ✅            | ❌            | ❌      |
| Отметка посещаемости        | ✅            | ✅            | ❌      |
| Просмотр всей статистики    | ✅            | ✅            | ❌      |
| Просмотр своей посещаемости | ✅            | ✅            | ✅      |

## 📱 Адаптивность

Приложение полностью адаптировано для:

- 📱 Мобильные устройства (320px+)
- 📱 Планшеты (768px+)
- 💻 Десктопы (1024px+)
- 🖥 Большие экраны (1400px+)

## 🧪 Доступные скрипты

```bash
# Разработка
npm run dev          # Запуск в режиме разработки
npm run build        # Сборка для продакшена
npm run start        # Запуск продакшен версии
npm run lint         # Проверка кода линтером

# База данных
npm run db:test      # Проверка подключения к Appwrite
npm run db:setup     # Создание коллекций
npm run db:reset     # Удаление коллекций
npm run db:reset-setup # Пересоздание коллекций
```

## 🎯 Используемые технологии в деталях

### State Management (Zustand)

Все глобальное состояние управляется через Zustand:

- **authStore** - состояние аутентификации и текущего пользователя
- **scheduleStore** - состояние расписания и выбранных дат

### Data Fetching (React Query)

Все API запросы идут через TanStack React Query:

- Автоматическое кеширование
- Optimistic updates
- Background refetching
- Error handling

### Styling (Tailwind CSS 4)

Используется новый синтаксис Tailwind CSS 4:

- Кастомные цвета и темы
- Анимации и переходы
- Адаптивный дизайн
- CSS-in-JS через @theme

## 🔧 Кастомизация

### Добавление новых ролей

1. Обновите enum `UserRole` в `src/types/index.ts`
2. Добавьте соответствующие проверки в middleware
3. Создайте новые маршруты и компоненты

### Изменение статусов посещаемости

1. Обновите enum `AttendanceStatus` в `src/types/index.ts`
2. Обновите цвета и метки в соответствующих константах

### Настройка темы

Основные цвета настраиваются в файле `src/app/globals.css` в разделе `@theme`.

## 🚀 Развертывание

### Vercel (рекомендуется)

1. Подключите репозиторий к Vercel
2. Настройте переменные окружения в панели Vercel
3. Разверните автоматически

### Другие платформы

Приложение можно развернуть на любой платформе, поддерживающей Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🐛 Отладка

### Проблемы с Appwrite

1. Проверьте настройки CORS в консоли Appwrite
2. Убедитесь, что API ключ имеет необходимые права
3. Проверьте правильность ID проекта и базы данных

### Проблемы с коллекциями

```bash
# Пересоздать коллекции
npm run db:reset-setup

# Проверить подключение
npm run db:test
```

## 📚 Дополнительные ресурсы

- [Документация Next.js](https://nextjs.org/docs)
- [Документация Appwrite](https://appwrite.io/docs)
- [Документация TanStack Query](https://tanstack.com/query/latest)
- [Документация Zustand](https://zustand-demo.pmnd.rs/)
- [Документация Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для вашей функции (`git checkout -b feature/AmazingFeature`)
3. Сделайте коммит изменений (`git commit -m 'Add some AmazingFeature'`)
4. Запушьте в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📝 Лицензия

Этот проект распространяется под лицензией MIT. См. файл `LICENSE` для подробностей.

## ⚠️ Известные ограничения

- Максимальный размер загружаемых файлов: 10MB (настройка Appwrite)
- Лимит на количество запросов: зависит от тарифного плана Appwrite
- Поддержка браузеров: современные браузеры с поддержкой ES2017+

## 🆘 Поддержка

Если у вас возникли вопросы или проблемы:

1. Проверьте секцию "Отладка" в этом README
2. Посмотрите в Issues репозитория
3. Создайте новый Issue с подробным описанием проблемы

## 🔄 Roadmap

- [ ] Уведомления в реальном времени
- [ ] Мобильное приложение
- [ ] Интеграция с календарем
- [ ] Экспорт отчетов в Excel/PDF
- [ ] API для интеграций
- [ ] Многоязычность
- [ ] Темная тема
- [ ] Массовая отметка посещаемости
- [ ] Система оценок
