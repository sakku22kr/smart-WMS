import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdDashboard, MdInventory, MdInventory2, MdCategory,
  MdWarehouse, MdLocalShipping, MdShoppingCart, MdBarChart,
  MdPeople, MdSettings, MdPerson, MdNotifications,
  MdChevronLeft, MdChevronRight, MdClose,
} from 'react-icons/md';
import { HiOutlineCube } from 'react-icons/hi2';
import clsx from 'clsx';
import useMediaQuery from '@hooks/useMediaQuery';
import { useAuth } from '@/context/AuthContext';
import { APP_NAME } from '@utils/constants';

// ─── Nav Sections ─────────────────────────────────────────────
// `roles` field: if set, user must have at least one of these roles to see the item
const NAV = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard',     path: '/dashboard',     icon: MdDashboard   },
      { label: 'Notifications', path: '/notifications', icon: MdNotifications },
    ],
  },
  {
    title: 'Inventory',
    items: [
      { label: 'Inventory',  path: '/inventory',  icon: MdInventory  },
      { label: 'Products',   path: '/products',   icon: MdInventory2 },
      { label: 'Categories', path: '/categories', icon: MdCategory   },
      { label: 'Warehouses', path: '/warehouses', icon: MdWarehouse  },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Suppliers',       path: '/suppliers',       icon: MdLocalShipping },
      { label: 'Purchase Orders', path: '/purchase-orders', icon: MdShoppingCart  },
      { label: 'Reports',         path: '/reports',         icon: MdBarChart      },
    ],
  },
  {
    title: 'Administration',
    roles: ['ROLE_ADMIN', 'ROLE_WAREHOUSE_MANAGER'], // section only visible to these roles
    items: [
      { label: 'Users', path: '/users', icon: MdPeople, roles: ['ROLE_ADMIN'] },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Profile',  path: '/profile',  icon: MdPerson   },
      { label: 'Settings', path: '/settings', icon: MdSettings },
    ],
  },
];

// ─── Animation Variants ───────────────────────────────────────
const sidebarVariants = {
  expanded:  { width: 260 },
  collapsed: { width: 72  },
};

const labelVariants = {
  visible: { opacity: 1, x: 0,  transition: { delay: 0.06, duration: 0.18 } },
  hidden:  { opacity: 0, x: -6, transition: { duration: 0.1  } },
};

const mobileVariants = {
  open:   { x: 0,    opacity: 1 },
  closed: { x: -280, opacity: 0 },
};

