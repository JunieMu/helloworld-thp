'use client';

import Link from 'next/link';

export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF4EA] font-philosopher">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-gray-600 mb-8">
          There was an error during the authentication process. This could be due to an expired or invalid code.
        </p>
        <Link 
          href="/"
          className="px-6 py-3 bg-[#CBE6FF] text-gray-800 rounded-full font-bold hover:brightness-105 transition-all active:scale-95"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
