function configured(value: string | undefined) {
  return Boolean(value && !/^your[_-]/i.test(value) && !/placeholder|replace[-_ ]?me/i.test(value));
}

export function isSupabaseAuthConfigured() {
  return isPlatformConfigured();
}

export function isPlatformConfigured() {
  return configured(process.env.NEXT_PUBLIC_SUPABASE_URL) && configured(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function isGuestTransferEnabled() {
  return process.env.NEXT_PUBLIC_GUEST_TRANSFER_ENABLED === 'true' && isPlatformConfigured();
}

export function isPublicRegistrationEnabled() {
  return process.env.NEXT_PUBLIC_DUCK_REGISTRATION_ENABLED === 'true' && isSupabaseAuthConfigured();
}

export function getBasePath() {
  return (process.env.NEXT_PUBLIC_BASE_PATH ?? '').trim().replace(/\/$/, '');
}

export function withBasePath(path: string) {
  return `${getBasePath()}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getPublicOrigin() {
  const value = process.env.NEXT_PUBLIC_APP_URL;
  if (!value || /^your[_-]/i.test(value)) return null;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    if (process.env.NODE_ENV === 'production' && (url.protocol !== 'https:' || ['localhost', '127.0.0.1'].includes(url.hostname))) return null;
    return url;
  } catch { return null; }
}
