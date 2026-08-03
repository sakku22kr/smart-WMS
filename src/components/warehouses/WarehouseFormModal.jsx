import { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@components/ui/Modal';
import Button from '@components/ui/Button';
import WarehouseFormFields from './WarehouseFormFields';
import warehouseService from '@/api/services/warehouseService';
import useToast from '@hooks/useToast';

const WarehouseFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  warehouse = null,
  loading: _loading = false,
}) => {
  const isEdit = !!warehouse?.id;
  const toast  = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      code: '',
      location: '',
      address: '',
      manager: '',
      contactNumber: '',
      email: '',
      capacity: '',
      currentUtilization: '',
      status: 'ACTIVE',
      description: '',
    },
  });

  // Reset form when modal opens/closes or warehouse changes
  useEffect(() => {
    if (isOpen) {
      if (isEdit && warehouse) {
        reset({
          name:               warehouse.name               || '',
          code:               warehouse.code               || '',
          location:           warehouse.location           || '',
          address:            warehouse.address            || '',
          manager:            warehouse.manager            || '',
          contactNumber:      warehouse.contactNumber      || '',
          email:              warehouse.email              || '',
          capacity:           warehouse.capacity           ?? '',
          currentUtilization: warehouse.currentUtilization ?? '',
          status:             warehouse.status             || 'ACTIVE',
          description:        warehouse.description        || '',
        });
      } else {
        reset({
          name: '', code: '', location: '', address: '',
          manager: '', contactNumber: '', email: '',
          capacity: '', currentUtilization: '', status: 'ACTIVE', description: '',
        });
      }
      clearErrors();
    }
  }, [isOpen, isEdit, warehouse, reset, clearErrors]);

  // Async code uniqueness validation
  const validateCodeUniqueness = useCallback(async (value) => {
    if (!value || value.trim().length < 2) return true;
    try {
      const res = await warehouseService.checkCode(value.trim(), isEdit ? warehouse?.id : null);
      const available = res?.data;
      if (available === false) {
        return 'This warehouse code is already taken';
      }
      return true;
    } catch {
      return true; // If API fails, skip async validation (server will catch it)
    }
  }, [isEdit, warehouse?.id]);

  // Re-register code field with async validation when dependencies change
  useEffect(() => {
    if (isOpen) {
      register('code', {
        required: 'Warehouse code is required',
        minLength: { value: 2, message: 'Code must be at least 2 characters' },
        maxLength: { value: 50, message: 'Code must not exceed 50 characters' },
        pattern: {
          value: /^[A-Z0-9_-]+$/i,
          message: 'Only uppercase letters, digits, hyphens, or underscores',
        },
        validate: validateCodeUniqueness,
      });
    }
  }, [isOpen, register, validateCodeUniqueness]);

  // Capacity validation: utilization <= capacity
  useEffect(() => {
    if (isOpen) {
      register('capacity', {
        required: 'Capacity is required',
        min: { value: 0, message: 'Capacity must be 0 or greater' },
        valueAsNumber: true,
      });
      register('currentUtilization', {
        min: { value: 0, message: 'Utilization must be 0 or greater' },
        valueAsNumber: true,
        validate: (value) => {
          const capacity = watch('capacity');
          if (value && capacity && Number(value) > Number(capacity)) {
            return 'Utilization cannot exceed capacity';
          }
          return true;
        },
      });
    }
  }, [isOpen, register, watch]);

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit({
        name:               data.name.trim(),
        code:               data.code.trim().toUpperCase(),
        location:           data.location?.trim() || null,
        address:            data.address?.trim() || null,
        manager:            data.manager?.trim() || null,
        contactNumber:      data.contactNumber?.trim() || null,
        email:              data.email?.trim() || null,
        capacity:           Number(data.capacity),
        currentUtilization: Number(data.currentUtilization) || 0,
        status:             data.status,
        description:        data.description?.trim() || null,
      });
      onClose();
    } catch (err) {
      const msg    = err?.response?.data?.message || err?.message || 'Operation failed';
      const fields = err?.response?.data?.data;

      if (fields) {
        Object.entries(fields).forEach(([field, message]) => {
          setError(field, { message });
        });
      } else if (msg.toLowerCase().includes('code')) {
        setError('code', { message: msg || 'This warehouse code already exists' });
      } else if (msg.toLowerCase().includes('name')) {
        setError('name', { message: msg || 'This warehouse name already exists' });
      } else {
        toast.error(msg);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Warehouse' : 'Create Warehouse'}
      description={isEdit ? `Update details for ${warehouse?.name}` : 'Add a new warehouse to the system'}
      size="2xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(handleFormSubmit)}
            loading={isSubmitting}
          >
            {isEdit ? 'Update Warehouse' : 'Create Warehouse'}
          </Button>
        </>
      }
    >
      <WarehouseFormFields
        register={register}
        errors={errors}
        watch={watch}
        setValue={setValue}
        disabled={isSubmitting}
      />
    </Modal>
  );
};

export default WarehouseFormModal;
