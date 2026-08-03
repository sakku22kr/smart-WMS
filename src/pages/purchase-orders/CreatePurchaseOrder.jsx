import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { MdSave, MdArrowBack, MdAdd, MdDelete } from 'react-icons/md';
import toast from 'react-hot-toast';
import PageWrapper from '@components/layout/PageWrapper';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import usePurchaseOrders from '@hooks/usePurchaseOrders';
import purchaseOrderService from '@api/services/purchaseOrderService';
import productService from '@api/services/productService';
import supplierService from '@api/services/supplierService';
import warehouseService from '@api/services/warehouseService';

const fieldClass = 'w-full px-3 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm text-surface-800 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all';
const selectClass = 'w-full px-3 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm text-surface-800 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all';
const labelClass = 'block text-xs font-semibold text-surface-500 dark:text-surface-400 mb-1.5';
const errorClass = 'text-xs text-danger-500 mt-1';

const EMPTY_ITEM = { productId: '', orderedQuantity: 1, unitPrice: 0, taxRate: 0, discountAmount: 0, notes: '' };

const formatCurrency = (val) => {
  const num = Number(val);
  if (!num && num !== 0) return '₹0';
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const calcLineTotal = (item) => {
  const qty = parseInt(item.orderedQuantity, 10) || 0;
  const price = parseFloat(item.unitPrice) || 0;
  const discount = parseFloat(item.discountAmount) || 0;
  const taxRate = parseFloat(item.taxRate) || 0;
  const base = qty * price;
  const afterDiscount = base - discount;
  const tax = afterDiscount * (taxRate / 100);
  return { base, afterDiscount, tax, total: afterDiscount + tax };
};

const FormSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {[1, 2, 3].map((s) => (
      <div key={s}>
        <div className="h-4 w-32 bg-surface-200 dark:bg-surface-700 rounded mb-3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

const CreatePurchaseOrder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { createOrder, updateOrder } = usePurchaseOrders();
  const [submitting, setSubmitting] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingOrder, setLoadingOrder] = useState(isEdit);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      supplierId: '',
      warehouseId: '',
      expectedDeliveryDate: '',
      paymentTerms: '',
      shippingAddress: '',
      notes: '',
      taxAmount: 0,
      shippingCost: 0,
      discountAmount: 0,
      items: [{ ...EMPTY_ITEM }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [supRes, warRes, prodRes] = await Promise.all([
          supplierService.getAll({ page: 0, size: 500, sort: 'name', direction: 'asc' }),
          warehouseService.getAll({ page: 0, size: 500, sort: 'name', direction: 'asc' }),
          productService.getAll({ page: 0, size: 500, sort: 'name', direction: 'asc' }),
        ]);
        setSuppliers(supRes?.data?.content ?? []);
        setWarehouses(warRes?.data?.content ?? []);
        setProducts(prodRes?.data?.content ?? []);

        if (isEdit) {
          setLoadingOrder(true);
          try {
            const res = await purchaseOrderService.getById(id);
            const order = res?.data;
            if (order) {
              reset({
                supplierId: order.supplierId ?? '',
                warehouseId: order.warehouseId ?? '',
                expectedDeliveryDate: order.expectedDeliveryDate ?? '',
                paymentTerms: order.paymentTerms ?? '',
                shippingAddress: order.shippingAddress ?? '',
                notes: order.notes ?? '',
                taxAmount: order.taxAmount ?? 0,
                shippingCost: order.shippingCost ?? 0,
                discountAmount: order.discountAmount ?? 0,
                items: (order.items ?? []).length > 0
                  ? (order.items ?? []).map(item => ({
                      productId: item.productId ?? '',
                      orderedQuantity: item.orderedQuantity ?? 1,
                      unitPrice: item.unitPrice ?? 0,
                      taxRate: item.taxRate ?? 0,
                      discountAmount: item.discountAmount ?? 0,
                      notes: item.notes ?? '',
                    }))
                  : [{ ...EMPTY_ITEM }],
              });
            }
          } catch {
            toast.error('Failed to load purchase order');
            navigate('/purchase-orders');
          } finally {
            setLoadingOrder(false);
          }
        }
      } catch {
        toast.error('Failed to load form data');
      } finally {
        setLoadingMeta(false);
      }
    };
    loadAll();
  }, [id, isEdit, navigate, reset]);

  const onSubmit = async (data) => {
    const validItems = (data.items || []).filter(item => item.productId);
    if (validItems.length === 0) {
      toast.error('Please add at least one product');
      return;
    }
    for (let i = 0; i < validItems.length; i++) {
      const qty = parseInt(validItems[i].orderedQuantity, 10);
      const price = parseFloat(validItems[i].unitPrice);
      if (!qty || qty < 1) {
        toast.error(`Item ${i + 1}: Quantity must be at least 1`);
        return;
      }
      if (!price || price <= 0) {
        toast.error(`Item ${i + 1}: Unit price must be greater than 0`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        supplierId: parseInt(data.supplierId, 10),
        warehouseId: parseInt(data.warehouseId, 10),
        expectedDeliveryDate: data.expectedDeliveryDate || null,
        paymentTerms: data.paymentTerms || '',
        shippingAddress: data.shippingAddress || '',
        notes: data.notes || '',
        taxAmount: parseFloat(data.taxAmount) || 0,
        shippingCost: parseFloat(data.shippingCost) || 0,
        discountAmount: parseFloat(data.discountAmount) || 0,
        items: validItems.map(item => ({
          productId: parseInt(item.productId, 10),
          orderedQuantity: parseInt(item.orderedQuantity, 10),
          unitPrice: parseFloat(item.unitPrice),
          taxRate: parseFloat(item.taxRate) || 0,
          discountAmount: parseFloat(item.discountAmount) || 0,
          notes: item.notes || '',
        })),
      };
      if (isEdit) {
        await updateOrder(id, payload);
        toast.success('Purchase order updated');
      } else {
        await createOrder(payload);
        toast.success('Purchase order created');
      }
      navigate('/purchase-orders');
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} purchase order`);
    } finally {
      setSubmitting(false);
    }
  };

  const watchItems = watch('items');
  const itemTotals = useMemo(() => {
    return (watchItems || []).map(item => calcLineTotal(item || {}));
  }, [watchItems]);

  const subtotal = itemTotals.reduce((sum, t) => sum + t.total, 0);
  const taxAmount = parseFloat(watch('taxAmount')) || 0;
  const shippingCost = parseFloat(watch('shippingCost')) || 0;
  const discountAmount = parseFloat(watch('discountAmount')) || 0;
  const grandTotal = subtotal + taxAmount + shippingCost - discountAmount;

  const handleRemoveItem = (index) => {
    if (fields.length === 1) {
      remove(0);
      append({ ...EMPTY_ITEM });
    } else {
      remove(index);
    }
  };

  if (loadingMeta || loadingOrder) {
    return (
      <PageWrapper title={isEdit ? 'Edit Purchase Order' : 'Create Purchase Order'}>
        <FormSkeleton />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title={isEdit ? `Edit ${watchItems?.[0]?.productId ? 'Order' : 'Order'}` : 'Create Purchase Order'}
      subtitle={isEdit ? 'Update procurement order' : 'Create a new procurement order'}
      actions={
        <Button variant="secondary" leftIcon={<MdArrowBack />} onClick={() => navigate('/purchase-orders')}>
          Back
        </Button>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-surface-600 dark:text-surface-300 mb-4">Order Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Supplier *</label>
              <select {...register('supplierId', { required: 'Supplier is required' })} className={selectClass}>
                <option value="">Select supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {errors.supplierId && <p className={errorClass}>{errors.supplierId.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Warehouse *</label>
              <select {...register('warehouseId', { required: 'Warehouse is required' })} className={selectClass}>
                <option value="">Select warehouse</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
              {errors.warehouseId && <p className={errorClass}>{errors.warehouseId.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Expected Delivery</label>
              <input type="date" {...register('expectedDeliveryDate')} className={fieldClass} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-surface-600 dark:text-surface-300">Line Items</h3>
            <Button type="button" variant="secondary" size="sm" leftIcon={<MdAdd />}
              onClick={() => append({ ...EMPTY_ITEM })}>
              Add Product
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-8">#</th>
                  <th>Product *</th>
                  <th className="text-right w-24">Qty *</th>
                  <th className="text-right w-32">Unit Price *</th>
                  <th className="text-right w-24">Tax %</th>
                  <th className="text-right w-32">Discount</th>
                  <th className="text-right w-36">Line Total</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => {
                  const totals = itemTotals[index] || { base: 0, tax: 0, total: 0 };
                  return (
                    <tr key={field.id} className="border-b border-surface-100 dark:border-surface-800">
                      <td className="px-3 py-2 text-sm text-surface-400">{index + 1}</td>
                      <td className="px-3 py-2">
                        <select {...register(`items.${index}.productId`, { required: 'Product is required' })} className={selectClass}>
                          <option value="">Select product</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                        </select>
                        {errors.items?.[index]?.productId && (
                          <p className={errorClass}>{errors.items[index].productId.message}</p>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" min="1" {...register(`items.${index}.orderedQuantity`, { required: true, min: 1 })} className={`${fieldClass} text-right`} />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" step="0.01" min="0.01" {...register(`items.${index}.unitPrice`, { required: true, min: 0.01 })} className={`${fieldClass} text-right`} />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" step="0.01" min="0" max="100" {...register(`items.${index}.taxRate`)} className={`${fieldClass} text-right`} />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" step="0.01" min="0" {...register(`items.${index}.discountAmount`)} className={`${fieldClass} text-right`} />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className="text-sm font-semibold text-surface-800 dark:text-surface-100">
                          {formatCurrency(totals.total)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Button type="button" variant="ghost" size="xs" className="text-danger-500"
                          onClick={() => handleRemoveItem(index)}>
                          <MdDelete size={16} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {fields.length === 0 && (
            <div className="py-8 text-center text-sm text-surface-400">
              No items added. Click "Add Product" to begin.
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-sm font-semibold text-surface-600 dark:text-surface-300 mb-4">Notes & Terms</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Payment Terms</label>
                <input type="text" {...register('paymentTerms')} placeholder="e.g., Net 30 days" className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Shipping Address</label>
                <textarea {...register('shippingAddress')} rows={2} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Notes</label>
                <textarea {...register('notes')} rows={2} className={fieldClass} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-surface-600 dark:text-surface-300 mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Subtotal ({fields.length} item{fields.length !== 1 ? 's' : ''})</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div>
                <label className={labelClass}>Tax Amount</label>
                <input type="number" step="0.01" min="0" {...register('taxAmount')} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Shipping Cost</label>
                <input type="number" step="0.01" min="0" {...register('shippingCost')} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Discount</label>
                <input type="number" step="0.01" min="0" {...register('discountAmount')} className={fieldClass} />
              </div>
              <div className="border-t border-surface-200 dark:border-surface-700 pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Grand Total</span>
                  <span className="font-bold text-lg">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/purchase-orders')}>Cancel</Button>
          <Button type="submit" variant="primary" leftIcon={<MdSave />} loading={submitting}>
            {isEdit ? 'Update Order' : 'Create Order'}
          </Button>
        </div>
      </form>
    </PageWrapper>
  );
};

export default CreatePurchaseOrder;
