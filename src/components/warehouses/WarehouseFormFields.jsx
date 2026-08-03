import Input from '@components/ui/Input';
import { MdPerson, MdEmail, MdPhone, MdLocationOn, MdWarehouse, MdScale, MdDescription } from 'react-icons/md';

const STATUS_OPTIONS = [
  { value: 'ACTIVE',            label: 'Active' },
  { value: 'INACTIVE',          label: 'Inactive' },
  { value: 'UNDER_MAINTENANCE', label: 'Under Maintenance' },
];

const WarehouseFormFields = ({
  register,
  errors,
  watch,
  setValue,
  disabled = false,
}) => {
  const status = watch('status');

  return (
    <div className="space-y-6">
      {/* ─── Basic Information ─── */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500 mb-3">
          Basic Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Warehouse Name"
            id="name"
            placeholder="e.g. Mumbai Central Hub"
            leftIcon={<MdWarehouse />}
            error={errors.name?.message}
            disabled={disabled}
            required
            {...register('name', {
              required: 'Warehouse name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
              maxLength: { value: 100, message: 'Name must not exceed 100 characters' },
            })}
          />
          <Input
            label="Warehouse Code"
            id="code"
            placeholder="e.g. WH-001"
            error={errors.code?.message}
            disabled={disabled}
            required
            helperText="Unique identifier — uppercase letters, digits, hyphens, or underscores"
            {...register('code', {
              required: 'Warehouse code is required',
              minLength: { value: 2, message: 'Code must be at least 2 characters' },
              maxLength: { value: 50, message: 'Code must not exceed 50 characters' },
              pattern: {
                value: /^[A-Z0-9_-]+$/i,
                message: 'Only uppercase letters, digits, hyphens, or underscores',
              },
            })}
          />
        </div>
      </div>

      {/* ─── Location ─── */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500 mb-3">
          Location
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Location"
            id="location"
            placeholder="e.g. Mumbai, Maharashtra"
            leftIcon={<MdLocationOn />}
            error={errors.location?.message}
            disabled={disabled}
            {...register('location', {
              maxLength: { value: 100, message: 'Location must not exceed 100 characters' },
            })}
          />
          <Input
            label="Full Address"
            id="address"
            placeholder="e.g. 123 Industrial Area, Andheri East, Mumbai 400069"
            error={errors.address?.message}
            disabled={disabled}
            {...register('address', {
              maxLength: { value: 255, message: 'Address must not exceed 255 characters' },
            })}
          />
        </div>
      </div>

      {/* ─── Manager Details ─── */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500 mb-3">
          Manager Details
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Manager Name"
            id="manager"
            placeholder="e.g. Rajesh Kumar"
            leftIcon={<MdPerson />}
            error={errors.manager?.message}
            disabled={disabled}
            {...register('manager', {
              maxLength: { value: 100, message: 'Manager name must not exceed 100 characters' },
            })}
          />
          <Input
            label="Contact Number"
            id="contactNumber"
            placeholder="e.g. +91-98765-43210"
            leftIcon={<MdPhone />}
            error={errors.contactNumber?.message}
            disabled={disabled}
            {...register('contactNumber', {
              pattern: {
                value: /^[+]?[\d\s\-().]{7,20}$/,
                message: 'Invalid phone number format',
              },
            })}
          />
          <Input
            label="Manager Email"
            id="email"
            type="email"
            placeholder="e.g. manager@smartwms.com"
            leftIcon={<MdEmail />}
            error={errors.email?.message}
            disabled={disabled}
            {...register('email', {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid email format',
              },
            })}
          />
        </div>
      </div>

      {/* ─── Capacity ─── */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500 mb-3">
          Capacity & Utilization
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Total Capacity (m³)"
            id="capacity"
            type="number"
            placeholder="e.g. 10000"
            leftIcon={<MdScale />}
            error={errors.capacity?.message}
            disabled={disabled}
            required
            {...register('capacity', {
              required: 'Capacity is required',
              min: { value: 0, message: 'Capacity must be 0 or greater' },
              valueAsNumber: true,
            })}
          />
          <Input
            label="Current Utilization (m³)"
            id="currentUtilization"
            type="number"
            placeholder="e.g. 5500"
            leftIcon={<MdScale />}
            error={errors.currentUtilization?.message}
            disabled={disabled}
            {...register('currentUtilization', {
              min: { value: 0, message: 'Utilization must be 0 or greater' },
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
        {errors.status && (
          <p className="text-xs text-danger-500 mt-1">{errors.status?.message}</p>
        )}
      </div>

      {/* ─── Description ─── */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500 mb-3">
          Description
        </h4>
        <div className="flex flex-col gap-1.5">
          <textarea
            id="description"
            placeholder="Brief description of the warehouse, its purpose, special features..."
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

export default WarehouseFormFields;
