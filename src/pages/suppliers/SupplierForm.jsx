import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MdSave, MdArrowBack } from 'react-icons/md';
import toast from 'react-hot-toast';
import PageWrapper from '@components/layout/PageWrapper';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import supplierService from '@api/services/supplierService';

const inputClass = 'w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm text-surface-700 dark:text-surface-200 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors';
const labelClass = 'block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1';
const errorClass = 'text-xs text-danger-500 mt-1';
const sectionTitle = 'text-sm font-semibold text-surface-700 dark:text-surface-200 mb-3 pb-2 border-b border-surface-200 dark:border-surface-700';

const FormSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {[1, 2, 3].map((s) => (
      <div key={s}>
        <div className="h-4 w-32 bg-surface-200 dark:bg-surface-700 rounded mb-3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: s === 1 ? 6 : s === 2 ? 4 : 3 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-20 bg-surface-200 dark:bg-surface-700 rounded mb-1.5" />
              <div className="h-10 bg-surface-200 dark:bg-surface-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const Field = ({ label, error, children }) => (
  <div>
    <label className={labelClass}>{label}</label>
    {children}
    {error && <p className={errorClass}>{error.message}</p>}
  </div>
);

const SupplierForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [_serverErrors, setServerErrors] = useState({});

  const {
    register, handleSubmit, reset, formState: { errors },
  } = useForm({
    defaultValues: {
      name: '', code: '', companyName: '', contactPerson: '',
      email: '', phone: '', alternatePhone: '', website: '',
      address: '', city: '', state: '', country: '', pinCode: '',
      gstin: '', panNumber: '', bankName: '', bankAccountNumber: '',
      bankIfsc: '', creditLimit: '', paymentTermDays: '',
      status: 'ACTIVE', notes: '',
    },
  });

  const phoneRegex = /^(\+[\d-]{7,15}|[\d-]{7,15})$/;
  const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const res = await supplierService.getById(id);
        const data = res?.data;
        if (data) {
          reset({
            name: data.name || '',
            code: data.code || '',
            companyName: data.companyName || '',
            contactPerson: data.contactPerson || '',
            email: data.email || '',
            phone: data.phone || '',
            alternatePhone: data.alternatePhone || '',
            website: data.website || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            country: data.country || '',
            pinCode: data.pinCode || '',
            gstin: data.gstin || '',
            panNumber: data.panNumber || '',
            bankName: data.bankName || '',
            bankAccountNumber: data.bankAccountNumber || '',
            bankIfsc: data.bankIfsc || '',
            creditLimit: data.creditLimit || '',
            paymentTermDays: data.paymentTermDays || '',
            status: data.status || 'ACTIVE',
            notes: data.notes || '',
          });
        }
      } catch {
        toast.error('Failed to load supplier');
        navigate('/suppliers');
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [id, isEdit, reset, navigate]);

  const onSubmit = async (formData) => {
    setLoading(true);
    setServerErrors({});
    try {
      const payload = { ...formData };
      if (payload.creditLimit === '' || payload.creditLimit === null) delete payload.creditLimit;
      if (payload.paymentTermDays === '' || payload.paymentTermDays === null) delete payload.paymentTermDays;

      if (isEdit) {
        await supplierService.update(id, payload);
        toast.success('Supplier updated successfully');
      } else {
        await supplierService.create(payload);
        toast.success('Supplier created successfully');
      }
      navigate('/suppliers');
    } catch (err) {
      const resp = err?.response?.data;
      if (resp?.errors) {
        setServerErrors(resp.errors);
      }
      toast.error(resp?.message || 'Failed to save supplier');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <PageWrapper>
        <div className="page-container max-w-4xl">
          <FormSkeleton />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="page-container max-w-4xl">
        <div className="page-header">
          <div>
            <button onClick={() => navigate('/suppliers')} className="flex items-center gap-1 text-xs text-surface-400 hover:text-primary-500 transition-colors mb-1">
              <MdArrowBack size={14} /> Back to Suppliers
            </button>
            <h1 className="page-title">{isEdit ? 'Edit Supplier' : 'Create Supplier'}</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <h3 className={sectionTitle}>Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Supplier Name *" error={errors.name}>
                <input {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' }, maxLength: { value: 200, message: 'Max 200 characters' } })} className={inputClass} placeholder="e.g. TechSupply Co." />
              </Field>
              <Field label="Supplier Code *" error={errors.code}>
                <input {...register('code', { required: 'Code is required', pattern: { value: /^[A-Z0-9_-]+$/i, message: 'Only letters, digits, hyphens, underscores' }, minLength: { value: 2, message: 'Min 2 characters' }, maxLength: { value: 30, message: 'Max 30 characters' } })} className={`${inputClass} font-mono`} placeholder="e.g. SUP-001" />
              </Field>
              <Field label="Company Name" error={errors.companyName}>
                <input {...register('companyName', { maxLength: { value: 200, message: 'Max 200 characters' } })} className={inputClass} placeholder="e.g. TechSupply Inc." />
              </Field>
              <Field label="Contact Person" error={errors.contactPerson}>
                <input {...register('contactPerson', { maxLength: { value: 150, message: 'Max 150 characters' } })} className={inputClass} placeholder="e.g. John Doe" />
              </Field>
              <Field label="Email" error={errors.email}>
                <input {...register('email', { pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' }, maxLength: { value: 150, message: 'Max 150 characters' } })} type="email" className={inputClass} placeholder="email@example.com" />
              </Field>
              <Field label="Phone" error={errors.phone}>
                <input {...register('phone', { pattern: { value: phoneRegex, message: 'Invalid phone format (e.g. +91-98765-43210)' } })} className={inputClass} placeholder="+91-98765-43210" />
              </Field>
              <Field label="Alternate Phone" error={errors.alternatePhone}>
                <input {...register('alternatePhone', { pattern: { value: phoneRegex, message: 'Invalid phone format' } })} className={inputClass} placeholder="+91-98765-43211" />
              </Field>
              <Field label="Website" error={errors.website}>
                <input {...register('website', { pattern: { value: urlRegex, message: 'Invalid URL (e.g. https://example.com)' } })} className={inputClass} placeholder="https://example.com" />
              </Field>
              <Field label="Status" error={errors.status}>
                <select {...register('status')} className={inputClass}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="BLACKLISTED">Blacklisted</option>
                </select>
              </Field>
            </div>
          </Card>

          {/* Address */}
          <Card>
            <h3 className={sectionTitle}>Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <Field label="Address" error={errors.address}>
                  <textarea {...register('address', { maxLength: { value: 500, message: 'Max 500 characters' } })} className={inputClass} rows={2} placeholder="Full address" />
                </Field>
              </div>
              <Field label="City" error={errors.city}>
                <input {...register('city', { maxLength: { value: 100, message: 'Max 100 characters' } })} className={inputClass} placeholder="City" />
              </Field>
              <Field label="State" error={errors.state}>
                <input {...register('state', { maxLength: { value: 100, message: 'Max 100 characters' } })} className={inputClass} placeholder="State" />
              </Field>
              <Field label="Country" error={errors.country}>
                <input {...register('country', { maxLength: { value: 100, message: 'Max 100 characters' } })} className={inputClass} placeholder="Country" />
              </Field>
              <Field label="Postal Code" error={errors.pinCode}>
                <input {...register('pinCode', { maxLength: { value: 20, message: 'Max 20 characters' } })} className={inputClass} placeholder="Postal code" />
              </Field>
            </div>
          </Card>

          {/* Tax & Bank */}
          <Card>
            <h3 className={sectionTitle}>Tax & Banking</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="GST/Tax Number" error={errors.gstin}>
                <input {...register('gstin', { pattern: { value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i, message: 'Invalid GSTIN (e.g. 22AAAAA0000A1Z5)' } })} className={`${inputClass} font-mono`} placeholder="22AAAAA0000A1Z5" />
              </Field>
              <Field label="PAN Number" error={errors.panNumber}>
                <input {...register('panNumber', { pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i, message: 'Invalid PAN (e.g. ABCDE1234F)' } })} className={`${inputClass} font-mono`} placeholder="ABCDE1234F" />
              </Field>
              <Field label="Credit Limit" error={errors.creditLimit}>
                <input {...register('creditLimit', { min: { value: 0, message: 'Must be 0 or greater' } })} type="number" step="0.01" className={inputClass} placeholder="0.00" />
              </Field>
              <Field label="Payment Term Days" error={errors.paymentTermDays}>
                <input {...register('paymentTermDays', { min: { value: 0, message: 'Must be 0 or greater' }, max: { value: 365, message: 'Max 365 days' } })} type="number" className={inputClass} placeholder="30" />
              </Field>
              <Field label="Bank Name" error={errors.bankName}>
                <input {...register('bankName', { maxLength: { value: 150, message: 'Max 150 characters' } })} className={inputClass} placeholder="Bank name" />
              </Field>
              <Field label="Bank Account Number" error={errors.bankAccountNumber}>
                <input {...register('bankAccountNumber', { maxLength: { value: 50, message: 'Max 50 characters' } })} className={`${inputClass} font-mono`} placeholder="Account number" />
              </Field>
              <Field label="Bank IFSC" error={errors.bankIfsc}>
                <input {...register('bankIfsc', { pattern: { value: /^[A-Z]{4}0[A-Z0-9]{6}$/i, message: 'Invalid IFSC (e.g. SBIN0001234)' } })} className={`${inputClass} font-mono`} placeholder="SBIN0001234" />
              </Field>
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <h3 className={sectionTitle}>Notes</h3>
            <textarea {...register('notes', { maxLength: { value: 1000, message: 'Max 1000 characters' } })} className={inputClass} rows={3} placeholder="Additional notes about this supplier\u2026" />
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pb-6">
            <Button variant="secondary" type="button" onClick={() => navigate('/suppliers')} leftIcon={<MdArrowBack />}>Cancel</Button>
            <Button variant="primary" type="submit" loading={loading} leftIcon={<MdSave />}>{isEdit ? 'Update Supplier' : 'Create Supplier'}</Button>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
};

export default SupplierForm;
