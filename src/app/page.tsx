'use client';

import { supabase } from "./utils/supabase";
import { useEffect, useState } from "react";
import Image from "next/image";
import { User } from "@supabase/supabase-js";

export default function Home() {
  const [captions, setCaptions] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true); // Indicate loading while redirecting
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: process.env.NEXT_PUBLIC_AUTH_CALLBACK_URL || 'https://thehumorproject1.vercel.app/auth/callback',
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      }
      // If no error, redirect happens automatically, so loading remains true
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message);
      } else {
        setUser(null); // Clear user state on sign out
        setCaptions(null); // Clear captions
        setHasCheckedSession(false); // Reset session check to trigger new sign-in attempt
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  useEffect(() => {
    const checkSessionAndFetchData = async () => {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        setError(sessionError.message);
        setLoading(false);
        setHasCheckedSession(true);
        return;
      }

      setUser(session?.user || null);

      if (!session) {
        console.log("No active session found.");
        // Removed automatic redirect to sign in
      } else {
        // Only fetch captions if a user is logged in
        const { data, error: captionsError } = await supabase
          .from("captions")
          .select(`
            *,
            images (
              url,
              image_description
            )
          `);
        if (captionsError) {
          setError(captionsError.message);
        } else {
          setCaptions(data);
        }
        setLoading(false);
      }
      setHasCheckedSession(true);
    };

    if (!hasCheckedSession) {
      checkSessionAndFetchData();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          setHasCheckedSession(false); // Re-check session and re-fetch data on auth change
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [hasCheckedSession]); // Rerun effect when hasCheckedSession changes to trigger re-check on auth events

  if (loading || !hasCheckedSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
          <h1 className="text-6xl font-extrabold text-pink-600 dark:text-pink-400">
            {loading ? "Loading..." : "Checking authentication..."}
          </h1>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
          <h1 className="text-6xl font-extrabold text-red-600 dark:text-red-400">
            Error: {error}
          </h1>
        </main>
      </div>
    );
  }

  // Display content only if user is logged in
    return (
      <div className="flex min-h-screen items-start justify-center font-sans" style={{ backgroundColor: '#FAF4EA', paddingTop: '2rem', paddingLeft: '2rem' }}>
        <div className="flex flex-col md:flex-row items-start w-full max-w-7xl p-8">
          {/* Left Side: Title */}
          <div className="flex-1 mb-8 md:mb-0">
            <h1 className="text-8xl font-bold font-paprika text-gray-800">Humor Study</h1>
          </div>

          {/* Right Side: Centered Card */}
          <div className="flex-1 flex justify-center items-center">
            <div
              className="p-10 rounded-lg shadow-xl text-center max-w-sm w-full"
              style={{
                backgroundColor: 'white', // Base for grid
                backgroundImage: 'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)',
                backgroundSize: '30px 30px', // Increased size
              }}
            >
              <h2 className="text-3xl font-bold mb-8 text-gray-800">START RATING MEMES</h2>
              <button
                onClick={handleGoogleSignIn}
                className="w-full px-6 py-4 rounded-full text-xl font-philosopher text-gray-800 transition-colors active:scale-95 duration-100" // Added pressing animation
                style={{ backgroundColor: '#CBE6FF' }}
              >
                SIGN IN
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-extrabold text-pink-600 dark:text-pink-400 text-center flex-grow">
            The Humor Project Captions
          </h1>
          {user && (
            <div className="text-right">
              <p className="text-gray-800 dark:text-white mb-2">Welcome, {user?.email}!</p>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {captions && captions!.map((caption) => (
            <div key={caption.id} className="bg-white dark:bg-zinc-800 rounded-lg shadow-md overflow-hidden">
              {caption.images && caption.images.url && (
                <Image
                  src={caption.images.url}
                  alt={caption.images.image_description || "Caption image"}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <p className="text-gray-800 dark:text-white">{caption.content}</p>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Likes: {caption.like_count}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
