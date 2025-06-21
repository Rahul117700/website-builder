'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // TODO: Integrate with registration API
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-8 card">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">Create your account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="name" className="label">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="input-field"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
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
            <div>
              <label htmlFor="password" className="label">Password</label>
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
          </div>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          <div>
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </div>
        </form>
        <div className="flex justify-center mt-4">
          <span className="text-sm text-gray-600 dark:text-gray-300">Already have an account?</span>
          <Link href="/auth/signin" className="ml-2 text-sm text-primary-600 hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
} 