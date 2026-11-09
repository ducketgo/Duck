import type { Metadata } from 'next';
import './globals.css';
import { SiteShell } from '@/components/site-shell';
import { getPublicOrigin } from '@/lib/supabase/config';
import { SEO_KEYWORDS } from '@/lib/seo-keywords';

const origin = getPublicOrigin();
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '57qw3X0k0H6kPEVo0i6jOdD3LawWPJXZBYJLLb8_VQY';

export const metadata: Metadata = {
  title: { default: 'DUCK — Apprendre, avancer et performer.', template: '%s · DUCK' },
  description: 'DUCK est un écosystème numérique ouvert pour apprendre, créer, jouer et avancer ensemble. Services, logiciels, jeux gratuits en ligne et communauté.',
  applicationName: 'DUCK',
  keywords: SEO_KEYWORDS,
  authors: [{ name: 'Léopold Bonin', url: 'https://duck.github.io' }],
  creator: 'DUCK',
  publisher: 'DUCK',
  metadataBase: origin ?? undefined,
  alternates: origin ? { canonical: '/' } : undefined,
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'DUCK',
    title: 'DUCK — Apprendre, avancer et performer.',
    description: 'DUCK est un écosystème numérique ouvert pour apprendre, créer, jouer et avancer ensemble.',
    url: origin?.toString(),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DUCK — Apprendre, avancer et performer.',
    description: 'DUCK est un écosystème numérique ouvert pour apprendre, créer, jouer et avancer ensemble.',
  },
  robots: {
    index: Boolean(origin && process.env.NODE_ENV === 'production'),
    follow: Boolean(origin && process.env.NODE_ENV === 'production'),
    googleBot: {
      index: Boolean(origin && process.env.NODE_ENV === 'production'),
      follow: Boolean(origin && process.env.NODE_ENV === 'production'),
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: { google: googleVerification },
  category: 'technology',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'DUCK',
  url: origin?.toString() ?? 'https://duck.github.io',
  logo: origin ? new URL('/icon.svg', origin).toString() : undefined,
  description: 'Écosystème numérique ouvert pour apprendre, créer et avancer ensemble.',
  founder: { '@type': 'Person', name: 'Léopold Bonin' },
};

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'DUCK',
  url: origin?.toString() ?? 'https://duck.github.io',
  inLanguage: 'fr-FR',
  potentialAction: {
    '@type': 'SearchAction',
    target: origin ? `${origin.toString()}search?q={search_term_string}` : undefined,
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <head>
        <meta name="google-site-verification" content={googleVerification} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
      </head>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
