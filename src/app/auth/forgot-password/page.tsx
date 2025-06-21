'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    // TODO: Integrate with forgot password API
    setLoading(false);
    setMessage('If your email exists in our system, you will receive a password reset link.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-8 card">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">Forgot your password?</h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">Enter your email and we will send you a reset link.</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="label">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="input-field"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
              {loading ? 'Sending...' : 'Send Reset Link'}
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