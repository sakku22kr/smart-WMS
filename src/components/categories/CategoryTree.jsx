import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdExpandMore, MdChevronRight, MdCategory, MdCheckCircle,
  MdPowerSettingsNew,
} from 'react-icons/md';
import clsx from 'clsx';
import Badge from '@components/ui/Badge';

const TreeNode = ({ category, depth = 0, expandedIds, onToggle }) => {
  const navigate = useNavigate();
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedIds.has(category.id);

  const statusConfig = {
    ACTIVE:   { variant: 'success', label: 'Active' },
    INACTIVE: { variant: 'danger',  label: 'Inactive' },
  };
  const cfg = statusConfig[category.status] || { variant: 'default', label: category.status };

  return (
    <div>
      <div
        className={clsx(
          'flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer group transition-colors',
          'hover:bg-surface-100 dark:hover:bg-surface-800/60',
        )}
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(category.id); }}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
          >
            {isExpanded
              ? <MdExpandMore size={16} />
              : <MdChevronRight size={16} />}
          </button>
        ) : (
          <span className="flex-shrink-0 w-5 h-5" />
        )}

        <div
          className="flex items-center gap-2 flex-1 min-w-0"
          onClick={() => navigate(`/categories/${category.id}`)}
        >
          <div className="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
            <MdCategory size={14} className="text-primary-500" />
          </div>
          <span className="text-sm font-medium text-surface-800 dark:text-surface-100 truncate">
            {category.name}
          </span>
          <span className="text-xs font-mono text-surface-400 dark:text-surface-500 flex-shrink-0">
            {category.code}
          </span>
          {(category.productCount ?? 0) > 0 && (
            <span className="text-xs text-surface-400 flex-shrink-0">
              {category.productCount} product{category.productCount !== 1 ? 's' : ''}
            </span>
          )}
          <Badge variant={cfg.variant} size="sm" className="ml-auto flex-shrink-0">
            {cfg.label}
          </Badge>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {category.children
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .map((child) => (
              <TreeNode
                key={child.id}
                category={child}
                depth={depth + 1}
                expandedIds={expandedIds}
                onToggle={onToggle}
              />
            ))}
        </div>
      )}
    </div>
  );
};

const CategoryTree = ({ categories = [], loading = false }) => {
  const [expandedIds, setExpandedIds] = useState(() => {
    const initial = new Set();
    categories.forEach((cat) => {
      if (cat.children && cat.children.length > 0) initial.add(cat.id);
    });
    return initial;
  });

  const handleToggle = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const all = new Set();
    const collect = (cats) => {
      cats.forEach((cat) => {
        if (cat.children && cat.children.length > 0) {
          all.add(cat.id);
          collect(cat.children);
        }
      });
    };
    collect(categories);
    setExpandedIds(all);
  };

  const collapseAll = () => setExpandedIds(new Set());

  if (loading) {
    return (
      <div className="space-y-2 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2 px-3">
            <div className="w-5 h-5 rounded bg-surface-200 dark:bg-surface-700 animate-pulse" />
            <div className="h-4 rounded bg-surface-200 dark:bg-surface-700 animate-pulse" style={{ width: `${60 - i * 10}%` }} />
          </div>
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-12 text-surface-400">
        <MdCategory size={48} className="mx-auto mb-3 opacity-40" />
        <p className="text-sm">No categories in the tree</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 px-1">
        <button
          onClick={expandAll}
          className="text-xs text-primary-500 hover:text-primary-600 font-medium"
        >
          Expand All
        </button>
        <span className="text-surface-300 dark:text-surface-600">|</span>
        <button
          onClick={collapseAll}
          className="text-xs text-primary-500 hover:text-primary-600 font-medium"
        >
          Collapse All
        </button>
      </div>
      <div className="space-y-0.5">
        {categories
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((cat) => (
            <TreeNode
              key={cat.id}
              category={cat}
              depth={0}
              expandedIds={expandedIds}
              onToggle={handleToggle}
            />
          ))}
      </div>
    </div>
  );
};

export default CategoryTree;
