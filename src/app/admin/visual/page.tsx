'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Download, Eye, RotateCcw, Save, Search, ShieldCheck, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { DEFAULT_VISUAL_SETTINGS, normalizeVisualSettings, VISUAL_FIELDS, VISUAL_GROUPS, type VisualField, type VisualSettings } from '@/lib/visual-settings';
import { useSiteVisualSettings } from '@/components/site-visual-provider';
import styles from './visual.module.css';

type HistoryRow = { id: number; changed_fields: string[]; created_at: string };

export default function VisualSiteEditorPage() {
  const router = useRouter();
  const { settings: liveSettings, setSettings } = useSiteVisualSettings();
  const [draft, setDraft] = useState<VisualSettings>({ ...DEFAULT_VISUAL_SETTINGS });
  const [saved, setSaved] = useState<VisualSettings>({ ...DEFAULT_VISUAL_SETTINGS });
  const [group, setGroup] = useState<string>(VISUAL_GROUPS[0]);
  const [search, setSearch] = useState('');
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const importRef = useRef<HTMLInputElement>(null);

  const changedCount = useMemo(() => VISUAL_FIELDS.filter(field => draft[field.key] !== saved[field.key]).length, [draft, saved]);
  const filteredFields = useMemo(() => VISUAL_FIELDS.filter(field => field.group === group && (!search.trim() || `${field.label} ${field.key} ${field.group}`.toLowerCase().includes(search.trim().toLowerCase()))), [group, search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const supabase = createClient();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/auth/login'); return; }
      const founder = session.user.email?.toLowerCase() === 'duckdev-service@protonmail.com';
      if (!founder) { router.replace('/dashboard'); return; }
      setAuthorized(true);

      const { data, error: settingsError } = await supabase.from('site_visual_settings').select('settings').eq('id', 1).maybeSingle();
      if (settingsError) throw settingsError;
      const next = normalizeVisualSettings(data?.settings);
      setDraft(next);
      setSaved(next);
      setSettings(next);

      const { data: logRows } = await supabase.from('site_visual_settings_history').select('id, changed_fields, created_at').order('created_at', { ascending: false }).limit(8);
      setHistory((logRows ?? []) as HistoryRow[]);
    } catch {
      setError('Impossible de charger les réglages. Applique d’abord la migration 202611070005_visual_site_editor.sql sur le projet Supabase actif.');
    } finally {
      setLoading(false);
    }
  }, [router, setSettings]);

  useEffect(() => { void load(); }, [load]);

  function changeField(field: VisualField, raw: string | boolean) {
    const next = normalizeVisualSettings({ ...draft, [field.key]: field.kind === 'range' ? Number(raw) : raw });
    setDraft(next);
    setSettings(next);
    setNotice('');
    setError('');
  }

  async function save() {
    setSaving(true); setError(''); setNotice('');
    const { error: saveError } = await createClient().rpc('admin_save_site_visual_settings', { p_settings: draft });
    if (saveError) {
      setError('Enregistrement refusé. Vérifie les droits administrateur et la migration de l’éditeur.');
      setSaving(false);
      return;
    }
    const next = normalizeVisualSettings(draft);
    setSaved(next); setDraft(next); setSettings(next); setNotice('Modifications enregistrées et publiées sur le site.');
    const { data: logRows } = await createClient().from('site_visual_settings_history').select('id, changed_fields, created_at').order('created_at', { ascending: false }).limit(8);
    setHistory((logRows ?? []) as HistoryRow[]);
    setSaving(false);
  }

  function resetDraft() {
    const defaults = { ...DEFAULT_VISUAL_SETTINGS };
    setDraft(defaults); setSettings(defaults); setNotice('Aperçu réinitialisé. Enregistre pour publier ces valeurs.');
  }

  function exportSettings() {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'duck-site-theme.json'; anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importSettings(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const next = normalizeVisualSettings(parsed);
      setDraft(next); setSettings(next); setNotice('Configuration importée dans l’aperçu. Enregistre pour publier.'); setError('');
    } catch {
      setError('Ce fichier JSON ne contient pas une configuration de thème valide.');
    }
    event.target.value = '';
  }

  if (loading) return <main className={styles.page}><p role="status">Chargement de l’éditeur…</p></main>;
  if (!authorized) return <main className={styles.page}><p role="status">Vérification de l’accès administrateur…</p></main>;

  return <main className={styles.page}>
    <header className={styles.header}>
      <div><Link className={styles.back} href="/admin"><ArrowLeft size={15}/> Console admin</Link><div className={styles.kicker}><ShieldCheck size={14}/> ADMINISTRATEUR UNIQUEMENT</div><h1>Éditeur visuel du site</h1><p>Modifie l’apparence, le contenu de l’accueil et la navigation. L’aperçu se met à jour immédiatement.</p></div>
      <div className={styles.headerActions}>
        <button className={styles.secondaryButton} type="button" onClick={() => { setDraft(saved); setSettings(saved); setNotice('Aperçu restauré depuis les dernières modifications publiées.'); }}><RotateCcw size={15}/> Annuler</button>
        <button className={styles.secondaryButton} type="button" onClick={exportSettings}><Download size={15}/> Exporter</button>
        <button className={styles.secondaryButton} type="button" onClick={() => importRef.current?.click()}><Upload size={15}/> Importer</button>
        <input ref={importRef} className={styles.hiddenInput} type="file" accept="application/json,.json" onChange={event => void importSettings(event)}/>
        <button className={styles.saveButton} type="button" onClick={() => void save()} disabled={saving || changedCount === 0}><Save size={15}/>{saving ? 'Publication…' : changedCount ? `Publier (${changedCount})` : 'Publié'}</button>
      </div>
    </header>

    {error && <div className={styles.error} role="alert">{error}</div>}
    {notice && <div className={styles.notice} role="status"><Check size={15}/>{notice}</div>}

    <div className={styles.workspace}>
      <aside className={styles.sidebar} aria-label="Catégories d’outils">
        <div className={styles.toolCount}><strong>{VISUAL_FIELDS.length}</strong><span>outils de modification</span></div>
        <label className={styles.search}><Search size={15}/><span className={styles.srOnly}>Rechercher un outil</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher…"/></label>
        <nav>{VISUAL_GROUPS.map(name => <button key={name} type="button" className={group === name ? styles.groupActive : styles.groupButton} onClick={() => setGroup(name)}>{name}<span>{VISUAL_FIELDS.filter(field => field.group === name).length}</span></button>)}</nav>
        <button className={styles.resetButton} type="button" onClick={resetDraft}>Revenir au thème par défaut</button>
        <a className={styles.previewLink} href="/" target="_blank" rel="noreferrer"><Eye size={15}/> Voir le site enregistré</a>
      </aside>

      <section className={styles.controls} aria-label={`Outils : ${group}`}>
        <div className={styles.sectionHeading}><div><span>{group}</span><h2>{filteredFields.length} réglage{filteredFields.length > 1 ? 's' : ''}</h2></div><span className={styles.livePill}><i/> Aperçu direct</span></div>
        <div className={styles.controlGrid}>
          {filteredFields.map(field => <VisualControl key={field.key} field={field} value={draft[field.key]} onChange={value => changeField(field, value)}/>) }
          {!filteredFields.length && <p className={styles.empty}>Aucun outil dans cette catégorie ne correspond à la recherche.</p>}
        </div>
      </section>

      <aside className={styles.preview} aria-label="Aperçu en direct">
        <div className={styles.previewHead}><span><Eye size={15}/> Aperçu</span><span className={styles.dot}/></div>
        <div className={styles.previewCanvas} style={{ background: String(liveSettings.pageBackground), color: String(liveSettings.textPrimary), fontFamily: String(liveSettings.fontFamily) }}>
          <div className={styles.previewNav} style={{ borderColor: String(liveSettings.borderColor) }}><b><i style={{ background: String(liveSettings.accent) }}>{String(liveSettings.brandMark)}</i>{String(liveSettings.brandName)}</b><span>{String(liveSettings.navServicesLabel)}</span></div>
          <div className={styles.previewHero}><small style={{ color: String(liveSettings.accentLight) }}>{String(liveSettings.heroEyebrow)}</small><h3>{String(liveSettings.heroTitleLine1)} <em style={{ color: String(liveSettings.accentLight) }}>{String(liveSettings.heroTitleLine2)}</em></h3><p style={{ color: String(liveSettings.textSecondary) }}>{String(liveSettings.heroDescription)}</p><button style={{ background: String(liveSettings.accent), borderRadius: `${liveSettings.buttonRadius}px`, minHeight: `${liveSettings.buttonHeight}px` }}>{String(liveSettings.heroPrimaryLabel)}</button></div>
          <div className={styles.previewCard} style={{ background: String(liveSettings.cardBackground), borderColor: String(liveSettings.borderColor), borderRadius: `${liveSettings.cardRadius}px` }}><span style={{ color: String(liveSettings.accent) }}>DUCK</span><strong>{String(liveSettings.servicesHeading)}</strong><small>{Number(liveSettings.contentWidth)}px · {String(liveSettings.fontFamily).split(',')[0]}</small></div>
        </div>
        <div className={styles.history}><h3>Dernières publications</h3>{history.length ? history.map(row => <div key={row.id}><span>{row.changed_fields.length} réglage{row.changed_fields.length === 1 ? '' : 's'}</span><time dateTime={row.created_at}>{new Date(row.created_at).toLocaleString('fr-FR')}</time></div>) : <p>Aucune modification publiée.</p>}</div>
      </aside>
    </div>
  </main>;
}

