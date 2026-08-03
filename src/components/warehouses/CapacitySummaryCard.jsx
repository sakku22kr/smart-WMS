import { MdWarehouse, MdWarning, MdCheckCircle, MdBuild, MdInventory } from 'react-icons/md';
import Card from '@components/ui/Card';
import Badge from '@components/ui/Badge';
import Loader from '@components/common/Loader';

const StatBox = ({ icon, label, value, color, suffix }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-surface-900 dark:text-white">
        {value}{suffix && <span className="text-sm font-normal text-surface-500 ml-1">{suffix}</span>}
      </p>
      <p className="text-xs text-surface-500">{label}</p>
    </div>
  </div>
);

const CapacitySummaryCard = ({ stats, loading, error }) => {
  if (loading) {
    return (
      <Card padding="lg">
        <div className="flex justify-center py-8">
          <Loader size="md" label="Loading capacity stats..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="md">
        <div className="text-center py-4">
          <p className="text-sm text-danger-500">{error}</p>
        </div>
      </Card>
    );
  }

  if (!stats) return null;

  const utilizationPercent = stats.avgUtilization ?? 0;
  const capacityColor = utilizationPercent >= 90
    ? 'bg-danger-500'
    : utilizationPercent >= 70
      ? 'bg-warning-500'
      : 'bg-success-500';

  return (
    <Card title="Capacity Overview" subtitle="Aggregate warehouse capacity metrics" padding="md">
      <div className="space-y-4">
        {/* Overall Utilization Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-surface-500 font-medium">Overall Utilization</span>
            <span className="font-bold text-surface-900 dark:text-white">{utilizationPercent}%</span>
          </div>
          <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2.5">
            <div
              className={`${capacityColor} h-2.5 rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-surface-400 mt-1">
            <span>{stats.totalUtilized?.toLocaleString() ?? 0} m³ used</span>
            <span>{stats.totalCapacity?.toLocaleString() ?? 0} m³ total</span>
          </div>
        </div>

        {/* Stat Boxes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatBox
            icon={<MdWarehouse size={20} className="text-primary-500" />}
            label="Total Warehouses"
            value={stats.totalWarehouses}
            color="bg-primary-500/10"
          />
          <StatBox
            icon={<MdCheckCircle size={20} className="text-success-500" />}
            label="Active"
            value={stats.activeCount}
            color="bg-success-500/10"
          />
          <StatBox
            icon={<MdWarning size={20} className="text-warning-500" />}
            label="Near Capacity (≥90%)"
            value={stats.warehousesNearCapacity}
            color="bg-warning-500/10"
          />
          <StatBox
            icon={<MdInventory size={20} className="text-info-500" />}
            label="Available"
            value={stats.availableCapacity?.toLocaleString() ?? '0'}
            suffix="m³"
            color="bg-info-500/10"
          />
        </div>

        {/* Additional Info */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-surface-200 dark:border-surface-700">
          <Badge variant="surface" size="sm">
            <MdBuild size={12} className="mr-1" />
            Maintenance: {stats.maintenanceCount}
          </Badge>
          <Badge variant="surface" size="sm">
            Inactive: {stats.inactiveCount}
          </Badge>
          {stats.warehousesFull > 0 && (
            <Badge variant="danger" size="sm">
              Full: {stats.warehousesFull}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CapacitySummaryCard;
