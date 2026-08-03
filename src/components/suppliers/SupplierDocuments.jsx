import { useState, useEffect, useCallback } from 'react';
import { MdAttachFile, MdCloudUpload, MdDelete, MdDownload, MdInsertDriveFile, MdDescription, MdReceipt, MdSecurity, MdClose } from 'react-icons/md';
import toast from 'react-hot-toast';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import supplierService from '@api/services/supplierService';

const DOC_TYPE_ICONS = {
  GST_CERTIFICATE: { icon: MdReceipt, color: 'success' },
  PAN_CARD: { icon: MdSecurity, color: 'info' },
  AGREEMENT: { icon: MdDescription, color: 'primary' },
  LICENSE: { icon: MdSecurity, color: 'warning' },
  OTHER: { icon: MdInsertDriveFile, color: 'surface' },
};

const DOC_TYPE_LABELS = {
  GST_CERTIFICATE: 'GST Certificate',
  PAN_CARD: 'PAN Card',
  AGREEMENT: 'Agreement',
  LICENSE: 'License',
  OTHER: 'Other',
};

const formatFileSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const DocumentItem = ({ doc, onDownload, onDelete }) => {
  const iconConfig = DOC_TYPE_ICONS[doc.documentType] || DOC_TYPE_ICONS.OTHER;
  const IconComp = iconConfig.icon;

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-lg bg-${iconConfig.color}-500/10 flex items-center justify-center flex-shrink-0`}>
          <IconComp size={18} className={`text-${iconConfig.color}-500`} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-surface-800 dark:text-surface-100 truncate">{doc.documentName}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="surface" size="sm">{DOC_TYPE_LABELS[doc.documentType] || doc.documentType}</Badge>
            <span className="text-xs text-surface-400">{formatFileSize(doc.fileSize)}</span>
            {doc.expiryDate && (
              <span className="text-xs text-surface-400">Exp: {new Date(doc.expiryDate).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" onClick={() => onDownload(doc)} className="!p-1.5">
          <MdDownload size={14} />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(doc)} className="!p-1.5 text-danger-500 hover:text-danger-600">
          <MdDelete size={14} />
        </Button>
      </div>
    </div>
  );
};

const UploadModal = ({ open, onClose, onUpload }) => {
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState('OTHER');
  const [description, setDescription] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !documentName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentName', documentName.trim());
      formData.append('documentType', documentType);
      if (description) formData.append('description', description);
      if (expiryDate) formData.append('expiryDate', expiryDate);
      await onUpload(formData);
      setDocumentName('');
      setDocumentType('OTHER');
      setDescription('');
      setExpiryDate('');
      setFile(null);
      onClose();
    } catch {
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-white dark:bg-surface-800 rounded-2xl shadow-xl border border-surface-200 dark:border-surface-700 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50">Upload Document</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
            <MdClose size={20} className="text-surface-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-surface-400 uppercase tracking-wide mb-1">Document Name *</label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., GST Certificate"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-surface-400 uppercase tracking-wide mb-1">Document Type</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="GST_CERTIFICATE">GST Certificate</option>
              <option value="PAN_CARD">PAN Card</option>
              <option value="AGREEMENT">Agreement</option>
              <option value="LICENSE">License</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-surface-400 uppercase tracking-wide mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="block text-xs text-surface-400 uppercase tracking-wide mb-1">Expiry Date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs text-surface-400 uppercase tracking-wide mb-1">File *</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full px-3 py-2 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={onClose} type="button">Cancel</Button>
            <Button variant="primary" size="sm" type="submit" loading={uploading} leftIcon={<MdCloudUpload />}>
              Upload
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SupplierDocuments = ({ supplierId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await supplierService.getDocuments(supplierId);
      setDocuments(res?.data ?? []);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const handleUpload = async (formData) => {
    await supplierService.uploadDocument(supplierId, formData);
    toast.success('Document uploaded');
    fetchDocuments();
  };

  const handleDownload = async (doc) => {
    try {
      const res = await supplierService.downloadDocument(supplierId, doc.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download document');
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete "${doc.documentName}"?`)) return;
    try {
      await supplierService.deleteDocument(supplierId, doc.id);
      toast.success('Document deleted');
      fetchDocuments();
    } catch {
      toast.error('Failed to delete document');
    }
  };

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
            <MdAttachFile size={16} className="text-primary-500" />
          </div>
          <h3 className="text-sm font-semibold text-surface-800 dark:text-surface-100">Documents ({documents.length})</h3>
        </div>
        <Button variant="primary" size="sm" leftIcon={<MdCloudUpload />} onClick={() => setShowUpload(true)}>
          Upload
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 bg-surface-200 dark:bg-surface-700 rounded-xl skeleton-shimmer" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <p className="text-sm text-surface-400 dark:text-surface-500 text-center py-4">No documents uploaded yet.</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <DocumentItem key={doc.id} doc={doc} onDownload={handleDownload} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <UploadModal open={showUpload} onClose={() => setShowUpload(false)} onUpload={handleUpload} />
    </Card>
  );
};

export default SupplierDocuments;
