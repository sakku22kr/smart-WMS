// Chart.js global registration — import this once in your app entry
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
);

// ─── Shared chart theme helpers ────────────────────────────────
export const getChartFont = () => ({
  family: 'Inter, sans-serif',
  size: 12,
});

export const getGridColor = (isDark) =>
  isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';

export const getTickColor = (isDark) =>
  isDark ? '#94a3b8' : '#64748b';

export const makeGradient = (ctx, color1, color2 = 'transparent') => {
  const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
};

export const BASE_OPTIONS = (isDark) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: getTickColor(isDark),
        font: getChartFont(),
        boxWidth: 12,
        padding: 16,
      },
    },
    tooltip: {
      backgroundColor: isDark ? '#1e293b' : '#fff',
      titleColor:      isDark ? '#f1f5f9' : '#0f172a',
      bodyColor:       isDark ? '#94a3b8' : '#475569',
      borderColor:     isDark ? '#334155' : '#e2e8f0',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 10,
      titleFont: { ...getChartFont(), weight: '600' },
    },
  },
  scales: {
    x: {
      grid:  { color: getGridColor(isDark), drawBorder: false },
      ticks: { color: getTickColor(isDark), font: getChartFont() },
    },
    y: {
      grid:  { color: getGridColor(isDark), drawBorder: false },
      ticks: { color: getTickColor(isDark), font: getChartFont() },
    },
  },
});
