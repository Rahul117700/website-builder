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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 lg:p-8 relative overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen -z-10" />

        <div className="w-full max-w-6xl flex flex-col lg:flex-row bg-[#111111]/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/5 relative overflow-hidden">
          {/* Subtle inner highlight */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />

          {/* Left Column: Value Proposition (Hidden on mobile) */}
          <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative border-r border-white/5">
            {/* Subtle noise pattern overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>

            <div className="relative z-10 flex flex-col h-full gap-12">
              <div>
                <Logo variant="white" size="lg" showText={true} href="/" />
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <h1 className="text-4xl xl:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
                  Welcome back to your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">creator studio.</span>
                </h1>
                <p className="text-lg text-gray-400 mb-10 leading-relaxed max-w-lg">
                  Continue building your customized platform, managing your community, and growing your digital presence.
                </p>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                      <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Track your revenue</h3>
                      <p className="text-sm text-gray-400">Monitor sales and subscription growth in real-time.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                      <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Manage digital assets</h3>
                      <p className="text-sm text-gray-400">Upload and organize videos, PDFs, and exclusive content.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Login Form */}
          <div className="w-full lg:w-[480px] p-8 lg:p-12 relative z-10 flex flex-col justify-center bg-[#0a0a0a]/50">
            <div className="mb-8 lg:hidden flex justify-center">
              <Logo variant="white" size="lg" showText={true} href="/" />
            </div>

            <div className="text-center lg:text-left mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Sign In</h2>
              <p className="text-gray-400">Log into your existing account</p>
            </div>

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
                <span className="px-4 bg-[#0d0d0d] text-gray-400">Or continue with email</span>
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

            {/* Mobile Footer */}
            <div className="mt-8 text-center text-xs text-gray-500 font-medium">
              <p>
                By signing in, you agree to our{' '}
                <Link href="/terms" className="hover:text-gray-300 transition-colors underline decoration-gray-600 underline-offset-2">Terms</Link>
                {' '}and{' '}
                <Link href="/privacy" className="hover:text-gray-300 transition-colors underline decoration-gray-600 underline-offset-2">Privacy</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 