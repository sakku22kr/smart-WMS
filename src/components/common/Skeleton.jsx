import clsx from 'clsx';

/**
 * Skeleton — shimmer loading placeholder with configurable shape and size.
 *
 * Usage:
 *   <Skeleton height="20px" className="w-1/2" />       — single bar
 *   <Skeleton lines={3} height="14px" />               — multiple lines
 *   <Skeleton circle height="40px" width="40px" />     — circle avatar
 *   <Skeleton.StatsCard />                             — pre-composed KPI card
 *   <Skeleton.DashboardGrid />                         — full dashboard skeleton
 */
const Skeleton = ({
  className = '',
  width,
  height,
  circle  = false,
  lines   = 0,
  gap     = 2,
  style   = {},
}) => {
  if (lines > 0) {
    return (
      <div className={clsx('flex flex-col', `gap-${gap}`, className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}
            height={height}
            circle={false}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx('skeleton', circle ? 'rounded-full' : 'rounded-xl', className)}
      style={{
        width:  width  || undefined,
        height: height || '16px',
        ...style,
      }}
    />
  );
};

// ─── Pre-composed variants ─────────────────────────────────────

Skeleton.Card = ({ className = '' }) => (
  <div className={clsx('glass-card p-6 space-y-4', className)}>
    <div className="flex items-center gap-3">
      <Skeleton circle height="40px" width="40px" />
      <div className="flex-1 space-y-2">
        <Skeleton height="14px" className="w-1/2" />
        <Skeleton height="12px" className="w-1/3" />
      </div>
    </div>
    <Skeleton lines={3} height="12px" />
  </div>
);

Skeleton.Table = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 px-4 py-3">
        {Array.from({ length: cols }).map((__, j) => (
          <Skeleton key={j} height="14px" className="flex-1" />
        ))}
      </div>
    ))}
  </div>
);

Skeleton.StatsCard = ({ className = '' }) => (
  <div className={clsx('glass-card p-5 space-y-3', className)}>
    <div className="flex items-start justify-between">
      <Skeleton height="44px" width="44px" className="rounded-xl flex-shrink-0" />
      <Skeleton height="22px" width="64px" className="rounded-full" />
    </div>
    <div className="space-y-2 pt-1">
      <Skeleton height="30px" className="w-2/5" />
      <Skeleton height="13px" className="w-3/5" />
    </div>
    <Skeleton height="10px" className="w-2/3" />
  </div>
);

Skeleton.ChartCard = ({ className = '', height = '220px' }) => (
  <div className={clsx('glass-card p-5 space-y-4', className)}>
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton height="16px" className="w-36" />
        <Skeleton height="12px" className="w-48" />
      </div>
      <Skeleton height="24px" width="60px" className="rounded-full" />
    </div>
    {/* Chart area */}
    <Skeleton height={height} className="w-full rounded-2xl" />
  </div>
);

Skeleton.ListCard = ({ rows = 4, className = '' }) => (
  <div className={clsx('glass-card p-5 space-y-4', className)}>
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton height="16px" className="w-40" />
        <Skeleton height="12px" className="w-52" />
      </div>
      <Skeleton height="24px" width="72px" className="rounded-full" />
    </div>
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
          <Skeleton circle height="32px" width="32px" />
          <div className="flex-1 space-y-1.5">
            <Skeleton height="13px" className="w-3/4" />
            <Skeleton height="11px" className="w-1/2" />
          </div>
          <Skeleton height="13px" width="60px" />
        </div>
      ))}
    </div>
  </div>
);

/**
 * Full dashboard loading skeleton — matches the real dashboard layout exactly.
 * Shows: 4 KPI cards + 2 chart rows + 1 table card
 */
Skeleton.DashboardGrid = () => (
  <div className="space-y-5">
    {/* Page header */}
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <Skeleton height="28px" className="w-48" />
        <Skeleton height="14px" className="w-72" />
      </div>
      <Skeleton height="36px" width="100px" className="rounded-xl" />
    </div>

    {/* KPI cards — 8 total, 4 cols on xl */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton.StatsCard key={i} />
      ))}
    </div>

    {/* Chart row 1 */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Skeleton.ChartCard className="lg:col-span-2" height="260px" />
      <Skeleton.ChartCard height="260px" />
    </div>

    {/* Chart row 2 */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Skeleton.ChartCard height="240px" />
      <Skeleton.ListCard rows={4} />
    </div>

    {/* Table card */}
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton height="16px" className="w-52" />
          <Skeleton height="12px" className="w-64" />
        </div>
        <Skeleton height="32px" width="80px" className="rounded-xl" />
      </div>
      <Skeleton.Table rows={5} cols={6} />
    </div>
  </div>
);

export default Skeleton;
