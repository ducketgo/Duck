import type { Metadata } from 'next';
import './globals.css';
import { SiteShell } from '@/components/site-shell';
import { getPublicOrigin } from '@/lib/supabase/config';

const origin = getPublicOrigin();

export const metadata: Metadata = {
  title: { default: 'DUCK — Apprendre, avancer et performer.', template: '%s · DUCK' },
  description: 'Un écosystème numérique ouvert pour apprendre, créer et avancer ensemble.',
  applicationName: 'DUCK',
  metadataBase: origin ?? undefined,
  alternates: origin ? { canonical: '/' } : undefined,
  openGraph: { type: 'website', locale: 'fr_FR', siteName: 'DUCK', title: 'DUCK — Apprendre, avancer et performer.', description: 'Un écosystème numérique ouvert pour apprendre, créer et avancer ensemble.' },
  twitter: { card: 'summary', title: 'DUCK — Apprendre, avancer et performer.', description: 'Un écosystème numérique ouvert pour apprendre, créer et avancer ensemble.' },
  robots: { index: Boolean(origin && process.env.NODE_ENV === 'production'), follow: Boolean(origin && process.env.NODE_ENV === 'production') },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body><SiteShell>{children}</SiteShell></body></html>;
}
