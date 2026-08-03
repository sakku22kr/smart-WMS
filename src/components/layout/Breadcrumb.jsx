import { useLocation, Link } from 'react-router-dom';
import { MdChevronRight, MdHome } from 'react-icons/md';
import { motion } from 'framer-motion';
import clsx from 'clsx';

// Route label map — keeps breadcrumb labels human-readable
const ROUTE_LABELS = {
  dashboard:       'Dashboard',
  inventory:       'Inventory',
  products:        'Products',
  categories:      'Categories',
  warehouses:      'Warehouses',
  suppliers:       'Suppliers',
  'purchase-orders': 'Purchase Orders',
  reports:         'Reports',
  users:           'User Management',
  settings:        'Settings',
  profile:         'Profile',
  notifications:   'Notifications',
};

/**
 * Breadcrumb — generates breadcrumbs from the current URL path.
 * Always shows Home as the first crumb.
 *
 * @param {string} className  - extra CSS classes
 */
const Breadcrumb = ({ className = '' }) => {
  const { pathname } = useLocation();

  const segments = pathname.split('/').filter(Boolean);

  // Build crumb objects: [{ label, path, isLast }]
  const crumbs = segments.map((seg, idx) => {
    const path  = '/' + segments.slice(0, idx + 1).join('/');
    const label = ROUTE_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
    return { label, path, isLast: idx === segments.length - 1 };
  });

  if (crumbs.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={clsx('flex items-center gap-1 text-sm', className)}
    >
      {/* Home crumb */}
      <Link
        to="/dashboard"
        className="flex items-center text-surface-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
        aria-label="Home"
      >
        <MdHome size={16} />
      </Link>

      {crumbs.map(({ label, path, isLast }) => (
        <motion.span
          key={path}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-1"
        >
          <MdChevronRight size={15} className="text-surface-300 dark:text-surface-600 flex-shrink-0" />
          {isLast ? (
            <span className="font-medium text-surface-700 dark:text-surface-200 truncate max-w-[180px]">
              {label}
            </span>
          ) : (
            <Link
              to={path}
              className="text-surface-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors truncate max-w-[120px]"
            >
              {label}
            </Link>
          )}
        </motion.span>
      ))}
    </nav>
  );
};

export default Breadcrumb;
