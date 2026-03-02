'use client';

import { supabase } from "../utils/supabase";
import { useEffect, useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

interface HistoryItem {
  id: string;
  url: string;
  captions: string[];
  created_at: string;
}

export default function UploadPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [captions, setCaptions] = useState<any[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const router = useRouter();

  const API_BASE_URL = "https://api.almostcrackd.ai";

  const fetchHistory = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('images')
        .select(`
          id,
          url,
          created_datetime_utc,
          captions (
            content
          )
        `)
        .eq('profile_id', userId)
        .order('created_datetime_utc', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedHistory: HistoryItem[] = data.map((item: any) => ({
          id: item.id,
          url: item.url,
          created_at: item.created_datetime_utc,
          captions: item.captions?.map((c: any) => c.content) || []
        }));
        setHistory(formattedHistory);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
      } else {
        setUser(session.user);
        fetchHistory(session.user.id);
      }
      setLoading(false);
    };
    checkUser();
  }, [router, fetchHistory]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setCaptions([]);
      setStatus("");
    }
  };

  const handleUpload = async () => {
    if (!image || !user) return;
    
    setUploading(true);
    setCaptions([]);
    setStatus("Getting upload URL...");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");
      const token = session.access_token;

      // Step 1: Generate Presigned URL
      const presignedRes = await fetch(`${API_BASE_URL}/pipeline/generate-presigned-url`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ contentType: image.type })
      });

      if (!presignedRes.ok) throw new Error("Failed to generate presigned URL");
      const { presignedUrl, cdnUrl } = await presignedRes.json();

      // Step 2: Upload Image Bytes to presignedUrl
      setStatus("Uploading image...");
      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": image.type
        },
        body: image
      });

      if (!uploadRes.ok) throw new Error("Failed to upload image to storage");

      // Step 3: Register Image URL in the Pipeline
      setStatus("Registering image...");
      const registerRes = await fetch(`${API_BASE_URL}/pipeline/upload-image-from-url`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          imageUrl: cdnUrl,
          isCommonUse: false
        })
      });

      if (!registerRes.ok) throw new Error("Failed to register image");
      const { imageId } = await registerRes.json();

      // Step 4: Generate Captions
      setStatus("Generating captions...");
      const captionsRes = await fetch(`${API_BASE_URL}/pipeline/generate-captions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ imageId })
      });

      if (!captionsRes.ok) throw new Error("Failed to generate captions");
      const data = await captionsRes.json();
      
      const newCaptions = Array.isArray(data) ? data : [];
      setCaptions(newCaptions);
      setStatus("Done!");
      
      // Refresh history to show the new upload
      fetchHistory(user.id);
    } catch (err: any) {
      console.error("Pipeline error:", err);
      setStatus(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF4EA] font-philosopher pl-64">
        <h1 className="text-4xl font-bold text-gray-800">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col font-philosopher pl-64" style={{ backgroundColor: '#FAF4EA' }}>
      {/* Sign Out Button */}
      <button
        onClick={handleSignOut}
        className="fixed top-6 right-6 px-4 py-2 bg-white/50 hover:bg-white/80 border border-gray-300 rounded-full text-sm font-semibold text-gray-700 transition-colors z-50 font-philosopher"
      >
        SIGN OUT
      </button>

      {/* Main Upload Section */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col md:flex-row items-center w-full max-w-7xl p-8">
          {/* Left Side: Title */}
          <div className="flex-1 mb-8 md:mb-0">
            <h1 className="text-8xl font-bold font-paprika text-gray-800">Humor Study</h1>
            <p className="mt-6 text-3xl font-bold text-gray-600 font-philosopher">
              Upload & Caption
            </p>
          </div>

          {/* Right Side: Upload View */}
          <div className="flex-[2] flex flex-col items-center gap-8">
            <div 
              className="w-[500px] h-[500px] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col items-center justify-center border-[12px] border-white relative group cursor-pointer"
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                    <circle cx="9" cy="9" r="2"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                  <span className="text-xl font-bold">Click to select image</span>
                </div>
              )}
              <input 
                id="fileInput"
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

            <div className="flex flex-col items-center gap-4">
              {image && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-12 py-4 rounded-full text-2xl font-bold transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#CBE6FF', color: '#1f2937' }}
                >
                  {uploading ? 'PROCESSING...' : 'GENERATE CAPTIONS'}
                </button>
              )}
              {status && (
                <p className={`text-xl font-bold ${status.startsWith('Error') ? 'text-red-500' : 'text-gray-600'}`}>
                  {status}
                </p>
              )}
            </div>

            {captions.length > 0 && (
              <div className="w-full max-w-2xl mt-8 flex flex-col gap-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Resulting Captions:</h3>
                {captions.map((caption, index) => (
                  <div 
                    key={index} 
                    className="p-6 bg-white rounded-2xl shadow-md border-l-8 border-[#CBE6FF] text-xl font-bold text-gray-800"
                  >
                    {caption.content || caption}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div className="w-full max-w-7xl mx-auto px-8 pb-24">
          <h2 className="text-5xl font-bold font-paprika text-gray-800 mb-12 border-b-4 border-white pb-4 inline-block">Your History</h2>
          <div className="grid grid-cols-1 gap-16">
            {history.map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row gap-12 bg-white/40 p-10 rounded-3xl backdrop-blur-sm border border-white/50 shadow-xl">
                <div className="w-full md:w-[350px] aspect-square bg-white rounded-2xl shadow-lg overflow-hidden border-[8px] border-white flex-shrink-0">
                  <img src={item.url} alt="Uploaded" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 flex flex-col gap-4">
                  <div className="text-sm text-gray-500 font-bold uppercase tracking-widest">
                    {new Date(item.created_at).toLocaleDateString(undefined, { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="flex flex-col gap-4 mt-2">
                    {item.captions.map((caption, idx) => (
                      <div 
                        key={idx} 
                        className="p-5 bg-white rounded-xl shadow-sm border-l-4 border-[#CBE6FF] text-lg font-bold text-gray-800"
                      >
                        {caption}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
