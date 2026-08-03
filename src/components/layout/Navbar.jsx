import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdMenu, MdSearch, MdNotifications, MdSettings,
  MdPerson, MdLogout, MdDarkMode, MdLightMode,
} from 'react-icons/md';
import { HiOutlineShieldCheck } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar    from '@components/ui/Avatar';
import Dropdown  from '@components/ui/Dropdown';
import Breadcrumb from '@components/layout/Breadcrumb';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

// ─── Role display helpers ─────────────────────────────────────
const ROLE_LABELS = {
  ROLE_ADMIN:             'Administrator',
  ROLE_WAREHOUSE_MANAGER: 'Warehouse Manager',
  ROLE_INVENTORY_STAFF:   'Inventory Staff',
};

const getRoleLabel = (roles = []) => {
  if (!roles?.length) return 'User';
  const name = typeof roles[0] === 'string' ? roles[0] : roles[0]?.name;
  return ROLE_LABELS[name] ?? 'User';
};

// ─── Notification badge ───────────────────────────────────────
const NotifBadge = ({ count }) => {
  if (!count) return null;
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-danger-500 text-white text-[10px] font-bold flex items-center justify-center px-1 pointer-events-none"
    >
      {count > 9 ? '9+' : count}
    </motion.span>
  );
};

// ─── Navbar ───────────────────────────────────────────────────
const Navbar = ({ onMenuClick, sidebarCollapsed }) => {
  const { isDark, toggleTheme }     = useTheme();
  const { user, logout, isAdmin }   = useAuth();
  const navigate                    = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  const fullName  = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : 'User';
  const roleLabel = getRoleLabel(user?.roles);

  // ─── User profile dropdown ──────────────────────────────────
  const userMenuItems = [
    {
      label: (
        <div className="px-1 py-0.5">
          <p className="text-sm font-semibold text-surface-900 dark:text-surface-50 leading-tight">{fullName}</p>
          <p className="text-xs text-surface-400 mt-0.5">{user?.email ?? ''}</p>
        </div>
      ),
      disabled: true,
    },
    { divider: true },
    { label: 'My Profile', icon: <MdPerson />,   onClick: () => navigate('/profile') },
    { label: 'Settings',   icon: <MdSettings />, onClick: () => navigate('/settings') },
    ...(isAdmin?.() ? [{ label: 'User Management', icon: <HiOutlineShieldCheck />, onClick: () => navigate('/users') }] : []),
    { divider: true },
    { label: 'Sign Out',   icon: <MdLogout />,   onClick: () => logout(), danger: true },
  ];

  return (
    <>
      <header
        className={clsx(
          'fixed top-0 right-0 z-20 h-16',
          'bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl',
          'border-b border-surface-200 dark:border-surface-700/60',
          'flex items-center px-4 gap-3',
          'transition-all duration-300',
        )}
        style={{
          left: sidebarCollapsed ? '72px' : '260px',
        }}
      >
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-700 dark:hover:text-surface-200 transition-colors"
          aria-label="Toggle menu"
        >
          <MdMenu size={22} />
        </button>

        {/* Breadcrumb — desktop */}
        <div className="hidden md:flex items-center flex-1 min-w-0">
          <Breadcrumb />
        </div>

        {/* Search — desktop */}
        <div className="hidden lg:flex items-center max-w-xs w-full">
          <div className="relative w-full">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" size={17} />
            <input
              type="search"
              placeholder="Search…"
              className="input-base h-9 pl-9 pr-3 text-sm w-full"
            />
          </div>
        </div>

        <div className="flex-1 lg:flex-none" />

        {/* Right actions */}
        <div className="flex items-center gap-1">

          {/* Mobile search toggle */}
          <button
            onClick={() => setSearchOpen((v) => !v)}
            className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            aria-label="Search"
          >
            <MdSearch size={20} />
          </button>

          {/* Theme toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-primary-500 transition-all"
            aria-label="Toggle dark mode"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isDark ? 'dark' : 'light'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0,   opacity: 1 }}
                exit={{ rotate: 90,  opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {isDark ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {/* Notifications */}
          <Dropdown
            align="right"
            trigger={
              <div className="relative w-9 h-9 rounded-xl flex items-center justify-center text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-primary-500 transition-all cursor-pointer">
                <MdNotifications size={21} />
                <NotifBadge count={2} />
              </div>
            }
            items={[
              {
                label: (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold">Low stock alert: Wireless Headset Pro</span>
                    <span className="text-xs text-surface-400">2 minutes ago</span>
                  </div>
                ),
                icon: <span className="w-2 h-2 rounded-full bg-warning-500 flex-shrink-0 mt-1" />,
                onClick: () => navigate('/notifications'),
              },
              {
                label: (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold">Purchase Order #1042 approved</span>
                    <span className="text-xs text-surface-400">1 hour ago</span>
                  </div>
                ),
                icon: <span className="w-2 h-2 rounded-full bg-success-500 flex-shrink-0 mt-1" />,
                onClick: () => navigate('/notifications'),
              },
              { divider: true },
              { label: 'View all notifications', onClick: () => navigate('/notifications') },
            ]}
            menuClass="w-80"
          />

          {/* User profile dropdown */}
          <Dropdown
            align="right"
            showArrow
            trigger={
              <div className="flex items-center gap-2 ml-1 pl-1.5 py-1 pr-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer">
                <Avatar
                  name={fullName}
                  size="sm"
                  status="online"
                />
                <div className="hidden sm:block text-left min-w-0">
                  <p className="text-sm font-semibold text-surface-800 dark:text-surface-100 leading-tight truncate max-w-[120px]">
                    {fullName}
                  </p>
                  <p className="text-[11px] text-surface-400 dark:text-surface-500 leading-tight truncate max-w-[120px]">
                    {roleLabel}
                  </p>
                </div>
              </div>
            }
            items={userMenuItems}
            menuClass="w-56"
          />
        </div>
      </header>

      {/* Mobile search drawer */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="fixed top-16 left-0 right-0 z-20 p-3 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700 lg:hidden shadow-lg"
          >
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" size={18} />
              <input
                autoFocus
                type="search"
                placeholder="Search products, orders, suppliers…"
                className="input-base h-10 pl-9 text-sm w-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
