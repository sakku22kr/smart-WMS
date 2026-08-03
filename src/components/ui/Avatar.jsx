import clsx from 'clsx';

const SIZES = {
  xs:  'w-6  h-6  text-xs',
  sm:  'w-8  h-8  text-sm',
  md:  'w-10 h-10 text-base',
  lg:  'w-12 h-12 text-lg',
  xl:  'w-14 h-14 text-xl',
  '2xl':'w-16 h-16 text-2xl',
};

const COLORS = ['bg-primary-500', 'bg-accent-500', 'bg-success-500', 'bg-info-500', 'bg-warning-500'];

const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

const getColor = (name = '') =>
  COLORS[name.charCodeAt(0) % COLORS.length];

/**
 * Avatar — user avatar with image fallback to initials.
 */
const Avatar = ({
  src,
  name      = '',
  size      = 'md',
  ring      = false,
  status,
  className = '',
  ...props
}) => {
  const sizeClass = SIZES[size];

  return (
    <div className={clsx('relative inline-flex flex-shrink-0', className)} {...props}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={clsx(
            'rounded-full object-cover',
            sizeClass,
            ring && 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-surface-900'
          )}
        />
      ) : (
        <div className={clsx(
          'rounded-full flex items-center justify-center font-semibold text-white',
          sizeClass,
          getColor(name),
          ring && 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-surface-900'
        )}>
          {getInitials(name)}
        </div>
      )}

      {/* Status dot */}
      {status && (
        <span className={clsx(
          'absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-surface-800',
          {
            'bg-success-500': status === 'online',
            'bg-surface-400': status === 'offline',
            'bg-warning-500': status === 'away',
            'bg-danger-500':  status === 'busy',
          },
          size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3 h-3',
        )} />
      )}
    </div>
  );
};

export default Avatar;
