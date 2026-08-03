import { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@components/ui/Modal';
import Button from '@components/ui/Button';
import CategoryFormFields from './CategoryFormFields';
import categoryService from '@/api/services/categoryService';
import useToast from '@hooks/useToast';

const CategoryFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  category = null,
}) => {
  const isEdit = !!category?.id;
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
      description: '',
      sortOrder: 0,
      status: 'ACTIVE',
      parentId: null,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (isEdit && category) {
        reset({
          name:        category.name        || '',
          code:        category.code        || '',
          description: category.description || '',
          sortOrder:   category.sortOrder   ?? 0,
          status:      category.status      || 'ACTIVE',
          parentId:    category.parentId    ?? null,
        });
      } else {
        reset({
          name: '', code: '', description: '',
          sortOrder: 0, status: 'ACTIVE', parentId: null,
        });
      }
      clearErrors();
    }
  }, [isOpen, isEdit, category, reset, clearErrors]);

  const validateCodeUniqueness = useCallback(async (value) => {
    if (!value || value.trim().length < 2) return true;
    try {
      const res = await categoryService.checkCode(value.trim(), isEdit ? category?.id : null);
      const available = res?.data;
      if (available === false) {
        return 'This category code is already taken';
      }
      return true;
    } catch {
      return true;
    }
  }, [isEdit, category?.id]);

  useEffect(() => {
    if (isOpen) {
      register('code', {
        required: 'Category code is required',
        minLength: { value: 2, message: 'Code must be at least 2 characters' },
        maxLength: { value: 30, message: 'Code must not exceed 30 characters' },
        pattern: {
          value: /^[A-Z0-9_-]+$/i,
          message: 'Only uppercase letters, digits, hyphens, or underscores',
        },
        validate: validateCodeUniqueness,
      });
    }
  }, [isOpen, register, validateCodeUniqueness]);

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit({
        name:        data.name.trim(),
        code:        data.code.trim().toUpperCase(),
        description: data.description?.trim() || null,
        sortOrder:   Number(data.sortOrder) || 0,
        status:      data.status,
        parentId:    data.parentId || null,
      });
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Operation failed';
      if (msg.toLowerCase().includes('code')) {
        setError('code', { message: msg || 'This category code already exists' });
      } else if (msg.toLowerCase().includes('name')) {
        setError('name', { message: msg || 'This category name already exists' });
      } else {
        toast.error(msg);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Category' : 'Create Category'}
      description={isEdit ? `Update details for ${category?.name}` : 'Add a new category to the system'}
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
            {isEdit ? 'Update Category' : 'Create Category'}
          </Button>
        </>
      }
    >
      <CategoryFormFields
        register={register}
        errors={errors}
        watch={watch}
        setValue={setValue}
        disabled={isSubmitting}
        categoryId={isEdit ? category?.id : null}
      />
    </Modal>
  );
};

export default CategoryFormModal;
