import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MdSave, MdArrowBack } from 'react-icons/md';
import toast from 'react-hot-toast';
import PageWrapper from '@components/layout/PageWrapper';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import inventoryService from '@api/services/inventoryService';
import productService from '@api/services/productService';
import warehouseService from '@api/services/warehouseService';

const TYPE_OPTIONS = [
  { value: 'STOCK_IN',   label: 'Stock In' },
  { value: 'STOCK_OUT',  label: 'Stock Out' },
  { value: 'ADJUSTMENT', label: 'Adjustment' },
  { value: 'TRANSFER',   label: 'Transfer' },
  { value: 'RESERVED',   label: 'Reserved' },
  { value: 'RELEASED',   label: 'Released' },
  { value: 'DISPATCHED', label: 'Dispatched' },
  { value: 'RETURNED',   label: 'Returned' },
  { value: 'DAMAGED',    label: 'Damaged' },
  { value: 'EXPIRED',    label: 'Expired' },
];

const FormSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {[1, 2, 3].map((s) => (
      <div key={s}>
        <div className="h-4 w-32 bg-surface-200 dark:bg-surface-700 rounded mb-3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
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

const fieldClass = 'w-full px-3 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm text-surface-800 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all';
const labelClass = 'block text-xs font-semibold text-surface-500 dark:text-surface-400 mb-1.5';
const errorClass = 'text-xs text-danger-500 mt-1';

const EditTransaction = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingTxn, setLoadingTxn] = useState(true);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      productId: '',
      warehouseId: '',
      transactionType: 'STOCK_IN',
      quantity: '',
      unitCost: '',
      referenceNumber: '',
      reason: '',
      batchNumber: '',
      destinationWarehouseId: '',
    },
  });

  const selectedType = watch('transactionType');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [txnRes, prodRes, warRes] = await Promise.all([
          inventoryService.getById(id),
          productService.getAll({ page: 0, size: 500, sort: 'name', direction: 'asc' }),
          warehouseService.getAll({ page: 0, size: 500, sort: 'name', direction: 'asc' }),
        ]);
        setProducts(prodRes?.data?.content ?? []);
        setWarehouses(warRes?.data?.content ?? []);

        const txn = txnRes?.data;
        if (txn) {
          reset({
            productId: txn.productId?.toString() || '',
            warehouseId: txn.warehouseId?.toString() || '',
            transactionType: txn.transactionType || 'STOCK_IN',
            quantity: txn.quantity?.toString() || '',
            unitCost: txn.unitCost?.toString() || '',
            referenceNumber: txn.referenceNumber || '',
            reason: txn.reason || '',
            batchNumber: txn.batchNumber || '',
            destinationWarehouseId: txn.destinationWarehouseId?.toString() || '',
          });
        }
      } catch {
        toast.error('Failed to load transaction');
        navigate('/inventory');
      } finally {
        setLoadingMeta(false);
        setLoadingTxn(false);
      }
    };
    loadData();
  }, [id, navigate, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        productId: parseInt(data.productId, 10),
        warehouseId: parseInt(data.warehouseId, 10),
        transactionType: data.transactionType,
        quantity: parseInt(data.quantity, 10),
        unitCost: data.unitCost ? parseFloat(data.unitCost) : null,
        referenceNumber: data.referenceNumber || null,
        reason: data.reason || null,
        batchNumber: data.batchNumber || null,
        destinationWarehouseId: data.destinationWarehouseId ? parseInt(data.destinationWarehouseId, 10) : null,
      };
      await inventoryService.update(id, payload);
      toast.success('Transaction updated successfully');
      navigate(`/inventory/${id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };

  if (loadingTxn) {
    return (
      <PageWrapper>
        <div className="page-container max-w-3xl">
          <Card><FormSkeleton /></Card>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="page-container max-w-3xl">
        <div className="page-header">
          <div>
            <h1 className="page-title">Edit Transaction</h1>
            <p className="page-subtitle">Update inventory transaction details</p>
          </div>
        </div>

        {loadingMeta ? (
          <Card><FormSkeleton /></Card>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              {/* Product & Warehouse */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={labelClass}>Product *</label>
                  <select {...register('productId', { required: 'Product is required' })} className={fieldClass}>
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                  {errors.productId && <p className={errorClass}>{errors.productId.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>Warehouse *</label>
                  <select {...register('warehouseId', { required: 'Warehouse is required' })} className={fieldClass}>
                    <option value="">Select warehouse</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                  {errors.warehouseId && <p className={errorClass}>{errors.warehouseId.message}</p>}
                </div>
              </div>

              {/* Type & Quantity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={labelClass}>Transaction Type *</label>
                  <select {...register('transactionType', { required: 'Type is required' })} className={fieldClass}>
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  {errors.transactionType && <p className={errorClass}>{errors.transactionType.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    {...register('quantity', { required: 'Quantity is required', min: { value: 1, message: 'Minimum 1' } })}
                    className={fieldClass}
                    placeholder="Enter quantity"
                  />
                  {errors.quantity && <p className={errorClass}>{errors.quantity.message}</p>}
                </div>
              </div>

              {/* Transfer destination */}
              {selectedType === 'TRANSFER' && (
                <div className="mb-6">
                  <label className={labelClass}>Destination Warehouse</label>
                  <select {...register('destinationWarehouseId')} className={fieldClass}>
                    <option value="">Select destination</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Cost & Reference */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={labelClass}>Unit Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('unitCost')}
                    className={fieldClass}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className={labelClass}>Reference Number</label>
                  <input
                    type="text"
                    {...register('referenceNumber', { maxLength: { value: 100, message: 'Max 100 characters' } })}
                    className={fieldClass}
                    placeholder="PO-001, ORDER-123"
                  />
                  {errors.referenceNumber && <p className={errorClass}>{errors.referenceNumber.message}</p>}
                </div>
              </div>

              {/* Batch & Reason */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={labelClass}>Batch Number</label>
                  <input
                    type="text"
                    {...register('batchNumber', { maxLength: { value: 100, message: 'Max 100 characters' } })}
                    className={fieldClass}
                    placeholder="LOT-2024-001"
                  />
                  {errors.batchNumber && <p className={errorClass}>{errors.batchNumber.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>Reason</label>
                  <input
                    type="text"
                    {...register('reason', { maxLength: { value: 500, message: 'Max 500 characters' } })}
                    className={fieldClass}
                    placeholder="Why this transaction?"
                  />
                  {errors.reason && <p className={errorClass}>{errors.reason.message}</p>}
                </div>
              </div>
            </Card>

            <div className="flex items-center justify-end gap-3 mt-6">
              <Button variant="secondary" leftIcon={<MdArrowBack />} onClick={() => navigate(`/inventory/${id}`)} type="button" disabled={loading}>
                Cancel
              </Button>
              <Button variant="primary" leftIcon={<MdSave />} type="submit" isLoading={loading}>
                Update Transaction
              </Button>
            </div>
          </form>
        )}
      </div>
    </PageWrapper>
  );
};

export default EditTransaction;
