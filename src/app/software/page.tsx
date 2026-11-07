import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, PackageOpen } from 'lucide-react';
import { createPlatformPublicClient } from '@/lib/supabase/platform';

export const metadata: Metadata = { title: 'Logiciels' };

export const dynamic = 'force-dynamic';

export default async function SoftwarePage() {
	const supabase = createPlatformPublicClient();
	if (!supabase) {
		return <div className="wrap page-wrap"><span className="section-kicker">LOGICIELS & PROJETS</span><h1 className="page-title">Des outils faits<br/><span>pour être partagés.</span></h1><div className="notice">Configuration du catalogue nécessaire.</div></div>;
	}

	const { data: software, error } = await supabase
		.from('software')
		.select('slug, name, description, current_version, branch')
		.eq('is_published', true)
		.order('name', { ascending: true });

	if (error) {
		return <div className="wrap page-wrap"><span className="section-kicker">LOGICIELS & PROJETS</span><h1 className="page-title">Des outils faits<br/><span>pour être partagés.</span></h1><div role="alert" className="notice error">Le catalogue est temporairement indisponible.</div></div>;
	}

	return <div className="wrap page-wrap">
		<span className="section-kicker">LOGICIELS & PROJETS</span>
		<h1 className="page-title">Des outils faits<br/><span>pour être partagés.</span></h1>
		<p className="page-lede">Logiciels DUCK publiés, versions disponibles et liens officiels.</p>
		{software?.length ? <div className="service-list">
			{software.map(item => <Link className="service-row" href={`/software/${item.slug}`} key={item.slug}>
				<span className="branch-icon cyan"><PackageOpen size={19}/></span>
				<div><h2>{item.name}</h2><p>{item.description}</p></div>
				<span className="status-pill">{item.current_version}</span>
				<ArrowUpRight className="service-arrow" size={17}/>
			</Link>)}
		</div> : <div className="empty-state"><PackageOpen size={30}/><h2>Aucun logiciel publié.</h2><p>Les logiciels apparaîtront ici après validation et publication par l’équipe.</p><Link className="text-link" href="/services/duckdev">Découvrir DuckDev <ArrowUpRight size={16}/></Link></div>}
	</div>;
}
