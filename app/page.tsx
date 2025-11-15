'use client';

import { useEffect, useState } from 'react';
import { clientId, redirectToAuthCodeFlow } from './script';

// Force dynamic rendering to avoid static generation issues with localStorage
export const dynamic = 'force-dynamic';

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedProfile = localStorage.getItem('spotify_profile');
    if (storedProfile) {
      try {
        const profileData = JSON.parse(storedProfile);
        console.log('Loaded profile from localStorage:', profileData);
        
        // Ensure images array exists even if missing
        if (!profileData.images) {
          profileData.images = [];
        }
        
        populateUI(profileData);
      } catch (error) {
        console.error('Error parsing stored profile:', error);
        // Clear invalid data and redirect to auth
        localStorage.removeItem('spotify_profile');
        redirectToAuthCodeFlow(clientId);
      }
    } else {
      redirectToAuthCodeFlow(clientId);
    }
  }, []);

  function populateUI(profile: UserProfile) {
    setProfile(profile);
    setLoading(false);
  }

  function handleLogout() {
    // Clear all Spotify-related data from localStorage
    localStorage.removeItem('spotify_profile');
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('verifier');
    
    // Clear profile state
    setProfile(null);
    setLoading(true);
    
    // Redirect to auth flow
    redirectToAuthCodeFlow(clientId);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{profile.display_name}</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
      
      {profile.images?.[0] && (
        <div id="avatar" className="mb-4">
          <img 
            src={profile.images[0].url} 
            alt="Profile" 
            width={200} 
            height={200}
            className="rounded-full"
          />
        </div>
      )}
      
      <div className="space-y-2">
        <p><strong>ID:</strong> <span id="id">{profile.id}</span></p>
        <p><strong>Email:</strong> <span id="email">{profile.email}</span></p>
        <p><strong>URI:</strong> <a id="uri" href={profile.external_urls?.spotify || '#'} className="text-blue-600 hover:underline">{profile.uri}</a></p>
        <p><strong>URL:</strong> <a id="url" href={profile.href} className="text-blue-600 hover:underline">{profile.href}</a></p>
        <p><strong>Image URL:</strong> <span id="imgUrl">{profile.images[0]?.url ?? '(no profile image)'}</span></p>
      </div>
    </div>
  );
}

