import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { MdLock, MdArrowBack, MdCheckCircle } from 'react-icons/md';
import { HiOutlineCube } from 'react-icons/hi2';
import Button from '@components/ui/Button';
import Input  from '@components/ui/Input';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import authService from '@/services/authService';

const ResetPassword = () => {
  const [searchParams]   = useSearchParams();
  const navigate         = useNavigate();
  const [success, setSuccess] = useState(false);
  const [tokenError, setTokenError] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setTokenError('No reset token found. Please request a new password reset link.');
    }
  }, [token]);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onBlur' });

  const password = watch('newPassword');

  const onSubmit = async (data) => {
    if (!token) return;
    try {
      await authService.resetPassword({
        token:           token,
        newPassword:     data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err) {
      const msg    = err.response?.data?.message || '';
      const status = err.response?.status;

      if (status === 400 && msg.toLowerCase().includes('match')) {
        setError('confirmPassword', { message: 'Passwords do not match' });
      } else if (msg.toLowerCase().includes('expired')) {
        setTokenError('This reset link has expired. Please request a new one.');
      } else if (msg.toLowerCase().includes('invalid')) {
        setTokenError('This reset link is invalid. Please request a new one.');
      } else {
        toast.error(msg || 'Password reset failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-accent-500/15 blur-3xl" />
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-primary-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
              <HiOutlineCube size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
              {success ? 'Password Updated!' : 'Set new password'}
            </h1>
            <p className="text-surface-500 dark:text-surface-400 mt-2 text-sm">
              {success
                ? 'Redirecting you to login…'
                : 'Your new password must be at least 8 characters long.'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* Token error state */}
            {tokenError && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-xl bg-error-500/10 border border-error-500/20 text-error-600 dark:text-error-400 text-sm text-center">
                  {tokenError}
                </div>
                <Link to="/forgot-password">
                  <Button variant="primary" size="lg" fullWidth>
                    Request New Reset Link
                  </Button>
                </Link>
              </motion.div>
            )}

            {/* Success state */}
            {success && !tokenError && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-4"
              >
                <MdCheckCircle size={64} className="text-success-500" />
                <p className="text-sm text-surface-500 dark:text-surface-400 text-center">
                  You will be redirected to the login page in a moment.
                </p>
                <Link to="/login" className="w-full">
                  <Button variant="primary" size="lg" fullWidth>Go to Login</Button>
                </Link>
              </motion.div>
            )}

            {/* Form state */}
            {!success && !tokenError && (
              <motion.form
                key="form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
                noValidate
              >
                <Input
                  label="New Password"
                  id="newPassword"
                  type="password"
                  placeholder="Min. 8 characters"
                  leftIcon={<MdLock />}
                  required
                  error={errors.newPassword?.message}
                  disabled={isSubmitting}
                  {...register('newPassword', {
                    required:  'Password is required',
                    minLength: { value: 8, message: 'At least 8 characters' },
                    pattern: {
                      value:   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
                      message: 'Must contain uppercase, lowercase and a number',
                    },
                  })}
                />
                <Input
                  label="Confirm New Password"
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter new password"
                  leftIcon={<MdLock />}
                  required
                  error={errors.confirmPassword?.message}
                  disabled={isSubmitting}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (v) => v === password || 'Passwords do not match',
                  })}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isSubmitting}
                >
                  {isSubmitting ? 'Resetting…' : 'Reset Password'}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          {!success && (
            <div className="text-center mt-5">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <MdArrowBack size={16} /> Back to login
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
