import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { services } from '@/lib/services';
export const metadata: Metadata = { title: 'Services' };
export default function ServicesPage() { return <div className="wrap page-wrap"><span className="section-kicker">LES BRANCHES DU PROJET</span><h1 className="page-title">Un écosystème,<br/><span>plusieurs horizons.</span></h1><p className="page-lede">Chaque branche explore un domaine et reste reliée à l’identité DUCK. Les statuts indiquent ce qui existe aujourd’hui et ce qui reste à construire.</p><div className="service-list">{services.map(({ icon: Icon, ...s }) => <Link key={s.slug} href={`/services/${s.slug}`} className="service-row"><span className={`branch-icon ${s.color}`}><Icon size={20}/></span><div><h2>{s.name}</h2><p>{s.tagline}</p></div><span className="status-pill">{s.status}</span><ArrowUpRight className="service-arrow" size={18}/></Link>)}</div></div> }
