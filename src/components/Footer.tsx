import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col items-center gap-6 md:gap-4 md:flex-row md:justify-between md:items-center">
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="font-bold text-lg text-white">Website Builder</span>
          <span className="text-gray-400">© {new Date().getFullYear()} All rights reserved.</span>
        </div>
        <nav className="flex flex-wrap justify-center gap-6 text-sm font-medium">
          <Link href="/#features" className="text-gray-300 hover:text-purple-400 transition">Features</Link>
          <Link href="/#templates" className="text-gray-300 hover:text-purple-400 transition">Templates</Link>
          <Link href="/#pricing" className="text-gray-300 hover:text-purple-400 transition">Pricing</Link>
          <Link href="/about" className="text-gray-300 hover:text-purple-400 transition">About Us</Link>
          <Link href="/terms" className="text-gray-300 hover:text-purple-400 transition">Terms</Link>
          <Link href="/privacy" className="text-gray-300 hover:text-purple-400 transition">Privacy</Link>
        </nav>
        <div className="flex gap-4 justify-center">
          <a href="https://github.com/" target="_blank" rel="noopener" className="text-gray-400 hover:text-white transition">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.984-.399 3.003-.404 1.019.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.119 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.371.823 1.102.823 2.222v3.293c0 .322.218.694.825.576C20.565 21.796 24 17.299 24 12c0-6.627-5.373-12-12-12z"/></svg>
          </a>
          <a href="https://twitter.com/" target="_blank" rel="noopener" className="text-gray-400 hover:text-blue-400 transition">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 01-2.828.775 4.932 4.932 0 002.165-2.724c-.951.564-2.005.974-3.127 1.195a4.92 4.92 0 00-8.384 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.93-.856 2.01-.857 3.17 0 2.188 1.115 4.117 2.823 5.254a4.904 4.904 0 01-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 01-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 010 21.543a13.94 13.94 0 007.548 2.209c9.058 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0024 4.557z"/></svg>
          </a>
        </div>
      </div>
    </footer>
  );
} 