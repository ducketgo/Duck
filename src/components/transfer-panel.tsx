'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Check, Copy, Download, FileUp, LoaderCircle, LockKeyhole, ShieldAlert } from 'lucide-react';
import { isGuestTransferEnabled, withBasePath } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/client';

type TransferResult = { shareUrl: string; token: string };
const maxBytes = 25 * 1024 * 1024;
function edgeUrl() { return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/guest-transfer`; }
async function callEdge(body: Record<string, unknown>) {
  const response = await fetch(edgeUrl(), { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! }, body: JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Le service a refusé la demande.');
  return result;
}

export function TransferPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<TransferResult | null>(null);
  const [downloadToken, setDownloadToken] = useState('');
  const [downloadName, setDownloadName] = useState('');
  const [copied, setCopied] = useState(false);
  const configured = isGuestTransferEnabled();

  useEffect(() => { const token = window.location.hash.slice(1); if (token) setDownloadToken(token); }, []);

  async function upload(event: FormEvent) {
    event.preventDefault(); if (!file) return;
    if (file.size > maxBytes) { setError('Ce fichier dépasse la limite de 25 Mio.'); return; }
    setBusy(true); setError(''); setResult(null);
    try {
      const prepared = await callEdge({ action: 'create', name: file.name, size: file.size, contentType: file.type || 'application/octet-stream' });
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage.from('guest-transfers').uploadToSignedUrl(prepared.path, prepared.uploadToken, file, { contentType: file.type || 'application/octet-stream', upsert: false });
      if (uploadError) throw uploadError;
      await callEdge({ action: 'complete', id: prepared.id, uploadProof: prepared.uploadProof });
      const shareUrl = `${window.location.origin}${withBasePath('/transfer')}#${prepared.token}`;
      setResult({ shareUrl, token: prepared.token });
      setFile(null);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'L’envoi a échoué. Réessayez plus tard.'); }
    finally { setBusy(false); }
  }

  async function download() {
    setBusy(true); setError('');
    try { const data = await callEdge({ action: 'download', token: downloadToken }); setDownloadName(data.name); window.location.assign(data.url); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Le lien ne fonctionne pas.'); }
    finally { setBusy(false); }
  }

  async function copyLink() { if (!result) return; await navigator.clipboard.writeText(result.shareUrl); setCopied(true); setTimeout(() => setCopied(false), 1800); }

  if (downloadToken) return <section className="transfer-card"><div className="transfer-lock"><LockKeyhole/></div><h2>Un fichier vous attend.</h2><p>Le lien est temporaire. Son téléchargement est accessible à toute personne qui possède ce lien.</p>{error && <div className="notice error" role="alert">{error}</div>}<button className="button" onClick={download} disabled={busy}>{busy ? <LoaderCircle className="spin" size={17}/> : <Download size={17}/>} Télécharger le fichier</button><p className="transfer-subtle">{downloadName || 'Le nom et la taille seront confirmés avant le téléchargement.'}</p></section>;

  if (!configured) return <section className="transfer-card transfer-unavailable"><ShieldAlert/><h2>Service à configurer</h2><p>Le transfert invité reste fermé jusqu’au déploiement et à la vérification de ses fonctions de sécurité. Aucun fichier ne sera envoyé tant que cette configuration n’est pas terminée.</p><div className="transfer-setup">Pré-requis : projets/variables Supabase, fonction Edge <code>guest-transfer</code>, secrets serveur et tâche de nettoyage.</div></section>;

  return <section className="transfer-card"><div className="transfer-lock"><FileUp/></div><h2>Envoyer un fichier</h2><p>Un lien de téléchargement sera prêt dès que l’envoi est terminé.</p><form className="transfer-form" onSubmit={upload}><label className="file-picker">{file ? <><Check size={18}/><span>{file.name}</span><small>{(file.size / 1024 / 1024).toFixed(2)} Mio</small></> : <><FileUp size={18}/><span>Choisir un fichier</span><small>25 Mio maximum</small></>}<input type="file" onChange={event => { setFile(event.target.files?.[0] ?? null); setError(''); }} /></label>{error && <div className="notice error" role="alert">{error}</div>}<button className="button" type="submit" disabled={!file || busy}>{busy ? <LoaderCircle className="spin" size={17}/> : <LockKeyhole size={17}/>} {busy ? 'Envoi sécurisé…' : 'Créer un lien temporaire'}</button></form>{result && <div className="transfer-result"><span className="success-label"><Check size={15}/> Lien prêt · valable 24 h</span><div className="share-link">{result.shareUrl}<button type="button" onClick={copyLink} aria-label="Copier le lien" title={copied ? 'Lien copié' : 'Copier le lien'}>{copied ? <Check size={16}/> : <Copy size={16}/>}</button></div><p>Le lien n’est pas listé publiquement, mais toute personne qui le reçoit peut télécharger le fichier.</p></div>}<div className="transfer-assurance"><LockKeyhole size={15}/><span>Connexion HTTPS · Stockage privé · Expiration à 24 h · Nettoyage planifié</span></div></section>;
}