// ─── NavItem ─────────────────────────────────────────────────
const NavItem = ({ item, collapsed }) => (
  <NavLink
    to={item.path}
    className={({ isActive }) =>
      clsx('nav-link group', isActive && 'active', collapsed && 'justify-center px-0')
    }
    title={collapsed ? item.label : undefined}
    end={item.path === '/dashboard'}
  >
    <item.icon size={20} className="flex-shrink-0" />
    <AnimatePresence>
      {!collapsed && (
        <motion.span
          variants={labelVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="truncate"
        >
          {item.label}
        </motion.span>
      )}
    </AnimatePresence>
  </NavLink>
);

// ─── Section ─────────────────────────────────────────────────
const NavSection = ({ section, collapsed, hasAnyRole }) => {
  // Filter items by role
  const visibleItems = section.items.filter((item) => {
    if (!item.roles?.length) return true;
    return hasAnyRole(...item.roles);
  });

  // Hide entire section if no visible items or user lacks section roles
  if (!visibleItems.length) return null;
  if (section.roles?.length && !hasAnyRole(...section.roles)) return null;

  return (
    <div className="space-y-0.5">
      <AnimatePresence>
        {!collapsed && (
          <motion.p
            variants={labelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-surface-400 dark:text-surface-500"
          >
            {section.title}
          </motion.p>
        )}
      </AnimatePresence>
      {collapsed && <div className="my-2 border-t border-surface-200 dark:border-surface-700/50" />}
      {visibleItems.map((item) => (
        <NavItem key={item.path} item={item} collapsed={collapsed} />
      ))}
    </div>
  );
};

// ─── Logo ─────────────────────────────────────────────────────
const Logo = ({ collapsed }) => (
  <div className={clsx('flex items-center gap-3 px-1 py-1', collapsed && 'justify-center')}>
    <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow">
      <HiOutlineCube size={20} className="text-white" />
    </div>
    <AnimatePresence>
      {!collapsed && (
        <motion.div
          variants={labelVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <p className="text-sm font-bold text-surface-900 dark:text-surface-50 leading-tight">{APP_NAME}</p>
          <p className="text-[10px] text-surface-400 dark:text-surface-500 leading-tight">Enterprise WMS</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ─── User mini-card (bottom of sidebar) ──────────────────────
const SidebarUserCard = ({ user, collapsed }) => {
  const fullName  = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '';
  const initials  = fullName.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || 'U';

  if (!fullName) return null;

  return (
    <div className={clsx(
      'mx-3 mb-2 p-2.5 rounded-xl',
      'bg-surface-50 dark:bg-surface-800/60',
      'border border-surface-200 dark:border-surface-700/50',
      'flex items-center gap-2.5',
      collapsed && 'justify-center mx-2 px-0',
    )}>
      <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
        {initials}
      </div>
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            variants={labelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="min-w-0"
          >
            <p className="text-xs font-semibold text-surface-800 dark:text-surface-100 truncate leading-tight">
              {fullName}
            </p>
            <p className="text-[10px] text-surface-400 dark:text-surface-500 truncate leading-tight">
              {user?.email ?? ''}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Sidebar ─────────────────────────────────────────────
const Sidebar = ({ mobileOpen, onMobileClose, onCollapsedChange }) => {
  const isDesktop = useMediaQuery('lg');
  const { user, hasAnyRole } = useAuth();

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('wms-sidebar') === 'collapsed'
  );

  useEffect(() => {
    localStorage.setItem('wms-sidebar', collapsed ? 'collapsed' : 'expanded');
    onCollapsedChange?.(collapsed);
  }, [collapsed, onCollapsedChange]);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo + mobile close */}
      <div className={clsx('flex items-center justify-between px-4 py-5 flex-shrink-0', collapsed && 'px-2')}>
        <Logo collapsed={collapsed} />
        {!isDesktop && (
          <button
            onClick={onMobileClose}
            className="text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800"
            aria-label="Close sidebar"
          >
            <MdClose size={20} />
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-surface-200 dark:border-surface-700/50" />

      {/* Nav */}
      <nav className={clsx('flex-1 overflow-y-auto no-scrollbar px-3 py-3 space-y-0.5', collapsed && 'px-2')}>
        {NAV.map((section) => (
          <NavSection
            key={section.title}
            section={section}
            collapsed={collapsed && isDesktop}
            hasAnyRole={hasAnyRole}
          />
        ))}
      </nav>

      {/* User card */}
      {!collapsed && <SidebarUserCard user={user} collapsed={false} />}
      {collapsed && isDesktop && <SidebarUserCard user={user} collapsed />}

      {/* Collapse toggle — desktop only */}
      {isDesktop && (
        <div className="px-3 py-3 border-t border-surface-200 dark:border-surface-700/50">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className={clsx(
              'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium',
              'text-surface-500 dark:text-surface-400',
              'hover:bg-surface-100 dark:hover:bg-surface-800',
              'transition-colors duration-200',
              collapsed && 'justify-center',
            )}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <MdChevronRight size={20} />
              : <><MdChevronLeft size={20} /><span>Collapse</span></>
            }
          </button>
        </div>
      )}
    </div>
  );

  // ── Desktop sidebar ──────────────────────────────────────────
  if (isDesktop) {
    return (
      <motion.aside
        variants={sidebarVariants}
        animate={collapsed ? 'collapsed' : 'expanded'}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={clsx(
          'fixed left-0 top-0 z-30 h-screen flex-shrink-0',
          'bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl',
          'border-r border-surface-200 dark:border-surface-700/60',
          'overflow-hidden',
        )}
      >
        {sidebarContent}
      </motion.aside>
    );
  }

  // ── Mobile drawer ────────────────────────────────────────────
  return (
    <AnimatePresence>
      {mobileOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-surface-900/60 backdrop-blur-sm lg:hidden"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <motion.aside
            variants={mobileVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-0 top-0 z-50 h-screen w-[260px] bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700 shadow-2xl overflow-hidden"
          >
            {sidebarContent}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
