'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, Coins, ExternalLink, Trophy } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import styles from './concours.module.css';

type Contest = { id: string; title: string; description: string; status: 'open' | 'closed' | 'completed'; created_at: string };
type Wallet = { balance: number; duck_rib: string };
type Entry = { nickname: string; project_url: string; placement: number | null; prize: number; submitted_at: string };

const PRIZES = [10000, 1000, 100, 10, 1];

export default function ContestPage() {
  const [contest, setContest] = useState<Contest | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [duckRib, setDuckRib] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [alreadyEntered, setAlreadyEntered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const supabase = createClient();

  const loadPage = useCallback(async () => {
    setLoading(true);
    const [{ data: sessionData }, { data: contestRows, error: contestError }] = await Promise.all([
      supabase.auth.getSession(),
      supabase.from('duck_contests').select('id,title,description,status,created_at').order('created_at', { ascending: false }).limit(1),
    ]);
    if (contestError) setError('Le concours est temporairement indisponible.');
    const currentContest = (contestRows?.[0] as Contest | undefined) ?? null;
    const signedInUser = sessionData.session?.user ?? null;
    setUserId(signedInUser?.id ?? null);
    setContest(currentContest);
    if (currentContest) {
      const { data } = await supabase.rpc('get_duck_contest_showcase', { p_contest_id: currentContest.id });
      setEntries((data ?? []) as Entry[]);
    } else setEntries([]);
    if (signedInUser) {
      const [{ data: walletRow }, { data: profileRow }] = await Promise.all([
        supabase.from('duck_wallets').select('balance,duck_rib').eq('user_id', signedInUser.id).maybeSingle(),
        supabase.from('profiles').select('username').eq('id', signedInUser.id).maybeSingle(),
      ]);
      const currentWallet = walletRow as Wallet | null;
      setWallet(currentWallet);
      setDuckRib(currentWallet?.duck_rib ?? '');
      if (profileRow?.username) setNickname(profileRow.username);
      if (currentContest) {
        const { data: ownEntry } = await supabase.from('duck_contest_entries').select('id').eq('contest_id', currentContest.id).eq('user_id', signedInUser.id).maybeSingle();
        setAlreadyEntered(Boolean(ownEntry));
      } else setAlreadyEntered(false);
    } else { setWallet(null); setAlreadyEntered(false); }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { void loadPage(); }, [loadPage]);

  async function joinContest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contest || !userId) return;
    setJoining(true); setError(''); setNotice('');
    const { error: registerError } = await supabase.rpc('duck_contest_register', {
      p_contest_id: contest.id,
      p_nickname: nickname.trim(),
      p_duck_rib: duckRib.trim(),
      p_project_url: projectUrl.trim(),
    });
    if (registerError) {
      setError(registerError.message.includes('Not enough DuckMoney') ? 'Il te faut au moins 5 DuckMoney pour participer.' : registerError.message.includes('DuckRIB') ? 'Le DuckRIB ne correspond pas à ton portefeuille.' : registerError.message.includes('duplicate') ? 'Tu es déjà inscrit à ce concours.' : 'Inscription impossible. Vérifie tes informations et réessaie.');
    } else {
      setProjectUrl(''); setAlreadyEntered(true); setNotice('Inscription confirmée. 5 DuckMoney ont été versés à la banque du concours.');
      await loadPage();
    }
    setJoining(false);
  }

  if (loading) return <main className={styles.page}><p role="status">Chargement du concours…</p></main>;
  return <main className={styles.page}>
    <header className={styles.hero}>
      <span className={styles.kicker}><Trophy size={15}/> CONCOURS DE CODAGE</span>
      <h1>Code un logiciel.<br/><span>Gagne des DuckMoney.</span></h1>
      <p>Présente ton logiciel et son exécutable. L’administrateur ferme les inscriptions, classe les projets, puis les prix sont versés automatiquement dans les portefeuilles des gagnants.</p>
      <div className={styles.prizeStrip}><strong><Trophy size={18}/> 10 000</strong><span>DuckMoney au premier</span><i/><span>5 DuckMoney pour participer</span></div>
    </header>

    {error && <div className={styles.error} role="alert">{error}</div>}
    {notice && <div className={styles.notice} role="status"><CheckCircle2 size={17}/>{notice}</div>}
    {!contest ? <section className={styles.panel}><h2>Aucun concours en cours</h2><p>Reviens bientôt : le prochain défi de codage apparaîtra ici.</p></section> : <>
      <section className={styles.contestPanel}>
        <div className={styles.contestHeading}><div><span className={styles.kicker}>{contest.status === 'open' ? 'INSCRIPTIONS OUVERTES' : contest.status === 'closed' ? 'INSCRIPTIONS FERMÉES' : 'RÉSULTATS PUBLIÉS'}</span><h2>{contest.title}</h2></div><span className={styles.entryFee}><Coins size={15}/> 5 DM</span></div>
        <p className={styles.description}>{contest.description}</p>
        <p className={styles.submissionTip}>Le lien doit ouvrir une page de projet ou une release qui contient ton exécutable. Les fichiers sont examinés par l’administrateur; le site ne lance aucun fichier.</p>
        {contest.status === 'open' && (userId ? alreadyEntered ? <div className={styles.registered}><CheckCircle2 size={18}/> Ton logiciel est inscrit au concours.</div> : <form className={styles.form} onSubmit={joinContest}>
          <label>Pseudo public<input value={nickname} onChange={event => setNickname(event.target.value)} minLength={2} maxLength={32} required placeholder="Ton pseudo"/></label>
          <label>DuckRIB de réception<input value={duckRib} onChange={event => setDuckRib(event.target.value)} required maxLength={40} placeholder="DR-…" autoComplete="off"/><small>Le prix sera crédité au portefeuille de ce compte. Le DuckRIB sert à confirmer la destination; aucun code de retrait ne t’est demandé.</small></label>
          <label>Lien du projet / dossier avec exécutable<input type="url" value={projectUrl} onChange={event => setProjectUrl(event.target.value)} required placeholder="https://github.com/…"/><small>HTTPS uniquement. Tu peux fournir un dépôt, une page de téléchargement ou un lien de release.</small></label>
          <div className={styles.formFooter}><span>Solde : <b>{wallet?.balance ?? 0} DuckMoney</b> · coût : 5 DuckMoney</span><button className="button" type="submit" disabled={joining || (wallet?.balance ?? 0) < 5}>{joining ? 'Inscription…' : 'Participer'}</button></div>
        </form> : <div className={styles.loginPrompt}><p>Connecte-toi pour voir ton DuckRIB et participer. Les nouveaux comptes reçoivent 100 DuckMoney fictifs.</p><Link className="button" href="/auth/login">Se connecter <ArrowUpRight size={15}/></Link></div>)}
        {contest.status !== 'open' && <div className={styles.registered}>{contest.status === 'completed' ? 'Le classement et les récompenses sont définitifs.' : 'Le classement sera publié après la clôture.'}</div>}
      </section>

      {contest.status === 'completed' && <section className={styles.panel}><div className={styles.panelHeading}><h2>Classement final</h2><span>PRIX VERSES EN DUCKMONEY</span></div>{entries.length ? <ol className={styles.results}>{entries.filter(entry => entry.placement).sort((a, b) => (a.placement ?? 99) - (b.placement ?? 99)).map(entry => <li key={`${entry.nickname}-${entry.placement}`}><b>#{entry.placement}</b><span>{entry.nickname}<small><a href={entry.project_url} target="_blank" rel="noreferrer">Voir le projet <ExternalLink size={12}/></a></small></span><strong>{entry.prize.toLocaleString('fr-FR')} DM</strong></li>)}</ol> : <p>Les résultats seront affichés après le classement.</p>}</section>}
    </>}

    <section className={styles.prizePanel}><div className={styles.panelHeading}><h2>Les récompenses</h2><span>DUCKMONEY FICTIFS</span></div><div className={styles.prizeList}>{PRIZES.map((prize, index) => <div key={prize}><span>{index + 1}{index === 0 ? 'er' : 'e'}</span><strong>{prize.toLocaleString('fr-FR')}</strong><small>DuckMoney</small></div>)}</div><p>Chaque compte commence avec 100 DuckMoney. Le frais de participation de 5 DuckMoney est débité une seule fois par concours. Les récompenses sont créditées automatiquement au portefeuille après la validation du classement par l’administrateur.</p></section>
    <footer className={styles.footer}><Link href="/">Retour à l’accueil</Link><span>DuckMoney est une monnaie virtuelle sans valeur monétaire réelle.</span></footer>
  </main>;
}
