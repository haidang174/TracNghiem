import type { ReactNode } from "react";

export interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  width?: number | string;
  render?: (value: T[keyof T], row: T) => ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  emptyText?: string;
}

export function Table<T extends Record<string, unknown>>({ columns, data, emptyText = "Không có dữ liệu" }: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-neutral-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-neutral-50 border-b border-neutral-200">
            {columns.map(col => (
              <th key={String(col.key)} className="px-4 py-3 text-left font-semibold text-neutral-600 whitespace-nowrap" style={{ width: col.width }}>
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-neutral-400">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                {columns.map(col => (
                  <td key={String(col.key)} className="px-4 py-3 text-neutral-800">
                    {col.render ? col.render(row[col.key as keyof T], row) : String(row[col.key as keyof T] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
