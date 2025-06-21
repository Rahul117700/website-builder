'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    // TODO: Integrate with reset password API
    setLoading(false);
    setMessage('Your password has been reset. You can now sign in.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-8 card">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">Reset your password</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="label">New Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="input-field"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="label">Confirm New Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="input-field"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          {message && <div className="text-green-600 text-sm mt-2">{message}</div>}
          <div>
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
        <div className="flex justify-center mt-4">
          <Link href="/auth/signin" className="text-sm text-primary-600 hover:underline">Back to Sign in</Link>
        </div>
      </div>
    </div>
  );
} 