import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdArrowUpward, MdArrowDownward, MdUnfoldMore } from 'react-icons/md';
import clsx from 'clsx';
import Skeleton from '@components/common/Skeleton';

/**
 * Table — sortable data table with loading/empty states, row selection, and sticky header.
 *
 * @param {Array}    columns  - [{ key, label, sortable, width, render }]
 * @param {Array}    data     - rows
 * @param {boolean}  loading  - show skeleton rows
 * @param {string}   emptyMsg - empty state message
 * @param {boolean}  selectable - enable row checkboxes
 * @param {Function} onRowClick - row click handler
 */
const Table = ({
  columns      = [],
  data         = [],
  loading      = false,
  emptyMsg     = 'No records found.',
  emptyIcon    = null,
  selectable   = false,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  onRowClick,
  sortKey,
  sortOrder    = 'asc',
  onSort,
  stickyHeader = true,
  className    = '',
}) => {
  const allSelected = data.length > 0 && selectedRows.length === data.length;

  const SortIcon = ({ col }) => {
    if (!col.sortable) return null;
    if (sortKey === col.key)
      return sortOrder === 'asc'
        ? <MdArrowUpward   size={14} className="text-primary-500 ml-0.5" />
        : <MdArrowDownward size={14} className="text-primary-500 ml-0.5" />;
    return <MdUnfoldMore size={14} className="opacity-40 ml-0.5" />;
  };

  return (
    <div className={clsx('table-wrapper', className)}>
      <table className="data-table">
        <thead className={stickyHeader ? 'sticky top-0 z-10' : ''}>
          <tr>
            {selectable && (
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll?.(e.target.checked)}
                  className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
                onClick={col.sortable ? () => onSort?.(col.key) : undefined}
                className={clsx(
                  col.sortable && 'cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 select-none',
                  col.align === 'right'  && 'text-right',
                  col.align === 'center' && 'text-center',
                )}
              >
                <span className="inline-flex items-center">
                  {col.label}
                  <SortIcon col={col} />
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="border-b border-surface-100 dark:border-surface-800">
                {selectable && <td className="px-4 py-3"><Skeleton className="h-4 w-4" /></td>}
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <Skeleton className={clsx('h-4', col.width ? `w-[${col.width}]` : 'w-full')} />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="py-16 text-center"
              >
                <div className="flex flex-col items-center gap-3 text-surface-400">
                  {emptyIcon && <div className="text-4xl opacity-40">{emptyIcon}</div>}
                  <p className="text-sm">{emptyMsg}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, idx) => {
              const isSelected = selectedRows.includes(row.id ?? idx);
              return (
                <motion.tr
                  key={row.id ?? idx}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.2 }}
                  onClick={() => onRowClick?.(row)}
                  className={clsx(
                    'border-b border-surface-100 dark:border-surface-800',
                    'hover:bg-surface-50 dark:hover:bg-surface-800/50',
                    'transition-colors duration-150',
                    isSelected && 'bg-primary-50/60 dark:bg-primary-950/20',
                    onRowClick && 'cursor-pointer',
                  )}
                >
                  {selectable && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onSelectRow?.(row.id ?? idx, e.target.checked)}
                        className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={clsx(
                        col.align === 'right'  && 'text-right',
                        col.align === 'center' && 'text-center',
                      )}
                    >
                      {col.render
                        ? col.render(row[col.key], row, idx)
                        : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </motion.tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
