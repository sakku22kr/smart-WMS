import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { MdEmail, MdLock, MdPerson } from 'react-icons/md';
import { HiOutlineCube } from 'react-icons/hi2';
import Button from '@components/ui/Button';
import Input  from '@components/ui/Input';
import { APP_NAME } from '@utils/constants';
import { useAuth } from '@/context/AuthContext';

const Register = () => {
  const { register: registerUser, loading } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ mode: 'onBlur' });

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      await registerUser({
        firstName:       data.firstName.trim(),
        lastName:        data.lastName.trim(),
        email:           data.email.trim().toLowerCase(),
        password:        data.password,
        confirmPassword: data.confirmPassword,
        phone:           data.phone?.trim() || null,
      });
    } catch (err) {
      const msg    = err.response?.data?.message || '';
      const fields = err.response?.data?.data;   // field errors map from GlobalExceptionHandler

      if (fields) {
        Object.entries(fields).forEach(([field, message]) => {
          setError(field, { message });
        });
      } else if (msg.toLowerCase().includes('email')) {
        setError('email', { message: msg || 'This email is already registered' });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-500/15 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent-500/15 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative"
      >
        <div className="glass-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
              <HiOutlineCube size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Create your account</h1>
            <p className="text-surface-500 dark:text-surface-400 mt-1 text-sm">{APP_NAME} — Enterprise WMS</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                id="firstName"
                placeholder="Alex"
                leftIcon={<MdPerson />}
                error={errors.firstName?.message}
                disabled={loading || isSubmitting}
                {...register('firstName', {
                  required:  'Required',
                  minLength: { value: 2, message: 'At least 2 characters' },
                  maxLength: { value: 100, message: 'Too long' },
                })}
              />
              <Input
                label="Last Name"
                id="lastName"
                placeholder="Johnson"
                leftIcon={<MdPerson />}
                error={errors.lastName?.message}
                disabled={loading || isSubmitting}
                {...register('lastName', {
                  required:  'Required',
                  minLength: { value: 2, message: 'At least 2 characters' },
                  maxLength: { value: 100, message: 'Too long' },
                })}
              />
            </div>

            <Input
              label="Email Address"
              id="email"
              type="email"
              placeholder="alex@company.com"
              leftIcon={<MdEmail />}
              required
              error={errors.email?.message}
              disabled={loading || isSubmitting}
              {...register('email', {
                required: 'Email is required',
                pattern:  { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
              })}
            />

            <Input
              label="Password"
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              leftIcon={<MdLock />}
              required
              error={errors.password?.message}
              disabled={loading || isSubmitting}
              {...register('password', {
                required:  'Password is required',
                minLength: { value: 8, message: 'At least 8 characters' },
                pattern: {
                  value:   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
                  message: 'Must contain uppercase, lowercase and a number',
                },
              })}
            />

            <Input
              label="Confirm Password"
              id="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              leftIcon={<MdLock />}
              required
              error={errors.confirmPassword?.message}
              disabled={loading || isSubmitting}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (v) => v === password || 'Passwords do not match',
              })}
            />

            <label className="flex items-start gap-2.5 mt-2 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                required
              />
              <span className="text-sm text-surface-600 dark:text-surface-400">
                I agree to the{' '}
                <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                  Terms of Service
                </a>
                {' '}and{' '}
                <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                  Privacy Policy
                </a>
              </span>
            </label>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              className="mt-2"
              loading={loading || isSubmitting}
            >
              {loading || isSubmitting ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
