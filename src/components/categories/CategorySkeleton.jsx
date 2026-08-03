const CategorySkeleton = ({ viewMode = 'table', count = 5 }) => {
  const cardSkeleton = (
    <div className="border border-surface-200 dark:border-surface-700 rounded-xl p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-surface-200 dark:bg-surface-700" />
        <div className="flex-1">
          <div className="h-4 w-32 bg-surface-200 dark:bg-surface-700 rounded mb-1" />
          <div className="h-3 w-20 bg-surface-200 dark:bg-surface-700 rounded" />
        </div>
        <div className="h-5 w-16 bg-surface-200 dark:bg-surface-700 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-surface-200 dark:bg-surface-700 rounded" />
        <div className="h-3 w-2/3 bg-surface-200 dark:bg-surface-700 rounded" />
      </div>
      <div className="flex justify-between mt-3 pt-3 border-t border-surface-100 dark:border-surface-800">
        <div className="h-3 w-20 bg-surface-200 dark:bg-surface-700 rounded" />
        <div className="h-6 w-16 bg-surface-200 dark:bg-surface-700 rounded" />
      </div>
    </div>
  );

  if (viewMode === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i}>{cardSkeleton}</div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th><div className="h-4 w-20 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" /></th>
            <th><div className="h-4 w-16 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" /></th>
            <th><div className="h-4 w-20 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" /></th>
            <th><div className="h-4 w-16 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" /></th>
            <th><div className="h-4 w-16 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" /></th>
            <th><div className="h-4 w-16 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" /></th>
            <th><div className="h-4 w-16 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" /></th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: count }).map((_, i) => (
            <tr key={i} className="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/40 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-surface-200 dark:bg-surface-700 animate-pulse" />
                  <div className="h-4 w-32 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
                </div>
              </td>
              <td className="px-4 py-3"><div className="h-4 w-20 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" /></td>
              <td className="px-4 py-3"><div className="h-4 w-16 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" /></td>
              <td className="px-4 py-3"><div className="h-4 w-16 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" /></td>
              <td className="px-4 py-3"><div className="h-4 w-16 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" /></td>
              <td className="px-4 py-3"><div className="h-5 w-16 bg-surface-200 dark:bg-surface-700 rounded-full animate-pulse" /></td>
              <td className="px-4 py-3 text-right"><div className="h-6 w-20 bg-surface-200 dark:bg-surface-700 rounded animate-pulse ml-auto" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategorySkeleton;