function VisualControl({ field, value, onChange }: { field: VisualField; value: string | number | boolean; onChange: (value: string | boolean) => void }) {
  return <label className={`${styles.control} ${field.kind === 'toggle' ? styles.toggleControl : ''}`}>
    <span className={styles.controlLabel}>{field.label}</span>
    {field.kind === 'color' && <span className={styles.colorInput}><input aria-label={field.label} type="color" value={String(value)} onChange={event => onChange(event.target.value)}/><code>{String(value).toUpperCase()}</code></span>}
    {field.kind === 'range' && <span className={styles.rangeInput}><input aria-label={field.label} type="range" min={field.min} max={field.max} step={field.step ?? 1} value={Number(value)} onChange={event => onChange(event.target.value)}/><output>{Number(value)}{field.unit ? ` ${field.unit}` : ''}</output></span>}
    {field.kind === 'text' && <input className={styles.textInput} aria-label={field.label} type="text" maxLength={240} value={String(value)} onChange={event => onChange(event.target.value)}/>}
    {field.kind === 'select' && <select className={styles.selectInput} aria-label={field.label} value={String(value)} onChange={event => onChange(event.target.value)}>{field.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>}
    {field.kind === 'toggle' && <input className={styles.toggleInput} aria-label={field.label} type="checkbox" checked={Boolean(value)} onChange={event => onChange(event.target.checked)}/>}
    {field.help && <small>{field.help}</small>}
  </label>;
}
