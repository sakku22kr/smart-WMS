const ProductSkeleton = ({ count = 8 }) => (
  <div className="overflow-x-auto">
    <table className="data-table">
      <thead>
        <tr>
          {['Product', 'SKU', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
            <th key={h} className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-16" /></th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: count }).map((_, i) => (
          <tr key={i} className="border-b border-surface-100 dark:border-surface-800">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-200 dark:bg-surface-700 animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-32" />
                  <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-20" />
                </div>
              </div>
            </td>
            <td className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-16" /></td>
            <td className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-20" /></td>
            <td className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-14 ml-auto" /></td>
            <td className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-8 mx-auto" /></td>
            <td className="px-4 py-3"><div className="h-6 bg-surface-200 dark:bg-surface-700 rounded-full animate-pulse w-16" /></td>
            <td className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse w-20 ml-auto" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ProductSkeleton;
