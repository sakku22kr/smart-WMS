import Avatar from '@components/ui/Avatar';

/**
 * UserAvatar — avatar with user's profile image or initials, with optional status dot.
 */
const UserAvatar = ({ user, size = 'sm', showStatus = true, ...props }) => {
  const fullName = user ? `${user.firstName} ${user.lastName}` : '';
  const status = showStatus ? (user?.enabled ? 'online' : 'offline') : undefined;

  return (
    <div className="flex items-center gap-3">
      <Avatar
        src={user?.profileImageUrl}
        name={fullName}
        size={size}
        status={status}
        {...props}
      />
      <div className="min-w-0">
        <p className="text-sm font-medium text-surface-800 dark:text-surface-100 truncate">
          {fullName}
        </p>
        <p className="text-xs text-surface-400 truncate">{user?.email}</p>
      </div>
    </div>
  );
};

export default UserAvatar;
