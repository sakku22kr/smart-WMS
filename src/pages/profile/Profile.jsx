import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdPerson, MdEmail, MdPhone, MdLock, MdSave, MdCalendarToday, MdArrowForward } from 'react-icons/md';
import PageWrapper from '@components/layout/PageWrapper';
import Card        from '@components/ui/Card';
import Button      from '@components/ui/Button';
import Badge       from '@components/ui/Badge';
import Input       from '@components/ui/Input';
import Loader      from '@components/common/Loader';
import { ProfilePictureUpload } from '@components/users';
import useProfile  from '@hooks/useProfile';
import useToast    from '@hooks/useToast';

const Profile = () => {
  const { profile, loading, error, updateProfile, uploadPicture, refresh } = useProfile();
  const toast = useToast();
  const navigate = useNavigate();

  // Profile form state
  const [formValues, setFormValues] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);

  // Sync form with profile data
  useEffect(() => {
    if (profile) {
      setFormValues({
        firstName: profile.firstName || '',
        lastName:  profile.lastName  || '',
        email:     profile.email     || '',
        phone:     profile.phone     || '',
      });
    }
  }, [profile]);

  // ─── Profile Update ────────────────────────────────────────
  const handleProfileChange = useCallback((field) => (e) => {
    setFormValues((prev) => ({ ...prev, [field]: e.target.value }));
  }, []);

  const handleSaveProfile = useCallback(async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(formValues);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }, [formValues, updateProfile, toast]);

  // ─── Profile Picture ───────────────────────────────────────
  const handleUploadPicture = useCallback(async (file) => {
    await uploadPicture(file);
    toast.success('Profile picture updated!');
    refresh();
  }, [uploadPicture, toast, refresh]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="page-container max-w-5xl">
          <div className="py-16 flex justify-center">
            <Loader size="lg" label="Loading profile…" />
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="page-container max-w-5xl">
          <div className="py-16 text-center">
            <p className="text-danger-500">{error}</p>
            <Button variant="secondary" className="mt-4" onClick={refresh}>Retry</Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const roleNames = profile?.roles?.map(r => r.name?.replace('ROLE_', '')) || [];
  const createdDate = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  }) : '';

  return (
    <PageWrapper>
      <div className="page-container max-w-5xl">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Profile</h1>
            <p className="page-subtitle">Manage your personal information and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — Avatar + Info Card */}
          <Card className="lg:col-span-1 text-center flex flex-col items-center">
            <ProfilePictureUpload
              user={profile}
              onUpload={handleUploadPicture}
            />
            <h2 className="mt-4 text-lg font-bold text-surface-900 dark:text-white">
              {profile?.firstName} {profile?.lastName}
            </h2>
            <p className="text-sm text-surface-400">{profile?.email}</p>
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
            <div className="w-full mt-6 space-y-2 text-left">
              <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
                <MdCalendarToday size={14} className="text-surface-400" />
                Joined {createdDate}
              </div>
              <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
                <span className={`w-2 h-2 rounded-full ${profile?.enabled ? 'bg-success-500' : 'bg-danger-500'}`} />
                {profile?.enabled ? 'Account Active' : 'Account Disabled'}
              </div>
            </div>
          </Card>

          {/* Right — Edit Form */}
          <Card title="Personal Information" className="lg:col-span-2">
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  leftIcon={<MdPerson />}
                  value={formValues.firstName}
                  onChange={handleProfileChange('firstName')}
                  required
                />
                <Input
                  label="Last Name"
                  leftIcon={<MdPerson />}
                  value={formValues.lastName}
                  onChange={handleProfileChange('lastName')}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  leftIcon={<MdEmail />}
                  value={formValues.email}
                  onChange={handleProfileChange('email')}
                  required
                />
                <Input
                  label="Phone"
                  leftIcon={<MdPhone />}
                  value={formValues.phone}
                  onChange={handleProfileChange('phone')}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" type="button" onClick={() => refresh()}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" leftIcon={<MdSave />} loading={saving}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Change Password — link to dedicated page */}
        <Card title="Change Password" subtitle="Keep your account secure with a strong password" className="mt-6">
          <div className="flex items-center justify-between max-w-lg">
            <p className="text-sm text-surface-500 dark:text-surface-400">
              Update your password regularly to keep your account secure.
            </p>
            <Button
              variant="outline"
              size="sm"
              rightIcon={<MdArrowForward />}
              onClick={() => navigate('/change-password')}
            >
              Change Password
            </Button>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
};

export default Profile;
