import { Doughnut } from 'react-chartjs-2';
import { useTheme } from '@/context/ThemeContext';
import { CHART_COLORS } from '@utils/constants';
import '@/components/charts/chartConfig';

const DEFAULT_COLORS = [
  CHART_COLORS.primary, CHART_COLORS.accent, CHART_COLORS.success,
  CHART_COLORS.info, CHART_COLORS.warning, CHART_COLORS.danger, CHART_COLORS.surface,
];

/**
 * DoughnutChart — animated doughnut/pie chart with legend.
 */
const DoughnutChart = ({
  labels  = [],
  data    = [],
  colors  = DEFAULT_COLORS,
  height  = 280,
  cutout  = '72%',
  title,
}) => {
  const { isDark } = useTheme();

  const chartData = {
    labels,
    datasets: [{
      data,
      backgroundColor:      colors.map((c) => c + 'cc'),
      hoverBackgroundColor: colors,
      borderColor:          isDark ? '#1e293b' : '#ffffff',
      borderWidth: 3,
      hoverBorderWidth: 0,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout,
    animation: { duration: 800, animateRotate: true, animateScale: false },
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color:    isDark ? '#94a3b8' : '#64748b',
          font:     { family: 'Inter, sans-serif', size: 12 },
          boxWidth: 12,
          padding:  14,
          usePointStyle: true,
          pointStyle: 'circle',
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
      },
      title: title
        ? { display: true, text: title, color: isDark ? '#f1f5f9' : '#0f172a', font: { size: 14, weight: '600' } }
        : { display: false },
    },
  };

  return (
    <div style={{ height }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default DoughnutChart;
