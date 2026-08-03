import { RouterProvider } from 'react-router-dom';
import { Toaster }        from 'react-hot-toast';
import { ThemeProvider }  from '@/context/ThemeContext';
import ErrorBoundary      from '@components/common/ErrorBoundary';
import router             from '@/routes/index';
import { useTheme }       from '@/context/ThemeContext';

// ─── Toast wrapper (needs theme context) ──────────────────────
const ToastProvider = () => {
  const { isDark } = useTheme();
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 3500,
        style: {
          background:   isDark ? '#1e293b' : '#ffffff',
          color:        isDark ? '#f1f5f9' : '#0f172a',
          border:       `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          borderRadius: '12px',
          boxShadow:    isDark
            ? '0 4px 24px rgba(0,0,0,0.4)'
            : '0 4px 24px rgba(0,0,0,0.08)',
          fontSize:     '14px',
          fontFamily:   'Inter, sans-serif',
          padding:      '12px 16px',
          maxWidth:     '380px',
        },
        success: {
          iconTheme: { primary: '#22c55e', secondary: isDark ? '#1e293b' : '#fff' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: isDark ? '#1e293b' : '#fff' },
        },
      }}
    />
  );
};

// ─── Root App ─────────────────────────────────────────────────
// NOTE: AuthProvider is intentionally placed INSIDE the router via routes/index.jsx
// (in the root layout component) because it uses useNavigate() which requires
// React Router context. ThemeProvider is kept here since it has no router dependency.
const App = () => (
  <ThemeProvider>
    <ErrorBoundary>
      <RouterProvider router={router} />
      <ToastProvider />
    </ErrorBoundary>
  </ThemeProvider>
);

export default App;
