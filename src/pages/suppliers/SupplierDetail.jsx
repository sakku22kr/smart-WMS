import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdArrowBack, MdEdit, MdDelete, MdLocalShipping, MdEmail, MdPhone, MdLanguage, MdBusiness, MdCreditCard, MdPlace, MdNotes, MdCheckCircle, MdBlock, MdInventory2, MdShoppingCart } from 'react-icons/md';
import toast from 'react-hot-toast';
import PageWrapper from '@components/layout/PageWrapper';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import ConfirmDialog from '@components/common/ConfirmDialog';
import SupplierRating from '@components/suppliers/SupplierRating';
import SupplierPerformance from '@components/suppliers/SupplierPerformance';
import SupplierTimeline from '@components/suppliers/SupplierTimeline';
import SupplierDocuments from '@components/suppliers/SupplierDocuments';
import SupplierNotes from '@components/suppliers/SupplierNotes';
import SupplierContacts from '@components/suppliers/SupplierContacts';
import supplierService from '@api/services/supplierService';

const STATUS_BADGE = { ACTIVE: 'success', INACTIVE: 'warning', BLACKLISTED: 'danger' };
const STATUS_LABEL = { ACTIVE: 'Active', INACTIVE: 'Inactive', BLACKLISTED: 'Blacklisted' };

