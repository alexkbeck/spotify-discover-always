'use client';

import { useEffect, useState } from 'react';
import { clientId, redirectToAuthCodeFlow } from './script';

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedProfile = localStorage.getItem('spotify_profile');
    if (storedProfile) {
      const profileData = JSON.parse(storedProfile);
      populateUI(profileData);
    } else {
      redirectToAuthCodeFlow(clientId);
    }
  }, []);

  function populateUI(profile: UserProfile) {
    setProfile(profile);
    setLoading(false);
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
      <h1 className="text-3xl font-bold mb-4">{profile.display_name}</h1>
      
      {profile.images[0] && (
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
        <p><strong>URI:</strong> <a id="uri" href={profile.external_urls.spotify} className="text-blue-600 hover:underline">{profile.uri}</a></p>
        <p><strong>URL:</strong> <a id="url" href={profile.href} className="text-blue-600 hover:underline">{profile.href}</a></p>
        <p><strong>Image URL:</strong> <span id="imgUrl">{profile.images[0]?.url ?? '(no profile image)'}</span></p>
      </div>
    </div>
  );
}

