'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Plus, RefreshCw, Trophy } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import styles from './concours-admin.module.css';

const FOUNDER_EMAIL = 'duckdev-service@protonmail.com';
type Contest = { id: string; title: string; description: string; status: 'open' | 'closed' | 'completed'; created_at: string };
type ContestEntry = { entry_id: string; nickname: string; duck_rib: string; project_url: string; placement: number | null; prize: number; submitted_at: string };
type BankSummary = { fees_collected: number; prizes_paid: number; net_total: number };

export default function ContestAdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [entries, setEntries] = useState<ContestEntry[]>([]);
  const [ranked, setRanked] = useState<Record<string, string>>({});
  const [bank, setBank] = useState<BankSummary | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const selected = contests.find(contest => contest.id === selectedId) ?? null;

  const loadData = useCallback(async (preferredId?: string) => {
    setLoading(true); setError('');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { router.replace('/auth/login'); return; }
    if (session.user.email?.toLowerCase() !== FOUNDER_EMAIL) { setAuthorized(false); router.replace('/dashboard'); return; }
    setAuthorized(true);
    const [{ data: contestRows, error: contestError }, { data: bankRows, error: bankError }] = await Promise.all([
      supabase.from('duck_contests').select('id,title,description,status,created_at').order('created_at', { ascending: false }).limit(30),
      supabase.rpc('admin_get_duck_bank_summary'),
    ]);
    if (contestError || bankError) setError('Chargement Supabase impossible. Vérifie que la migration concours est appliquée.');
    const list = (contestRows ?? []) as Contest[];
    setContests(list);
    const nextId = preferredId && list.some(row => row.id === preferredId) ? preferredId
      : list.some(row => row.id === selectedId) ? selectedId
        : list.find(row => row.status === 'open')?.id ?? list[0]?.id ?? '';
    setSelectedId(nextId);
    setBank(((bankRows as BankSummary[] | null)?.[0]) ?? null);
    if (nextId) {
      const { data: entryRows, error: entriesError } = await supabase.rpc('admin_get_duck_contest_entries', { p_contest_id: nextId });
      if (entriesError) setError('Impossible de charger les candidatures.');
      const nextEntries = (entryRows ?? []) as ContestEntry[];
      setEntries(nextEntries);
      setRanked(Object.fromEntries(nextEntries.filter(row => row.placement).map(row => [row.entry_id, String(row.placement)])));
    } else { setEntries([]); setRanked({}); }
    setLoading(false);
  }, [router, selectedId, supabase]);

  useEffect(() => { void loadData(); }, [loadData]);

  async function launch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    const { data, error: launchError } = await supabase.rpc('admin_launch_duck_contest', { p_title: title.trim(), p_description: description.trim() });
    if (launchError) setError(launchError.message.includes('duck_contests_one_open_idx') ? 'Ferme le concours en cours avant d’en lancer un nouveau.' : 'Le concours n’a pas pu être lancé. Vérifie le titre, le descriptif et la migration Supabase.');
    else { setTitle(''); setDescription(''); setNotice('Concours lancé : la bannière de participation apparaît sur le site.'); await loadData(data as string); }
    setSaving(false);
  }

  async function closeContest() {
    if (!selected || !window.confirm('Fermer les inscriptions à ce concours ? Les membres ne pourront plus envoyer leur logiciel.')) return;
    setSaving(true); setError('');
    const { error: closeError } = await supabase.rpc('admin_close_duck_contest', { p_contest_id: selected.id });
    if (closeError) setError('Impossible de fermer ce concours.');
    else { setNotice('Inscriptions fermées. Classe les logiciels puis publie les résultats.'); await loadData(selected.id); }
    setSaving(false);
  }

  const rankedEntries = useMemo(() => entries.filter(entry => ranked[entry.entry_id]).sort((a, b) => Number(ranked[a.entry_id]) - Number(ranked[b.entry_id])), [entries, ranked]);
  async function publishResults() {
    if (!selected || selected.status !== 'closed') return;
    const ranks = Object.values(ranked).filter(Boolean);
    if (new Set(ranks).size !== ranks.length || ranks.some(rank => Number(rank) < 1 || Number(rank) > 5)) { setError('Chaque place doit être unique, de 1er à 5e.'); return; }
    if (!window.confirm(`Publier le classement et verser automatiquement ${rankedEntries.reduce((sum, entry) => sum + [10000, 1000, 100, 10, 1][Number(ranked[entry.entry_id]) - 1], 0).toLocaleString('fr-FR')} DuckMoney ?`)) return;
    setSaving(true); setError('');
    const { data, error: finalizeError } = await supabase.rpc('admin_finalize_duck_contest', { p_contest_id: selected.id, p_ranked_entry_ids: rankedEntries.map(entry => entry.entry_id) });
    if (finalizeError) setError('Classement non publié. Vérifie les rangs sélectionnés et les droits de la banque admin.');
    else { setNotice(`Résultats publiés. ${Number(data).toLocaleString('fr-FR')} DuckMoney versés aux gagnants.`); await loadData(selected.id); }
    setSaving(false);
  }

  if (loading) return <main className={styles.page}><p role="status">Vérification de l’accès banque admin…</p></main>;
  if (!authorized) return <main className={styles.page}><p role="status">Redirection…</p></main>;
  return <main className={styles.page}>
    <header className={styles.header}><div><Link className={styles.back} href="/admin"><ArrowLeft size={15}/> Console admin</Link><span className={styles.kicker}><Trophy size={14}/> BANQUE DUCKMONEY · FONDATEUR UNIQUEMENT</span><h1>Concours de codage</h1><p>Lance un défi, examine les logiciels et publie le classement. Les frais et récompenses sont inscrits au grand livre.</p></div><button className={styles.refresh} type="button" onClick={() => void loadData()} disabled={loading}><RefreshCw size={15}/> Actualiser</button></header>

    {error && <div className={styles.error} role="alert">{error}</div>}{notice && <div className={styles.notice} role="status">{notice}</div>}
    <section className={styles.bankCards} aria-label="Résumé de la banque DuckMoney"><article><span>FRAIS REÇUS</span><strong>{bank?.fees_collected?.toLocaleString('fr-FR') ?? '—'} DM</strong></article><article><span>PRIX VERSÉS</span><strong>{bank?.prizes_paid?.toLocaleString('fr-FR') ?? '—'} DM</strong></article><article><span>SOLDE NET CONCOURS</span><strong>{bank?.net_total?.toLocaleString('fr-FR') ?? '—'} DM</strong></article></section>

    <div className={styles.columns}>
      <section className={styles.panel}><div className={styles.panelHeader}><h2>Lancer un concours</h2><span>Frais fixe : 5 DM</span></div><form className={styles.form} onSubmit={launch}><label>Titre du défi<input value={title} onChange={event => setTitle(event.target.value)} required minLength={3} maxLength={100} placeholder="Ex. Le meilleur gestionnaire de tâches"/></label><label>Description et consignes<textarea value={description} onChange={event => setDescription(event.target.value)} required minLength={10} maxLength={3000} rows={5} placeholder="Décris le logiciel attendu, les critères et la date limite…"/></label><p>Le lancement affiche une bannière sur toutes les pages. Une seule inscription ouverte à la fois.</p><button className="button" type="submit" disabled={saving}><Plus size={16}/>{saving ? 'Lancement…' : 'Lancer le concours'}</button></form></section>

      <section className={styles.panel}><div className={styles.panelHeader}><h2>Concours enregistrés</h2><span>{contests.length}</span></div>{contests.length ? <select className={styles.contestSelect} value={selectedId} onChange={event => { setSelectedId(event.target.value); void loadData(event.target.value); }} aria-label="Choisir un concours">{contests.map(contest => <option key={contest.id} value={contest.id}>{contest.title} · {contest.status === 'open' ? 'ouvert' : contest.status === 'closed' ? 'à classer' : 'terminé'}</option>)}</select> : <p className={styles.empty}>Aucun concours lancé pour le moment.</p>}
        {selected && <><div className={styles.contestDetails}><strong>{selected.title}</strong><span>{selected.status === 'open' ? 'Inscriptions ouvertes' : selected.status === 'closed' ? 'Classement à publier' : 'Terminé'}</span><p>{selected.description}</p></div>{selected.status === 'open' && <button className={styles.dangerButton} type="button" onClick={() => void closeContest()} disabled={saving}>Fermer les inscriptions</button>}</>}
      </section>
    </div>

    {selected && <section className={styles.panel}><div className={styles.panelHeader}><div><h2>Logiciels inscrits</h2><p>{entries.length} candidature{entries.length === 1 ? '' : 's'} · DuckRIB visible uniquement dans cette console</p></div>{selected.status === 'closed' && <button className="button" type="button" onClick={() => void publishResults()} disabled={saving || !entries.length}>{saving ? 'Publication…' : 'Publier et verser les prix'}</button>}</div>{entries.length ? <div className={styles.tableScroll}><table className={styles.table}><thead><tr><th>Pseudo</th><th>DuckRIB</th><th>Logiciel</th><th>Place / prix</th></tr></thead><tbody>{entries.map(entry => <tr key={entry.entry_id}><td><strong>{entry.nickname}</strong></td><td><code>{entry.duck_rib}</code></td><td><a href={entry.project_url} target="_blank" rel="noreferrer">Ouvrir le projet <ExternalLink size={12}/></a></td><td>{selected.status === 'closed' ? <select aria-label={`Place pour ${entry.nickname}`} value={ranked[entry.entry_id] ?? ''} onChange={event => setRanked(current => ({ ...current, [entry.entry_id]: event.target.value }))}><option value="">Non classé</option>{[1, 2, 3, 4, 5].map(rank => <option key={rank} value={rank}>{rank}{rank === 1 ? 'er' : 'e'} · {[10000, 1000, 100, 10, 1][rank - 1].toLocaleString('fr-FR')} DM</option>)}</select> : entry.placement ? `${entry.placement}e · ${entry.prize.toLocaleString('fr-FR')} DM` : '—'}</td></tr>)}</tbody></table></div> : <p className={styles.empty}>Aucun logiciel soumis pour ce concours.</p>}{selected.status === 'closed' && <p className={styles.hint}>Sélectionne jusqu’à cinq gagnants avec des places différentes. La validation crédite chaque portefeuille automatiquement et rend les résultats publics.</p>}</section>}
    <p className={styles.disclaimer}>DuckMoney est une monnaie virtuelle de la plateforme et n’est pas une monnaie réelle.</p>
  </main>;
}
