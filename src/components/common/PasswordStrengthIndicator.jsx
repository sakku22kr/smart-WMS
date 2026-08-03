import { useMemo } from 'react';
import clsx from 'clsx';

/**
 * PasswordStrengthIndicator — visual strength meter for password validation.
 *
 * Criteria evaluated:
 *  - Length ≥ 8 chars
 *  - Contains uppercase letter
 *  - Contains lowercase letter
 *  - Contains digit
 *  - Contains special character
 *
 * Strength levels:
 *  0-1 : Weak    (red)
 *  2-3 : Fair    (orange)
 *  4   : Strong  (green)
 *  5   : Excellent (emerald)
 */
const PasswordStrengthIndicator = ({ password = '', showCriteria = true }) => {
  const assessment = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '', criteria: [] };

    const criteria = [
      { label: 'At least 8 characters',       met: password.length >= 8 },
      { label: 'Uppercase letter (A-Z)',       met: /[A-Z]/.test(password) },
      { label: 'Lowercase letter (a-z)',       met: /[a-z]/.test(password) },
      { label: 'Digit (0-9)',                  met: /\d/.test(password) },
      { label: 'Special character (!@#$...)',  met: /[^A-Za-z0-9]/.test(password) },
    ];

    const score = criteria.filter((c) => c.met).length;

    let label, color, barColor;
    if (score <= 1)      { label = 'Weak';     color = 'text-danger-500';   barColor = 'bg-danger-500'; }
    else if (score <= 3) { label = 'Fair';     color = 'text-warning-500';  barColor = 'bg-warning-500'; }
    else if (score === 4) { label = 'Strong';  color = 'text-success-600';  barColor = 'bg-success-500'; }
    else                 { label = 'Excellent'; color = 'text-success-700'; barColor = 'bg-success-700'; }

    return { score, label, color, barColor, criteria };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={clsx(
                'h-1.5 flex-1 rounded-full transition-all duration-300',
                i < assessment.score
                  ? assessment.barColor
                  : 'bg-surface-200 dark:bg-surface-700',
              )}
            />
          ))}
        </div>
        <span className={clsx('text-xs font-semibold min-w-[70px] text-right', assessment.color)}>
          {assessment.label}
        </span>
      </div>

      {/* Criteria checklist */}
      {showCriteria && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
          {assessment.criteria.map((c) => (
            <li key={c.label} className="flex items-center gap-2 text-xs">
              <span
                className={clsx(
                  'inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] font-bold',
                  c.met
                    ? 'bg-success-500 text-white'
                    : 'bg-surface-200 dark:bg-surface-700 text-surface-400',
                )}
              >
                {c.met ? '✓' : ''}
              </span>
              <span className={clsx(
                c.met ? 'text-surface-700 dark:text-surface-200' : 'text-surface-400 dark:text-surface-500',
              )}>
                {c.label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
