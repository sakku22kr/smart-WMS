import { useState, useCallback } from 'react';
import userService from '@/api/services/userService';

/**
 * useChangePassword — manages change-password form state and submission.
 *
 * Returns:
 *  - loading          : boolean
 *  - error            : string | null
 *  - success          : boolean
 *  - changePassword(data) : submit { currentPassword, newPassword, confirmPassword }
 *  - reset()               : clear error/success
 */
const useChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(false);

  const changePassword = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await userService.changePassword(data);
      setSuccess(true);
      return true;
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to change password. Please try again.';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return { loading, error, success, changePassword, reset };
};

export default useChangePassword;
