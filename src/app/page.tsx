'use client';

import { supabase } from "./utils/supabase";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

// Thumbs Up SVG
const ThumbsUpIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 10v12" />
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
  </svg>
);

// Thumbs Down SVG
const ThumbsDownIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 14V2" />
    <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
  </svg>
);

export default function Home() {
  const [captions, setCaptions] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
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
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleVote = async (value: number) => {
    if (!user || !captions || !captions[currentIndex]) return;

    const currentCaption = captions[currentIndex];

    try {
      const { error } = await supabase
        .from('caption_votes')
        .insert({
          vote_value: value,
          profile_id: user.id,
          caption_id: currentCaption.id,
          created_datetime_utc: new Date().toISOString()
        });

      if (error) {
        console.error('Error voting:', error);
        alert('Error submitting vote: ' + error.message);
      } else {
        // Move to next caption
        setCurrentIndex((prev) => prev + 1);
      }
    } catch (err: any) {
      console.error('Error in handleVote:', err);
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

      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        const { data, error: captionsError } = await supabase
          .from("captions")
          .select(`
            *,
            images (
              url,
              image_description
            )
          `)
          .eq('is_public', true);

        if (captionsError) {
          setError(captionsError.message);
        } else if (data) {
          // Randomly select 5 captions
          const shuffled = [...data].sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, 5);
          setCaptions(selected);
        }
      }
      setLoading(false);
      setHasCheckedSession(true);
    };

    if (!hasCheckedSession) {
      checkSessionAndFetchData();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          setHasCheckedSession(false);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [hasCheckedSession]);

  if (loading || !hasCheckedSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF4EA] font-philosopher">
        <h1 className="text-4xl font-bold text-gray-800">Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF4EA] font-philosopher">
        <h1 className="text-4xl font-bold text-gray-800">Error: {error}</h1>
      </div>
    );
  }

  // If not logged in, show Landing Page
  if (!user) {
    return (
      <div className="flex min-h-screen items-start justify-center font-philosopher" style={{ backgroundColor: '#FAF4EA', paddingTop: '2rem', paddingLeft: '2rem' }}>
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
                backgroundColor: 'white',
                backgroundImage: 'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)',
                backgroundSize: '30px 30px',
              }}
            >
              <h2 className="text-3xl font-bold mb-8 text-gray-800">START RATING MEMES</h2>
              <button
                onClick={handleGoogleSignIn}
                className="w-full px-6 py-4 rounded-full text-xl font-philosopher text-gray-800 transition-colors active:scale-95 duration-100"
                style={{ backgroundColor: '#CBE6FF' }}
              >
                SIGN IN
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message);
      } else {
        setUser(null);
        setCaptions(null);
        setHasCheckedSession(false);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  // If logged in, show Rating Page
  const currentCaption = captions?.[currentIndex];

  return (
    <div className="flex min-h-screen items-start justify-center font-philosopher" style={{ backgroundColor: '#FAF4EA', paddingTop: '2rem', paddingLeft: '2rem' }}>
      {/* Sign Out Button (Fixed at top right) */}
      <button
        onClick={handleSignOut}
        className="fixed top-6 right-6 px-4 py-2 bg-white/50 hover:bg-white/80 border border-gray-300 rounded-full text-sm font-semibold text-gray-700 transition-colors z-50 font-philosopher"
      >
        SIGN OUT
      </button>

      <div className="flex flex-col md:flex-row items-start w-full max-w-7xl p-8">
        {/* Left Side: Title */}
        <div className="flex-1 mb-8 md:mb-0">
          <h1 className="text-8xl font-bold font-paprika text-gray-800">Humor Study</h1>
        </div>

        {/* Right Side: Rating View */}
        <div className="flex-[2] flex justify-center items-center gap-12 mt-12">
          {currentCaption ? (
            <div className="flex items-center gap-12">
              {/* Voting Buttons (Left of image) */}
              <div className="flex flex-col gap-6">
                <button
                  onClick={() => handleVote(1)}
                  className="w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-90 hover:brightness-105 shadow-md"
                  style={{ backgroundColor: '#a0d0ff' }}
                  title="Thumbs Up"
                >
                  <ThumbsUpIcon />
                </button>
                <button
                  onClick={() => handleVote(-1)}
                  className="w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-90 hover:brightness-105 shadow-md"
                  style={{ backgroundColor: '#dc99b5' }}
                  title="Thumbs Down"
                >
                  <ThumbsDownIcon />
                </button>
              </div>

              {/* Meme Container */}
              <div className="flex flex-col items-center">
                <p className="mb-4 text-lg text-gray-500 font-philosopher">
                  {captions.length - currentIndex} captions remaining
                </p>
                <div className="w-[500px] h-[500px] bg-white rounded-xl shadow-2xl overflow-hidden flex items-center justify-center border-[12px] border-white">
                  {currentCaption.images?.url ? (
                    <img
                      src={currentCaption.images.url}
                      alt={currentCaption.images.image_description || "Meme"}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400 font-bold text-xl">No Image Available</div>
                  )}
                </div>
                {/* Caption Text Below Image */}
                <p className="mt-8 text-3xl font-bold text-gray-800 text-center max-w-[500px] leading-tight">
                  {currentCaption.content}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center p-12 bg-white rounded-2xl shadow-xl">
              <h2 className="text-3xl font-bold text-gray-800">All caught up!</h2>
              <p className="text-gray-600 mt-4 text-xl">You have rated all available captions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
