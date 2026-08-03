import { useState, useEffect } from 'react';
import Badge      from '@components/ui/Badge';
import ChartCard  from '@components/charts/ChartCard';
import LineChart  from '@components/charts/LineChart';
import BarChart   from '@components/charts/BarChart';
import DoughnutChart from '@components/charts/DoughnutChart';
import PieChart   from '@components/charts/PieChart';
import categoryService from '@/api/services/categoryService';

const CATEGORY_COLORS = ['#6366f1', '#22c55e', '#f97316', '#0ea5e9', '#8b5cf6', '#ef4444', '#ec4899', '#14b8a6'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

function buildInventoryTrend(recentOrders = []) {
  const inData = [120, 180, 150, 220, 190, 260, 240];
  const outData = [90, 130, 110, 170, 140, 200, 180];

  if (recentOrders.length > 0) {
    const last7 = recentOrders.slice(0, 7);
    last7.forEach((order, i) => {
      if (i < 7) {
        inData[i] = order.receivedQuantity ?? inData[i];
        outData[i] = order.dispatchedQuantity ?? outData[i];
      }
    });
  }

  return {
    labels: MONTHS,
    datasets: [
      { label: 'Stock In',  data: inData,  color: '#22c55e' },
      { label: 'Stock Out', data: outData, color: '#ef4444' },
    ],
  };
}

// ─── Build stock-distribution doughnut from live stats ────────
function buildStockDist(stats) {
  if (!stats) {
    return {
      labels: ['In Stock', 'Low Stock', 'Out of Stock', 'Discontinued'],
      data:   [54, 22, 8, 16],
      colors: ['#22c55e', '#f97316', '#ef4444', '#6366f1'],
    };
  }

  const total       = Number(stats.totalProducts) || 1;
  const lowStock    = Number(stats.lowStockProducts) || 0;
  const outOfStock  = Number(stats.outOfStockProducts) || 0;
  const discontinued= Number(stats.discontinuedProducts) || 0;
  const inStock     = Math.max(0, total - lowStock - outOfStock - discontinued);

  return {
    labels: ['In Stock', 'Low Stock', 'Out of Stock', 'Discontinued'],
    data:   [inStock, lowStock, outOfStock, discontinued],
    colors: ['#22c55e', '#f97316', '#ef4444', '#6366f1'],
  };
}

// ─── Build warehouse utilization chart from live stats ────────
function buildWarehouseUtil(stats) {
  if (!stats || stats.totalWarehouseCapacity === undefined || stats.totalWarehouseCapacity === null) {
    return {
      labels: ['Utilized', 'Available'],
      datasets: [
        { label: 'Capacity', data: [stats?.warehouseUtilizationPercent ?? 55, 100 - (stats?.warehouseUtilizationPercent ?? 55)], color: '#6366f1' },
      ],
    };
  }

  const utilized = Number(stats.totalWarehouseUtilized) || 0;
  const available = Math.max(0, (Number(stats.totalWarehouseCapacity) || 0) - utilized);

  return {
    labels: ['Utilized', 'Available'],
    datasets: [
      { label: 'Capacity (m³)', data: [utilized, available], color: '#6366f1' },
    ],
  };
}

// ─── Build top products chart from API data ───────────────────
function buildTopProducts(topProducts) {
  if (!topProducts || topProducts.length === 0) {
    return {
      labels: ['No products yet'],
      datasets: [{ label: 'Stock', data: [0], color: '#0ea5e9' }],
    };
  }

  return {
    labels: topProducts.map((p) => p.name?.length > 20 ? p.name.substring(0, 20) + '...' : p.name),
    datasets: [{ label: 'Stock', data: topProducts.map((p) => p.currentStock || 0), color: '#0ea5e9' }],
  };
}

/**
 * DashboardCharts — 5-panel enterprise chart section.
 *
 * @param {object|null} stats          - Live KPI data from useDashboard hook
 * @param {Array}       topProducts    - Top products from API
 * @param {object|null} productStats   - Product statistics from API
 * @param {object|null} inventoryValue - Live inventory value breakdown from API
 * @param {boolean}     loading        - Show skeletons while data loads
 */
const DashboardCharts = ({ stats = null, topProducts = [], productStats = null, inventoryValue = null, recentOrders = [], loading = false }) => {
  const stockDist = buildStockDist(stats);
  const warehouseUtil = buildWarehouseUtil(stats);
  const topProductsChart = buildTopProducts(topProducts);
  const inventoryTrend = buildInventoryTrend(recentOrders);
  const [categoryData, setCategoryData] = useState(null);

  useEffect(() => {
    categoryService.getRoots()
      .then((res) => {
        const cats = res?.data ?? [];
        if (cats.length > 0) {
          const withProducts = cats.filter((c) => (c.productCount ?? 0) > 0);
          if (withProducts.length > 0) {
            setCategoryData({
              labels: withProducts.map((c) => c.name),
              data: withProducts.map((c) => c.productCount),
              colors: CATEGORY_COLORS.slice(0, withProducts.length),
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-4">

      {/* ── Row 1: Trend + Stock Distribution ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Monthly Inventory Trend */}
        <ChartCard
          title="Monthly Inventory Trend"
          subtitle="Stock in vs. stock out — last 7 months"
          className="lg:col-span-2"
          action={<Badge variant="primary" dot>Live</Badge>}
          loading={loading}
          delay={0}
          skeletonH="280px"
        >
          <LineChart
            labels={inventoryTrend.labels}
            datasets={inventoryTrend.datasets}
            height={280}
            fill
            smooth
          />
        </ChartCard>

        {/* Inventory Stock Distribution — driven by live stats */}
        <ChartCard
          title="Stock Distribution"
          subtitle="Current inventory status breakdown"
          loading={loading}
          delay={0.06}
          skeletonH="280px"
        >
          <DoughnutChart
            labels={stockDist.labels}
            data={stockDist.data}
            colors={stockDist.colors}
            height={280}
            cutout="70%"
          />
        </ChartCard>
      </div>

      {/* ── Row 2: Warehouse Utilization + Top Products ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <ChartCard
          title="Warehouse Utilization"
          subtitle="Used vs available capacity"
          loading={loading}
          delay={0.12}
          skeletonH="260px"
        >
          <BarChart
            labels={warehouseUtil.labels}
            datasets={warehouseUtil.datasets}
            height={260}
            stacked
            borderRadius={5}
          />
        </ChartCard>

        <ChartCard
          title="Top Products by Stock"
          subtitle="Products with highest current stock"
          loading={loading}
          delay={0.18}
          skeletonH="260px"
        >
          <BarChart
            labels={topProductsChart.labels}
            datasets={topProductsChart.datasets}
            height={260}
            horizontal
            borderRadius={5}
          />
        </ChartCard>
      </div>

      {/* ── Row 3: Inventory Value Pie + Product Statistics ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <ChartCard
          title="Inventory by Category"
          subtitle="Products per root category"
          loading={loading}
          delay={0.24}
          skeletonH="260px"
        >
          <PieChart
            labels={categoryData?.labels ?? inventoryValue?.labels ?? ['No data']}
            data={categoryData?.data ?? inventoryValue?.data ?? [1]}
            colors={categoryData?.colors ?? CATEGORY_COLORS}
            height={260}
            legendPosition="right"
          />
        </ChartCard>

        {/* Product Statistics — live stats in card grid */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 content-start">
          {productStats && [
            { label: 'Total Products',  value: productStats.totalProducts?.toLocaleString()  ?? '—', color: 'text-primary-600 dark:text-primary-400' },
            { label: 'Active',          value: productStats.activeProducts?.toLocaleString() ?? '—', color: 'text-success-600 dark:text-success-400'  },
            { label: 'Low Stock',       value: productStats.lowStockProducts?.toLocaleString() ?? '—', color: 'text-warning-600 dark:text-warning-400' },
            { label: 'Out of Stock',    value: productStats.outOfStockProducts?.toLocaleString() ?? '—', color: 'text-danger-600 dark:text-danger-400' },
            { label: 'Total Stock',     value: productStats.totalStockQuantity?.toLocaleString() ?? '—', color: 'text-info-600 dark:text-info-400' },
            { label: 'Avg Price',       value: productStats.averageSellingPrice ? `₹${productStats.averageSellingPrice.toLocaleString()}` : '—', color: 'text-violet-600 dark:text-violet-400' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-xl p-4 bg-white/80 dark:bg-surface-800/80 border border-surface-100 dark:border-surface-700/50 backdrop-blur-xl"
            >
              <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">{label}</p>
            </div>
          ))}
          {!productStats && (
            <div className="col-span-full rounded-2xl border-2 border-dashed border-surface-200 dark:border-surface-700/50 flex items-center justify-center min-h-[200px]">
              <p className="text-sm text-surface-400 dark:text-surface-500 select-none">
                Loading product statistics…
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default DashboardCharts;
