import Modal from '@components/ui/Modal';
import Button from '@components/ui/Button';
import { MdWarning } from 'react-icons/md';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            loading={loading}
            leftIcon={<MdWarning />}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center py-2">
        <div className="w-12 h-12 rounded-full bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center mb-4">
          <MdWarning size={24} className="text-danger-500" />
        </div>
        <h3 className="text-base font-semibold text-surface-900 dark:text-surface-50 mb-1">
          {title}
        </h3>
        <p className="text-sm text-surface-500 dark:text-surface-400 max-w-xs">
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
