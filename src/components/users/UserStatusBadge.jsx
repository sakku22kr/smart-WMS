import Badge from '@components/ui/Badge';

const ROLE_VARIANT_MAP = {
  ROLE_ADMIN:              'primary',
  ROLE_WAREHOUSE_MANAGER:  'info',
  ROLE_INVENTORY_STAFF:    'success',
};

/**
 * UserStatusBadge — renders a user's enabled/disabled status with icon.
 */
export const UserStatusBadge = ({ enabled, size = 'md' }) => (
  <Badge variant={enabled ? 'success' : 'danger'} dot size={size}>
    {enabled ? 'Active' : 'Inactive'}
  </Badge>
);

/**
 * UserAccountBadge — renders account status (active, inactive, locked, expired).
 */
export const UserAccountBadge = ({ user }) => {
  if (!user) return null;
  if (!user.enabled) {
    return <Badge variant="danger" size="sm">Disabled</Badge>;
  }
  if (user.accountNonLocked === false) {
    return <Badge variant="warning" size="sm">Locked</Badge>;
  }
  if (user.credentialsNonExpired === false) {
    return <Badge variant="warning" size="sm">Expired</Badge>;
  }
  return <Badge variant="success" size="sm">Active</Badge>;
};

/**
 * UserRoleBadge — renders a single role name as a colored badge.
 */
export const UserRoleBadge = ({ roleName }) => (
  <Badge variant={ROLE_VARIANT_MAP[roleName] || 'surface'}>
    {roleName?.replace('ROLE_', '') || 'Unknown'}
  </Badge>
);

/**
 * UserRoleBadges — renders multiple role badges for a user.
 */
export const UserRoleBadges = ({ roles = [] }) => (
  <div className="flex flex-wrap gap-1">
    {roles.map((role) => (
      <UserRoleBadge key={role.id || role.name} roleName={role.name} />
    ))}
  </div>
);

export default UserStatusBadge;
