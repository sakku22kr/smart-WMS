import { useState, useEffect, useRef } from 'react';

/**
 * usePagination — manages page, pageSize, and total state with derived helpers.
 *
 * @param {object} options
 * @param {number} options.initialPage     - starting page (default 1)
 * @param {number} options.initialPageSize - rows per page (default 25)
 * @param {number} options.total           - total record count
 */
const usePagination = ({ initialPage = 1, initialPageSize = 25, total = 0 } = {}) => {
  const [page,     setPage]     = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const isFirstRender = useRef(true);

  // Reset to page 1 when pageSize changes (but not on mount)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    setPage(1);
  }, [pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const offset     = (page - 1) * pageSize;
  const hasNext    = page < totalPages;
  const hasPrev    = page > 1;

  const goToPage  = (p) => setPage(Math.max(1, Math.min(p, totalPages)));
  const nextPage  = ()  => hasNext && setPage((p) => p + 1);
  const prevPage  = ()  => hasPrev && setPage((p) => p - 1);
  const firstPage = ()  => setPage(1);
  const lastPage  = ()  => setPage(totalPages);
  const reset     = ()  => { setPage(initialPage); setPageSize(initialPageSize); };

  return {
    page, pageSize, totalPages, offset, hasNext, hasPrev,
    setPage: goToPage,
    setPageSize,
    nextPage, prevPage, firstPage, lastPage,
    reset,
    // Convenience props to spread directly into <Pagination />
    paginationProps: {
      page, pageSize, total,
      onPageChange:     goToPage,
      onPageSizeChange: (s) => setPageSize(s),
    },
  };
};

export default usePagination;
