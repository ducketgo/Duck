'use client';

import { getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type User } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { isFirebaseAuthConfigured } from '@/lib/supabase/config';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function getFirebaseApp() {
  if (!isFirebaseAuthConfigured()) throw new Error('La configuration Web Firebase est incomplète.');
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export async function ensureSupabaseClaims(user: User, options: { acceptedTerms?: boolean; username?: string } = {}) {
  const current = await user.getIdTokenResult();
  const roleReady = current.claims.role === 'authenticated';
  const termsReady = options.acceptedTerms !== true || current.claims.terms_version === '2026-11-07-v1';
  const usernameReady = options.username === undefined || current.claims.username === options.username;
  if (roleReady && termsReady && usernameReady) return current;

  const region = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION || 'asia-southeast1';
  const functions = getFunctions(getFirebaseApp(), region);
  const ensureClaims = httpsCallable(functions, 'ensureSupabaseRole');
  await ensureClaims(options);
  await user.getIdToken(true);
  return user.getIdTokenResult();
}
