import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowDownToLine, ArrowLeft, ArrowUpRight, Github, PackageOpen } from 'lucide-react';
import { notFound } from 'next/navigation';
import { createPlatformPublicClient } from '@/lib/supabase/platform';

export const dynamic = 'force-dynamic';

type SoftwarePageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: SoftwarePageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createPlatformPublicClient();
  if (!supabase) return { title: 'Logiciel' };
  const { data } = await supabase.from('software').select('name').eq('slug', slug).eq('is_published', true).maybeSingle();
  return { title: data?.name ?? 'Logiciel' };
}

export default async function SoftwareDetailPage({ params }: SoftwarePageProps) {
  const { slug } = await params;
  const supabase = createPlatformPublicClient();
  if (!supabase) {
    return <div className="wrap page-wrap"><div className="notice">Configuration du catalogue nécessaire.</div></div>;
  }

  const { data: software, error } = await supabase
    .from('software')
    .select('slug, name, description, long_description, image_urls, categories, current_version, download_url, repository_url, documentation_url, branch')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error || !software) notFound();

  return <div className="wrap page-wrap service-detail">
    <Link href="/software" className="back-link"><ArrowLeft size={15}/> Tous les logiciels</Link>
    <div className="branch-icon cyan detail-icon"><PackageOpen size={22}/></div>
    <span className="section-kicker">{software.branch.toUpperCase()} · VERSION {software.current_version}</span>
    <h1 className="page-title">{software.name}</h1>
    <p className="page-lede">{software.description}</p>
    {software.long_description && <p className="honesty-note">{software.long_description}</p>}
    {software.categories?.length > 0 && <div className="feature-panel"><h2>Catégories</h2><p>{software.categories.join(' · ')}</p></div>}
    <div className="dashboard-actions">
      <a className="button" href={software.download_url} target="_blank" rel="noreferrer"><ArrowDownToLine size={16}/> Télécharger</a>
      <div className="software-links">
        {software.repository_url && <a className="text-link" href={software.repository_url} target="_blank" rel="noreferrer"><Github size={16}/> Dépôt <ArrowUpRight size={14}/></a>}
        {software.documentation_url && <a className="text-link" href={software.documentation_url} target="_blank" rel="noreferrer">Documentation <ArrowUpRight size={14}/></a>}
      </div>
    </div>
  </div>;
}