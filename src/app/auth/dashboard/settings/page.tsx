"use client";
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || '');
  const [email, setEmail] = useState(session?.user?.email || '');
  const [avatar, setAvatar] = useState(session?.user?.image || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Handle avatar upload (mock)
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setAvatar(url);
    }
  };

  // Handle profile save (mock)
  const handleSaveProfile = async () => {
    setSaving(true);
    setSuccess('');
    setError('');
    setTimeout(() => {
      setSaving(false);
      setSuccess('Profile updated!');
    }, 1000);
  };

  // Handle password change (mock)
  const handleChangePassword = async () => {
    setSaving(true);
    setSuccess('');
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setSaving(false);
      return;
    }
    setTimeout(() => {
      setSaving(false);
      setSuccess('Password changed!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">Settings</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">Manage your account information below.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 flex flex-col items-center">
          <div className="relative mb-6">
            <img
              src={avatar || '/default-avatar.png'}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-purple-200 object-cover shadow-lg"
            />
            <label className="absolute bottom-2 right-2 bg-purple-600 text-white rounded-full p-2 cursor-pointer shadow-md hover:bg-purple-700 transition">
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.25 2.25 0 1 1 3.182 3.182L7.5 20.213l-4.182.545.545-4.182 12.999-12.09z" />
              </svg>
            </label>
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:outline-none bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white mb-4"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
            />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 mb-4"
              value={email}
              disabled
            />
            <button
              onClick={handleSaveProfile}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg shadow transition mb-2"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {success && <div className="text-green-600 text-sm mt-1">{success}</div>}
            {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
          </div>
        </div>
        {/* Security Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Change Password</h2>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:outline-none bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white mb-4"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            placeholder="Current password"
          />
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:outline-none bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white mb-4"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="New password"
          />
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:outline-none bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white mb-4"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
          <button
            onClick={handleChangePassword}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg shadow transition mb-2"
            disabled={saving}
          >
            {saving ? 'Updating...' : 'Update Password'}
          </button>
          {success && <div className="text-green-600 text-sm mt-1">{success}</div>}
          {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
        </div>
      </div>
    </DashboardLayout>
  );
}