'use client';
import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { FaGoogle, FaGithub } from 'react-icons/fa';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Credentials login
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });
    if (res?.error) {
      setError(res.error);
      toast.error(res.error);
    } else if (res?.ok) {
      toast.success('Signed in successfully!');
      router.push('/');
    }
    setLoading(false);
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-2xl border border-purple-100">
          <div className="flex flex-col items-center">
            <span className="mb-2 text-4xl font-extrabold text-purple-600">🔑</span>
            <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">Sign in to your account</h2>
          </div>
          {/* Social Sign In Buttons */}
          <div className="flex flex-col gap-3 mt-4">
            <button
              type="button"
              className="flex items-center justify-center gap-3 w-full py-2 rounded-lg font-semibold shadow transition-all text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-red-400"
              onClick={() => signIn('google', { callbackUrl: '/' })}
            >
              <FaGoogle className="w-5 h-5" /> Sign in with Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-3 w-full py-2 rounded-lg font-semibold shadow transition-all text-white bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-700"
              onClick={() => signIn('github', { callbackUrl: '/' })}
            >
              <FaGithub className="w-5 h-5" /> Sign in with GitHub
            </button>
          </div>
          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-200" />
            <span className="mx-3 text-gray-400 text-sm">or sign in with email</span>
            <div className="flex-grow h-px bg-gray-200" />
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-field peer placeholder-transparent focus:border-purple-500 focus:ring-2 focus:ring-purple-400"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email address"
                />
                <label htmlFor="email" className="absolute left-3 top-2 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-focus:-top-4 peer-focus:text-xs peer-focus:text-purple-600 bg-white px-1 pointer-events-none">Email address</label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="input-field peer placeholder-transparent focus:border-purple-500 focus:ring-2 focus:ring-purple-400"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                />
                <label htmlFor="password" className="absolute left-3 top-2 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-focus:-top-4 peer-focus:text-xs peer-focus:text-purple-600 bg-white px-1 pointer-events-none">Password</label>
              </div>
            </div>
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
            <div>
              <button
                type="submit"
                className="w-full py-2 rounded-lg font-bold shadow bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white text-lg transition focus:outline-none focus:ring-2 focus:ring-purple-400"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>
          <div className="flex justify-between mt-4">
            <Link href="/auth/forgot-password" className="text-sm text-primary-600 hover:underline">Forgot password?</Link>
            <Link href="/auth/signup" className="text-sm text-primary-600 hover:underline">Sign up</Link>
          </div>
        </div>
      </div>
    </>
  );
} 