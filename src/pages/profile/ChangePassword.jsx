import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MdLock, MdCheckCircle, MdArrowBack, MdSecurity } from 'react-icons/md';
import PageWrapper from '@components/layout/PageWrapper';
import Card        from '@components/ui/Card';
import Button      from '@components/ui/Button';
import Input       from '@components/ui/Input';
import { PasswordStrengthIndicator } from '@components/common';
import useChangePassword from '@hooks/useChangePassword';
import useToast    from '@hooks/useToast';

const PASSWORD_RULES = {
  minLength: 8,
  maxLength: 255,
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  digit:     /\d/,
};

const validate = (values) => {
  const errors = {};

  if (!values.currentPassword) {
    errors.currentPassword = 'Current password is required';
  }

  if (!values.newPassword) {
    errors.newPassword = 'New password is required';
  } else if (values.newPassword.length < PASSWORD_RULES.minLength) {
    errors.newPassword = `Password must be at least ${PASSWORD_RULES.minLength} characters`;
  } else if (values.newPassword.length > PASSWORD_RULES.maxLength) {
    errors.newPassword = `Password must not exceed ${PASSWORD_RULES.maxLength} characters`;
  } else if (!PASSWORD_RULES.uppercase.test(values.newPassword)) {
    errors.newPassword = 'Password must contain at least one uppercase letter';
  } else if (!PASSWORD_RULES.lowercase.test(values.newPassword)) {
    errors.newPassword = 'Password must contain at least one lowercase letter';
  } else if (!PASSWORD_RULES.digit.test(values.newPassword)) {
    errors.newPassword = 'Password must contain at least one digit';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your new password';
  } else if (values.newPassword !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (values.currentPassword && values.newPassword && values.currentPassword === values.newPassword) {
    errors.newPassword = 'New password must be different from current password';
  }

  return errors;
};

const ChangePassword = () => {
  const navigate = useNavigate();
  const toast    = useToast();
  const { loading, error, success, changePassword, reset } = useChangePassword();

  const [values, setValues] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });
  const [errors, setErrors]       = useState({});
  const [touched, setTouched]     = useState({});

  const handleChange = useCallback((field) => (e) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear error for this field on change
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const handleBlur = useCallback((field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    // Validate single field on blur
    const fieldErrors = validate(values);
    setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
  }, [values]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    const fieldErrors = validate(values);
    setErrors(fieldErrors);
    setTouched({ currentPassword: true, newPassword: true, confirmPassword: true });

    if (Object.keys(fieldErrors).length > 0) return;

    const ok = await changePassword(values);
    if (ok) {
      toast.success('Password changed successfully!');
      setValues({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setErrors({});
      setTouched({});
    }
  }, [values, changePassword, toast]);

  const handleBackToProfile = useCallback(() => {
    navigate('/profile');
  }, [navigate]);

  return (
    <PageWrapper>
      <div className="page-container max-w-2xl mx-auto">
        <div className="page-header">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<MdArrowBack />}
              onClick={handleBackToProfile}
            >
              Back
            </Button>
            <div>
              <h1 className="page-title">Change Password</h1>
              <p className="page-subtitle">Update your password to keep your account secure</p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="text-center py-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                >
                  <MdCheckCircle className="mx-auto text-success-500" size={64} />
                </motion.div>
                <h2 className="mt-4 text-xl font-bold text-surface-900 dark:text-white">
                  Password Changed Successfully
                </h2>
                <p className="mt-2 text-surface-500 dark:text-surface-400 max-w-sm mx-auto">
                  Your password has been updated. You will need to use your new password the next time you sign in.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <Button variant="primary" onClick={handleBackToProfile}>
                    Back to Profile
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      reset();
                      setValues({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                  >
                    Change Again
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <Card
                title="Update Your Password"
                subtitle="Enter your current password and choose a new one"
              >
                {/* Error banner */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-4 p-3 rounded-xl bg-danger-50 dark:bg-danger-950/30 border border-danger-200 dark:border-danger-800"
                  >
                    <p className="text-sm text-danger-600 dark:text-danger-400">{error}</p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
                  {/* Current Password */}
                  <Input
                    label="Current Password"
                    type="password"
                    leftIcon={<MdLock />}
                    placeholder="Enter your current password"
                    value={values.currentPassword}
                    onChange={handleChange('currentPassword')}
                    onBlur={handleBlur('currentPassword')}
                    error={touched.currentPassword && errors.currentPassword}
                    required
                  />

                  {/* New Password */}
                  <div>
                    <Input
                      label="New Password"
                      type="password"
                      leftIcon={<MdSecurity />}
                      placeholder="Enter a new password"
                      value={values.newPassword}
                      onChange={handleChange('newPassword')}
                      onBlur={handleBlur('newPassword')}
                      error={touched.newPassword && errors.newPassword}
                      required
                    />
                    <div className="mt-2">
                      <PasswordStrengthIndicator password={values.newPassword} />
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <Input
                    label="Confirm New Password"
                    type="password"
                    leftIcon={<MdLock />}
                    placeholder="Re-enter your new password"
                    value={values.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    error={touched.confirmPassword && errors.confirmPassword}
                    required
                  />

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={handleBackToProfile}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      leftIcon={<MdLock />}
                      loading={loading}
                    >
                      Update Password
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
};

export default ChangePassword;
