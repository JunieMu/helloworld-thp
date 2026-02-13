'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Explicitly log for debugging
    console.log('AuthCallback page loaded. Checking session...');

    const handleSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error fetching session:', error.message);
        router.push('/error?message=' + error.message); // Redirect to an error page
        return;
      }

      if (session) {
        console.log('Session found, redirecting to home.');
        router.push('/');
      } else {
        console.log('No session found, redirecting to login.');
        // Consider creating a dedicated /login page or redirecting to home and handling unauthenticated state there
        router.push('/login'); // Assuming a /login page exists or unauthenticated state is handled on home
      }
    };

    handleSession();

    // Listener for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        if (session) {
          console.log('Session active from listener, redirecting to home.');
          router.push('/');
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
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
