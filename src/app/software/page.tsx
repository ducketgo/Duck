import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, PackageOpen } from 'lucide-react';
export const metadata: Metadata = { title: 'Logiciels' };
export default function SoftwarePage() { return <div className="wrap page-wrap"><span className="section-kicker">LOGICIELS & PROJETS</span><h1 className="page-title">Des outils faits<br/><span>pour être partagés.</span></h1><p className="page-lede">Les logiciels DUCK seront publiés ici avec leurs versions, leur documentation et leurs liens de téléchargement. Le catalogue n’est pas encore connecté à une base de données.</p><div className="empty-state"><PackageOpen size={30}/><h2>Le catalogue se prépare.</h2><p>Aucun logiciel publié pour le moment. Les téléchargements apparaîtront lorsqu’un projet aura une version disponible.</p><Link className="text-link" href="/services/duckdev">Découvrir DuckDev <ArrowUpRight size={16}/></Link></div></div> }
