import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineCube } from 'react-icons/hi2';
import { MdCheckCircle, MdError, MdEmail } from 'react-icons/md';
import Button from '@components/ui/Button';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import authService from '@/services/authService';
import { APP_NAME } from '@utils/constants';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();

  const [status,  setStatus]  = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found. Please use the link from your email.');
      return;
    }

    const verify = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus('success');
        setMessage('Your email address has been verified successfully!');
        toast.success('Email verified! Welcome to Smart WMS.');
      } catch (err) {
        const msg = err.response?.data?.message || 'Verification failed.';
        setStatus('error');
        setMessage(msg);
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary-500/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-accent-500/15 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-10 text-center">
          {/* Logo */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
            <HiOutlineCube size={28} className="text-white" />
          </div>

          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
            {APP_NAME}
          </h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mb-8">
            Email Verification
          </p>

          <AnimatePresence mode="wait">
            {/* Verifying */}
            {status === 'verifying' && (
              <motion.div
                key="verifying"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"
                  />
                </div>
                <p className="text-surface-600 dark:text-surface-400">
                  Verifying your email address…
                </p>
              </motion.div>
            )}

            {/* Success */}
            {status === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <MdCheckCircle size={64} className="text-success-500 mx-auto" />
                <div>
                  <p className="text-lg font-semibold text-surface-900 dark:text-white mb-1">
                    Email Verified!
                  </p>
                  <p className="text-sm text-surface-500 dark:text-surface-400">
                    {message}
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => navigate('/login', { replace: true })}
                >
                  Go to Login
                </Button>
              </motion.div>
            )}

            {/* Error */}
            {status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <MdError size={64} className="text-error-500 mx-auto" />
                <div>
                  <p className="text-lg font-semibold text-surface-900 dark:text-white mb-1">
                    Verification Failed
                  </p>
                  <p className="text-sm text-surface-500 dark:text-surface-400">
                    {message}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    leftIcon={<MdEmail />}
                    onClick={async () => {
                      try {
                        // Resend using email from a stored user — prompt if not available
                        const email = prompt('Enter your email to resend the verification:');
                        if (!email) return;
                        await authService.resendVerification(email.trim().toLowerCase());
                        toast.success('Verification email resent!');
                      } catch {
                        toast.error('Failed to resend. Please try again.');
                      }
                    }}
                  >
                    Resend Verification Email
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    fullWidth
                    onClick={() => navigate('/login')}
                  >
                    Back to Login
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
