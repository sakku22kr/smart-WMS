import toast from 'react-hot-toast';
import { useCallback } from 'react';

/**
 * Convenience hook wrapping react-hot-toast with pre-styled variants.
 */
const useToast = () => {
  const success = useCallback((msg, opts = {}) =>
    toast.success(msg, { duration: 3500, ...opts }), []);

  const error = useCallback((msg, opts = {}) =>
    toast.error(msg, { duration: 4500, ...opts }), []);

  const info = useCallback((msg, opts = {}) =>
    toast(msg, { icon: 'ℹ️', duration: 3500, ...opts }), []);

  const warning = useCallback((msg, opts = {}) =>
    toast(msg, { icon: '⚠️', duration: 4000, ...opts }), []);

  const loading = useCallback((msg, opts = {}) =>
    toast.loading(msg, opts), []);

  const dismiss = useCallback((id) =>
    id ? toast.dismiss(id) : toast.dismiss(), []);

  const promise = useCallback((prom, msgs, opts = {}) =>
    toast.promise(prom, msgs, opts), []);

  return { success, error, info, warning, loading, dismiss, promise };
};

export default useToast;
