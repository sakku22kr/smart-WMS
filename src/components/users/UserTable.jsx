import { MdEdit, MdDelete, MdToggleOn, MdToggleOff } from 'react-icons/md';
import Table from '@components/table/Table';
import Button from '@components/ui/Button';
import UserAvatar from './UserAvatar';
import { UserStatusBadge, UserRoleBadges } from './UserStatusBadge';

/**
 * UserTable — data table for user list with action callbacks.
 */
const UserTable = ({
  users    = [],
  loading  = false,
  sortKey,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
  onToggleStatus,
  onRowClick,
}) => {
  const columns = [
    {
      key: 'user',
      label: 'User',
      sortable: true,
      render: (_, user) => <UserAvatar user={user} size="sm" />,
    },
    {
      key: 'roles',
      label: 'Roles',
      render: (_, user) => <UserRoleBadges roles={user.roles} />,
    },
    {
      key: 'enabled',
      label: 'Status',
      sortable: true,
      render: (val) => <UserStatusBadge enabled={val} />,
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (val) => val || '—',
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (val) => val ? new Date(val).toLocaleDateString() : '—',
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      width: '160px',
      render: (_, user) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="xs"
            leftIcon={<MdEdit />}
            onClick={() => onEdit?.(user)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="xs"
            leftIcon={user.enabled ? <MdToggleOff /> : <MdToggleOn />}
            onClick={() => onToggleStatus?.(user.id)}
          >
            {user.enabled ? 'Disable' : 'Enable'}
          </Button>
          <Button
            variant="ghost"
            size="xs"
            className="text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950/20"
            leftIcon={<MdDelete />}
            onClick={() => onDelete?.(user)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={users}
      loading={loading}
      emptyMsg="No users found."
      sortKey={sortKey}
      sortOrder={sortOrder}
      onSort={onSort}
      onRowClick={onRowClick}
    />
  );
};

export default UserTable;
