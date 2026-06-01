import { type ReactElement, type ReactNode } from 'react'
import { cn } from '../lib/cn'

export interface DataTableColumn<T> {
  key: string
  header: string
  className?: string
  headerClassName?: string
  cell: (row: T, index: number) => ReactNode
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  getRowKey: (row: T, index: number) => string
  onRowClick?: (row: T) => void
  emptyState?: ReactNode
  className?: string
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  emptyState,
  className,
}: DataTableProps<T>): ReactElement {
  if (rows.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  return (
    <div
      className={cn(
        'w-full overflow-x-auto rounded-xl border border-border-subtle bg-background',
        className,
      )}
    >
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border-subtle bg-surface">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary',
                  col.headerClassName,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={getRowKey(row, i)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'border-b border-border-subtle/50 last:border-0 transition-colors',
                onRowClick && 'cursor-pointer hover:bg-surface',
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn('px-4 py-3 text-sm text-text-primary', col.className)}
                >
                  {col.cell(row, i)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
