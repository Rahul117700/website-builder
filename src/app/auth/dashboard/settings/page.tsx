'use client';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [saving, setSaving] = useState(false);
  // Change password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  // 2FA
  const [twoFAEnabled, setTwoFAEnabled] = useState(false); // Placeholder
  // Email preferences
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [productEmails, setProductEmails] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  // Connected accounts
  const [connectedAccounts, setConnectedAccounts] = useState(['google']); // Placeholder
  // Account deletion
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
    if (session?.user) {
      setName(session.user.name || '');
      setImage(session.user.image || '');
    }
  }, [session, status, router]);

  // Save profile
  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, image }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to update profile');
      toast.success('Profile updated!');
      update && update({ name, image });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async (e: any) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to change password');
      toast.success('Password changed!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  // Toggle 2FA
  const handleToggle2FA = async () => {
    // Placeholder logic
    setTwoFAEnabled((prev) => !prev);
    toast.success(twoFAEnabled ? '2FA disabled' : '2FA enabled');
  };

  // Save email preferences
  const handleSavePrefs = async () => {
    setSavingPrefs(true);
    try {
      const res = await fetch('/api/auth/email-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketingEmails, productEmails }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to save preferences');
      toast.success('Preferences saved!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save preferences');
    } finally {
      setSavingPrefs(false);
    }
  };

  // Disconnect OAuth
  const handleDisconnect = (provider: string) => {
    toast.success(`Disconnected from ${provider}`);
    setConnectedAccounts((accs) => accs.filter((a) => a !== provider));
  };

  // Delete account
  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to delete account');
      toast.success('Account deleted');
      setShowDeleteModal(false);
      // Clear localStorage/sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      // Sign out and redirect to home
      await signOut({ callbackUrl: '/' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <Toaster position="top-right" />
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Manage your account information below.
        </p>
      </div>
      {/* Profile Section */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6 max-w-lg mx-auto mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Profile</h2>
        <div className="mb-4 flex flex-col items-center">
          {image ? (
            <img src={image} alt="Profile" className="h-20 w-20 rounded-full border mb-2" />
          ) : (
            <div className="h-20 w-20 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center border mb-2 text-3xl font-bold">
              {name?.charAt(0) || session?.user?.email?.charAt(0) || '?'}
            </div>
          )}
          <input
            type="text"
            className="input-field mt-2"
            placeholder="Profile image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Name</label>
          <input
            type="text"
            className="input-field w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Email</label>
          <input
            type="email"
            className="input-field w-full bg-gray-100 dark:bg-slate-700 cursor-not-allowed"
            value={session?.user?.email || ''}
            disabled
          />
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
      {/* Change Password Section */}
      <form onSubmit={handleChangePassword} className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6 max-w-lg mx-auto mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Change Password</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Current Password</label>
          <input
            type="password"
            className="input-field w-full"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">New Password</label>
          <input
            type="password"
            className="input-field w-full"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Confirm New Password</label>
          <input
            type="password"
            className="input-field w-full"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={changingPassword}>
          {changingPassword ? 'Changing...' : 'Change Password'}
        </button>
      </form>
      {/* Two-Factor Authentication Section */}
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6 max-w-lg mx-auto mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Two-Factor Authentication</h2>
        <div className="flex items-center justify-between">
          <span className="text-gray-900 dark:text-white">{twoFAEnabled ? 'Enabled' : 'Disabled'}</span>
          <button className="btn btn-secondary" onClick={handleToggle2FA}>
            {twoFAEnabled ? 'Disable' : 'Enable'} 2FA
          </button>
        </div>
      </div>
      {/* Email Preferences Section */}
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6 max-w-lg mx-auto mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Email Preferences</h2>
        <div className="flex flex-col gap-2 mb-4">
          <label className="flex items-center gap-2 text-gray-900 dark:text-white">
            <input type="checkbox" checked={marketingEmails} onChange={() => setMarketingEmails((v) => !v)} />
            Marketing emails
          </label>
          <label className="flex items-center gap-2 text-gray-900 dark:text-white">
            <input type="checkbox" checked={productEmails} onChange={() => setProductEmails((v) => !v)} />
            Product updates
          </label>
        </div>
        <button className="btn btn-primary w-full" onClick={handleSavePrefs} disabled={savingPrefs}>
          {savingPrefs ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
      {/* Connected Accounts Section */}
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6 max-w-lg mx-auto mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Connected Accounts</h2>
        <ul className="mb-4">
          {connectedAccounts.length === 0 && <li className="text-gray-500 dark:text-gray-400">No connected accounts</li>}
          {connectedAccounts.map((provider) => (
            <li key={provider} className="flex items-center justify-between mb-2">
              <span className="capitalize text-gray-900 dark:text-white">{provider}</span>
              <button className="btn btn-danger btn-xs" onClick={() => handleDisconnect(provider)}>
                Disconnect
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/* Account Deletion Section */}
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6 max-w-lg mx-auto mb-8">
        <h2 className="text-lg font-semibold mb-4 text-red-600 dark:text-red-400">Delete Account</h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          Deleting your account is irreversible. All your data will be permanently removed.
        </p>
        <button className="btn btn-danger w-full" onClick={() => setShowDeleteModal(true)}>
          Delete Account
        </button>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-bold mb-2 text-red-600 dark:text-red-400">Are you sure?</h3>
              <p className="mb-4 text-sm text-gray-900 dark:text-white">This action cannot be undone. All your data will be deleted.</p>
              <div className="flex gap-2">
                <button className="btn btn-danger flex-1" onClick={handleDeleteAccount} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Yes, delete my account'}
                </button>
                <button className="btn btn-secondary flex-1" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// Add minimal shadcn/ui button/input classes if not present in your project:
// .btn, .btn-primary, .btn-secondary, .btn-danger, .btn-xs, .input-field