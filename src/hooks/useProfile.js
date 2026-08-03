import { useState, useEffect, useCallback } from 'react';
import userService from '@/api/services/userService';

/**
 * useProfile — manages the authenticated user's profile state and actions.
 *
 * Returns:
 *  - profile      : UserResponse | null
 *  - loading      : boolean
 *  - error        : string | null
 *  - updateProfile(data)    : update own profile
 *  - changePassword(data)   : change own password
 *  - uploadPicture(file)    : upload profile picture
 *  - refresh()              : re-fetch profile
 */
const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.getMyProfile();
      setProfile(res?.data ?? null);
      setError(null);
    } catch (err) {
      console.error('[useProfile] fetch error:', err);
      setError(err?.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (data) => {
    const res = await userService.updateMyProfile(data);
    setProfile(res?.data ?? null);
    return res;
  }, []);

  const changePassword = useCallback(async (data) => {
    const res = await userService.changePassword(data);
    return res;
  }, []);

  const uploadPicture = useCallback(async (file) => {
    const res = await userService.uploadProfilePicture(file);
    setProfile(res?.data ?? null);
    return res;
  }, []);

  const refresh = useCallback(() => fetchProfile(), [fetchProfile]);

  return { profile, loading, error, updateProfile, changePassword, uploadPicture, refresh };
};

export default useProfile;
