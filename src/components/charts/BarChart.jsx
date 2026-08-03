import { Bar } from 'react-chartjs-2';
import { useTheme } from '@/context/ThemeContext';
import { BASE_OPTIONS } from './chartConfig';
import { CHART_COLORS } from '@utils/constants';
import '@/components/charts/chartConfig';

/**
 * BarChart — vertical/horizontal bar chart with multi-dataset support.
 */
const BarChart = ({
  labels     = [],
  datasets   = [],
  height     = 280,
  title,
  horizontal = false,
  stacked    = false,
  borderRadius = 6,
}) => {
  const { isDark } = useTheme();

  const palette = [
    CHART_COLORS.primary, CHART_COLORS.accent, CHART_COLORS.success,
    CHART_COLORS.info,    CHART_COLORS.warning, CHART_COLORS.danger,
  ];

  const defaultDatasets = datasets.map((ds, i) => {
    const color = ds.color ?? palette[i % palette.length];
    return {
      label:           ds.label,
      data:            ds.data,
      backgroundColor: color + 'cc',
      hoverBackgroundColor: color,
      borderColor:     color,
      borderRadius,
      borderSkipped:   false,
    };
  });

  const baseOpts = BASE_OPTIONS(isDark);
  const options  = {
    ...baseOpts,
    indexAxis: horizontal ? 'y' : 'x',
    plugins: {
      ...baseOpts.plugins,
      title: title
        ? { display: true, text: title, color: isDark ? '#f1f5f9' : '#0f172a', font: { size: 14, weight: '600' } }
        : { display: false },
    },
    scales: {
      ...baseOpts.scales,
      x: { ...baseOpts.scales.x, stacked },
      y: { ...baseOpts.scales.y, stacked },
    },
    animation: { duration: 700, easing: 'easeOutQuart' },
  };

  return (
    <div style={{ height }}>
      <Bar data={{ labels, datasets: defaultDatasets }} options={options} />
    </div>
  );
};

export default BarChart;
