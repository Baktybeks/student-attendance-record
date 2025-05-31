import React from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: {
    container: "py-8",
    icon: "text-4xl mb-3",
    title: "text-lg",
    description: "text-sm",
  },
  md: {
    container: "py-12",
    icon: "text-6xl mb-4",
    title: "text-xl",
    description: "text-base",
  },
  lg: {
    container: "py-16",
    icon: "text-8xl mb-6",
    title: "text-2xl",
    description: "text-lg",
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = "md",
  className = "",
}) => {
  const classes = sizeClasses[size];

  return (
    <div className={`text-center ${classes.container} ${className}`}>
      {icon && (
        <div className={`${classes.icon} text-slate-400 mb-4`}>{icon}</div>
      )}

      <h3 className={`${classes.title} font-semibold text-slate-900 mb-2`}>
        {title}
      </h3>

      {description && (
        <p
          className={`${classes.description} text-slate-600 mb-6 max-w-md mx-auto`}
        >
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {action && (
            <Button variant="primary" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// Предустановленные состояния
export const NoDataState: React.FC<{
  title?: string;
  description?: string;
  action?: EmptyStateProps["action"];
}> = ({
  title = "Нет данных",
  description = "Здесь пока ничего нет. Попробуйте изменить фильтры или добавить новые данные.",
  action,
}) => (
  <EmptyState
    icon="📭"
    title={title}
    description={description}
    action={action}
  />
);

export const NoSearchResultsState: React.FC<{
  searchTerm?: string;
  onClearSearch?: () => void;
}> = ({ searchTerm, onClearSearch }) => (
  <EmptyState
    icon="🔍"
    title="Ничего не найдено"
    description={
      searchTerm
        ? `По запросу "${searchTerm}" ничего не найдено. Попробуйте изменить поисковый запрос.`
        : "По вашему запросу ничего не найдено. Попробуйте изменить критерии поиска."
    }
    action={
      onClearSearch
        ? {
            label: "Очистить поиск",
            onClick: onClearSearch,
          }
        : undefined
    }
  />
);

export const NoPermissionState: React.FC<{
  title?: string;
  description?: string;
}> = ({
  title = "Нет доступа",
  description = "У вас нет прав для просмотра этого содержимого. Обратитесь к администратору за помощью.",
}) => (
  <EmptyState icon="🔒" title={title} description={description} size="md" />
);

export const ErrorState: React.FC<{
  title?: string;
  description?: string;
  onRetry?: () => void;
}> = ({
  title = "Что-то пошло не так",
  description = "Произошла ошибка при загрузке данных. Попробуйте обновить страницу или повторить попытку.",
  onRetry,
}) => (
  <EmptyState
    icon="⚠️"
    title={title}
    description={description}
    action={
      onRetry
        ? {
            label: "Повторить",
            onClick: onRetry,
          }
        : undefined
    }
  />
);

export const OfflineState: React.FC<{
  onRetry?: () => void;
}> = ({ onRetry }) => (
  <EmptyState
    icon="📡"
    title="Нет подключения"
    description="Проверьте подключение к интернету и попробуйте снова."
    action={
      onRetry
        ? {
            label: "Попробовать снова",
            onClick: onRetry,
          }
        : undefined
    }
  />
);

export const ComingSoonState: React.FC<{
  title?: string;
  description?: string;
}> = ({
  title = "Скоро будет",
  description = "Эта функция находится в разработке. Следите за обновлениями!",
}) => <EmptyState icon="🚧" title={title} description={description} />;

export const MaintenanceState: React.FC<{
  title?: string;
  description?: string;
  estimatedTime?: string;
}> = ({
  title = "Техническое обслуживание",
  description = "Система временно недоступна в связи с техническим обслуживанием.",
  estimatedTime,
}) => (
  <EmptyState
    icon="🔧"
    title={title}
    description={
      estimatedTime
        ? `${description} Ожидаемое время восстановления: ${estimatedTime}.`
        : description
    }
    size="lg"
  />
);

export const WelcomeState: React.FC<{
  title: string;
  description?: string;
  action?: EmptyStateProps["action"];
  secondaryAction?: EmptyStateProps["secondaryAction"];
}> = ({ title, description, action, secondaryAction }) => (
  <EmptyState
    icon="👋"
    title={title}
    description={description}
    action={action}
    secondaryAction={secondaryAction}
    size="lg"
  />
);
