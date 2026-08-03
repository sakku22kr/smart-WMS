import { MdEdit, MdDelete, MdWarehouse } from 'react-icons/md';
import Table from '@components/table/Table';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';

const CapacityBar = ({ value }) => {
  const color = value >= 90 ? 'bg-danger-500' : value >= 70 ? 'bg-warning-500' : 'bg-success-500';
  return (
    <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-1.5 mt-1">
      <div className={`${color} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
    </div>
  );
};

const WarehouseTable = ({
  warehouses = [],
  loading    = false,
  sortKey,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
  onRowClick,
}) => {
  const getCapacityPercent = (wh) => {
    if (!wh.capacity || wh.capacity === 0) return 0;
    return Math.round((wh.currentUtilization / wh.capacity) * 100);
  };

  const columns = [
    {
      key: 'name',
      label: 'Warehouse',
      sortable: true,
      render: (_, wh) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
            <MdWarehouse size={18} className="text-primary-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-surface-900 dark:text-surface-50 truncate">{wh.name}</p>
            <p className="text-xs text-primary-500 font-mono">{wh.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
      render: (val) => (
        <span className="text-sm text-surface-600 dark:text-surface-400 truncate max-w-[160px] block">
          {val || '—'}
        </span>
      ),
    },
    {
      key: 'manager',
      label: 'Manager',
      render: (val) => (
        <span className="text-sm text-surface-600 dark:text-surface-400">{val || '—'}</span>
      ),
    },
    {
      key: 'capacity',
      label: 'Capacity',
      sortable: true,
      align: 'right',
      render: (_, wh) => {
        const pct = getCapacityPercent(wh);
        return (
          <div className="min-w-[100px]">
            <div className="flex justify-between text-xs">
              <span className="text-surface-500">{wh.currentUtilization?.toLocaleString() ?? 0}</span>
              <span className="font-medium text-surface-700 dark:text-surface-300">
                / {wh.capacity?.toLocaleString() ?? 0} m³
              </span>
            </div>
            <CapacityBar value={pct} />
            <p className="text-[10px] text-right text-surface-400 mt-0.5">{pct}% used</p>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      align: 'center',
      render: (val) => (
        <Badge
          variant={val === 'ACTIVE' ? 'success' : val === 'UNDER_MAINTENANCE' ? 'warning' : 'danger'}
          dot
          size="sm"
        >
          {val?.replace('_', ' ') || '—'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      width: '120px',
      render: (_, wh) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="xs"
            leftIcon={<MdEdit />}
            onClick={() => onEdit?.(wh)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="xs"
            className="text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950/20"
            leftIcon={<MdDelete />}
            onClick={() => onDelete?.(wh)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={warehouses}
      loading={loading}
      emptyMsg="No warehouses found."
      sortKey={sortKey}
      sortOrder={sortOrder}
      onSort={onSort}
      onRowClick={onRowClick}
    />
  );
};

export default WarehouseTable;
