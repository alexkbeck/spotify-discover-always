'use client';

import { sha256 } from 'js-sha256';

export const clientId = "93a99fc1bd3649e7be64cb9004f844cf";

function generateCodeVerifier(length: number): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function generateCodeChallenge(codeVerifier: string): string {
  // Use js-sha256 which works in non-secure contexts (unlike crypto.subtle)
  // This allows us to use IP addresses for Spotify redirect URIs
  const hash = sha256(codeVerifier);
  
  // Convert hex string to base64url format
  // First, convert hex to binary
  const binaryString = hash.match(/.{1,2}/g)!.map(byte => String.fromCharCode(parseInt(byte, 16))).join('');
  
  // Convert to base64, then make it URL-safe
  return btoa(binaryString)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function redirectToAuthCodeFlow(clientId: string) {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called in the browser');
  }

  const verifier = generateCodeVerifier(128);
  const challenge = generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", "https://spotify-discover-always-nine.vercel.app/callback");
  params.append("scope", "user-read-private user-read-email");
  params.append("code_challenge", challenge);
  params.append("code_challenge_method", "S256");

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function getAccessToken(clientId: string, code: string): Promise<string> {
  const verifier = localStorage.getItem("verifier");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", "https://spotify-discover-always-nine.vercel.app/callback");
  params.append("code_verifier", verifier!);

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });

  const { access_token } = await result.json();
  return access_token;
}

export async function fetchProfile(token: string): Promise<UserProfile> {
  const result = await fetch("https://api.spotify.com/v1/me", {
    method: "GET", headers: { Authorization: `Bearer ${token}` }
  });

  return await result.json();
}

