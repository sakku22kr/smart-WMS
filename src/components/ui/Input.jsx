import { forwardRef, useState } from 'react';
import { MdVisibility, MdVisibilityOff, MdInfoOutline } from 'react-icons/md';
import clsx from 'clsx';

/**
 * Input — full-featured input with label, icon, error, helper text, password toggle.
 */
const Input = forwardRef(({
  label,
  id,
  name,
  type          = 'text',
  placeholder   = '',
  error         = '',
  helperText    = '',
  leftIcon      = null,
  rightIcon     = null,
  disabled      = false,
  required      = false,
  fullWidth     = true,
  size          = 'md',
  className     = '',
  wrapperClass  = '',
  ...props
}, ref) => {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === 'password';
  const inputType  = isPassword ? (showPwd ? 'text' : 'password') : type;

  const sizeClasses = {
    sm: 'h-8  text-xs px-3 py-1.5',
    md: 'h-10 text-sm px-4 py-2.5',
    lg: 'h-12 text-base px-4 py-3',
  };

  return (
    <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full', wrapperClass)}>
      {label && (
        <label
          htmlFor={id || name}
          className="text-sm font-medium text-surface-700 dark:text-surface-300"
        >
          {label}
          {required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {/* Left Icon */}
        {leftIcon && (
          <span className="absolute left-3 text-surface-400 dark:text-surface-500 pointer-events-none text-lg">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={id || name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={clsx(
            'input-base',
            sizeClasses[size],
            leftIcon  && 'pl-10',
            (rightIcon || isPassword) && 'pr-10',
            error     && 'border-danger-500 focus:ring-danger-500/40 focus:border-danger-500',
            disabled  && 'opacity-50 cursor-not-allowed bg-surface-100 dark:bg-surface-900',
            className,
          )}
          {...props}
        />

        {/* Right — password toggle or icon */}
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-3 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
            tabIndex={-1}
          >
            {showPwd ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
          </button>
        ) : rightIcon && (
          <span className="absolute right-3 text-surface-400 dark:text-surface-500 pointer-events-none text-lg">
            {rightIcon}
          </span>
        )}
      </div>

      {/* Error / Helper */}
      {error ? (
        <p className="text-xs text-danger-500 flex items-center gap-1">
          <MdInfoOutline size={14} /> {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-surface-400 dark:text-surface-500">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
