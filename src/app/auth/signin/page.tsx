'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Logo from '@/components/Logo';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl: callbackUrl, // Pass callbackUrl to signIn
    });

    if (res?.error) {
      setError(res.error);
      toast.error(res.error);
    } else if (res?.ok) {
      toast.success('Signed in successfully!');
      // Decode callbackUrl in case it's encoded
      const decodedCallbackUrl = decodeURIComponent(callbackUrl);
      // Small delay to ensure session is set, then redirect
      setTimeout(() => {
        // Use window.location for a full page reload to ensure session is properly set
        if (decodedCallbackUrl && decodedCallbackUrl !== '/') {
          // Ensure URL is absolute
          const redirectUrl = decodedCallbackUrl.startsWith('http')
            ? decodedCallbackUrl
            : `${window.location.origin}${decodedCallbackUrl.startsWith('/') ? '' : '/'}${decodedCallbackUrl}`;
          window.location.href = redirectUrl;
        } else {
          router.push('/');
          router.refresh();
        }
      }, 200);
    }
    setLoading(false);
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Link href="/">
                <Logo variant="white" size="lg" showText={true} />
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-gray-400">Sign in to your account</p>
          </div>

          {/* Main Card */}
          <div className="bg-[#1a1a1a] rounded-2xl shadow-xl border border-[#333] p-8">
            {/* Social Sign In Buttons */}
            <div className="space-y-3 mb-8">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium text-white bg-[#222] border border-[#333] hover:bg-[#333] hover:border-[#444] transition-all duration-200 focus:outline-none"
                onClick={() => {
                  const url = callbackUrl && callbackUrl !== '/' ? callbackUrl : window.location.origin;
                  signIn('google', {
                    callbackUrl: url,
                    redirect: true
                  });
                }}
              >
                <FaGoogle className="w-5 h-5 text-red-500" />
                Continue with Google
              </button>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium text-white bg-[#222] border border-[#333] hover:bg-[#333] hover:border-[#444] transition-all duration-200 focus:outline-none"
                onClick={() => {
                  const url = callbackUrl && callbackUrl !== '/' ? callbackUrl : window.location.origin;
                  signIn('github', {
                    callbackUrl: url,
                    redirect: true
                  });
                }}
              >
                <FaGithub className="w-5 h-5" />
                Continue with GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#333]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#1a1a1a] text-gray-400">Or continue with email</span>
              </div>
            </div>

            {/* Sign In Form */}
            <form className="space-y-6" onSubmit={handleSubmit} method="POST">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 border border-[#333] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-[#222]"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-3 pr-12 border border-[#333] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-[#222]"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-white" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-white" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-xl">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-500 focus:ring-indigo-500 border-[#333] rounded bg-[#222]"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                    Remember me
                  </label>
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-indigo-400 hover:text-indigo-300 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 focus:outline-none border border-indigo-500 shadow-lg shadow-indigo-600/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400">
                Don&apos;t have an account?{' '}
                <Link
                  href={`/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                  className="font-medium text-indigo-500 hover:text-indigo-400 hover:underline"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 