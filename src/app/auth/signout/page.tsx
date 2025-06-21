import Link from 'next/link';

export default function SignOutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-8 card text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">You have been signed out</h2>
        <p className="mt-4 text-gray-600 dark:text-gray-300">Thank you for visiting. You can sign in again to access your account.</p>
        <Link href="/auth/signin" className="btn-primary mt-6">Sign In Again</Link>
      </div>
    </div>
  );
} 