import { Pie } from 'react-chartjs-2';
import { useTheme } from '@/context/ThemeContext';
import { CHART_COLORS } from '@utils/constants';
import '@/components/charts/chartConfig';

const DEFAULT_COLORS = [
  CHART_COLORS.primary, CHART_COLORS.success, CHART_COLORS.warning,
  CHART_COLORS.info, CHART_COLORS.accent, CHART_COLORS.danger, CHART_COLORS.surface,
];

/**
 * PieChart — full-circle pie with animated rotation and legend.
 *
 * Props:
 *  @param {string[]}  labels   - Segment labels
 *  @param {number[]}  data     - Segment values
 *  @param {string[]}  colors   - Hex color per segment
 *  @param {number}    height   - Canvas height in px
 *  @param {'bottom'|'right'} legendPosition
 */
const PieChart = ({
  labels          = [],
  data            = [],
  colors          = DEFAULT_COLORS,
  height          = 280,
  legendPosition  = 'right',
}) => {
  const { isDark } = useTheme();

  const chartData = {
    labels,
    datasets: [{
      data,
      backgroundColor:      colors.map((c) => c + 'cc'),
      hoverBackgroundColor: colors,
      borderColor:          isDark ? '#1e293b' : '#ffffff',
      borderWidth:          3,
      hoverBorderWidth:     0,
      hoverOffset:          8,
    }],
  };

  const options = {
    responsive:          true,
    maintainAspectRatio: false,
    animation: {
      duration:      900,
      animateRotate: true,
      animateScale:  true,
      easing:        'easeInOutQuart',
    },
    plugins: {
      legend: {
        position: legendPosition,
        labels: {
          color:         isDark ? '#94a3b8' : '#64748b',
          font:          { family: 'Inter, sans-serif', size: 12 },
          boxWidth:      12,
          padding:       14,
          usePointStyle: true,
          pointStyle:    'circle',
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#fff',
        titleColor:      isDark ? '#f1f5f9' : '#0f172a',
        bodyColor:       isDark ? '#94a3b8' : '#475569',
        borderColor:     isDark ? '#334155' : '#e2e8f0',
        borderWidth:     1,
        padding:         12,
        cornerRadius:    10,
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct   = total ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
            return ` ${ctx.label}: ${ctx.formattedValue} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default PieChart;
