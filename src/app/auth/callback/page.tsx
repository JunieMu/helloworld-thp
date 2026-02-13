'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // User is authenticated, redirect to home page
        router.push('/');
      } else {
        // Handle cases where session is not found or error
        // (e.g., redirect to login or show an error message)
        router.push('/login'); // Redirect to a login page or homepage
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          router.push('/');
        }
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-extrabold text-pink-600 dark:text-pink-400">
          Processing Authentication...
        </h1>
      </main>
    </div>
  );
}
