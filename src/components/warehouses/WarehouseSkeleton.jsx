import Skeleton from '@components/common/Skeleton';
import Card from '@components/ui/Card';

const WarehouseCardSkeleton = ({ index = 0 }) => (
  <div style={{ animationDelay: `${index * 70}ms` }} className="animate-pulse">
    <Card className="h-full">
      <div className="flex items-start justify-between mb-4">
        <Skeleton width="44px" height="44px" className="rounded-xl" />
        <Skeleton width="64px" height="22px" className="rounded-full" />
      </div>
      <Skeleton height="16px" className="w-3/4 mb-2" />
      <Skeleton height="12px" className="w-1/3 mb-2" />
      <Skeleton height="12px" className="w-1/2 mb-4" />
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton height="12px" className="w-20" />
          <Skeleton height="12px" className="w-8" />
        </div>
        <Skeleton height="6px" className="w-full rounded-full" />
      </div>
      <div className="mt-3 pt-3 border-t border-surface-200 dark:border-surface-700">
        <Skeleton height="12px" className="w-1/2" />
      </div>
    </Card>
  </div>
);

const WarehouseTableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-0">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 px-4 py-3 border-b border-surface-100 dark:border-surface-800"
      >
        <div className="flex items-center gap-3 flex-1">
          <Skeleton width="36px" height="36px" className="rounded-lg flex-shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton height="14px" className="w-3/4" />
            <Skeleton height="10px" className="w-1/3" />
          </div>
        </div>
        <Skeleton height="14px" className="w-24 hidden sm:block" />
        <Skeleton height="14px" className="w-20 hidden md:block" />
        <Skeleton height="14px" className="w-28" />
        <Skeleton height="20px" className="w-16 rounded-full" />
        <Skeleton height="24px" className="w-20 rounded-lg" />
      </div>
    ))}
  </div>
);

const WarehouseSkeleton = ({ view = 'card', rows = 6 }) => (
  view === 'table' ? (
    <WarehouseTableSkeleton rows={rows} />
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: rows }).map((_, i) => (
        <WarehouseCardSkeleton key={i} index={i} />
      ))}
    </div>
  )
);

export { WarehouseCardSkeleton, WarehouseTableSkeleton };
export default WarehouseSkeleton;
