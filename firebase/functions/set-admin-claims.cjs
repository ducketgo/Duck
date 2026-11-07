const { applicationDefault, initializeApp, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const projectId = 'duckauth2026';
const adminEmail = 'duckdev-service@protonmail.com';
const termsVersion = '2026-11-07-v1';

async function main() {
  if (!process.argv.includes('--accept-terms')) {
    throw new Error('Pass --accept-terms only after the account owner has accepted the current DUCK terms.');
  }
  if (getApps().length === 0) initializeApp({ credential: applicationDefault(), projectId });
  const auth = getAuth();
  const user = await auth.getUserByEmail(adminEmail);
  if (!user.emailVerified) throw new Error('Verify the Firebase account email before assigning admin claims.');

  await auth.setCustomUserClaims(user.uid, {
    ...(user.customClaims || {}),
    role: 'authenticated',
    admin: true,
    terms_version: termsVersion,
    terms_accepted_at: new Date().toISOString(),
  });
  process.stdout.write(`Claims assigned to ${adminEmail}. Sign in again to refresh the Firebase ID token.\n`);
}

main().catch(error => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
