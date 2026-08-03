import { Component } from 'react';
import { HiOutlineExclamationTriangle, HiArrowPath } from 'react-icons/hi2';

/**
 * AuthErrorBoundary — catches unexpected runtime errors in auth components.
 *
 * Shows a recovery UI with a retry button instead of a blank screen.
 * Wrap around <AuthProvider> or any auth-critical subtree.
 */
class AuthErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[AuthErrorBoundary]', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Clear stale auth state and force a clean reload
    ['swms_access_token', 'swms_refresh_token', 'swms_auth_user'].forEach(k => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
    window.location.href = '/login';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-4">
        <div className="glass-card p-10 max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-error-500/10 flex items-center justify-center mx-auto">
            <HiOutlineExclamationTriangle size={32} className="text-error-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-surface-900 dark:text-white mb-2">
              Authentication Error
            </h1>
            <p className="text-sm text-surface-500 dark:text-surface-400">
              An unexpected error occurred in the authentication system.
              Your session has been cleared for security.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-4 text-xs text-left bg-surface-100 dark:bg-surface-800 p-3 rounded-lg overflow-auto max-h-32 text-error-600">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-white font-semibold hover:opacity-90 transition-opacity"
          >
            <HiArrowPath size={18} />
            Return to Login
          </button>
        </div>
      </div>
    );
  }
}

export default AuthErrorBoundary;
