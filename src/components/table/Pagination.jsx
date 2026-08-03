import { MdChevronLeft, MdChevronRight, MdFirstPage, MdLastPage } from 'react-icons/md';
import clsx from 'clsx';
import Button from '@components/ui/Button';

/**
 * Pagination — full-featured pagination with page input, page size selector, and info text.
 */
const Pagination = ({
  page,
  pageSize      = 25,
  total         = 0,
  onPageChange,
  onPageSizeChange,
  pageSizes     = [10, 25, 50, 100],
  showInfo      = true,
  showPageSizes = true,
  className     = '',
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start      = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end        = Math.min(page * pageSize, total);

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4)        return [1, 2, 3, 4, 5, '…', totalPages];
    if (page >= totalPages - 3) return [1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '…', page - 1, page, page + 1, '…', totalPages];
  };

  return (
    <div className={clsx(
      'flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-3',
      className,
    )}>
      {/* Info */}
      {showInfo && (
        <p className="text-sm text-surface-500 dark:text-surface-400 flex-shrink-0">
          Showing <span className="font-semibold text-surface-700 dark:text-surface-200">{start}–{end}</span> of{' '}
          <span className="font-semibold text-surface-700 dark:text-surface-200">{total}</span> results
        </p>
      )}

      <div className="flex items-center gap-2">
        {/* Page Size */}
        {showPageSizes && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            className="h-9 px-2 text-sm rounded-xl border border-surface-200 dark:border-surface-700
                       bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300
                       focus:ring-2 focus:ring-primary-500/40 focus:outline-none"
          >
            {pageSizes.map((s) => (
              <option key={s} value={s}>{s} / page</option>
            ))}
          </select>
        )}

        {/* First */}
        <Button
          variant="secondary"
          size="sm"
          iconOnly
          disabled={page <= 1}
          onClick={() => onPageChange?.(1)}
          aria-label="First page"
        >
          <MdFirstPage size={18} />
        </Button>

        {/* Prev */}
        <Button
          variant="secondary"
          size="sm"
          iconOnly
          disabled={page <= 1}
          onClick={() => onPageChange?.(page - 1)}
          aria-label="Previous page"
        >
          <MdChevronLeft size={18} />
        </Button>

        {/* Pages */}
        <div className="flex items-center gap-1">
          {getPages().map((p, i) =>
            p === '…' ? (
              <span key={`ellipsis-${i}`} className="w-9 text-center text-surface-400 text-sm">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange?.(p)}
                className={clsx(
                  'w-9 h-9 rounded-xl text-sm font-medium transition-all duration-150',
                  p === page
                    ? 'bg-gradient-primary text-white shadow-glow'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700',
                )}
              >
                {p}
              </button>
            )
          )}
        </div>

        {/* Next */}
        <Button
          variant="secondary"
          size="sm"
          iconOnly
          disabled={page >= totalPages}
          onClick={() => onPageChange?.(page + 1)}
          aria-label="Next page"
        >
          <MdChevronRight size={18} />
        </Button>

        {/* Last */}
        <Button
          variant="secondary"
          size="sm"
          iconOnly
          disabled={page >= totalPages}
          onClick={() => onPageChange?.(totalPages)}
          aria-label="Last page"
        >
          <MdLastPage size={18} />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
