import type { MetadataRoute } from 'next';
import { getPublicOrigin } from '@/lib/supabase/config';

export default function manifest(): MetadataRoute.Manifest {
  const origin = getPublicOrigin();
  return {
    name: 'DUCK',
    short_name: 'DUCK',
    description: 'Écosystème numérique ouvert pour apprendre, créer et avancer ensemble.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0f14',
    theme_color: '#0b0f14',
    lang: 'fr',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    ...(origin ? { scope: origin.toString() } : {}),
  };
}