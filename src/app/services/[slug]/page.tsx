import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { services } from '@/lib/services';
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return services.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find(s => s.slug === slug);
  return {
    title: service?.name ?? 'Service DUCK',
    description: service?.description ?? 'Service de l écosystème DUCK.',
    keywords: service ? [service.name, service.tagline, ...service.features, 'duck', 'écosystème'] : ['duck'],
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = services.find(s => s.slug === slug);
  if (!service) notFound();
  const Icon = service.icon;
  return (
    <div className="wrap page-wrap service-detail">
      <Link href="/services" className="back-link"><ArrowLeft size={16}/> Tous les services</Link>
      <span className={`branch-icon detail-icon ${service.color}`}><Icon size={24}/></span>
      <span className="section-kicker">ÉCOSYSTÈME DUCK</span>
      <h1 className="page-title">{service.name}<br/><span>{service.tagline}.</span></h1>
      <span className="status-pill">{service.status}</span>
      <p className="page-lede">{service.description}</p>
      <div className="feature-panel"><span className="section-kicker">CAPS ET FONCTIONNALITÉS</span>{service.features.map((feature, i) => <div className="feature-line" key={feature}><span>0{i + 1}</span><p>{feature}</p><ArrowUpRight size={15}/></div>)}</div>
      {slug === 'djduck' && (
        <div className="feature-panel" style={{ marginTop: 24 }}>
          <span className="section-kicker">ÉCOUTE DJ DUCK</span>
          <iframe
            width="100%"
            height="300"
            scrolling="no"
            frameBorder="no"
            allow="autoplay; encrypted-media"
            src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/soundcloud%253Aplaylists%253A2317906317&color=%23000df7&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"
            title="Playlist DjDuck"
            style={{ borderRadius: 12, marginTop: 12 }}
          />
          <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a className="button button-small" href="https://suno.com/@djduck2013" target="_blank" rel="noreferrer">Écouter sur Suno 🎵 <ArrowUpRight size={14}/></a>
            <a className="button button-small" href="https://soundcloud.com/djduck2026" target="_blank" rel="noreferrer">Écouter sur SoundCloud <ArrowUpRight size={14}/></a>
          </div>
          <div style={{ fontSize: 10, color: '#cccccc', lineBreak: 'anywhere', wordBreak: 'normal', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontFamily: 'Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif', fontWeight: 100, marginTop: 8 }}>
            <a href="https://soundcloud.com/djduck2026" title="DJ DUCK" target="_blank" rel="noreferrer" style={{ color: '#cccccc', textDecoration: 'none' }}>DJ DUCK</a>
            {' · '}
            <a href="https://soundcloud.com/djduck2026/sets/creation-groupe-1" title="Playlist DjDuck" target="_blank" rel="noreferrer" style={{ color: '#cccccc', textDecoration: 'none' }}>Playlist DjDuck</a>
          </div>
        </div>
      )}
      {slug === 'duckdev' && (
        <div className="feature-panel" style={{ marginTop: 24 }}>
          <span className="section-kicker">DUCKDEV EN LIGNE</span>
          <p className="page-lede" style={{ marginTop: 8 }}>Découvre le site DuckDev hébergé sur Netlify.</p>
          <iframe
            src="https://ducketgo.netlify.app"
            title="DuckDev - DucketGo"
            width="100%"
            height="600"
            style={{ border: 0, borderRadius: 12, marginTop: 12, background: '#fff' }}
            loading="lazy"
          />
          <div style={{ marginTop: 12 }}>
            <a className="button button-small" href="https://ducketgo.netlify.app" target="_blank" rel="noreferrer">Ouvrir dans un nouvel onglet <ArrowUpRight size={14}/></a>
          </div>
        </div>
      )}
      <p className="honesty-note">Cette page présente le périmètre prévu. Seules les fonctions explicitement marquées comme disponibles sont actuellement opérationnelles.</p>
    </div>
  );
}
