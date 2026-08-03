import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { MdEmail, MdArrowBack, MdSend } from 'react-icons/md';
import { HiOutlineCube } from 'react-icons/hi2';
import Button from '@components/ui/Button';
import Input  from '@components/ui/Input';
import { APP_NAME } from '@utils/constants';
import { useState } from 'react';
import toast from 'react-hot-toast';
import authService from '@/services/authService';

const ForgotPassword = () => {
  const [sent,      setSent]      = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await authService.forgotPassword(data.email.trim().toLowerCase());
      setSentEmail(data.email);
      setSent(true);
    } catch {
      // Generic message — never reveal if email exists
      setSentEmail(data.email);
      setSent(true);
    }
  };

  const handleResend = async () => {
    const email = sentEmail || getValues('email');
    if (!email) return;
    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      toast.success('Reset email resent successfully!');
    } catch {
      toast.success('If your email is registered, you will receive a new reset link.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary-500/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-accent-500/10 blur-3xl" />
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
              {sent ? 'Check your inbox' : 'Forgot password?'}
            </h1>
            <p className="text-surface-500 dark:text-surface-400 mt-2 text-sm">
              {sent
                ? `We sent a reset link to ${sentEmail}`
                : "Enter your email and we'll send you a reset link."}
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                label="Email Address"
                id="email"
                type="email"
                placeholder="alex@company.com"
                leftIcon={<MdEmail />}
                required
                error={errors.email?.message}
                disabled={isSubmitting}
                {...register('email', {
                  required: 'Email is required',
                  pattern:  { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
                })}
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isSubmitting}
                rightIcon={<MdSend />}
              >
                {isSubmitting ? 'Sending…' : 'Send Reset Link'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Success state */}
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="w-16 h-16 rounded-full bg-success-500/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-surface-500 dark:text-surface-400 text-center">
                  Didn't receive it? Check your spam folder or try resending.
                </p>
              </div>
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={handleResend}
              >
                Resend Email
              </Button>
              <Button
                variant="ghost"
                size="lg"
                fullWidth
                onClick={() => setSent(false)}
              >
                Try a different email
              </Button>
            </div>
          )}

          <div className="text-center mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <MdArrowBack size={16} /> Back to login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
