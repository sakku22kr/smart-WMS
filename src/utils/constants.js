// ─── App Meta ─────────────────────────────────────────────────
export const APP_NAME    = 'Smart WMS';
export const APP_VERSION = '1.0.0';
export const APP_TAGLINE = 'Intelligent Inventory & Warehouse Management';

// ─── Pagination ────────────────────────────────────────────────
export const PAGE_SIZES   = [10, 25, 50, 100];
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 25;

// ─── Status Maps ───────────────────────────────────────────────
export const STOCK_STATUS = {
  IN_STOCK:  'in_stock',
  LOW_STOCK: 'low',
  OUT:       'out',
};

export const ORDER_STATUS = {
  DRAFT:     'draft',
  PENDING:   'pending',
  APPROVED:  'approved',
  RECEIVED:  'received',
  REJECTED:  'rejected',
  CANCELLED: 'cancelled',
};

export const USER_ROLES = {
  ADMIN:     'Admin',
  MANAGER:   'Manager',
  STAFF:     'Staff',
  VIEWER:    'Viewer',
};

// ─── Chart Colors ──────────────────────────────────────────────
export const CHART_COLORS = {
  primary:  '#6366f1',
  accent:   '#8b5cf6',
  success:  '#22c55e',
  warning:  '#f97316',
  danger:   '#ef4444',
  info:     '#0ea5e9',
  surface:  '#94a3b8',
};

export const CHART_GRADIENT_STOPS = ['rgba(99,102,241,0.4)', 'rgba(99,102,241,0)'];

// ─── Nav items (sidebar) ───────────────────────────────────────
export const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard',     path: '/dashboard',       icon: 'MdDashboard' },
      { label: 'Notifications', path: '/notifications',   icon: 'MdNotifications' },
    ],
  },
  {
    title: 'Inventory',
    items: [
      { label: 'Inventory',     path: '/inventory',       icon: 'MdInventory' },
      { label: 'Products',      path: '/products',        icon: 'MdInventory2' },
      { label: 'Categories',    path: '/categories',      icon: 'MdCategory' },
      { label: 'Warehouses',    path: '/warehouses',      icon: 'MdWarehouse' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Suppliers',       path: '/suppliers',       icon: 'MdLocalShipping' },
      { label: 'Purchase Orders', path: '/purchase-orders', icon: 'MdShoppingCart' },
      { label: 'Reports',         path: '/reports',         icon: 'MdBarChart' },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Users',     path: '/users',     icon: 'MdPeople' },
      { label: 'Settings',  path: '/settings',  icon: 'MdSettings' },
      { label: 'Profile',   path: '/profile',   icon: 'MdPerson' },
    ],
  },
];

// ─── Local storage keys ────────────────────────────────────────
export const LS_KEYS = {
  THEME:         'wms-theme',
  AUTH_TOKEN:    'auth_token',
  SIDEBAR_STATE: 'wms-sidebar',
};
