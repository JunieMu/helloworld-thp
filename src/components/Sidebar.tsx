'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/app/utils/supabase';
import { User } from '@supabase/supabase-js';

export default function Sidebar() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!user) return null;

  return (
    <div 
      className="fixed left-0 top-0 h-screen w-64 border-r border-gray-200 p-8 flex flex-col gap-6 font-philosopher z-40 bg-white/30 backdrop-blur-md"
      style={{ borderRightColor: 'rgba(0,0,0,0.05)' }}
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-paprika text-gray-800">Menu</h2>
      </div>

      <nav className="flex flex-col gap-4">
        <Link 
          href="/" 
          className={`px-6 py-4 rounded-2xl text-xl font-semibold transition-all duration-200 active:scale-95 ${
            pathname === '/' 
              ? 'bg-[#CBE6FF] text-gray-800 shadow-md' 
              : 'text-gray-600 hover:bg-white/50'
          }`}
        >
          Rating
        </Link>
        <Link 
          href="/upload" 
          className={`px-6 py-4 rounded-2xl text-xl font-semibold transition-all duration-200 active:scale-95 ${
            pathname === '/upload' 
              ? 'bg-[#CBE6FF] text-gray-800 shadow-md' 
              : 'text-gray-600 hover:bg-white/50'
          }`}
        >
          Upload
        </Link>
      </nav>

      <div className="mt-auto pt-8">
        <div className="text-sm text-gray-400 font-medium">
          Logged in as:
          <div className="text-gray-600 truncate">{user.email}</div>
        </div>
      </div>
    </div>
  );
}
