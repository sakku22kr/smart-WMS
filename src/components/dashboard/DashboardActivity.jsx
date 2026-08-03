import RecentActivities    from './RecentActivities';
import SystemNotifications from './SystemNotifications';
import QuickActions        from './QuickActions';

/**
 * DashboardActivity — Phase 4.4 layout section, wired to live data (Phase 4.6).
 *
 * Responsive grid:
 *  Mobile:  1 column (stacked)
 *  Tablet:  2 columns (notifications + quick actions side by side)
 *  Desktop: 3 columns (activities | notifications | quick actions)
 *
 * @param {Array}   lowStock   - Live low-stock products from useDashboard
 * @param {Array}   outOfStock - Live out-of-stock products from useDashboard
 * @param {boolean} loading    - Propagates to all three child panels
 */
const DashboardActivity = ({ lowStock = [], outOfStock = [], stats = null, loading = false }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

    {/* Column 1 — Recent Activity timeline (stock alerts as live activities) */}
    <RecentActivities
      lowStock={lowStock}
      outOfStock={outOfStock}
      loading={loading}
    />

    {/* Column 2 — System Notifications from stock alerts + category stats */}
    <SystemNotifications
      lowStock={lowStock}
      outOfStock={outOfStock}
      stats={stats}
      loading={loading}
    />

    {/* Column 3 — Quick Actions (static navigation, no API needed) */}
    <QuickActions loading={loading} />

  </div>
);

export default DashboardActivity;
