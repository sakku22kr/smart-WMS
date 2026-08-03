import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar  from './Navbar';
import useMediaQuery from '@hooks/useMediaQuery';
import clsx from 'clsx';

/**
 * AppLayout — root shell combining Sidebar + Navbar + animated page outlet.
 *
 * Manages:
 *  - Desktop sidebar collapsed/expanded state (reactive, synced to localStorage)
 *  - Mobile drawer open/close state
 *  - Correct margin-left for main content to match sidebar width
 */
const AppLayout = () => {
  const isDesktop = useMediaQuery('lg');

  // Collapsed state — reactive so Navbar offset updates immediately
  const [collapsed,   setCollapsed]   = useState(
    () => localStorage.getItem('wms-sidebar') === 'collapsed'
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleCollapsedChange = useCallback((value) => {
    setCollapsed(value);
  }, []);

  // Sidebar width in px
  const sidebarWidth = isDesktop ? (collapsed ? 72 : 260) : 0;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onCollapsedChange={handleCollapsedChange}
      />

      <Navbar
        onMenuClick={() => setMobileOpen(true)}
        sidebarCollapsed={collapsed && isDesktop}
      />

      {/* Main content — shifts right to clear sidebar */}
      <main
        className={clsx(
          'transition-all duration-300 ease-in-out',
          'pt-16', // Navbar height offset
        )}
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="min-h-[calc(100vh-64px)]">
          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
