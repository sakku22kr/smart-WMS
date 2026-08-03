import { useState, useEffect, useCallback, useRef } from 'react';
import userService from '@/api/services/userService';

/**
 * useUsers — fetches paginated user list from the backend with filtering.
 *
 * @param {object} options
 * @param {number} options.initialPage   - starting page (0-indexed)
 * @param {number} options.initialSize   - rows per page
 * @param {string} options.initialSort   - sort field
 * @param {string} options.initialDir    - sort direction
 *
 * Returns:
 *  - users, total, loading, error
 *  - page, setPage, size, setSize
 *  - search, setSearch
 *  - sortBy, setSortBy, sortDir, setSortDir
 *  - statusFilter, setStatusFilter (null=all, true=active, false=inactive)
 *  - roleFilter, setRoleFilter (null=all, or role ID)
 *  - refresh(), createUser(), updateUser(), deleteUser(), toggleStatus()
 */
const useUsers = ({
  initialPage = 0,
  initialSize = 25,
  initialSort = 'id',
  initialDir  = 'asc',
} = {}) => {
  const [users,        setUsers]        = useState([]);
  const [total,        setTotal]        = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [page,         setPage]         = useState(initialPage);
  const [size,         setSize]         = useState(initialSize);
  const [search,       setSearch]       = useState('');
  const [sortBy,       setSortBy]       = useState(initialSort);
  const [sortDir,      setSortDir]      = useState(initialDir);
  const [statusFilter, setStatusFilter] = useState(null);
  const [roleFilter,   setRoleFilter]   = useState(null);

  const mountedRef = useRef(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        sortBy,
        sortDir,
        ...(search   ? { search }   : {}),
        ...(statusFilter !== null ? { enabled: statusFilter } : {}),
        ...(roleFilter   !== null ? { roleId: roleFilter }    : {}),
      };

      const res = await userService.getAll(params);
      if (!mountedRef.current) return;

      const payload = res?.data;
      setUsers(payload?.content ?? []);
      setTotal(payload?.totalElements ?? 0);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      console.error('[useUsers] fetch error:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load users');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [page, size, sortBy, sortDir, search, statusFilter, roleFilter]);

  // Reset to page 0 when filters change
  const setPageSafe = useCallback((p) => setPage(p), []);
  const setSortBySafe = useCallback((field) => {
    setSortBy((prev) => {
      if (prev === field) {
        setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
        return prev;
      }
      setSortDir('asc');
      return field;
    });
    setPage(0);
  }, []);

  const setSearchSafe = useCallback((val) => { setSearch(val); setPage(0); }, []);
  const setStatusFilterSafe = useCallback((val) => { setStatusFilter(val); setPage(0); }, []);
  const setRoleFilterSafe = useCallback((val) => { setRoleFilter(val); setPage(0); }, []);
  const setSizeSafe = useCallback((val) => { setSize(val); setPage(0); }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchUsers();
    return () => { mountedRef.current = false; };
  }, [fetchUsers]);

  const refresh = useCallback(() => fetchUsers(), [fetchUsers]);

  const createUser = useCallback(async (data) => {
    const res = await userService.create(data);
    await fetchUsers();
    return res;
  }, [fetchUsers]);

  const updateUser = useCallback(async (id, data) => {
    const res = await userService.update(id, data);
    await fetchUsers();
    return res;
  }, [fetchUsers]);

  const deleteUser = useCallback(async (id) => {
    const res = await userService.delete(id);
    await fetchUsers();
    return res;
  }, [fetchUsers]);

  const toggleStatus = useCallback(async (id) => {
    const res = await userService.toggleStatus(id);
    await fetchUsers();
    return res;
  }, [fetchUsers]);

  return {
    users, total, loading, error,
    page,       setPage:       setPageSafe,
    size,       setSize:       setSizeSafe,
    search,     setSearch:     setSearchSafe,
    sortBy,     setSortBy:     setSortBySafe,
    sortDir,    setSortDir,
    statusFilter, setStatusFilter: setStatusFilterSafe,
    roleFilter,   setRoleFilter:   setRoleFilterSafe,
    refresh, createUser, updateUser, deleteUser, toggleStatus,
  };
};

export default useUsers;
