import { useState, useCallback } from 'react';

/**
 * useLocalStorage — syncs state to localStorage, with optional JSON (de)serialization.
 *
 * @param {string}  key          - localStorage key
 * @param {*}       initialValue - default value when key is missing
 * @param {boolean} json         - set false to store raw strings (default true)
 */
const useLocalStorage = (key, initialValue, json = true) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return initialValue;
      return json ? JSON.parse(item) : item;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, json ? JSON.stringify(valueToStore) : String(valueToStore));
    } catch (error) {
      console.warn(`[useLocalStorage] Failed to set "${key}":`, error);
    }
  }, [key, json, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`[useLocalStorage] Failed to remove "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

export default useLocalStorage;
