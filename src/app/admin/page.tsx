'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Palette, RefreshCw, Save, Search, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import styles from './admin.module.css';

type Profile = {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  bio: string | null;
  avatar_url: string | null;
  is_profile_public: boolean;
  role: 'admin' | 'member';
  duck_points: number;
  created_at: string;
};

type AuditEntry = {
  id: string;
  target_user_id: string;
  changed_fields: string[];
  created_at: string;
};

type ProfileForm = {
  username: string;
  first_name: string;
  last_name: string;
  bio: string;
  avatar_url: string;
  is_profile_public: boolean;
  role: 'admin' | 'member';
};

function toForm(profile: Profile): ProfileForm {
  return {
    username: profile.username,
    first_name: profile.first_name,
    last_name: profile.last_name,
    bio: profile.bio ?? '',
    avatar_url: profile.avatar_url ?? '',
    is_profile_public: profile.is_profile_public,
    role: profile.role,
  };
}

export default function AdminPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState<ProfileForm | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [isFounder, setIsFounder] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    const supabase = createClient();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/auth/login');
        return;
      }

      let isAdmin = session.user.app_metadata?.duck_role === 'admin';
      if (!isAdmin) {
        const { data: ownProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();
        isAdmin = ownProfile?.role === 'admin';
      }
      if (!isAdmin) {
        setAuthorized(false);
        router.replace('/dashboard');
        return;
      }
      setIsFounder(session.user.email?.toLowerCase() === 'duckdev-service@protonmail.com');

      const { data: profileRows, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, first_name, last_name, bio, avatar_url, is_profile_public, role, duck_points, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (profilesError) throw profilesError;

      const { data: auditRows, error: auditError } = await supabase
        .from('admin_audit_log')
        .select('id, target_user_id, changed_fields, created_at')
        .order('created_at', { ascending: false })
        .limit(20);
      if (auditError) throw auditError;

      const rows = (profileRows ?? []) as Profile[];
      setProfiles(rows);
      setAudit((auditRows ?? []) as AuditEntry[]);
      setAuthorized(true);
      if (!rows.some(profile => profile.id === selectedId)) {
        const firstProfile = rows[0];
        setSelectedId(firstProfile?.id ?? '');
        setForm(firstProfile ? toForm(firstProfile) : null);
      }
    } catch {
      setError('Impossible de charger la console admin. Vérifie les migrations et les autorisations Supabase.');
    } finally {
      setLoading(false);
    }
  }, [router, selectedId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const selectedProfile = profiles.find(profile => profile.id === selectedId) ?? null;
  const filteredProfiles = profiles.filter(profile => {
    const needle = search.trim().toLowerCase();
    return !needle || `${profile.username} ${profile.first_name} ${profile.last_name}`.toLowerCase().includes(needle);
  });

  function chooseProfile(profile: Profile) {
    setSelectedId(profile.id);
    setForm(toForm(profile));
    setNotice('');
    setError('');
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProfile || !form) return;
    const existingRole = selectedProfile.role;
    if (existingRole !== form.role && !window.confirm(`Confirmer le changement de rôle vers « ${form.role} » ?`)) return;

    setSaving(true);
    setError('');
    setNotice('');
    const supabase = createClient();
    const { error: updateError } = await supabase.rpc('admin_update_profile', {
      p_user_id: selectedProfile.id,
      p_username: form.username.trim(),
      p_first_name: form.first_name.trim(),
      p_last_name: form.last_name.trim(),
      p_bio: form.bio || null,
      p_avatar_url: form.avatar_url || null,
      p_is_profile_public: form.is_profile_public,
      p_role: form.role,
    });

    if (updateError) {
      setError('La mise à jour a été refusée. Vérifie les champs et les droits administrateur.');
      setSaving(false);
      return;
    }

    const updatedProfile = { ...selectedProfile, ...form };
    setProfiles(current => current.map(profile => profile.id === selectedProfile.id ? updatedProfile : profile));
    setNotice('Profil mis à jour. L’action est inscrite dans le journal admin.');
    const { data: auditRows } = await supabase
      .from('admin_audit_log')
      .select('id, target_user_id, changed_fields, created_at')
      .order('created_at', { ascending: false })
      .limit(20);
    setAudit((auditRows ?? []) as AuditEntry[]);
    setSaving(false);
  }

  if (loading) return <main className={styles.page}><p role="status">Chargement de la console admin…</p></main>;
  if (!authorized) return <main className={styles.page}><p role="status">Redirection…</p></main>;

  return <main className={styles.page}>
    <div className={styles.header}>
      <div>
        <Link className={styles.back} href="/dashboard"><ArrowLeft size={15}/> Mon espace</Link>
        <span className="section-kicker">DUCK ADMIN · IDENTITÉS</span>
        <h1 className={styles.title}>Gestion des membres</h1>
      </div>
      <div className={styles.headerActions}>
        {isFounder && <Link className="button button-secondary" href="/admin/visual"><Palette size={15}/> Modifier le site</Link>}
        <button className="button button-secondary" type="button" onClick={() => void loadData()} disabled={loading}>
          <RefreshCw size={15}/> Actualiser
        </button>
      </div>
    </div>

    <div className={styles.summary}>
      <ShieldCheck size={18}/>
      <span>{profiles.length} profil{profiles.length === 1 ? '' : 's'} chargé{profiles.length === 1 ? '' : 's'} · limite 100</span>
    </div>
    {error && <div role="alert" className="notice error">{error}</div>}
    {notice && <div role="status" className="notice">{notice}</div>}

    <div className={styles.layout}>
      <section className={styles.panel} aria-labelledby="member-list-title">
        <div className={styles.panelHeader}>
          <h2 id="member-list-title">Membres</h2>
          <label className={styles.search}>
            <Search size={16}/>
            <span className={styles.srOnly}>Rechercher un membre</span>
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Nom ou pseudonyme"/>
          </label>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th scope="col">Membre</th><th scope="col">Rôle</th><th scope="col">Points</th></tr></thead>
            <tbody>
              {filteredProfiles.map(profile => <tr key={profile.id} className={profile.id === selectedId ? styles.selected : undefined}>
                <td><button className={styles.memberButton} type="button" onClick={() => chooseProfile(profile)}><strong>{profile.first_name} {profile.last_name}</strong><span>@{profile.username}</span></button></td>
                <td><span className={profile.role === 'admin' ? styles.adminRole : styles.memberRole}>{profile.role === 'admin' ? 'Admin' : 'Membre'}</span></td>
                <td>{profile.duck_points}</td>
              </tr>)}
              {!filteredProfiles.length && <tr><td colSpan={3} className={styles.empty}>Aucun profil correspondant.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.panel} aria-labelledby="profile-edit-title">
        <div className={styles.panelHeader}><h2 id="profile-edit-title">Modifier le profil</h2></div>
        {selectedProfile && form ? <form className={styles.form} onSubmit={saveProfile}>
          <label>Pseudonyme<input value={form.username} onChange={event => setForm({ ...form, username: event.target.value })} pattern="[A-Za-z0-9_]{3,24}" required maxLength={24}/></label>
          <div className={styles.nameFields}>
            <label>Prénom<input value={form.first_name} onChange={event => setForm({ ...form, first_name: event.target.value })} required maxLength={80}/></label>
            <label>Nom<input value={form.last_name} onChange={event => setForm({ ...form, last_name: event.target.value })} required maxLength={80}/></label>
          </div>
          <label>Présentation<textarea value={form.bio} onChange={event => setForm({ ...form, bio: event.target.value })} maxLength={500} rows={3}/></label>
          <label>URL de l’avatar<input type="url" value={form.avatar_url} onChange={event => setForm({ ...form, avatar_url: event.target.value })} placeholder="https://…"/></label>
          <label>Rôle<select value={form.role} onChange={event => setForm({ ...form, role: event.target.value as ProfileForm['role'] })}><option value="member">Membre</option><option value="admin">Administrateur</option></select></label>
          <label className={styles.toggle}><input type="checkbox" checked={form.is_profile_public} onChange={event => setForm({ ...form, is_profile_public: event.target.checked })}/><span>Profil public</span></label>
          <button className="button" type="submit" disabled={saving}><Save size={15}/>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
        </form> : <p className={styles.empty}>Sélectionne un profil dans la liste.</p>}
      </section>
    </div>

    <section className={styles.auditPanel} aria-labelledby="audit-title">
      <div className={styles.panelHeader}><h2 id="audit-title">Journal des actions admin</h2></div>
      {audit.length ? <ul className={styles.auditList}>{audit.map(entry => <li key={entry.id}><span>{entry.changed_fields.join(', ')}</span><code>{entry.target_user_id.slice(0, 8)}</code><time dateTime={entry.created_at}>{new Date(entry.created_at).toLocaleString('fr-FR')}</time></li>)}</ul> : <p className={styles.empty}>Aucune modification enregistrée.</p>}
    </section>
  </main>;
}
