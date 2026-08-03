import { useState, useEffect, useCallback } from 'react';
import roleService from '@/api/services/roleService';

/**
 * useRoles — fetches all active roles for selection/management.
 *
 * Returns:
 *  - roles     : RoleResponse[]
 *  - loading   : boolean
 *  - error     : string | null
 *  - refresh() : re-fetch roles
 */
const useRoles = () => {
  const [roles,   setRoles]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await roleService.getAllActive();
      setRoles(res?.data ?? []);
      setError(null);
    } catch (err) {
      console.error('[useRoles] fetch error:', err);
      setError(err?.response?.data?.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const refresh = useCallback(() => fetchRoles(), [fetchRoles]);

  return { roles, loading, error, refresh };
};

export default useRoles;
