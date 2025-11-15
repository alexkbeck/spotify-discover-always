'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clientId, getAccessToken, fetchProfile } from '../script';

// Force dynamic rendering to avoid static generation issues with localStorage
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function CallbackPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleCallback = async () => {
      // Get search params directly from URL to avoid useSearchParams() prerender issues
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const errorParam = params.get('error');

      if (errorParam) {
        setError(`Authorization failed: ${errorParam}`);
        setLoading(false);
        return;
      }

      if (!code) {
        setError('No authorization code received');
        setLoading(false);
        return;
      }

      try {
        const accessToken = await getAccessToken(clientId, code);
        const profileData = await fetchProfile(accessToken);
        console.log(profileData);
        setProfile(profileData);
        
        // Store profile and token in localStorage
        localStorage.setItem('spotify_profile', JSON.stringify(profileData));
        localStorage.setItem('spotify_access_token', accessToken);
        
        // Redirect to home page after successful authentication
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to authenticate. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <p>Completing authentication...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="text-center">
        <p className="mb-4">Authentication successful! Redirecting...</p>
        {profile && (
          <p className="text-sm text-gray-600">Logged in as {profile.display_name}</p>
        )}
      </div>
    </div>
  );
}

