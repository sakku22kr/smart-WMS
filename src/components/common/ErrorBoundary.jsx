import { Component } from 'react';
import { MdErrorOutline, MdRefresh, MdHome } from 'react-icons/md';

/**
 * ErrorBoundary — catches unhandled render errors and shows a graceful fallback UI.
 * Use as a wrapper around route segments or high-risk components.
 *
 * @example
 * <ErrorBoundary>
 *   <SomeComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // TODO: wire to error monitoring service (e.g. Sentry)
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { title = 'Something went wrong', showDetails = false } = this.props;

    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-6">
        <div className="w-full max-w-lg text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-3xl bg-danger-500/10 flex items-center justify-center mx-auto mb-6">
            <MdErrorOutline size={40} className="text-danger-500" />
          </div>

          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-2">{title}</h1>
          <p className="text-surface-500 dark:text-surface-400 mb-8">
            An unexpected error occurred. Try refreshing the page or returning to the dashboard.
          </p>

          {/* Error detail (dev only) */}
          {showDetails && this.state.error && (
            <div className="text-left bg-surface-100 dark:bg-surface-800 rounded-xl p-4 mb-6 overflow-auto max-h-40">
              <p className="text-xs font-mono text-danger-500 whitespace-pre-wrap">
                {this.state.error.toString()}
              </p>
            </div>
          )}

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-200 text-sm font-medium hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
            >
              <MdRefresh size={18} />
              Try Again
            </button>
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-medium shadow-glow hover:opacity-90 transition-opacity"
            >
              <MdHome size={18} />
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
