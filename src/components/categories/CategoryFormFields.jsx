import { useState, useEffect } from 'react';
import Input from '@components/ui/Input';
import { MdCategory, MdSort, MdDescription } from 'react-icons/md';
import categoryService from '@/api/services/categoryService';

const STATUS_OPTIONS = [
  { value: 'ACTIVE',   label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const CategoryFormFields = ({
  register,
  errors,
  watch,
  setValue,
  disabled = false,
  categoryId = null,
  rootCategories: _rootCategories = [],
}) => {
  const status = watch('status');
  const [parentOptions, setParentOptions] = useState([]);

  useEffect(() => {
    const fetchParents = async () => {
      try {
        const res = await categoryService.getRoots();
        const data = res?.data ?? [];
        const filtered = categoryId ? data.filter((c) => c.id !== categoryId) : data;
        setParentOptions(filtered);
      } catch {
        setParentOptions([]);
      }
    };
    fetchParents();
  }, [categoryId]);

  return (
    <div className="space-y-6">
      {/* ─── Basic Information ─── */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500 mb-3">
          Basic Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Category Name"
            id="name"
            placeholder="e.g. Electronics"
            leftIcon={<MdCategory />}
            error={errors.name?.message}
            disabled={disabled}
            required
            {...register('name', {
              required: 'Category name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
              maxLength: { value: 150, message: 'Name must not exceed 150 characters' },
            })}
          />
          <Input
            label="Category Code"
            id="code"
            placeholder="e.g. ELEC"
            error={errors.code?.message}
            disabled={disabled}
            required
            helperText="Unique identifier — uppercase letters, digits, hyphens, or underscores"
            {...register('code', {
              required: 'Category code is required',
              minLength: { value: 2, message: 'Code must be at least 2 characters' },
              maxLength: { value: 30, message: 'Code must not exceed 30 characters' },
              pattern: {
                value: /^[A-Z0-9_-]+$/i,
                message: 'Only uppercase letters, digits, hyphens, or underscores',
              },
            })}
          />
        </div>
      </div>

      {/* ─── Hierarchy & Display ─── */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500 mb-3">
          Hierarchy & Display
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Parent Category
            </label>
            <select
              id="parentId"
              disabled={disabled}
              value={watch('parentId') ?? ''}
              onChange={(e) => {
                const val = e.target.value === '' ? null : Number(e.target.value);
                setValue('parentId', val, { shouldValidate: true });
              }}
              className="input-base h-10 text-sm px-4 py-2.5 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
            >
              <option value="">None (Root Category)</option>
              {parentOptions.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name} ({cat.code})</option>
              ))}
            </select>
            {errors.parentId && (
              <p className="text-xs text-danger-500 flex items-center gap-1">
                {errors.parentId?.message}
              </p>
            )}
          </div>
          <Input
            label="Sort Order"
            id="sortOrder"
            type="number"
            placeholder="0"
            leftIcon={<MdSort />}
            error={errors.sortOrder?.message}
            disabled={disabled}
            {...register('sortOrder', {
              min: { value: 0, message: 'Sort order must be 0 or greater' },
              valueAsNumber: true,
            })}
          />
        </div>
      </div>

      {/* ─── Status ─── */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500 mb-3">
          Status
        </h4>
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => setValue('status', opt.value, { shouldValidate: true })}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                status === opt.value
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600 border border-surface-200 dark:border-surface-600'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Description ─── */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500 mb-3">
          Description
        </h4>
        <div className="flex flex-col gap-1.5">
          <textarea
            id="description"
            placeholder="Brief description of this category..."
            disabled={disabled}
            rows={3}
            className={`input-base w-full px-4 py-2.5 text-sm rounded-xl resize-none ${
              errors.description ? 'border-danger-500 focus:ring-danger-500/40 focus:border-danger-500' : ''
            } ${disabled ? 'opacity-50 cursor-not-allowed bg-surface-100 dark:bg-surface-900' : ''}`}
            {...register('description', {
              maxLength: { value: 500, message: 'Description must not exceed 500 characters' },
            })}
          />
          {errors.description && (
            <p className="text-xs text-danger-500 flex items-center gap-1">
              <MdDescription size={14} /> {errors.description?.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryFormFields;
