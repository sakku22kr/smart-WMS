import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdPersonAdd, MdFilterList, MdClose, MdPeople } from 'react-icons/md';
import PageWrapper  from '@components/layout/PageWrapper';
import Card         from '@components/ui/Card';
import Button       from '@components/ui/Button';
import Badge        from '@components/ui/Badge';
import Search       from '@components/table/Search';
import Pagination   from '@components/table/Pagination';
import Loader       from '@components/common/Loader';
import EmptyState   from '@components/common/EmptyState';
import UserTable    from '@components/users/UserTable';
import useUsers     from '@hooks/useUsers';
import useRoles     from '@hooks/useRoles';
import useDebounce  from '@hooks/useDebounce';

const STATUS_OPTIONS = [
  { value: null,  label: 'All Status' },
  { value: true,  label: 'Active' },
  { value: false, label: 'Inactive' },
];

const Users = () => {
  const navigate = useNavigate();
  const { roles: allRoles } = useRoles();
  const {
    users, total, loading, error,
    page,   setPage,
    size,   setSize,
    search, setSearch,
    sortBy, setSortBy,
    sortDir,
    statusFilter, setStatusFilter,
    roleFilter,   setRoleFilter,
    refresh, deleteUser, toggleStatus,
  } = useUsers({ initialSize: 25, initialSort: 'id' });

  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const debouncedSearch = useDebounce(localSearch, 400);
  const prevDebouncedRef = useRef(debouncedSearch);

  // Sync debounced search to hook (only when value actually changes)
  useEffect(() => {
    if (prevDebouncedRef.current !== debouncedSearch) {
      prevDebouncedRef.current = debouncedSearch;
      setSearch(debouncedSearch);
    }
  }, [debouncedSearch, setSearch]);

  const handleSearchChange = useCallback((e) => {
    setLocalSearch(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setLocalSearch('');
    setSearch('');
  }, [setSearch]);

  const handleSort = useCallback((field) => {
    setSortBy(field);
  }, [setSortBy]);

  const handlePageChange = useCallback((p) => {
    setPage(p - 1); // Pagination is 1-indexed, hook is 0-indexed
  }, [setPage]);

  const handlePageSizeChange = useCallback((s) => {
    setSize(s);
  }, [setSize]);

  const handleDelete = useCallback(async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      await deleteUser(user.id);
    }
  }, [deleteUser]);

  const handleToggleStatus = useCallback(async (id) => {
    await toggleStatus(id);
  }, [toggleStatus]);

  const handleRowClick = useCallback((user) => {
    navigate(`/users/${user.id}`);
  }, [navigate]);

  const hasActiveFilters = statusFilter !== null || roleFilter !== null;

  const ROLE_OPTIONS = [
    { value: null, label: 'All Roles' },
    ...allRoles.map((r) => ({ value: r.id, label: r.name?.replace('ROLE_', '') || r.name })),
  ];

  return (
    <PageWrapper>
      <div className="page-container">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Users</h1>
            <p className="page-subtitle">Manage system users and their roles</p>
          </div>
          <Button variant="primary" leftIcon={<MdPersonAdd />}>Add User</Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card padding="sm" className="text-center">
            <p className="text-2xl font-bold text-primary-600">{total}</p>
            <p className="text-xs text-surface-500 mt-0.5">Total Users</p>
          </Card>
          <Card padding="sm" className="text-center">
            <p className="text-2xl font-bold text-success-600">
              {statusFilter === true ? total : '—'}
            </p>
            <p className="text-xs text-surface-500 mt-0.5">Active</p>
          </Card>
          <Card padding="sm" className="text-center">
            <p className="text-2xl font-bold text-danger-600">
              {statusFilter === false ? total : '—'}
            </p>
            <p className="text-xs text-surface-500 mt-0.5">Inactive</p>
          </Card>
          <Card padding="sm" className="text-center">
            <p className="text-2xl font-bold text-warning-600">
              {roleFilter ? total : '—'}
            </p>
            <p className="text-xs text-surface-500 mt-0.5">
              {roleFilter ? ROLE_OPTIONS.find(r => r.value === roleFilter)?.label || 'Filtered' : 'Admins'}
            </p>
          </Card>
        </div>

        <Card>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Search
              value={localSearch}
              onChange={handleSearchChange}
              onClear={handleClearSearch}
              placeholder="Search users by name, email, phone…"
              className="w-full sm:w-72"
            />
            <div className="flex gap-2 ml-auto">
              <Button
                variant={hasActiveFilters ? 'primary' : 'secondary'}
                size="sm"
                leftIcon={<MdFilterList />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
                {hasActiveFilters && (
                  <Badge variant="primary" size="sm" className="ml-1.5">
                    {(statusFilter !== null ? 1 : 0) + (roleFilter !== null ? 1 : 0)}
                  </Badge>
                )}
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<MdClose />}
                  onClick={() => { setStatusFilter(null); setRoleFilter(null); }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="flex flex-wrap gap-3 mb-4 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700">
              {/* Status Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-surface-500">Status</label>
                <div className="flex gap-1">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={String(opt.value)}
                      onClick={() => setStatusFilter(opt.value)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        statusFilter === opt.value
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-white dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-600 border border-surface-200 dark:border-surface-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Role Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-surface-500">Role</label>
                <div className="flex gap-1 flex-wrap">
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={String(opt.value)}
                      onClick={() => setRoleFilter(opt.value)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        roleFilter === opt.value
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-white dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-600 border border-surface-200 dark:border-surface-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-danger-50 dark:bg-danger-950/20 border border-danger-200 dark:border-danger-800">
              <p className="text-sm text-danger-600 dark:text-danger-400">{error}</p>
              <Button variant="ghost" size="xs" className="mt-2" onClick={refresh}>
                Retry
              </Button>
            </div>
          )}

          {/* Loading or Table */}
          {loading && users.length === 0 ? (
            <div className="py-16 flex justify-center">
              <Loader size="lg" label="Loading users…" />
            </div>
          ) : !loading && users.length === 0 ? (
            <EmptyState
              icon={<MdPeople />}
              title="No users found"
              description={search || hasActiveFilters ? "Try adjusting your search or filters." : "Get started by adding your first user."}
              actionLabel="Add User"
              onAction={() => {}}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <UserTable
                  users={users}
                  loading={loading}
                  sortKey={sortBy}
                  sortOrder={sortDir}
                  onSort={handleSort}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                  onRowClick={handleRowClick}
                />
              </div>

              <Pagination
                page={page + 1}
                pageSize={size}
                total={total}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          )}
        </Card>
      </div>
    </PageWrapper>
  );
};

export default Users;
