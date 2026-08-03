import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdArrowBack, MdHome, MdSearchOff } from 'react-icons/md';
import { HiOutlineCube } from 'react-icons/hi2';
import { APP_NAME } from '@utils/constants';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 dark:bg-surface-950 p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-accent-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg relative"
      >
        {/* Logo */}
        <Link to="/dashboard" className="inline-flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <HiOutlineCube size={20} className="text-white" />
          </div>
          <span className="font-bold text-surface-800 dark:text-surface-100">{APP_NAME}</span>
        </Link>

        {/* 404 illustration */}
        <div className="relative mb-8">
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-28 h-28 rounded-3xl bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center mx-auto"
          >
            <MdSearchOff size={56} className="text-primary-400" />
          </motion.div>

          {/* Floating number */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 18 }}
            className="absolute -top-4 -right-4 sm:right-16"
          >
            <span className="text-8xl font-black text-gradient select-none leading-none">404</span>
          </motion.div>
        </div>

        <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-50 mb-3">
          Page not found
        </h1>
        <p className="text-surface-500 dark:text-surface-400 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-200 text-sm font-medium hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors w-full sm:w-auto justify-center"
          >
            <MdArrowBack size={18} />
            Go Back
          </button>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-medium shadow-glow hover:opacity-90 transition-opacity w-full sm:w-auto justify-center"
          >
            <MdHome size={18} />
            Go to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
