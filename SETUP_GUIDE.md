# 🚀 Быстрый запуск AttendTrack

## Исправления в коде

### 1. Обновленные типы

- Добавлен `RegisterResult` тип для корректной обработки результата регистрации
- Исправлены импорты в `src/utils/permissions.ts`

### 2. Исправленная система аутентификации

- Обновлен `authService.ts` с корректной логикой первого пользователя
- Добавлена автоматическая авторизация первого администратора
- Исправлен `authStore.ts` с правильным persist middleware

### 3. Новые скрипты настройки

#### Настройка базы данных:

```bash
# Проверка подключения
npm run db:test

# Создание коллекций
npm run db:setup

# Полное пересоздание
npm run db:reset-setup
```

#### Настройка прав доступа:

```bash
# Проверка текущих прав
npm run permissions:check

# Обновление прав доступа
npm run permissions:update

# Полная настройка прав
npm run permissions:setup
```

#### Полная настройка одной командой:

```bash
npm run setup:full
```

## Порядок запуска

1. **Настройте переменные окружения** в `.env.local`:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
APPWRITE_API_KEY=your_api_key

NEXT_PUBLIC_USERS_COLLECTION_ID=users
NEXT_PUBLIC_GROUPS_COLLECTION_ID=groups
NEXT_PUBLIC_SUBJECTS_COLLECTION_ID=subjects
NEXT_PUBLIC_SCHEDULE_COLLECTION_ID=schedule
NEXT_PUBLIC_ATTENDANCE_COLLECTION_ID=attendance
NEXT_PUBLIC_CLASSES_COLLECTION_ID=classes
```

2. **Установите зависимости**:

```bash
npm install
```

3. **Настройте базу данных и права**:

```bash
npm run setup:full
```

4. **Запустите приложение**:

```bash
npm run dev
```

5. **Создайте первого администратора**:
   - Перейдите на `/register`
   - Зарегистрируйтесь (первый пользователь автоматически станет админом)
   - Вы будете автоматически авторизованы и перенаправлены в админ-панель

## Исправленные проблемы

✅ **Property 'isFirstUser' does not exist on type 'User'** - исправлено добавлением `RegisterResult` типа

✅ **Persist middleware** - обновлен для zustand v5

✅ **Права доступа Appwrite** - добавлены скрипты для автоматической настройки

✅ **Автоматический вход первого пользователя** - реализован в странице регистрации

## Следующие шаги

После успешного запуска вы можете:

- Создавать группы в админ-панели
- Добавлять предметы и преподавателей
- Настраивать расписание
- Начать отмечать посещаемость

## Возможные проблемы

### CORS ошибки:

Убедитесь, что в настройках Appwrite проекта добавлен домен `http://localhost:3000`

### Ошибки прав доступа:

Запустите: `npm run permissions:setup`

### Ошибки коллекций:

Запустите: `npm run db:reset-setup`
