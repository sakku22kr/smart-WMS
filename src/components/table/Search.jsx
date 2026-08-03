import { useRef } from 'react';
import { MdSearch, MdClose } from 'react-icons/md';
import clsx from 'clsx';

/**
 * Search — controlled search input with clear button and debounce support.
 */
const Search = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search…',
  size        = 'md',
  className   = '',
  autoFocus   = false,
  ...props
}) => {
  const inputRef = useRef(null);

  const sizeClasses = {
    sm: 'h-8  text-xs pl-8  pr-8',
    md: 'h-10 text-sm pl-10 pr-10',
    lg: 'h-12 text-base pl-11 pr-10',
  };

  const iconSize = { sm: 14, md: 16, lg: 18 }[size];

  const handleClear = () => {
    onClear?.();
    onChange?.({ target: { value: '' } });
    inputRef.current?.focus();
  };

  return (
    <div className={clsx('relative flex items-center', className)}>
      <MdSearch
        size={iconSize}
        className="absolute left-3 text-surface-400 dark:text-surface-500 pointer-events-none"
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={clsx(
          'input-base',
          sizeClasses[size],
        )}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
          aria-label="Clear search"
        >
          <MdClose size={iconSize} />
        </button>
      )}
    </div>
  );
};

export default Search;
