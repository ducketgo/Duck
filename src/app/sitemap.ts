import type { MetadataRoute } from 'next';
import { services } from '@/lib/services';
import { DUCKFUN_GAMES } from '@/lib/duckfun-games';
import { createPlatformPublicClient } from '@/lib/supabase/platform';
import { getPublicOrigin } from '@/lib/supabase/config';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getPublicOrigin();
  if (!origin || process.env.NODE_ENV !== 'production') return [];

  const staticPaths = [
    '/',
    '/about',
    '/services',
    '/software',
    '/journal',
    '/legal',
    '/privacy',
    '/terms',
    '/concours',
    '/duckfun',
    '/transfer',
    '/auth/login',
    '/auth/signup',
  ];

  const servicePaths = services.map(service => `/services/${service.slug}`);
  const gamePaths = DUCKFUN_GAMES.map(game => `/duckfun/${game.slug}`);

  let softwarePaths: string[] = [];
  try {
    const supabase = createPlatformPublicClient();
    if (supabase) {
      const { data } = await supabase.from('software').select('slug').eq('is_published', true);
      softwarePaths = (data ?? []).map((item: { slug: string }) => `/software/${item.slug}`);
    }
  } catch {
    softwarePaths = [];
  }

  const allPaths = [...staticPaths, ...servicePaths, ...gamePaths, ...softwarePaths];

  return allPaths.map(path => ({
    url: new URL(path, origin).toString(),
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : path.startsWith('/duckfun/') ? 0.5 : 0.6,
    lastModified: new Date(),
  }));
}
