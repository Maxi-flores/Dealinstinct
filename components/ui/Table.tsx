'use client';

import { type ReactNode, type HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

export function Table({ children, className, ...props }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-surface-200 dark:border-surface-700">
      <table
        className={clsx('min-w-full divide-y divide-surface-200 dark:divide-surface-700', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

interface TableHeadProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export function TableHead({ children, className, ...props }: TableHeadProps) {
  return (
    <thead
      className={clsx('bg-surface-50 dark:bg-surface-800/50', className)}
      {...props}
    >
      {children}
    </thead>
  );
}

interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export function TableBody({ children, className, ...props }: TableBodyProps) {
  return (
    <tbody
      className={clsx(
        'divide-y divide-surface-200 dark:divide-surface-700',
        'bg-white dark:bg-surface-800',
        className
      )}
      {...props}
    >
      {children}
    </tbody>
  );
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  hoverable?: boolean;
  selected?: boolean;
}

export function TableRow({ children, hoverable = true, selected = false, className, ...props }: TableRowProps) {
  return (
    <tr
      className={clsx(
        hoverable && 'hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors',
        selected && 'bg-primary-50 dark:bg-primary-900/20',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

interface TableHeaderCellProps extends HTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
}

export function TableHeaderCell({
  children,
  sortable = false,
  sortDirection = null,
  onSort,
  className,
  ...props
}: TableHeaderCellProps) {
  return (
    <th
      className={clsx(
        'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider',
        'text-surface-600 dark:text-surface-400',
        sortable && 'cursor-pointer select-none hover:text-surface-900 dark:hover:text-surface-200',
        className
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortable && (
          <span className="flex flex-col">
            <svg
              className={clsx(
                'w-3 h-3 -mb-1',
                sortDirection === 'asc' ? 'text-primary-500' : 'text-surface-300 dark:text-surface-600'
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M5 10l5-5 5 5H5z" />
            </svg>
            <svg
              className={clsx(
                'w-3 h-3',
                sortDirection === 'desc' ? 'text-primary-500' : 'text-surface-300 dark:text-surface-600'
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M15 10l-5 5-5-5h10z" />
            </svg>
          </span>
        )}
      </div>
    </th>
  );
}

interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
}

export function TableCell({ children, className, ...props }: TableCellProps) {
  return (
    <td
      className={clsx(
        'px-4 py-3 text-sm text-surface-700 dark:text-surface-300',
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}

// Empty State
interface TableEmptyProps {
  message?: string;
  description?: string;
  action?: ReactNode;
  colSpan?: number;
}

export function TableEmpty({
  message = 'No data found',
  description,
  action,
  colSpan = 1,
}: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="w-12 h-12 text-surface-300 dark:text-surface-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{message}</p>
            {description && (
              <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">{description}</p>
            )}
          </div>
          {action}
        </div>
      </td>
    </tr>
  );
}

export default Table;
