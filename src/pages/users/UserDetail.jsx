import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MdArrowBack, MdEmail, MdPhone, MdCalendarToday, MdPerson,
  MdCheckCircle, MdBlock, MdHistory
} from 'react-icons/md';
import PageWrapper from '@components/layout/PageWrapper';
import Card        from '@components/ui/Card';
import Button      from '@components/ui/Button';
import Badge       from '@components/ui/Badge';
import Loader      from '@components/common/Loader';
import Avatar      from '@components/ui/Avatar';
import { ActivityTimeline } from '@components/common';
import { RoleManager } from '@components/users';
import userService from '@/api/services/userService';
import useActivityLogs from '@hooks/useActivityLogs';
import useToast from '@hooks/useToast';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [user, setUser]       = useState(null);
  const [loading, setL]       = useState(true);
  const [error, setE]         = useState(null);
  const [statusLoading, setSL] = useState(false);

  const { logs, loading: logsLoading } = useActivityLogs({ userId: id, initialSize: 20 });

  const fetchUser = useCallback(async () => {
    setL(true);
    try {
      const res = await userService.getById(id);
      setUser(res?.data ?? null);
      setE(null);
    } catch (err) {
      setE(err?.response?.data?.message || 'Failed to load user');
    } finally {
      setL(false);
    }
  }, [id]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  // ─── Activate / Deactivate ──────────────────────────────
  const handleToggleStatus = useCallback(async () => {
    if (!user) return;
    setSL(true);
    try {
      if (user.enabled) {
        await userService.deactivate(id);
        toast.success('User deactivated successfully');
      } else {
        await userService.activate(id);
        toast.success('User activated successfully');
      }
      await fetchUser();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setSL(false);
    }
  }, [user, id, fetchUser, toast]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="page-container max-w-5xl">
          <div className="py-16 flex justify-center">
            <Loader size="lg" label="Loading user…" />
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="page-container max-w-5xl">
          <Button variant="ghost" leftIcon={<MdArrowBack />} onClick={() => navigate(-1)} className="mb-4">
            Back
          </Button>
          <div className="py-16 text-center">
            <p className="text-danger-500">{error}</p>
            <Button variant="secondary" className="mt-4" onClick={fetchUser}>Retry</Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!user) return null;

  const roleNames = user.roles?.map(r => r.name?.replace('ROLE_', '')) || [];
  const createdDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';
  const updatedDate = user.updatedAt
    ? new Date(user.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <PageWrapper>
      <div className="page-container max-w-5xl">
        <Button variant="ghost" leftIcon={<MdArrowBack />} onClick={() => navigate(-1)} className="mb-4">
          Back to Users
        </Button>

        <div className="page-header">
          <div>
            <h1 className="page-title">User Details</h1>
            <p className="page-subtitle">View user information, manage status and roles</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — Avatar + Status + Actions */}
          <Card className="lg:col-span-1 text-center flex flex-col items-center">
            <Avatar
              src={user.profileImageUrl}
              name={`${user.firstName} ${user.lastName}`}
              size="2xl"
              ring
              status={user.enabled ? 'online' : 'offline'}
            />
            <h2 className="mt-4 text-lg font-bold text-surface-900 dark:text-white">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-surface-400">{user.email}</p>
            <div className="flex flex-wrap gap-1 justify-center mt-2">
              {roleNames.map((role) => (
                <Badge key={role} variant={
                  role === 'ADMIN' ? 'primary' :
                  role === 'WAREHOUSE_MANAGER' ? 'info' : 'success'
                }>
                  {role}
                </Badge>
              ))}
            </div>
            <Badge variant={user.enabled ? 'success' : 'danger'} dot className="mt-2" size="lg">
              {user.enabled ? 'Active' : 'Inactive'}
            </Badge>

            {/* Status Action Button */}
            <div className="w-full mt-4 px-4">
              <Button
                variant={user.enabled ? 'danger' : 'success'}
                fullWidth
                size="sm"
                leftIcon={user.enabled ? <MdBlock /> : <MdCheckCircle />}
                onClick={handleToggleStatus}
                loading={statusLoading}
              >
                {user.enabled ? 'Deactivate Account' : 'Activate Account'}
              </Button>
            </div>
          </Card>

          {/* Right — Detailed Info + Audit */}
          <Card title="Account Information" className="lg:col-span-2">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-surface-500">First Name</label>
                  <p className="mt-1 text-sm text-surface-800 dark:text-surface-100">{user.firstName}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-surface-500">Last Name</label>
                  <p className="mt-1 text-sm text-surface-800 dark:text-surface-100">{user.lastName}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-surface-500 flex items-center gap-1">
                  <MdEmail size={12} /> Email
                </label>
                <p className="mt-1 text-sm text-surface-800 dark:text-surface-100">{user.email}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-surface-500 flex items-center gap-1">
                  <MdPhone size={12} /> Phone
                </label>
                <p className="mt-1 text-sm text-surface-800 dark:text-surface-100">{user.phone || '—'}</p>
              </div>

              {/* Audit Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-surface-200 dark:border-surface-700">
                <div>
                  <label className="text-xs font-medium text-surface-500 flex items-center gap-1">
                    <MdCalendarToday size={12} /> Created
                  </label>
                  <p className="mt-1 text-sm text-surface-800 dark:text-surface-100">{createdDate}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-surface-500">Last Updated</label>
                  <p className="mt-1 text-sm text-surface-800 dark:text-surface-100">{updatedDate}</p>
                </div>
              </div>

              {(user.createdBy || user.updatedBy) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-surface-200 dark:border-surface-700">
                  <div>
                    <label className="text-xs font-medium text-surface-500 flex items-center gap-1">
                      <MdPerson size={12} /> Created By
                    </label>
                    <p className="mt-1 text-sm text-surface-800 dark:text-surface-100">{user.createdBy || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-surface-500">Updated By</label>
                    <p className="mt-1 text-sm text-surface-800 dark:text-surface-100">{user.updatedBy || '—'}</p>
                  </div>
                </div>
              )}

              {/* Account Status Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-surface-200 dark:border-surface-700">
                <div className="text-center p-2 rounded-lg bg-surface-50 dark:bg-surface-800">
                  <p className="text-[10px] uppercase text-surface-400">Account</p>
                  <Badge variant={user.accountNonExpired ? 'success' : 'danger'} size="sm" className="mt-1">
                    {user.accountNonExpired ? 'Valid' : 'Expired'}
                  </Badge>
                </div>
                <div className="text-center p-2 rounded-lg bg-surface-50 dark:bg-surface-800">
                  <p className="text-[10px] uppercase text-surface-400">Locked</p>
                  <Badge variant={user.accountNonLocked ? 'success' : 'warning'} size="sm" className="mt-1">
                    {user.accountNonLocked ? 'No' : 'Yes'}
                  </Badge>
                </div>
                <div className="text-center p-2 rounded-lg bg-surface-50 dark:bg-surface-800">
                  <p className="text-[10px] uppercase text-surface-400">Credentials</p>
                  <Badge variant={user.credentialsNonExpired ? 'success' : 'warning'} size="sm" className="mt-1">
                    {user.credentialsNonExpired ? 'Valid' : 'Expired'}
                  </Badge>
                </div>
                <div className="text-center p-2 rounded-lg bg-surface-50 dark:bg-surface-800">
                  <p className="text-[10px] uppercase text-surface-400">Email</p>
                  <Badge variant={user.emailVerified ? 'success' : 'warning'} size="sm" className="mt-1">
                    {user.emailVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Role Management */}
        <Card title="Role Management" subtitle="Assign or remove roles for this user" className="mt-6">
          <RoleManager
            userId={user.id}
            currentRoles={user.roles || []}
            onUpdated={fetchUser}
          />
        </Card>

        {/* Activity Timeline */}
        <Card
          title="Activity Timeline"
          subtitle="Recent activity for this user"
          headerAction={
            <MdHistory size={18} className="text-surface-400" />
          }
          className="mt-6"
        >
          <ActivityTimeline
            logs={logs}
            loading={logsLoading}
            compact={false}
          />
        </Card>
      </div>
    </PageWrapper>
  );
};

export default UserDetail;
