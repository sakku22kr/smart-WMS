import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MdArrowBack, MdEdit, MdCheckCircle, MdCancel, MdSend, MdDelete,
  MdLocalShipping, MdInventory, MdPerson, MdCalendarToday,
  MdHistory,
} from 'react-icons/md';
import toast from 'react-hot-toast';
import PageWrapper from '@components/layout/PageWrapper';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import ConfirmDialog from '@components/common/ConfirmDialog';
import StatusTimeline from '@components/purchase-orders/StatusTimeline';
import purchaseOrderService from '@api/services/purchaseOrderService';
import { useAuth } from '@/context/AuthContext';

const STATUS_BADGE = {
  DRAFT: 'surface', PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger',
  ORDERED: 'info', PARTIALLY_RECEIVED: 'warning', RECEIVED: 'success', COMPLETED: 'primary', CANCELLED: 'surface',
};

const STATUS_LABELS = {
  DRAFT: 'Draft', PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected',
  ORDERED: 'Ordered', PARTIALLY_RECEIVED: 'Partial', RECEIVED: 'Received', COMPLETED: 'Completed', CANCELLED: 'Cancelled',
};

const PurchaseOrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { hasAnyRole } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLabel, setActionLabel] = useState('');

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const res = await purchaseOrderService.getById(id);
        setOrder(res?.data);
      } catch {
        toast.error('Failed to load purchase order');
        navigate('/purchase-orders');
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id, navigate]);

  const handleAction = async () => {
    if (!confirmAction) return;
    try {
      await confirmAction(id);
      toast.success(actionLabel);
      const res = await purchaseOrderService.getById(id);
      setOrder(res?.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Action failed');
    } finally {
      setConfirmAction(null);
      setActionLabel('');
    }
  };

  const formatCurrency = (val) => val != null ? `₹${Number(val).toLocaleString('en-IN')}` : '₹0';
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const isManager = hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSE_MANAGER');

  if (loading) {
    return (
      <PageWrapper title="Purchase Order Detail">
        <div className="space-y-6 animate-pulse">
          <div className="h-48 bg-surface-200 dark:bg-surface-700 rounded-xl" />
          <div className="h-64 bg-surface-200 dark:bg-surface-700 rounded-xl" />
        </div>
      </PageWrapper>
    );
  }

  if (!order) return null;

  const canEdit = (order.status === 'DRAFT' || order.status === 'PENDING');
  const canApprove = order.status === 'PENDING' && isManager;
  const canReject = order.status === 'PENDING' && isManager;
  const canReceive = (order.status === 'APPROVED' || order.status === 'ORDERED' || order.status === 'PARTIALLY_RECEIVED');
  const canCancel = (order.status === 'DRAFT' || order.status === 'PENDING' || order.status === 'APPROVED');
  const canDelete = order.status === 'DRAFT';

  return (
    <PageWrapper
      title={order.orderNumber}
      subtitle={`Purchase Order — ${order.supplierName}`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="secondary" leftIcon={<MdArrowBack />} onClick={() => navigate('/purchase-orders')}>Back</Button>
          {canEdit && (
            <Button variant="primary" leftIcon={<MdEdit />} onClick={() => navigate(`/purchase-orders/${id}/edit`)}>Edit</Button>
          )}
          {canApprove && (
            <Button variant="success" leftIcon={<MdCheckCircle />}
              onClick={() => { setConfirmAction(() => purchaseOrderService.approve); setActionLabel('Order approved'); }}>
              Approve
            </Button>
          )}
          {canReject && (
            <Button variant="danger" leftIcon={<MdCancel />}
              onClick={() => { setConfirmAction(() => purchaseOrderService.reject); setActionLabel('Order rejected'); }}>
              Reject
            </Button>
          )}
          {canReceive && (
            <Button variant="primary" leftIcon={<MdSend />}
              onClick={() => { setConfirmAction(() => purchaseOrderService.receive); setActionLabel('Order received'); }}>
              Receive
            </Button>
          )}
          {canCancel && (
            <Button variant="danger" leftIcon={<MdCancel />}
              onClick={() => { setConfirmAction(() => purchaseOrderService.cancel); setActionLabel('Order cancelled'); }}>
              Cancel
            </Button>
          )}
          {canDelete && (
            <Button variant="danger" leftIcon={<MdDelete />}
              onClick={() => { setConfirmAction(() => purchaseOrderService.delete); setActionLabel('Order deleted'); }}>
              Delete
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Status + Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card padding="sm" className="text-center">
            <Badge variant={STATUS_BADGE[order.status] ?? 'surface'} dot>{STATUS_LABELS[order.status] ?? order.status}</Badge>
          </Card>
          <Card padding="sm" className="text-center">
            <p className="text-2xl font-bold text-primary-600">{order.totalItems}</p>
            <p className="text-xs text-surface-500">Items</p>
          </Card>
          <Card padding="sm" className="text-center">
            <p className="text-2xl font-bold text-surface-800 dark:text-surface-100">{formatCurrency(order.totalAmount)}</p>
            <p className="text-xs text-surface-500">Total</p>
          </Card>
          <Card padding="sm" className="text-center">
            <p className="text-2xl font-bold text-info-500">{order.totalReceivedQuantity}/{order.totalQuantity}</p>
            <p className="text-xs text-surface-500">Received</p>
          </Card>
        </div>

        {/* Order Info + Financial Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-surface-600 dark:text-surface-300 mb-4">Order Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MdLocalShipping size={18} className="text-surface-400" />
                <div>
                  <p className="text-xs text-surface-500">Supplier</p>
                  <p className="text-sm font-medium">{order.supplierName} ({order.supplierCode})</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MdInventory size={18} className="text-surface-400" />
                <div>
                  <p className="text-xs text-surface-500">Warehouse</p>
                  <p className="text-sm font-medium">{order.warehouseName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MdCalendarToday size={18} className="text-surface-400" />
                <div>
                  <p className="text-xs text-surface-500">Order Date</p>
                  <p className="text-sm font-medium">{formatDate(order.orderDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MdLocalShipping size={18} className="text-surface-400" />
                <div>
                  <p className="text-xs text-surface-500">Expected Delivery</p>
                  <p className="text-sm font-medium">{formatDate(order.expectedDeliveryDate)}</p>
                </div>
              </div>
              {order.approvedBy && (
                <div className="flex items-center gap-3">
                  <MdPerson size={18} className="text-surface-400" />
                  <div>
                    <p className="text-xs text-surface-500">Approved By</p>
                    <p className="text-sm font-medium">{order.approvedBy} at {formatDate(order.approvedAt)}</p>
                  </div>
                </div>
              )}
              {order.rejectedBy && (
                <div className="flex items-center gap-3">
                  <MdCancel size={18} className="text-surface-400" />
                  <div>
                    <p className="text-xs text-surface-500">Rejected By</p>
                    <p className="text-sm font-medium">{order.rejectedBy} at {formatDate(order.rejectedAt)}</p>
                  </div>
                </div>
              )}
              {order.cancelledBy && (
                <div className="flex items-center gap-3">
                  <MdCancel size={18} className="text-surface-400" />
                  <div>
                    <p className="text-xs text-surface-500">Cancelled By</p>
                    <p className="text-sm font-medium">{order.cancelledBy} at {formatDate(order.cancelledAt)}</p>
                  </div>
                </div>
              )}
              {order.receivedBy && (
                <div className="flex items-center gap-3">
                  <MdPerson size={18} className="text-surface-400" />
                  <div>
                    <p className="text-xs text-surface-500">Received By</p>
                    <p className="text-sm font-medium">{order.receivedBy} at {formatDate(order.receivedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-surface-600 dark:text-surface-300 mb-4">Financial Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Tax</span>
                <span>{formatCurrency(order.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Shipping</span>
                <span>{formatCurrency(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Discount</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
              <div className="border-t border-surface-200 dark:border-surface-700 pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Grand Total</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>
            {order.paymentTerms && (
              <div className="mt-4 p-3 rounded-lg bg-surface-50 dark:bg-surface-800/50">
                <p className="text-xs text-surface-500">Payment Terms</p>
                <p className="text-sm">{order.paymentTerms}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Line Items */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-surface-600 dark:text-surface-300 mb-4">Line Items</h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>SKU</th>
                  <th className="text-center">Ordered</th>
                  <th className="text-center">Received</th>
                  <th className="text-right">Unit Price</th>
                  <th className="text-right">Tax %</th>
                  <th className="text-right">Discount</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((item, idx) => (
                  <tr key={item.id} className="border-b border-surface-100 dark:border-surface-800">
                    <td className="px-4 py-3 text-sm text-surface-400">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium">{item.productName}</td>
                    <td className="px-4 py-3 text-sm text-surface-500 font-mono">{item.productSku}</td>
                    <td className="px-4 py-3 text-center text-sm">{item.orderedQuantity}</td>
                    <td className="px-4 py-3 text-center text-sm">
                      <span className={item.receivedQuantity >= item.orderedQuantity ? 'text-success-500 font-semibold' : ''}>
                        {item.receivedQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-4 py-3 text-right text-sm">{item.taxRate}%</td>
                    <td className="px-4 py-3 text-right text-sm">{item.discountAmount > 0 ? `-${formatCurrency(item.discountAmount)}` : '—'}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold">{formatCurrency(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Notes */}
        {(order.notes || order.internalNotes || order.shippingAddress) && (
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-surface-600 dark:text-surface-300 mb-4">Notes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {order.notes && (
                <div>
                  <p className="text-xs text-surface-500 mb-1">External Notes</p>
                  <p className="text-sm">{order.notes}</p>
                </div>
              )}
              {order.internalNotes && (
                <div>
                  <p className="text-xs text-surface-500 mb-1">Internal Notes</p>
                  <p className="text-sm">{order.internalNotes}</p>
                </div>
              )}
              {order.shippingAddress && (
                <div className="md:col-span-2">
                  <p className="text-xs text-surface-500 mb-1">Shipping Address</p>
                  <p className="text-sm">{order.shippingAddress}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Status Timeline */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MdHistory size={18} className="text-surface-400" />
            <h3 className="text-sm font-semibold text-surface-600 dark:text-surface-300">Status History</h3>
          </div>
          <StatusTimeline history={order.statusHistory || []} />
        </Card>
      </div>

      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => { setConfirmAction(null); setActionLabel(''); }}
        onConfirm={handleAction}
        title={actionLabel}
        message={`Are you sure you want to ${actionLabel.toLowerCase()}?`}
        confirmText={actionLabel.split(' ').pop()}
        variant={actionLabel.includes('delete') || actionLabel.includes('reject') || actionLabel.includes('cancel') ? 'danger' : 'primary'}
      />
    </PageWrapper>
  );
};

export default PurchaseOrderDetail;
