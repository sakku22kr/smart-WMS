import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('wms-theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('wms-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('wms-theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);
  const setLight    = () => setIsDark(false);
  const setDark     = () => setIsDark(true);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setLight, setDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export default ThemeContext;
