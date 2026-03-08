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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen -z-10" />

        <div className="w-full max-w-md relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo variant="white" size="lg" showText={true} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back 🚀</h1>
            <p className="text-gray-400">Sign in to your account</p>
          </div>

          {/* Main Card */}
          <div className="bg-[#111111]/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/5 p-8 relative overflow-hidden">
            {/* Subtle inner highlight */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

            <div className="relative z-10">
              {/* Social Sign In Buttons */}
              <div className="space-y-3 mb-8">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  onClick={() => {
                    const url = callbackUrl && callbackUrl !== '/' ? callbackUrl : window.location.origin;
                    signIn('google', {
                      callbackUrl: url,
                      redirect: true
                    });
                  }}
                >
                  <FaGoogle className="w-5 h-5 text-red-400" />
                  Continue with Google
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  onClick={() => {
                    const url = callbackUrl && callbackUrl !== '/' ? callbackUrl : window.location.origin;
                    signIn('github', {
                      callbackUrl: url,
                      redirect: true
                    });
                  }}
                >
                  <FaGithub className="w-5 h-5 text-white" />
                  Continue with GitHub
                </button>
              </div>

              {/* Divider */}
              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#111111] text-gray-400">Or continue with email</span>
                </div>
              </div>

              {/* Sign In Form */}
              <form className="space-y-5" onSubmit={handleSubmit} method="POST">
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
                    className="w-full px-4 py-3 pb-3.5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all duration-300 bg-white/5 hover:bg-white/10"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
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
                      className="w-full px-4 py-3 pb-3.5 pr-12 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all duration-300 bg-white/5 hover:bg-white/10"
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
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-sm text-red-500/90 font-medium text-center">{error}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500/50 border-white/20 rounded bg-white/5 cursor-pointer"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400 cursor-pointer select-none">
                      Remember me
                    </label>
                  </div>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm font-medium text-purple-400 hover:text-purple-300 hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_-5px_rgba(168,85,247,0.6)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign in to account'
                  )}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-400">
                  Don&apos;t have an account?{' '}
                  <Link
                    href={`/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                    className="font-semibold text-white/90 hover:text-white hover:underline transition-colors"
                  >
                    Sign up for free
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-500 font-medium">
            <p>
              By signing in, you agree to our{' '}
              <Link href="/terms" className="hover:text-gray-300 transition-colors underline decoration-gray-600 underline-offset-2">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="hover:text-gray-300 transition-colors underline decoration-gray-600 underline-offset-2">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 