import React from "react";
import { ChevronUp, ChevronDown, MoreHorizontal } from "lucide-react";

interface Column<T = any> {
  key: string;
  title: string;
  dataIndex?: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string | number;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  fixed?: "left" | "right";
  className?: string;
}

interface TableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  empty?: React.ReactNode;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  sortable?: boolean;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedRowKeys: string[]) => void;
  rowKey?: string | ((record: T) => string);
  onRow?: (
    record: T,
    index: number
  ) => {
    onClick?: () => void;
    onDoubleClick?: () => void;
    className?: string;
  };
  size?: "sm" | "md" | "lg";
  bordered?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  sticky?: boolean;
  className?: string;
}

export function Table<T = any>({
  columns,
  data,
  loading = false,
  empty,
  pagination,
  sortable = false,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  rowKey = "id",
  onRow,
  size = "md",
  bordered = true,
  striped = false,
  hoverable = true,
  sticky = false,
  className = "",
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const getRowKey = React.useCallback(
    (record: T): string => {
      if (typeof rowKey === "function") {
        return rowKey(record);
      }
      return (record as any)[rowKey] || "";
    },
    [rowKey]
  );

  const handleSort = (columnKey: string) => {
    if (!sortable) return;

    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === columnKey && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key: columnKey, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig || !sortable) return data;

    const { key, direction } = sortConfig;
    const column = columns.find((col) => col.key === key);
    if (!column) return data;

    return [...data].sort((a, b) => {
      const aValue = column.dataIndex ? (a as any)[column.dataIndex] : a;
      const bValue = column.dataIndex ? (b as any)[column.dataIndex] : b;

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig, columns, sortable]);

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      const allKeys = sortedData.map(getRowKey);
      onSelectionChange(allKeys);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (rowKey: string, checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      onSelectionChange([...selectedRows, rowKey]);
    } else {
      onSelectionChange(selectedRows.filter((key) => key !== rowKey));
    }
  };

  const isAllSelected =
    selectedRows.length === sortedData.length && sortedData.length > 0;
  const isIndeterminate =
    selectedRows.length > 0 && selectedRows.length < sortedData.length;

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const cellPadding = {
    sm: "px-3 py-2",
    md: "px-4 py-3",
    lg: "px-6 py-4",
  };

  const tableClasses = [
    "w-full",
    sizeClasses[size],
    bordered ? "border border-slate-200" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const theadClasses = ["bg-slate-50", sticky ? "sticky top-0 z-10" : ""]
    .filter(Boolean)
    .join(" ");

  if (loading) {
    return (
      <div className="w-full border border-slate-200 rounded-lg">
        <div className="animate-pulse">
          <div className="bg-slate-50 h-12 border-b border-slate-200"></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 border-b border-slate-200 last:border-b-0"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full border border-slate-200 rounded-lg">
        <div className="bg-slate-50 border-b border-slate-200">
          <div className="flex">
            {selectable && (
              <div
                className={`${cellPadding[size]} border-r border-slate-200 w-12`}
              ></div>
            )}
            {columns.map((column) => (
              <div
                key={column.key}
                className={`${
                  cellPadding[size]
                } font-medium text-slate-700 border-r border-slate-200 last:border-r-0 ${
                  column.align === "center"
                    ? "text-center"
                    : column.align === "right"
                    ? "text-right"
                    : "text-left"
                }`}
                style={{ width: column.width }}
              >
                {column.title}
              </div>
            ))}
          </div>
        </div>
        <div className="p-12 text-center">
          {empty || (
            <div className="text-slate-500">
              <div className="text-4xl mb-4">📭</div>
              <div>Нет данных для отображения</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <div className="overflow-x-auto">
        <table className={tableClasses}>
          <thead className={theadClasses}>
            <tr>
              {selectable && (
                <th
                  className={`${cellPadding[size]} border-r border-slate-200 w-12`}
                >
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${
                    cellPadding[size]
                  } font-medium text-slate-700 border-r border-slate-200 last:border-r-0 ${
                    column.align === "center"
                      ? "text-center"
                      : column.align === "right"
                      ? "text-right"
                      : "text-left"
                  } ${
                    column.sortable || sortable
                      ? "cursor-pointer hover:bg-slate-100"
                      : ""
                  } ${column.className || ""}`}
                  style={{ width: column.width }}
                  onClick={() => {
                    if (column.sortable || sortable) {
                      handleSort(column.key);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span>{column.title}</span>
                    {(column.sortable || sortable) && (
                      <div className="flex flex-col ml-2">
                        <ChevronUp
                          className={`w-3 h-3 ${
                            sortConfig?.key === column.key &&
                            sortConfig.direction === "asc"
                              ? "text-blue-600"
                              : "text-slate-400"
                          }`}
                        />
                        <ChevronDown
                          className={`w-3 h-3 -mt-1 ${
                            sortConfig?.key === column.key &&
                            sortConfig.direction === "desc"
                              ? "text-blue-600"
                              : "text-slate-400"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((record, index) => {
              const key = getRowKey(record);
              const isSelected = selectedRows.includes(key);
              const rowProps = onRow?.(record, index) || {};

              return (
                <tr
                  key={key}
                  className={`
                    border-b border-slate-200 last:border-b-0
                    ${striped && index % 2 === 1 ? "bg-slate-25" : ""}
                    ${hoverable ? "hover:bg-slate-50" : ""}
                    ${isSelected ? "bg-blue-50" : ""}
                    ${rowProps.className || ""}
                  `}
                  onClick={rowProps.onClick}
                  onDoubleClick={rowProps.onDoubleClick}
                >
                  {selectable && (
                    <td
                      className={`${cellPadding[size]} border-r border-slate-200`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(key, e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => {
                    const value = column.dataIndex
                      ? (record as any)[column.dataIndex]
                      : record;
                    const content = column.render
                      ? column.render(value, record, index)
                      : value;

                    return (
                      <td
                        key={column.key}
                        className={`${
                          cellPadding[size]
                        } border-r border-slate-200 last:border-r-0 ${
                          column.align === "center"
                            ? "text-center"
                            : column.align === "right"
                            ? "text-right"
                            : "text-left"
                        } ${column.className || ""}`}
                        style={{ width: column.width }}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="text-sm text-slate-600">
            Показано {(pagination.current - 1) * pagination.pageSize + 1}-
            {Math.min(
              pagination.current * pagination.pageSize,
              pagination.total
            )}{" "}
            из {pagination.total}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                pagination.onChange(pagination.current - 1, pagination.pageSize)
              }
              disabled={pagination.current === 1}
              className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Назад
            </button>
            <span className="text-sm text-slate-600">
              Страница {pagination.current} из{" "}
              {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <button
              onClick={() =>
                pagination.onChange(pagination.current + 1, pagination.pageSize)
              }
              disabled={
                pagination.current >=
                Math.ceil(pagination.total / pagination.pageSize)
              }
              className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Далее
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
