import { useEffect, useState } from 'react';

/**
 * Debounce a rapidly-changing value.
 * @param {*} value - The value to debounce
 * @param {number} delay - Delay in ms (default 400)
 */
const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

export default useDebounce;
