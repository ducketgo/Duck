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
export default async function ServicePage({ params }: Props) { const { slug } = await params; const service = services.find(s => s.slug === slug); if (!service) notFound(); const Icon = service.icon; return <div className="wrap page-wrap service-detail"><Link href="/services" className="back-link"><ArrowLeft size={16}/> Tous les services</Link><span className={`branch-icon detail-icon ${service.color}`}><Icon size={24}/></span><span className="section-kicker">ÉCOSYSTÈME DUCK</span><h1 className="page-title">{service.name}<br/><span>{service.tagline}.</span></h1><span className="status-pill">{service.status}</span><p className="page-lede">{service.description}</p><div className="feature-panel"><span className="section-kicker">CAPS ET FONCTIONNALITÉS</span>{service.features.map((feature, i) => <div className="feature-line" key={feature}><span>0{i + 1}</span><p>{feature}</p><ArrowUpRight size={15}/></div>)}</div><p className="honesty-note">Cette page présente le périmètre prévu. Seules les fonctions explicitement marquées comme disponibles sont actuellement opérationnelles.</p></div> }
