import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdChevronRight, MdCategory } from 'react-icons/md';
import categoryService from '@/api/services/categoryService';

const CategoryBreadcrumb = ({ categoryId }) => {
  const navigate = useNavigate();
  const [path, setPath] = useState([]);

  useEffect(() => {
    if (!categoryId) return;
    let cancelled = false;
    categoryService.getPath(categoryId)
      .then((res) => { if (!cancelled) setPath(res?.data ?? []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [categoryId]);

  if (!path || path.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-sm text-surface-500 dark:text-surface-400 mb-4 flex-wrap">
      {path.map((cat, idx) => {
        const isLast = idx === path.length - 1;
        return (
          <span key={cat.id} className="flex items-center gap-1">
            {idx > 0 && <MdChevronRight size={14} className="text-surface-300 dark:text-surface-600 flex-shrink-0" />}
            {isLast ? (
              <span className="flex items-center gap-1 font-semibold text-surface-800 dark:text-surface-100">
                <MdCategory size={14} className="text-primary-500" />
                {cat.name}
              </span>
            ) : (
              <button
                onClick={() => navigate(`/categories/${cat.id}`)}
                className="flex items-center gap-1 hover:text-primary-500 transition-colors"
              >
                <MdCategory size={12} />
                {cat.name}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default CategoryBreadcrumb;
