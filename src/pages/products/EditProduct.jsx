import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { MdSave, MdArrowBack } from 'react-icons/md';
import toast from 'react-hot-toast';
import PageWrapper from '@components/layout/PageWrapper';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import ProductFormFields from '@components/products/ProductFormFields';
import useProducts from '@hooks/useProducts';
import categoryService from '@api/services/categoryService';
import supplierService from '@api/services/supplierService';
import warehouseService from '@api/services/warehouseService';
import productService from '@api/services/productService';

const FormSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {[1, 2, 3, 4].map((s) => (
      <div key={s}>
        <div className="h-4 w-32 bg-surface-200 dark:bg-surface-700 rounded mb-3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: s === 1 ? 6 : 3 }).map((_, i) => (
            <div key={i} className={s === 1 && i === 0 ? 'md:col-span-3' : ''}>
              <div className="h-3 w-20 bg-surface-200 dark:bg-surface-700 rounded mb-1.5" />
              <div className="h-10 bg-surface-200 dark:bg-surface-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { updateProduct } = useProducts();
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const methods = useForm({
    defaultValues: {
      name: '', sku: '', barcode: '', description: '', brand: '', model: '',
      unit: 'PCS', purchasePrice: '', sellingPrice: '', taxRate: 0,
      reorderLevel: 0, reorderQuantity: 0, imageUrl: '', status: 'ACTIVE',
      categoryId: '', supplierId: '', warehouseId: '', notes: '',
    },
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, supRes, warRes, prodRes] = await Promise.all([
          categoryService.getAll({ page: 0, size: 500, sort: 'name', direction: 'asc' }),
          supplierService.getAll({ page: 0, size: 500, sort: 'name', direction: 'asc' }),
          warehouseService.getAll({ page: 0, size: 500, sort: 'name', direction: 'asc' }),
          productService.getById(id),
        ]);
        setCategories(catRes?.data?.content ?? []);
        setSuppliers(supRes?.data?.content ?? []);
        setWarehouses(warRes?.data?.content ?? []);
        const p = prodRes?.data;
        if (p) {
          methods.reset({
            name: p.name || '', sku: p.sku || '', barcode: p.barcode || '',
            description: p.description || '', brand: p.brand || '', model: p.model || '',
            unit: p.unit || 'PCS', purchasePrice: p.purchasePrice || '',
            sellingPrice: p.sellingPrice || '', taxRate: p.taxRate || 0,
            reorderLevel: p.reorderLevel || 0, reorderQuantity: p.reorderQuantity || 0,
            imageUrl: p.imageUrl || '', status: p.status || 'ACTIVE',
            categoryId: p.categoryId || '', supplierId: p.supplierId || '',
            warehouseId: p.warehouseId || '', notes: p.notes || '',
          });
        }
      } catch {
        toast.error('Failed to load product');
        navigate('/products');
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        purchasePrice: parseFloat(data.purchasePrice) || 0,
        sellingPrice: parseFloat(data.sellingPrice) || 0,
        taxRate: parseFloat(data.taxRate) || 0,
        reorderLevel: parseInt(data.reorderLevel, 10) || 0,
        reorderQuantity: parseInt(data.reorderQuantity, 10) || 0,
        categoryId: data.categoryId ? parseInt(data.categoryId, 10) : null,
        supplierId: data.supplierId ? parseInt(data.supplierId, 10) : null,
        warehouseId: data.warehouseId ? parseInt(data.warehouseId, 10) : null,
      };
      await updateProduct(id, payload);
      toast.success('Product updated successfully');
      navigate('/products');
    } catch (err) {
      const fieldErrors = err?.response?.data?.data;
      if (fieldErrors && typeof fieldErrors === 'object') {
        Object.entries(fieldErrors).forEach(([field, msg]) => {
          methods.setError(field, { type: 'server', message: msg });
        });
        toast.error('Please fix the errors below');
      } else {
        toast.error(err?.response?.data?.message || 'Failed to update product');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="page-container max-w-4xl">
        <div className="page-header">
          <div>
            <h1 className="page-title">Edit Product</h1>
            <p className="page-subtitle">Update product details</p>
          </div>
        </div>

        {fetching ? (
          <Card>
            <FormSkeleton />
          </Card>
        ) : (
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <Card>
                <ProductFormFields categories={categories} suppliers={suppliers} warehouses={warehouses} excludeId={parseInt(id, 10)} />
              </Card>

              <div className="flex items-center justify-end gap-3 mt-6">
                <Button variant="secondary" leftIcon={<MdArrowBack />} onClick={() => navigate('/products')} type="button" disabled={loading}>
                  Cancel
                </Button>
                <Button variant="primary" leftIcon={<MdSave />} type="submit" isLoading={loading}>
                  Update Product
                </Button>
              </div>
            </form>
          </FormProvider>
        )}
      </div>
    </PageWrapper>
  );
};

export default EditProduct;
