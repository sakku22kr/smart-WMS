import {
  MdInventory2, MdCategory, MdWarehouse, MdLocalShipping,
  MdWarningAmber,
  MdAttachMoney,
  MdPendingActions, MdCheckCircle, MdReceipt,
} from 'react-icons/md';
import DashboardCard from './DashboardCard';

/**
 * Builds the card definitions from live API stats.
 * Falls back to placeholder dashes when stats are not yet loaded.
 */
function buildCards(stats) {
  const s = stats ?? {};

  const fmt = (n) => (n !== undefined && n !== null ? n.toLocaleString() : '—');
  const fmtCurrency = (n) => {
    if (n === undefined || n === null) return '—';
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    return `₹${n.toLocaleString()}`;
  };

  return [
    {
      id:      'total-products',
      label:   'Total Products',
      value:   fmt(s.totalProducts),
      icon:    <MdInventory2 />,
      color:   'primary',
      trend:   { value: 0, label: 'all time' },
      subtext: s.activeProducts !== undefined
        ? `${fmt(s.activeProducts)} active · ${fmt(s.inactiveProducts ?? 0)} inactive`
        : 'Across all warehouses',
    },
    {
      id:      'inventory-value',
      label:   'Inventory Value',
      value:   fmtCurrency(s.totalInventoryValue),
      icon:    <MdAttachMoney />,
      color:   'success',
      trend:   { value: 0, label: 'total value' },
      subtext: s.averageSellingPrice !== undefined
        ? `Avg price: ${fmtCurrency(s.averageSellingPrice)}`
        : 'Total stock value',
    },
    {
      id:      'total-categories',
      label:   'Total Categories',
      value:   fmt(s.totalCategories),
      icon:    <MdCategory />,
      color:   'violet',
      trend:   { value: 0, label: 'all time' },
      subtext: s.activeCategories !== undefined
        ? `${fmt(s.activeCategories)} active`
        : 'All product categories',
    },
    {
      id:      'total-warehouses',
      label:   'Total Warehouses',
      value:   fmt(s.totalWarehouses),
      icon:    <MdWarehouse />,
      color:   'info',
      trend:   { value: 0, label: 'all time' },
      subtext: s.activeWarehouses !== undefined
        ? `${fmt(s.activeWarehouses)} active · ${fmt(s.inactiveWarehouses ?? 0)} inactive`
        : 'All warehouse locations',
    },
    {
      id:      'pending-orders',
      label:   'Pending Orders',
      value:   fmt(s.pendingOrders),
      icon:    <MdPendingActions />,
      color:   'warning',
      trend:   { value: 0, label: 'awaiting approval' },
      subtext: s.totalOrders !== undefined
        ? `${fmt(s.totalOrders)} total orders placed`
        : 'Purchase orders pending',
    },
    {
      id:      'approved-orders',
      label:   'Active Orders',
      value:   fmt(s.approvedOrders),
      icon:    <MdCheckCircle />,
      color:   'success',
      trend:   { value: 0, label: 'in progress' },
      subtext: s.completedOrders !== undefined
        ? `${fmt(s.completedOrders)} completed`
        : 'Orders being processed',
    },
    {
      id:      'total-order-value',
      label:   'Total Order Value',
      value:   fmtCurrency(s.totalOrderValue),
      icon:    <MdReceipt />,
      color:   'primary',
      trend:   { value: 0, label: 'all orders' },
      subtext: s.pendingOrderValue !== undefined
        ? `Pending: ${fmtCurrency(s.pendingOrderValue)}`
        : 'Total procurement spend',
    },
    {
      id:      'low-stock',
      label:   'Low Stock Products',
      value:   fmt(s.lowStockProducts),
      icon:    <MdWarningAmber />,
      color:   'warning',
      trend:   { value: 0, label: 'requires reorder' },
      subtext: s.outOfStockProducts !== undefined
        ? `${fmt(s.outOfStockProducts)} out of stock`
        : 'Requires reorder soon',
    },
    {
      id:      'total-suppliers',
      label:   'Total Suppliers',
      value:   fmt(s.totalSuppliers),
      icon:    <MdLocalShipping />,
      color:   'info',
      trend:   { value: 0, label: 'all time' },
      subtext: s.activeSuppliers !== undefined
        ? `${fmt(s.activeSuppliers)} active`
        : 'Vendor network',
    },
  ];
}

/**
 * DashboardSummary — 4-column responsive KPI grid.
 *
 * @param {object|null} stats    - Live data from useDashboard hook
 * @param {boolean}     loading  - Show skeleton cards while loading
 */
const DashboardSummary = ({ stats = null, loading = false }) => {
  const cards = buildCards(stats);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <DashboardCard
          key={card.id}
          label={card.label}
          value={card.value}
          icon={card.icon}
          color={card.color}
          trend={card.trend}
          subtext={card.subtext}
          loading={loading}
          delay={index * 0.05}
        />
      ))}
    </div>
  );
};

export default DashboardSummary;
