'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { EyeIcon, EyeSlashIcon, CheckIcon } from '@heroicons/react/24/outline';
import Logo from '@/components/Logo';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Registration successful, redirect to signin with callbackUrl
      router.push(`/auth/signin?signup=success&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
    setLoading(false);
  };

  const passwordStrength = () => {
    if (password.length === 0) return { score: 0, text: '', color: '' };
    if (password.length < 6) return { score: 1, text: 'Too weak', color: 'text-red-500' };
    if (password.length < 8) return { score: 2, text: 'Weak', color: 'text-orange-500' };
    if (password.length < 10) return { score: 3, text: 'Fair', color: 'text-yellow-500' };
    if (password.length < 12) return { score: 4, text: 'Good', color: 'text-blue-500' };
    return { score: 5, text: 'Strong', color: 'text-green-500' };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen -z-10" />

      <div className="w-full max-w-md relative z-10 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo variant="white" size="lg" showText={true} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create your account</h1>
          <p className="text-gray-400">Start selling digital products today</p>
        </div>

        {/* Main Card */}
        <div className="bg-[#111111]/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/5 p-8 relative overflow-hidden">
          {/* Subtle inner highlight */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

          <div className="relative z-10">
            {/* Social Signup Buttons */}
            <div className="space-y-3 mb-8">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                onClick={() => window.location.href = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              >
                <FaGoogle className="w-5 h-5 text-red-400" />
                Continue with Google
              </button>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                onClick={() => window.location.href = `/api/auth/signin/github?callbackUrl=${encodeURIComponent(callbackUrl)}`}
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
                <span className="px-4 bg-[#111111] text-gray-400">Or sign up with email</span>
              </div>
            </div>

            {/* Sign Up Form */}
            <form className="space-y-5" onSubmit={handleSubmit} method="POST">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="w-full px-4 py-3 pb-3.5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all duration-300 bg-white/5 hover:bg-white/10"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

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
                    autoComplete="new-password"
                    required
                    className="w-full px-4 py-3 pb-3.5 pr-12 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all duration-300 bg-white/5 hover:bg-white/10"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Create a strong password"
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

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full ${level <= strength.score
                              ? strength.color.replace('text-', 'bg-')
                              : 'bg-white/10'
                              }`}
                          />
                        ))}
                      </div>
                      <span className={`text-[11px] font-bold uppercase tracking-wider w-16 text-right ${strength.color}`}>
                        {strength.text}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium">
                      Use at least 8 characters with a mix of letters, numbers & symbols
                    </p>
                  </div>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start pt-2">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500/50 border-white/20 rounded bg-white/5 cursor-pointer"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-400 cursor-pointer select-none">
                    I agree to the{' '}
                    <Link href="/terms" className="font-medium text-purple-400 hover:text-purple-300 hover:underline transition-colors">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="font-medium text-purple-400 hover:text-purple-300 hover:underline transition-colors">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-sm text-red-500/90 font-medium text-center">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !agreedToTerms}
                className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_-5px_rgba(168,85,247,0.6)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create account'
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <Link
                  href={`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                  className="font-semibold text-white/90 hover:text-white hover:underline transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center px-2">
          <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5 flex flex-col items-center">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center mb-2">
              <CheckIcon className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-xs font-medium text-gray-300">Free to start</p>
          </div>
          <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5 flex flex-col items-center">
            <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mb-2">
              <CheckIcon className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-xs font-medium text-gray-300">No credit card</p>
          </div>
          <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5 flex flex-col items-center">
            <div className="w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center mb-2">
              <CheckIcon className="w-4 h-4 text-pink-400" />
            </div>
            <p className="text-xs font-medium text-gray-300">Cancel anytime</p>
          </div>
        </div>
      </div>
    </div>
  );
} 