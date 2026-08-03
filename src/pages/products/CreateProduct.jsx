import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const CreateProduct = () => {
  const navigate = useNavigate();
  const { createProduct } = useProducts();
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [serverErrors, setServerErrors] = useState({});

  const methods = useForm({
    defaultValues: {
      name: '', sku: '', barcode: '', description: '', brand: '', model: '',
      unit: 'PCS', purchasePrice: '', sellingPrice: '', taxRate: 0,
      reorderLevel: 0, reorderQuantity: 0, imageUrl: '', status: 'ACTIVE',
      categoryId: '', supplierId: '', warehouseId: '', notes: '',
    },
  });

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [catRes, supRes, warRes] = await Promise.all([
          categoryService.getAll({ page: 0, size: 500, sort: 'name', direction: 'asc' }),
          supplierService.getAll({ page: 0, size: 500, sort: 'name', direction: 'asc' }),
          warehouseService.getAll({ page: 0, size: 500, sort: 'name', direction: 'asc' }),
        ]);
        setCategories(catRes?.data?.content ?? []);
        setSuppliers(supRes?.data?.content ?? []);
        setWarehouses(warRes?.data?.content ?? []);
      } catch {
        toast.error('Failed to load form data');
      } finally {
        setLoadingMeta(false);
      }
    };
    loadMeta();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    setServerErrors({});
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
      await createProduct(payload);
      toast.success('Product created successfully');
      navigate('/products');
    } catch (err) {
      const fieldErrors = err?.response?.data?.data;
      if (fieldErrors && typeof fieldErrors === 'object') {
        setServerErrors(fieldErrors);
        Object.entries(fieldErrors).forEach(([field, msg]) => {
          methods.setError(field, { type: 'server', message: msg });
        });
        toast.error('Please fix the errors below');
      } else {
        toast.error(err?.response?.data?.message || 'Failed to create product');
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
            <h1 className="page-title">Create Product</h1>
            <p className="page-subtitle">Add a new product to the catalog</p>
          </div>
        </div>

        {loadingMeta ? (
          <Card>
            <FormSkeleton />
          </Card>
        ) : (
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <Card>
                <ProductFormFields categories={categories} suppliers={suppliers} warehouses={warehouses} />
              </Card>

              <div className="flex items-center justify-end gap-3 mt-6">
                <Button variant="secondary" leftIcon={<MdArrowBack />} onClick={() => navigate('/products')} type="button" disabled={loading}>
                  Cancel
                </Button>
                <Button variant="primary" leftIcon={<MdSave />} type="submit" isLoading={loading}>
                  Create Product
                </Button>
              </div>
            </form>
          </FormProvider>
        )}
      </div>
    </PageWrapper>
  );
};

export default CreateProduct;
