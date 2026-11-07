import type { MetadataRoute } from 'next';
import { getPublicOrigin } from '@/lib/supabase/config';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const origin = getPublicOrigin();
  if (!origin || process.env.NODE_ENV !== 'production') return { rules: { userAgent: '*', disallow: '/' } };
  return { rules: { userAgent: '*', allow: '/' }, sitemap: new URL('/sitemap.xml', origin).toString() };
}
