import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-8 card text-center">
        <h2 className="text-3xl font-extrabold text-red-600 dark:text-red-400">Authentication Error</h2>
        <p className="mt-4 text-gray-600 dark:text-gray-300">Something went wrong during authentication. Please try again.</p>
        <Link href="/auth/signin" className="btn-primary mt-6">Back to Sign In</Link>
      </div>
    </div>
  );
} 