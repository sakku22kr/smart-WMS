import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { MdEmail, MdLock, MdArrowForward } from 'react-icons/md';
import { HiOutlineCube } from 'react-icons/hi2';
import Button from '@components/ui/Button';
import Input  from '@components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { MdDarkMode, MdLightMode } from 'react-icons/md';
import { APP_NAME } from '@utils/constants';
import storage from '@/utils/sessionStorage';

const Login = () => {
  const { login, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  // Redirect back to the page the user was trying to access before login
  const from = location.state?.from || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm({
    mode: 'onBlur',
    defaultValues: { rememberMe: storage.isRememberMe() },
  });

  const rememberMe = watch('rememberMe');

  const onSubmit = async (data) => {
    try {
      await login({
        email:      data.email.trim().toLowerCase(),
        password:   data.password,
        rememberMe: !!data.rememberMe,
        from,
      });
    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.message || '';
      if (status === 401 || msg.toLowerCase().includes('credential')) {
        setError('password', { message: 'Incorrect email or password' });
        setError('email',    { message: '' });
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-950 overflow-hidden relative">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-accent-500/20 blur-3xl" />
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors z-10"
      >
        {isDark ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
      </button>

      {/* Left panel — branding */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-primary flex-col justify-between p-12 relative overflow-hidden"
      >
        {/* Decorative rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-white/10" />

        {/* Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <HiOutlineCube size={24} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl">{APP_NAME}</span>
        </div>

        {/* Center copy */}
        <div className="z-10 space-y-4">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Intelligent Warehouse<br />Management
          </h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-md">
            Streamline your inventory operations, track shipments in real-time, and gain
            actionable insights with our enterprise WMS platform.
          </p>
          {/* Feature bullets */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            {['Real-time Tracking', 'Smart Analytics', 'Multi-Warehouse', 'Purchase Orders'].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white/80 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/40 text-sm z-10">© 2025 {APP_NAME}. Enterprise Edition.</p>
      </motion.div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <HiOutlineCube size={22} className="text-white" />
            </div>
            <span className="font-bold text-xl text-surface-900 dark:text-white">{APP_NAME}</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-surface-900 dark:text-white">Welcome back</h2>
            <p className="text-surface-500 dark:text-surface-400 mt-2">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
              placeholder="Enter your password"
              leftIcon={<MdLock />}
              required
              error={errors.password?.message}
              disabled={loading || isSubmitting}
              {...register('password', {
                required:  'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
              })}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                  {...register('rememberMe')}
                />
                <span className="text-surface-600 dark:text-surface-400">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading || isSubmitting}
              rightIcon={<MdArrowForward />}
            >
              {loading || isSubmitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