const DetailSkeleton = () => (
  <PageWrapper>
    <div className="page-container max-w-5xl">
      <div className="page-header">
        <div className="space-y-3">
          <div className="h-5 w-24 bg-surface-200 dark:bg-surface-700 rounded skeleton-shimmer" />
          <div className="h-8 w-64 bg-surface-200 dark:bg-surface-700 rounded skeleton-shimmer" />
        </div>
        <div className="flex gap-2">
          {[1, 2].map((i) => (
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
        </div>
      </div>
    </div>
  </PageWrapper>
);

const InfoRow = ({ label, value, mono = false }) => (
  <div className="flex items-center justify-between py-2 border-b border-surface-100 dark:border-surface-700/50 last:border-0">
    <span className="text-xs text-surface-400 uppercase tracking-wide">{label}</span>
    <span className={`text-sm font-medium text-surface-800 dark:text-surface-100 ${mono ? 'font-mono' : ''}`}>
      {value ?? '\u2014'}
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

const SupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Products state
  const [products, setProducts] = useState([]);
  const [productsTotal, setProductsTotal] = useState(0);
  const [productsLoading, setProductsLoading] = useState(false);

  // Purchase Orders state
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [poTotal, setPoTotal] = useState(0);
  const [poLoading, setPoLoading] = useState(false);

  const fetchSupplier = useCallback(async () => {
    setLoading(true);
    try {
      const res = await supplierService.getById(id);
      setSupplier(res?.data);
    } catch {
      toast.error('Failed to load supplier');
      navigate('/suppliers');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const res = await supplierService.getProductsBySupplier(id, { page: 0, size: 10 });
      const payload = res?.data;
      setProducts(payload?.content ?? []);
      setProductsTotal(payload?.totalElements ?? 0);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setProductsLoading(false);
    }
  }, [id]);

  const fetchPurchaseOrders = useCallback(async () => {
    setPoLoading(true);
    try {
      const res = await supplierService.getPurchaseOrdersBySupplier(id, { page: 0, size: 10 });
      const payload = res?.data;
      setPurchaseOrders(payload?.content ?? []);
      setPoTotal(payload?.totalElements ?? 0);
    } catch {
      toast.error('Failed to load purchase orders');
    } finally {
      setPoLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchSupplier(); }, [fetchSupplier]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { fetchPurchaseOrders(); }, [fetchPurchaseOrders]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await supplierService.delete(id);
      toast.success('Supplier deleted');
      navigate('/suppliers');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleStatusToggle = async () => {
    try {
      if (supplier.status === 'ACTIVE') {
        await supplierService.deactivate(id);
        toast.success('Supplier deactivated');
      } else {
        await supplierService.activate(id);
        toast.success('Supplier activated');
      }
      fetchSupplier();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) return <DetailSkeleton />;
  if (!supplier) return null;

  return (
    <PageWrapper>
      <div className="page-container max-w-5xl">
        {/* Header */}
        <div className="page-header">
          <div>
            <button onClick={() => navigate('/suppliers')} className="flex items-center gap-1 text-xs text-surface-400 hover:text-primary-500 transition-colors mb-1">
              <MdArrowBack size={14} /> Back to Suppliers
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
                <MdLocalShipping size={24} className="text-primary-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50">{supplier.name}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-mono text-surface-400">{supplier.code}</span>
                  <Badge variant={STATUS_BADGE[supplier.status] || 'info'} dot>{STATUS_LABEL[supplier.status] || supplier.status}</Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {supplier.status === 'ACTIVE' ? (
              <Button variant="warning" size="sm" leftIcon={<MdBlock />} onClick={handleStatusToggle}>Deactivate</Button>
            ) : (
              <Button variant="success" size="sm" leftIcon={<MdCheckCircle />} onClick={handleStatusToggle}>Activate</Button>
            )}
            <Button variant="secondary" size="sm" leftIcon={<MdEdit />} onClick={() => navigate(`/suppliers/${id}/edit`)}>Edit</Button>
            <Button variant="danger" size="sm" leftIcon={<MdDelete />} onClick={() => setConfirmDelete(true)}>Delete</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <SectionCard icon={MdLocalShipping} title="Basic Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                <InfoRow label="Name" value={supplier.name} />
                <InfoRow label="Code" value={supplier.code} mono />
                <InfoRow label="Company" value={supplier.companyName} />
                <InfoRow label="Contact Person" value={supplier.contactPerson} />
                <div className="sm:col-span-2">
                  <span className="text-xs text-surface-400 uppercase tracking-wide">Rating</span>
                  <div className="mt-1">
                    <SupplierRating supplierId={supplier.id} rating={supplier.rating} onRatingUpdated={(val) => setSupplier(prev => ({ ...prev, rating: val }))} />
                  </div>
                </div>
                <InfoRow label="Created By" value={supplier.createdBy} />
              </div>
            </SectionCard>

            <SectionCard icon={MdPlace} title="Address">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                <div className="sm:col-span-2">
                  <InfoRow label="Address" value={supplier.address} />
                </div>
                <InfoRow label="City" value={supplier.city} />
                <InfoRow label="State" value={supplier.state} />
                <InfoRow label="Country" value={supplier.country} />
                <InfoRow label="Postal Code" value={supplier.pinCode} mono />
              </div>
            </SectionCard>

            {supplier.notes && (
              <SectionCard icon={MdNotes} title="Notes">
                <p className="text-sm text-surface-600 dark:text-surface-300 whitespace-pre-wrap">{supplier.notes}</p>
              </SectionCard>
            )}

            {/* Products Section */}
            <SectionCard icon={MdInventory2} title={`Products (${productsTotal})`}>
              {productsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-10 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <p className="text-sm text-surface-400 dark:text-surface-500">No products assigned to this supplier.</p>
              ) : (
                <div className="space-y-2">
                  {products.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-surface-50 dark:bg-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors cursor-pointer" onClick={() => navigate(`/products/${p.id}`)}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                          <MdInventory2 size={14} className="text-primary-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-surface-800 dark:text-surface-100">{p.name}</p>
                          <p className="text-xs text-surface-400 font-mono">{p.sku}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={p.stockStatus === 'OUT_OF_STOCK' ? 'danger' : p.stockStatus === 'LOW_STOCK' ? 'warning' : 'success'} dot>
                          {p.currentStock} {p.unit}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {productsTotal > 10 && (
                    <button onClick={() => navigate('/products')} className="text-xs text-primary-500 hover:text-primary-600 mt-2">
                      View all {productsTotal} products →
                    </button>
                  )}
                </div>
              )}
            </SectionCard>

            {/* Purchase Orders Section */}
            <SectionCard icon={MdShoppingCart} title={`Purchase Orders (${poTotal})`}>
              {poLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-10 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
                  ))}
                </div>
              ) : purchaseOrders.length === 0 ? (
                <p className="text-sm text-surface-400 dark:text-surface-500">No purchase orders for this supplier.</p>
              ) : (
                <div className="space-y-2">
                  {purchaseOrders.map((po) => (
                    <div key={po.id} className="flex items-center justify-between p-2 rounded-lg bg-surface-50 dark:bg-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors cursor-pointer" onClick={() => navigate(`/purchase-orders/${po.id}`)}>
                      <div>
                        <p className="text-sm font-medium text-surface-800 dark:text-surface-100">{po.orderNumber}</p>
                        <p className="text-xs text-surface-400">{po.orderDate}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-surface-700 dark:text-surface-200">₹{(po.totalAmount || 0).toLocaleString()}</span>
                        <Badge variant={po.status === 'COMPLETED' ? 'success' : po.status === 'CANCELLED' ? 'danger' : po.status === 'PENDING' ? 'warning' : 'info'}>
                          {po.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {poTotal > 10 && (
                    <button onClick={() => navigate('/purchase-orders')} className="text-xs text-primary-500 hover:text-primary-600 mt-2">
                      View all {poTotal} purchase orders →
                    </button>
                  )}
                </div>
              )}
            </SectionCard>

            {/* Performance Analytics */}
            <SupplierPerformance supplierId={id} />

            {/* Documents */}
            <SupplierDocuments supplierId={id} />

            {/* Notes */}
            <SupplierNotes supplierId={id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SectionCard icon={MdEmail} title="Contact">
              <div className="space-y-2">
                {supplier.email && (
                  <a href={`mailto:${supplier.email}`} className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300 hover:text-primary-500 transition-colors">
                    <MdEmail size={14} /> {supplier.email}
                  </a>
                )}
                {supplier.phone && (
                  <p className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300">
                    <MdPhone size={14} /> {supplier.phone}
                  </p>
                )}
                {supplier.alternatePhone && (
                  <p className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
                    <MdPhone size={14} /> {supplier.alternatePhone} (alt)
                  </p>
                )}
                {supplier.website && (
                  <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300 hover:text-primary-500 transition-colors">
                    <MdLanguage size={14} /> {supplier.website}
                  </a>
                )}
              </div>
            </SectionCard>

            <SectionCard icon={MdBusiness} title="Tax Information">
              <div className="space-y-1">
                <InfoRow label="GSTIN" value={supplier.gstin} mono />
                <InfoRow label="PAN" value={supplier.panNumber} mono />
              </div>
            </SectionCard>

            <SectionCard icon={MdCreditCard} title="Banking">
              <div className="space-y-1">
                <InfoRow label="Bank" value={supplier.bankName} />
                <InfoRow label="Account" value={supplier.bankAccountNumber} mono />
                <InfoRow label="IFSC" value={supplier.bankIfsc} mono />
                <InfoRow label="Credit Limit" value={supplier.creditLimit ? `\u20B9${supplier.creditLimit.toLocaleString()}` : 'None'} />
                <InfoRow label="Payment Terms" value={supplier.paymentTermDays ? `${supplier.paymentTermDays} days` : 'None'} />
              </div>
            </SectionCard>

            <Card padding="md">
              <div className="space-y-1">
                <InfoRow label="Created" value={supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString() : '—'} />
                <InfoRow label="Last Updated" value={supplier.updatedAt ? new Date(supplier.updatedAt).toLocaleDateString() : '—'} />
              </div>
            </Card>

            {/* Contacts */}
            <SupplierContacts supplierId={id} />

            {/* Activity Timeline */}
            <SupplierTimeline supplierId={id} />
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Supplier"
        message={`Are you sure you want to delete "${supplier.name}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleting}
        variant="danger"
      />
    </PageWrapper>
  );
};

export default SupplierDetail;
