import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MdArrowBack, MdCategory } from 'react-icons/md';
import PageWrapper from '@components/layout/PageWrapper';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import Loader from '@components/common/Loader';
import CategoryFormFields from '@components/categories/CategoryFormFields';
import categoryService from '@/api/services/categoryService';
import useToast from '@hooks/useToast';

const EditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [category, setCategory] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError: setFieldError,
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

  const fetchCategory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoryService.getById(id);
      const data = res?.data ?? null;
      setCategory(data);
      if (data) {
        reset({
          name:        data.name        || '',
          code:        data.code        || '',
          description: data.description || '',
          sortOrder:   data.sortOrder   ?? 0,
          status:      data.status      || 'ACTIVE',
          parentId:    data.parentId    ?? null,
        });
      }
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load category');
    } finally {
      setLoading(false);
    }
  }, [id, reset]);

  useEffect(() => { fetchCategory(); }, [fetchCategory]);

  const validateCodeUniqueness = useCallback(async (value) => {
    if (!value || value.trim().length < 2) return true;
    try {
      const res = await categoryService.checkCode(value.trim(), id);
      if (res?.data === false) return 'This category code is already taken';
      return true;
    } catch {
      return true;
    }
  }, [id]);

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
      await categoryService.update(id, {
        name:        data.name.trim(),
        code:        data.code.trim().toUpperCase(),
        description: data.description?.trim() || null,
        sortOrder:   Number(data.sortOrder) || 0,
        status:      data.status,
        parentId:    data.parentId || null,
      });
      toast.success('Category updated successfully');
      navigate(`/categories/${id}`);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update category';
      if (msg.toLowerCase().includes('code')) {
        setFieldError('code', { message: msg });
      } else if (msg.toLowerCase().includes('name')) {
        setFieldError('name', { message: msg });
      } else {
        setServerError(msg);
        toast.error(msg);
      }
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="page-container max-w-3xl">
          <div className="py-16 flex justify-center">
            <Loader size="lg" label="Loading category..." />
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="page-container max-w-3xl">
          <Button variant="ghost" leftIcon={<MdArrowBack />} onClick={() => navigate(-1)} className="mb-4">
            Back
          </Button>
          <div className="py-16 text-center">
            <p className="text-danger-500">{error}</p>
            <Button variant="secondary" className="mt-4" onClick={fetchCategory}>Retry</Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!category) return null;

  return (
    <PageWrapper>
      <div className="page-container max-w-3xl">
        <Button
          variant="ghost"
          leftIcon={<MdArrowBack />}
          onClick={() => navigate(`/categories/${id}`)}
          className="mb-4"
        >
          Back to Category
        </Button>

        <div className="page-header">
          <div>
            <h1 className="page-title">Edit Category</h1>
            <p className="page-subtitle">Update details for {category.name}</p>
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
              categoryId={Number(id)}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
              <Button
                variant="ghost"
                onClick={() => navigate(`/categories/${id}`)}
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
                Update Category
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PageWrapper>
  );
};

export default EditCategory;
