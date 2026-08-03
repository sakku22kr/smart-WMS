import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MdArrowBack, MdEdit, MdDelete, MdCheckCircle, MdPauseCircle, MdInventory2, MdStore, MdCategory, MdLocalShipping, MdAttachMoney, MdWarning, MdQrCode2, MdBarChart, MdHistory } from 'react-icons/md';
import toast from 'react-hot-toast';
import PageWrapper from '@components/layout/PageWrapper';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import ConfirmDialog from '@components/common/ConfirmDialog';
import AuditTrail from '@components/products/AuditTrail';
import productService from '@api/services/productService';

const STATUS_BADGE = { ACTIVE: 'success', INACTIVE: 'warning', DISCONTINUED: 'danger' };
const STATUS_LABEL = { ACTIVE: 'Active', INACTIVE: 'Inactive', DISCONTINUED: 'Discontinued' };
const STOCK_STATUS_BADGE = { IN_STOCK: 'success', LOW_STOCK: 'warning', OUT_OF_STOCK: 'danger', OVERSTOCKED: 'info' };
const STOCK_STATUS_LABEL = { IN_STOCK: 'In Stock', LOW_STOCK: 'Low Stock', OUT_OF_STOCK: 'Out of Stock', OVERSTOCKED: 'Overstocked' };

const DetailSkeleton = () => (
  <PageWrapper>
    <div className="page-container max-w-6xl">
      <div className="page-header">
        <div className="space-y-3">
          <div className="h-5 w-24 bg-surface-200 dark:bg-surface-700 rounded skeleton-shimmer" />
          <div className="h-8 w-64 bg-surface-200 dark:bg-surface-700 rounded skeleton-shimmer" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-24 bg-surface-200 dark:bg-surface-700 rounded-xl skeleton-shimmer" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-80 bg-surface-200 dark:bg-surface-700 rounded-2xl skeleton-shimmer" />
          <div className="h-48 bg-surface-200 dark:bg-surface-700 rounded-2xl skeleton-shimmer" />
        </div>
        <div className="space-y-6">
          <div className="h-48 bg-surface-200 dark:bg-surface-700 rounded-2xl skeleton-shimmer" />
          <div className="h-40 bg-surface-200 dark:bg-surface-700 rounded-2xl skeleton-shimmer" />
          <div className="h-40 bg-surface-200 dark:bg-surface-700 rounded-2xl skeleton-shimmer" />
        </div>
      </div>
    </div>
  </PageWrapper>
);

const InfoRow = ({ label, value, mono = false }) => (
  <div className="flex items-center justify-between py-2 border-b border-surface-100 dark:border-surface-700/50 last:border-0">
    <span className="text-xs text-surface-400 uppercase tracking-wide">{label}</span>
    <span className={`text-sm font-medium text-surface-800 dark:text-surface-100 ${mono ? 'font-mono' : ''}`}>
      {value ?? '—'}
    </span>
  </div>
);

const SectionCard = ({ icon: Icon, title, children, className = '' }) => (
  <Card padding="md" className={className}>
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-primary-500" />
      </div>
      <h3 className="text-sm font-semibold text-surface-800 dark:text-surface-100">{title}</h3>
    </div>
    {children}
  </Card>
);

