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
    <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Link href="/">
              <Logo variant="white" size="lg" showText={true} />
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-gray-400">Start selling digital products today</p>
        </div>

        {/* Main Card */}
        <div className="bg-[#1a1a1a] rounded-2xl shadow-xl border border-[#333] p-8">
          {/* Social Signup Buttons */}
          <div className="space-y-3 mb-8">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium text-white bg-[#222] border border-[#333] hover:bg-[#333] transition-all duration-200 focus:outline-none"
              onClick={() => window.location.href = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            >
              <FaGoogle className="w-5 h-5 text-red-500" />
              Continue with Google
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium text-white bg-[#222] border border-[#333] hover:bg-[#333] transition-all duration-200 focus:outline-none"
              onClick={() => window.location.href = `/api/auth/signin/github?callbackUrl=${encodeURIComponent(callbackUrl)}`}
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
              <span className="px-4 bg-[#1a1a1a] text-gray-400">Or sign up with email</span>
            </div>
          </div>

          {/* Sign Up Form */}
          <form className="space-y-6" onSubmit={handleSubmit} method="POST">
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
                className="w-full px-4 py-3 border border-[#333] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-[#222] transition-all duration-200"
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
                className="w-full px-4 py-3 border border-[#333] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-[#222] transition-all duration-200"
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
                  autoComplete="new-password"
                  required
                  className="w-full px-4 py-3 pr-12 border border-[#333] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 bg-[#222]"
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
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-white" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-white" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 w-8 rounded-full ${level <= strength.score
                            ? strength.color.replace('text-', 'bg-')
                            : 'bg-gray-200'
                            }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs font-medium ${strength.color}`}>
                      {strength.text}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Use at least 8 characters with a mix of letters, numbers, and symbols
                  </p>
                </div>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="h-4 w-4 text-indigo-500 focus:ring-indigo-500 border-[#333] rounded bg-[#222]"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-400">
                  I agree to the{' '}
                  <Link href="/terms" className="text-indigo-400 hover:text-indigo-300 hover:underline">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300 hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-xl">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 focus:outline-none shadow-lg shadow-indigo-600/20 border border-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
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
                className="font-medium text-indigo-500 hover:text-indigo-400 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-[#1a1a1a] rounded-xl shadow-sm border border-[#333]">
            <div className="w-8 h-8 bg-indigo-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
              <CheckIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-xs text-gray-400">Free to start</p>
          </div>
          <div className="p-4 bg-[#1a1a1a] rounded-xl shadow-sm border border-[#333]">
            <div className="w-8 h-8 bg-indigo-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
              <CheckIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-xs text-gray-400">No credit card</p>
          </div>
          <div className="p-4 bg-[#1a1a1a] rounded-xl shadow-sm border border-[#333]">
            <div className="w-8 h-8 bg-indigo-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
              <CheckIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-xs text-gray-400">Cancel anytime</p>
          </div>
        </div>
      </div>
    </div>
  );
} 