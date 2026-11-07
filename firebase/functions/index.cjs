const { initializeApp, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { HttpsError, onCall } = require('firebase-functions/v2/https');

if (getApps().length === 0) initializeApp();

const termsVersion = '2026-11-07-v1';
const adminEmail = 'duckdev-service@protonmail.com';

exports.ensureSupabaseRole = onCall({ region: 'asia-southeast1' }, async request => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign-in required.');

  const acceptedTerms = request.data?.acceptedTerms;
  if (acceptedTerms !== undefined && acceptedTerms !== true) {
    throw new HttpsError('invalid-argument', 'Terms acceptance is required.');
  }
  if (request.auth.token.email_verified !== true && acceptedTerms !== true) {
    throw new HttpsError('failed-precondition', 'Verify your email address first.');
  }

  const username = request.data?.username;
  if (username !== undefined && (typeof username !== 'string' || !/^[A-Za-z0-9_]{3,24}$/.test(username))) {
    throw new HttpsError('invalid-argument', 'Invalid username.');
  }

  const auth = getAuth();
  const user = await auth.getUser(request.auth.uid);
  if (acceptedTerms !== true && !user.customClaims?.terms_version) {
    throw new HttpsError('failed-precondition', 'Accept the current terms before continuing.');
  }
  const claims = { ...(user.customClaims || {}), role: 'authenticated' };

  if (acceptedTerms === true) {
    claims.terms_version = termsVersion;
    claims.terms_accepted_at = new Date().toISOString();
  }
  if (username !== undefined) claims.username = username;
  if (user.emailVerified && user.email?.toLowerCase() === adminEmail) claims.admin = true;
  else delete claims.admin;

  await auth.setCustomUserClaims(user.uid, claims);
  return { ok: true };
});
