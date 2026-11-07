import type { MetadataRoute } from 'next';
import { services } from '@/lib/services';
import { getPublicOrigin } from '@/lib/supabase/config';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getPublicOrigin();
  if (!origin || process.env.NODE_ENV !== 'production') return [];
  const paths = ['/', '/about', '/services', '/software', '/journal', '/legal', '/privacy', '/terms', ...services.map(service => `/services/${service.slug}`)];
  return paths.map(path => ({ url: new URL(path, origin).toString(), changeFrequency: path === '/' ? 'weekly' : 'monthly', priority: path === '/' ? 1 : 0.6 }));
}
