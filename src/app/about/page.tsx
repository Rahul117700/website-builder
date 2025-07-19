import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center px-4 py-20">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-10 border border-purple-100 dark:border-slate-700">
        <h1 className="text-4xl font-extrabold text-purple-700 mb-4 text-center">About Us</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 text-center">
          Website Builder is on a mission to empower everyone to create beautiful, professional websites with ease. Our platform combines AI-powered tools, a visual editor, and a marketplace of modern templates to help you launch and grow your online presence—no coding required.
        </p>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Our Values</h2>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <li className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <span className="text-purple-600 text-2xl font-bold">🚀</span>
              <div className="font-semibold mt-2">Innovation</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">We use the latest technology to make website building fast, fun, and future-proof.</div>
            </li>
            <li className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <span className="text-purple-600 text-2xl font-bold">🤝</span>
              <div className="font-semibold mt-2">Empowerment</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">We believe everyone should have the tools to build their dream online—no matter their background.</div>
            </li>
            <li className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <span className="text-purple-600 text-2xl font-bold">🌐</span>
              <div className="font-semibold mt-2">Community</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">We foster a supportive community where users can learn, share, and grow together.</div>
            </li>
          </ul>
        </div>
        <div className="text-center mt-8">
          <Link href="/" className="inline-block px-6 py-2 rounded-full bg-purple-600 text-white font-bold shadow hover:bg-purple-700 transition">Back to Home</Link>
        </div>
      </div>
    </div>
  );
} 