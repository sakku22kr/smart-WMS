import { Line } from 'react-chartjs-2';
import { useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { BASE_OPTIONS } from './chartConfig';
import { CHART_COLORS } from '@utils/constants';
import '@/components/charts/chartConfig'; // ensure registration

/**
 * LineChart — animated area/line chart with gradient fill.
 */
const LineChart = ({
  labels    = [],
  datasets  = [],
  height    = 280,
  title,
  fill      = true,
  smooth    = true,
}) => {
  const { isDark } = useTheme();
  const chartRef   = useRef(null);

  const defaultDatasets = datasets.map((ds, i) => {
    const colors = [CHART_COLORS.primary, CHART_COLORS.accent, CHART_COLORS.success, CHART_COLORS.info];
    const color  = ds.color ?? colors[i % colors.length];
    return {
      label:           ds.label,
      data:            ds.data,
      borderColor:     color,
      backgroundColor: fill
        ? (ctx) => {
            if (!ctx.chart.chartArea) return 'transparent';
            const gradient = ctx.chart.ctx.createLinearGradient(
              0, ctx.chart.chartArea.top, 0, ctx.chart.chartArea.bottom
            );
            gradient.addColorStop(0, color + '66');
            gradient.addColorStop(1, color + '00');
            return gradient;
          }
        : 'transparent',
      borderWidth:  2,
      pointRadius:  4,
      pointHoverRadius: 6,
      pointBackgroundColor: color,
      tension:      smooth ? 0.4 : 0,
      fill,
    };
  });

  const options = {
    ...BASE_OPTIONS(isDark),
    plugins: {
      ...BASE_OPTIONS(isDark).plugins,
      title: title
        ? { display: true, text: title, color: isDark ? '#f1f5f9' : '#0f172a', font: { size: 14, weight: '600' } }
        : { display: false },
    },
    animation: {
      duration: 800,
      easing: 'easeInOutQuart',
    },
  };

  return (
    <div style={{ height }}>
      <Line
        ref={chartRef}
        data={{ labels, datasets: defaultDatasets }}
        options={options}
      />
    </div>
  );
};

export default LineChart;
