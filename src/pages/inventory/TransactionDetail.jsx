import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  MdArrowBack, MdEdit, MdDelete,
  MdInput, MdOutput, MdTune, MdSwapVert,
  MdLock, MdLockOpen, MdLocalShipping, MdAssignmentReturn,
  MdReportProblem, MdEventBusy, MdPerson,
  MdReceipt, MdInfo, MdWarehouse,
} from 'react-icons/md';
import toast from 'react-hot-toast';
import PageWrapper from '@components/layout/PageWrapper';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import ConfirmDialog from '@components/common/ConfirmDialog';
import inventoryService from '@api/services/inventoryService';

const TYPE_CONFIG = {
  STOCK_IN:      { icon: MdInput,          color: 'text-success-500',   bg: 'bg-success-500/10',   badge: 'success', label: 'Stock In' },
  STOCK_OUT:     { icon: MdOutput,         color: 'text-danger-500',    bg: 'bg-danger-500/10',    badge: 'danger',  label: 'Stock Out' },
  ADJUSTMENT:    { icon: MdTune,           color: 'text-info-500',      bg: 'bg-info-500/10',      badge: 'info',    label: 'Adjustment' },
  TRANSFER:      { icon: MdSwapVert,       color: 'text-primary-500',   bg: 'bg-primary-500/10',   badge: 'primary', label: 'Transfer' },
  RESERVED:      { icon: MdLock,           color: 'text-warning-500',   bg: 'bg-warning-500/10',   badge: 'warning', label: 'Reserved' },
  RELEASED:      { icon: MdLockOpen,       color: 'text-surface-500',   bg: 'bg-surface-500/10',   badge: 'surface', label: 'Released' },
  DISPATCHED:    { icon: MdLocalShipping,  color: 'text-purple-500',    bg: 'bg-purple-500/10',    badge: 'primary', label: 'Dispatched' },
  RETURNED:      { icon: MdAssignmentReturn,color: 'text-teal-500',     bg: 'bg-teal-500/10',      badge: 'info',    label: 'Returned' },
  DAMAGED:       { icon: MdReportProblem,  color: 'text-danger-500',    bg: 'bg-danger-500/10',    badge: 'danger',  label: 'Damaged' },
  EXPIRED:       { icon: MdEventBusy,      color: 'text-orange-500',    bg: 'bg-orange-500/10',    badge: 'warning', label: 'Expired' },
};

const DetailSkeleton = () => (
  <PageWrapper>
    <div className="page-container max-w-4xl">
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
        <div className="lg:col-span-2 h-80 bg-surface-200 dark:bg-surface-700 rounded-2xl skeleton-shimmer" />
        <div className="space-y-6">
          <div className="h-48 bg-surface-200 dark:bg-surface-700 rounded-2xl skeleton-shimmer" />
          <div className="h-40 bg-surface-200 dark:bg-surface-700 rounded-2xl skeleton-shimmer" />
        </div>
      </div>
    </div>
  </PageWrapper>
);

const InfoRow = ({ label, value, icon: Icon, mono = false, color }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-surface-100 dark:border-surface-700/50 last:border-0">
    <span className="flex items-center gap-2 text-xs text-surface-400 uppercase tracking-wide">
      {Icon && <Icon size={12} />}
      {label}
    </span>
    <span className={`text-sm font-medium text-surface-800 dark:text-surface-100 ${mono ? 'font-mono' : ''} ${color || ''}`}>
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

const StockFlow = ({ before, after }) => {
  const isIncrease = after > before;
  const diff = Math.abs(after - before);
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
      <div className="text-center">
        <p className="text-xs text-surface-400 mb-1">Before</p>
        <p className="text-2xl font-bold text-surface-600 dark:text-surface-300">{before ?? '—'}</p>
      </div>
      <div className={`flex-1 flex items-center justify-center gap-2 ${isIncrease ? 'text-success-500' : 'text-danger-500'}`}>
        <div className="h-px flex-1 bg-surface-300 dark:bg-surface-600" />
        <div className={`px-3 py-1.5 rounded-lg ${isIncrease ? 'bg-success-500/10' : 'bg-danger-500/10'}`}>
          <span className="text-sm font-bold">{isIncrease ? '+' : '-'}{diff.toLocaleString()}</span>
        </div>
        <div className="h-px flex-1 bg-surface-300 dark:bg-surface-600" />
      </div>
      <div className="text-center">
        <p className="text-xs text-surface-400 mb-1">After</p>
        <p className="text-2xl font-bold text-surface-800 dark:text-surface-100">{after ?? '—'}</p>
      </div>
    </div>
  );
};

const TransactionDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [txn, setTxn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const abortRef = useRef(null);

  const fetchTxn = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    inventoryService.getById(id)
      .then((res) => { if (!controller.signal.aborted) setTxn(res?.data); })
      .catch(() => { if (!controller.signal.aborted) { toast.error('Failed to load transaction'); navigate('/inventory'); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, navigate]);

  useEffect(() => {
    const cleanup = fetchTxn();
    return cleanup;
  }, [fetchTxn]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await inventoryService.delete(id);
      toast.success('Transaction deleted');
      navigate('/inventory');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete transaction');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) return <DetailSkeleton />;
  if (!txn) return null;

  const cfg = TYPE_CONFIG[txn.transactionType] || TYPE_CONFIG.STOCK_IN;
  const Icon = cfg.icon;

  return (
    <PageWrapper>
      <div className="page-container max-w-4xl">
        {/* Header */}
        <div className="page-header">
          <div>
            <Link to="/inventory" className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1 mb-1">
              <MdArrowBack size={12} /> Inventory
            </Link>
            <h1 className="page-title">Transaction #{txn.id}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={cfg.badge} dot>{cfg.label}</Badge>
              <span className="text-xs font-mono text-surface-400">{txn.referenceNumber || 'No reference'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="secondary" leftIcon={<MdArrowBack />} onClick={() => navigate('/inventory')}>Back</Button>
            <Button variant="primary" leftIcon={<MdEdit />} onClick={() => navigate(`/inventory/${id}/edit`)}>Edit</Button>
            <Button variant="danger" leftIcon={<MdDelete />} onClick={() => setDeleteOpen(true)}>Delete</Button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stock Flow */}
            <Card padding="md">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                  <Icon size={24} className={cfg.color} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-surface-900 dark:text-surface-50">{cfg.label}</h2>
                  <p className="text-xs text-surface-400">{formatDate(txn.transactionDate)}</p>
                </div>
              </div>
              <StockFlow before={txn.quantityBefore} after={txn.quantityAfter} type={txn.transactionType} />
              {txn.reason && (
                <div className="mt-4 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                  <p className="text-xs text-surface-400 mb-1">Reason</p>
                  <p className="text-sm text-surface-700 dark:text-surface-200">{txn.reason}</p>
                </div>
              )}
            </Card>

            {/* Product & Warehouse */}
            <SectionCard icon={MdInfo} title="Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 text-center">
                  <p className="text-xs text-surface-400 mb-1">Product</p>
                  <p className="text-sm font-semibold text-surface-800 dark:text-surface-100">{txn.productName || '—'}</p>
                </div>
                <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 text-center">
                  <p className="text-xs text-surface-400 mb-1">Warehouse</p>
                  <p className="text-sm font-semibold text-surface-800 dark:text-surface-100">{txn.warehouseName || '—'}</p>
                </div>
                <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 text-center">
                  <p className="text-xs text-surface-400 mb-1">Quantity</p>
                  <p className={`text-lg font-bold ${txn.transactionType === 'STOCK_OUT' || txn.transactionType === 'DISPATCHED' || txn.transactionType === 'DAMAGED' || txn.transactionType === 'EXPIRED' ? 'text-danger-500' : 'text-success-500'}`}>
                    {txn.transactionType === 'STOCK_OUT' || txn.transactionType === 'DISPATCHED' || txn.transactionType === 'DAMAGED' || txn.transactionType === 'EXPIRED' ? '-' : '+'}{txn.quantity?.toLocaleString()}
                  </p>
                </div>
                {txn.unitCost && (
                  <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 text-center">
                    <p className="text-xs text-surface-400 mb-1">Unit Cost</p>
                    <p className="text-sm font-semibold text-surface-800 dark:text-surface-100">₹{txn.unitCost?.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>

          {/* Right column — 1/3 */}
          <div className="space-y-6">
            <SectionCard icon={MdReceipt} title="Reference">
              <div className="space-y-1">
                <InfoRow label="Reference #" value={txn.referenceNumber} mono />
                <InfoRow label="Batch #" value={txn.batchNumber} mono />
                {txn.totalValue && <InfoRow label="Total Value" value={`₹${txn.totalValue.toLocaleString()}`} color="text-primary-600 dark:text-primary-400" />}
              </div>
            </SectionCard>

            <SectionCard icon={MdPerson} title="Audit">
              <div className="space-y-1">
                <InfoRow label="Performed By" value={txn.performedBy} />
                <InfoRow label="Created" value={formatDate(txn.createdAt)} />
                {txn.updatedAt && <InfoRow label="Updated" value={formatDate(txn.updatedAt)} />}
              </div>
            </SectionCard>

            {txn.destinationWarehouseId && (
              <SectionCard icon={MdWarehouse} title="Transfer">
                <InfoRow label="Destination WH ID" value={txn.destinationWarehouseId} />
              </SectionCard>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this inventory transaction? This action can be reversed by restoring."
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleting}
      />
    </PageWrapper>
  );
};

export default TransactionDetail;
