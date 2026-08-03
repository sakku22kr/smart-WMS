import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MdArrowBack, MdCategory } from 'react-icons/md';
import PageWrapper from '@components/layout/PageWrapper';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import CategoryFormFields from '@components/categories/CategoryFormFields';
import categoryService from '@/api/services/categoryService';
import useToast from '@hooks/useToast';

const CreateCategory = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
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

  const validateCodeUniqueness = useCallback(async (value) => {
    if (!value || value.trim().length < 2) return true;
    try {
      const res = await categoryService.checkCode(value.trim());
      if (res?.data === false) return 'This category code is already taken';
      return true;
    } catch {
      return true;
    }
  }, []);

  useEffect(() => {
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
  }, [register, validateCodeUniqueness]);

  const handleFormSubmit = async (data) => {
    setServerError(null);
    try {
      await categoryService.create({
        name:        data.name.trim(),
        code:        data.code.trim().toUpperCase(),
        description: data.description?.trim() || null,
        sortOrder:   Number(data.sortOrder) || 0,
        status:      data.status,
        parentId:    data.parentId || null,
      });
      toast.success('Category created successfully');
      navigate('/categories');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create category';
      if (msg.toLowerCase().includes('code')) {
        setError('code', { message: msg });
      } else if (msg.toLowerCase().includes('name')) {
        setError('name', { message: msg });
      } else {
        setServerError(msg);
        toast.error(msg);
      }
    }
  };

  return (
    <PageWrapper>
      <div className="page-container max-w-3xl">
        <Button
          variant="ghost"
          leftIcon={<MdArrowBack />}
          onClick={() => navigate('/categories')}
          className="mb-4"
        >
          Back to Categories
        </Button>

        <div className="page-header">
          <div>
            <h1 className="page-title">Create Category</h1>
            <p className="page-subtitle">Add a new category to organize your products</p>
          </div>
        </div>

        {serverError && (
          <Card className="mb-4">
            <p className="text-danger-500 text-sm">{serverError}</p>
          </Card>
        )}

        <Card>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <CategoryFormFields
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
              disabled={isSubmitting}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
              <Button
                variant="ghost"
                onClick={() => navigate('/categories')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                leftIcon={<MdCategory />}
                loading={isSubmitting}
              >
                Create Category
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PageWrapper>
  );
};

export default CreateCategory;