const StockBar = ({ current, reserved, max, reorderLevel }) => {
  const pct = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const reorderPct = max > 0 ? Math.min((reorderLevel / max) * 100, 100) : 0;
  return (
    <div className="w-full h-2.5 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden relative">
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          pct < 20 ? 'bg-danger-500' : pct < 50 ? 'bg-warning-500' : 'bg-success-500'
        }`}
        style={{ width: `${pct}%` }}
      />
      {reorderLevel > 0 && (
        <div
          className="absolute top-0 h-full w-0.5 bg-danger-500/70"
          style={{ left: `${reorderPct}%` }}
          title={`Reorder Level: ${reorderLevel}`}
        />
      )}
    </div>
  );
};

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [imgError, setImgError] = useState(false);

  const abortRef = useRef(null);

  const fetchProduct = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    productService.getById(id)
      .then((res) => { if (!controller.signal.aborted) setProduct(res?.data); })
      .catch(() => { if (!controller.signal.aborted) { toast.error('Failed to load product'); navigate('/products'); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, navigate]);

  useEffect(() => {
    const cleanup = fetchProduct();
    return cleanup;
  }, [fetchProduct]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await productService.delete(id);
      toast.success('Product deleted successfully');
      navigate('/products');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!product) return;
    setToggling(true);
    try {
      const res = product.status === 'ACTIVE'
        ? await productService.deactivate(id)
        : await productService.activate(id);
      setProduct(res?.data);
      toast.success(`Product ${product.status === 'ACTIVE' ? 'deactivated' : 'activated'}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setToggling(false);
    }
  };

  if (loading) return <DetailSkeleton />;
  if (!product) return null;

  const margin = product.sellingPrice && product.purchasePrice && product.purchasePrice > 0
    ? ((product.sellingPrice - product.purchasePrice) / product.purchasePrice * 100).toFixed(1)
    : null;
  const stockMax = Math.max(product.reorderLevel * 2 || 100, product.currentStock || 0);

  return (
    <PageWrapper>
      <div className="page-container max-w-6xl">
        {/* Header */}
        <div className="page-header">
          <div>
            <Link to="/products" className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1 mb-1">
              <MdArrowBack size={12} /> Products
            </Link>
            <h1 className="page-title">{product.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={STATUS_BADGE[product.status]} dot>{STATUS_LABEL[product.status]}</Badge>
              {product.sku && <span className="text-xs font-mono text-surface-400">{product.sku}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="secondary" leftIcon={<MdArrowBack />} onClick={() => navigate('/products')}>Back</Button>
            <Button variant="primary" leftIcon={<MdEdit />} onClick={() => navigate(`/products/${id}/edit`)}>Edit</Button>
            <Button
              variant={product.status === 'ACTIVE' ? 'warning' : 'success'}
              leftIcon={product.status === 'ACTIVE' ? <MdPauseCircle /> : <MdCheckCircle />}
              onClick={handleToggleStatus}
              isLoading={toggling}
            >
              {product.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            </Button>
            <Button variant="danger" leftIcon={<MdDelete />} onClick={() => setDeleteOpen(true)}>Delete</Button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Image + Description */}
            <Card padding="md">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-48 h-48 rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-700 flex items-center justify-center flex-shrink-0">
                  {product.imageUrl && !imgError ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <MdInventory2 size={48} className="text-surface-300 dark:text-surface-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-surface-900 dark:text-surface-50 mb-2">{product.name}</h2>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {product.brand && <Badge variant="info">{product.brand}</Badge>}
                    {product.model && <Badge variant="surface">{product.model}</Badge>}
                    {product.unit && <Badge variant="primary">{product.unit}</Badge>}
                  </div>
                  {product.description ? (
                    <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed">{product.description}</p>
                  ) : (
                    <p className="text-sm text-surface-400 italic">No description</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Price Card */}
            <SectionCard icon={MdAttachMoney} title="Pricing">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                  <p className="text-xs text-surface-400 mb-1">Purchase Price</p>
                  <p className="text-lg font-bold text-surface-800 dark:text-surface-100">₹{product.purchasePrice?.toLocaleString()}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                  <p className="text-xs text-surface-400 mb-1">Selling Price</p>
                  <p className="text-lg font-bold text-primary-600 dark:text-primary-400">₹{product.sellingPrice?.toLocaleString()}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                  <p className="text-xs text-surface-400 mb-1">Tax Rate</p>
                  <p className="text-lg font-bold text-surface-800 dark:text-surface-100">{product.taxRate}%</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                  <p className="text-xs text-surface-400 mb-1">Margin</p>
                  <p className={`text-lg font-bold ${margin >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                    {margin !== null ? `${margin}%` : '—'}
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* Stock Levels */}
            <SectionCard icon={MdBarChart} title="Stock Levels">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex justify-between text-xs text-surface-400 mb-1">
                      <span>Current Stock</span>
                      <span className="font-mono">{product.currentStock} / {stockMax}</span>
                    </div>
                    <StockBar current={product.currentStock} max={stockMax} reorderLevel={product.reorderLevel} />
                  </div>
                  {product.stockStatus && (
                    <Badge variant={STOCK_STATUS_BADGE[product.stockStatus]} size="lg">
                      {STOCK_STATUS_LABEL[product.stockStatus]}
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                    <p className="text-xs text-surface-400 mb-1">Available</p>
                    <p className="text-xl font-bold text-surface-800 dark:text-surface-100">{product.availableStock}</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                    <p className="text-xs text-surface-400 mb-1">Reserved</p>
                    <p className="text-xl font-bold text-warning-600 dark:text-warning-400">{product.reservedStock}</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                    <p className="text-xs text-surface-400 mb-1">Reorder Level</p>
                    <p className="text-xl font-bold text-surface-800 dark:text-surface-100">{product.reorderLevel}</p>
                  </div>
                </div>
                {product.lowStock && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-warning-500/10 border border-warning-500/20">
                    <MdWarning size={16} className="text-warning-500 flex-shrink-0" />
                    <span className="text-sm text-warning-700 dark:text-warning-400">
                      Stock below reorder level ({product.reorderLevel}). Reorder {product.reorderQuantity} units.
                    </span>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Barcode / QR */}
            <SectionCard icon={MdQrCode2} title="Identifiers">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow label="SKU" value={product.sku} mono />
                <InfoRow label="Barcode" value={product.barcode || 'Not assigned'} mono />
              </div>
            </SectionCard>

            {/* Full Audit Trail */}
            <AuditTrail productId={id} />
          </div>

          {/* Right column — 1/3 */}
          <div className="space-y-6">
            {/* Category Details */}
            <SectionCard icon={MdCategory} title="Category">
              <div className="space-y-1">
                <InfoRow label="Category" value={product.categoryName || 'Uncategorized'} />
                {product.notes && <InfoRow label="Notes" value={product.notes} />}
              </div>
            </SectionCard>

            {/* Supplier Details */}
            <SectionCard icon={MdLocalShipping} title="Supplier">
              {product.supplierName ? (
                <div className="space-y-1">
                  <InfoRow label="Supplier" value={product.supplierName} />
                  {product.supplierEmail && <InfoRow label="Email" value={product.supplierEmail} />}
                  {product.supplierPhone && <InfoRow label="Phone" value={product.supplierPhone} />}
                </div>
              ) : (
                <p className="text-sm text-surface-400 italic">No supplier assigned</p>
              )}
            </SectionCard>

            {/* Warehouse Details */}
            <SectionCard icon={MdStore} title="Warehouse">
              {product.warehouseName ? (
                <div className="space-y-1">
                  <InfoRow label="Warehouse" value={product.warehouseName} />
                  {product.warehouseLocation && <InfoRow label="Location" value={product.warehouseLocation} />}
                </div>
              ) : (
                <p className="text-sm text-surface-400 italic">No warehouse assigned</p>
              )}
            </SectionCard>

            {/* Reorder Info */}
            <SectionCard icon={MdWarning} title="Reorder Info">
              <div className="space-y-1">
                <InfoRow label="Reorder Level" value={product.reorderLevel} />
                <InfoRow label="Reorder Quantity" value={product.reorderQuantity} />
                <InfoRow label="Unit" value={product.unit} />
              </div>
            </SectionCard>

            {/* Activity Timeline (compact) */}
            <AuditTrail productId={id} compact />
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${product.name}"? This action can be reversed by restoring the product.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleting}
      />
    </PageWrapper>
  );
};

export default ProductDetail;
