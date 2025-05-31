"use client";

import React from "react";
import { Button } from "./Button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error?: Error;
    resetError: () => void;
  }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Вызываем callback для отправки ошибки в систему мониторинга
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
          />
        );
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

// Компонент отображения ошибки по умолчанию
interface DefaultErrorFallbackProps {
  error?: Error;
  errorInfo?: React.ErrorInfo;
  resetError: () => void;
  showDetails?: boolean;
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({
  error,
  errorInfo,
  resetError,
  showDetails = false,
}) => {
  const [detailsVisible, setDetailsVisible] = React.useState(false);

  const goHome = () => {
    window.location.href = "/";
  };

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Упс! Что-то пошло не так
          </h1>

          <p className="text-slate-600 mb-6">
            Произошла неожиданная ошибка. Мы извиняемся за неудобства.
            Попробуйте обновить страницу или вернуться на главную.
          </p>

          <div className="space-y-3 mb-6">
            <Button
              variant="primary"
              fullWidth
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={resetError}
            >
              Попробовать снова
            </Button>

            <Button
              variant="outline"
              fullWidth
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={refreshPage}
            >
              Обновить страницу
            </Button>

            <Button
              variant="ghost"
              fullWidth
              icon={<Home className="w-4 h-4" />}
              onClick={goHome}
            >
              На главную
            </Button>
          </div>

          {showDetails && error && (
            <div className="text-left">
              <button
                onClick={() => setDetailsVisible(!detailsVisible)}
                className="text-sm text-slate-500 hover:text-slate-700 underline mb-3"
              >
                {detailsVisible ? "Скрыть" : "Показать"} детали ошибки
              </button>

              {detailsVisible && (
                <div className="bg-slate-100 rounded-lg p-4 text-xs font-mono text-left max-h-48 overflow-auto">
                  <div className="mb-2">
                    <strong>Ошибка:</strong> {error.name}
                  </div>
                  <div className="mb-2">
                    <strong>Сообщение:</strong> {error.message}
                  </div>
                  {error.stack && (
                    <div className="mb-2">
                      <strong>Stack trace:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                  {errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="text-xs text-slate-400 mt-6">
            Если проблема повторяется, обратитесь в службу поддержки
          </div>
        </div>
      </div>
    </div>
  );
};

// Хук для работы с ошибками
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const throwError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { throwError, clearError };
};

// HOC для оборачивания компонентов в ErrorBoundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
) {
  const WrappedComponent = (props: P) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}

// Простая fallback компонента для мелких ошибок
export const SimpleErrorFallback: React.FC<{
  error?: Error;
  resetError: () => void;
}> = ({ error, resetError }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
    <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-2" />
    <h3 className="text-sm font-medium text-red-800 mb-2">Ошибка загрузки</h3>
    <p className="text-xs text-red-600 mb-3">
      {error?.message || "Произошла неожиданная ошибка"}
    </p>
    <Button size="sm" variant="outline" onClick={resetError}>
      Повторить
    </Button>
  </div>
);

// Async компонент с обработкой ошибок
export const AsyncErrorBoundary: React.FC<{
  children: React.ReactNode;
  onError?: (error: Error) => void;
}> = ({ children, onError }) => {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error("Async error:", error, errorInfo);
        onError?.(error);
      }}
      fallback={SimpleErrorFallback}
    >
      {children}
    </ErrorBoundary>
  );
};
