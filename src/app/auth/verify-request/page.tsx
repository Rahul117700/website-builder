import Link from 'next/link';

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-8 card text-center">
        <h2 className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">Check your email</h2>
        <p className="mt-4 text-gray-600 dark:text-gray-300">A sign-in link has been sent to your email address. Please check your inbox and follow the instructions to continue.</p>
        <Link href="/auth/signin" className="btn-primary mt-6">Back to Sign In</Link>
      </div>
    </div>
  );
} 