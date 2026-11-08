'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDownToLine, Check, ImagePlus, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type ContentType = 'text' | 'button' | 'download' | 'image' | 'video';
type ContentItem = {
  content_key: string;
  page_path: string;
  content_type: ContentType;
  content: string;
  href: string | null;
  anchor_key: string;
  sort_order: number;
};
type Draft = Omit<ContentItem, 'page_path'> & { page_path: string; isBlock: boolean };

const CONTENT_COLUMNS = 'content_key, page_path, content_type, content, href, anchor_key, sort_order';

function elementKey(root: HTMLElement, element: HTMLElement) {
  const path: string[] = [];
  let current: HTMLElement | null = element;
  while (current && current !== root) {
    const parent: HTMLElement | null = current.parentElement;
    if (!parent) return '';
    const sameTag = Array.from(parent.children).filter(sibling => sibling.tagName === current?.tagName && !sibling.matches('.site-custom-block-slot, [data-site-editor-ui]'));
    path.unshift(`${current.tagName.toLowerCase()}[${sameTag.indexOf(current)}]`);
    current = parent;
  }
  return current === root ? path.join('/') : '';
}

function textNodeKey(root: HTMLElement, pathname: string, node: Text) {
  const parent = node.parentElement;
  if (!parent) return '';
  const parentPath = elementKey(root, parent);
  const textNodes = Array.from(parent.childNodes).filter(child => child.nodeType === Node.TEXT_NODE);
  return parentPath ? `text:${pathname}:${parentPath}:t${textNodes.indexOf(node)}` : '';
}

function elementAtKey(root: HTMLElement, key: string) {
  let current: HTMLElement = root;
  if (!key) return current;
  for (const part of key.split('/')) {
    const match = /^([a-z0-9-]+)\[(\d+)\]$/.exec(part);
    if (!match) return null;
    const matching = Array.from(current.children).filter(child => child.tagName.toLowerCase() === match[1] && !child.matches('.site-custom-block-slot, [data-site-editor-ui]'));
    const next = matching[Number(match[2])];
    if (!(next instanceof HTMLElement)) return null;
    current = next;
  }
  return current;
}

function mediaUrl(value: string) {
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.toString() : '';
  } catch { return ''; }
}

function videoEmbedUrl(value: string) {
  const safeUrl = mediaUrl(value);
  if (!safeUrl) return '';
  try {
    const url = new URL(safeUrl);
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(url.hostname)) {
      const id = url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).at(-1);
      return id && /^[\w-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : '';
    }
    if (url.hostname === 'youtu.be') {
      const id = url.pathname.slice(1);
      return /^[\w-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : '';
    }
    if (url.hostname === 'vimeo.com' || url.hostname === 'www.vimeo.com') {
      const id = url.pathname.split('/').filter(Boolean).at(-1);
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : '';
    }
    return '';
  } catch { return ''; }
}

export function SitePageEditor({ children, pathname, isFounder }: { children: ReactNode; pathname: string; isFounder: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [editing, setEditing] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const textOverrides = useMemo(() => new Map(items.filter(item => item.content_type === 'text' && !item.content_key.startsWith('block:')).map(item => [item.content_key, item.content])), [items]);
  const blocks = useMemo(() => items.filter(item => item.content_key.startsWith('block:')).sort((a, b) => a.sort_order - b.sort_order), [items]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void createClient().from('site_content_items').select(CONTENT_COLUMNS).eq('page_path', pathname).order('sort_order').then(({ data, error: loadError }) => {
      if (!active) return;
      if (loadError) {
        setItems([]);
        if (isFounder) setError('La migration 202611080001_site_page_builder.sql doit être appliquée pour enregistrer le contenu.');
      } else {
        setItems((data ?? []) as ContentItem[]);
        setError('');
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, [pathname, isFounder]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let frame = 0;
    const applyOverrides = () => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        if (!(node instanceof Text) || !node.textContent?.trim() || node.parentElement?.closest('[data-site-editor-ui]')) continue;
        const key = textNodeKey(root, pathname, node);
        const replacement = textOverrides.get(key);
        if (replacement !== undefined && node.textContent !== replacement) node.textContent = replacement;
      }
    };
    applyOverrides();
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(applyOverrides);
    });
    observer.observe(root, { childList: true, characterData: true, subtree: true });
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [pathname, textOverrides]);

  const openDraft = useCallback((item: ContentItem, isBlock: boolean) => {
    setError(''); setNotice(''); setDraft({ ...item, page_path: pathname, isBlock }); setPlacing(false);
  }, [pathname]);

  function selectText(event: MouseEvent<HTMLDivElement>) {
    if (!isFounder || !editing || !rootRef.current) return;
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (!target || target.closest('[data-site-editor-ui]')) return;
    if (placing) {
      event.preventDefault(); event.stopPropagation();
      const anchor = target.closest<HTMLElement>('section, article, .hero, .intro-band, .manifesto, .closing-cta, .page-wrap, .service-row, .transfer-card, .auth-card, .feature-panel, .empty-state')
        ?? target.closest<HTMLElement>('#site-page-content > *') ?? rootRef.current;
      setDraft({
        content_key: `block:${crypto.randomUUID()}`, page_path: pathname, content_type: 'text', content: '', href: null,
        anchor_key: elementKey(rootRef.current, anchor), sort_order: blocks.length, isBlock: true,
      });
      setPlacing(false); return;
    }

    const blockElement = target.closest<HTMLElement>('[data-content-key]');
    const blockItem = blockElement ? items.find(item => item.content_key === blockElement.dataset.contentKey) : undefined;
    if (blockItem) { event.preventDefault(); event.stopPropagation(); openDraft(blockItem, true); return; }

    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, {
      acceptNode: node => node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
    });
    const textNode = walker.nextNode();
    if (!(textNode instanceof Text)) return;
    const key = textNodeKey(rootRef.current, pathname, textNode);
    if (!key) return;
    event.preventDefault(); event.stopPropagation();
    const current = items.find(item => item.content_key === key);
    openDraft(current ?? { content_key: key, page_path: pathname, content_type: 'text', content: textNode.textContent?.trim() ?? '', href: null, anchor_key: '', sort_order: 0 }, false);
  }

  function addBlock() {
    setDraft(null); setError(''); setNotice(''); setPlacing(true);
  }

  async function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    const content = draft.content.trim();
    const href = draft.content_type === 'text' ? null : draft.href?.trim() || null;
    if (!content) { setError('Ajoute un texte ou un intitulé avant d’enregistrer.'); return; }
    if (draft.content_type !== 'text' && !href) { setError('Ajoute une adresse ou un fichier pour cet élément.'); return; }
    setLoading(true); setError('');
    const { error: saveError } = await createClient().rpc('admin_save_site_content', {
      p_content_key: draft.content_key, p_page_path: pathname, p_content_type: draft.content_type,
      p_content: content, p_href: href, p_anchor_key: draft.anchor_key, p_sort_order: draft.sort_order,
    });
    if (saveError) { setError('Enregistrement refusé. Vérifie les droits fondateur et la migration 007.'); setLoading(false); return; }
    const saved: ContentItem = { ...draft, page_path: pathname, content, href };
    setItems(current => [...current.filter(item => item.content_key !== saved.content_key), saved]);
    setDraft(null); setLoading(false); setNotice('Modification publiée sur cette page.');
  }

  async function removeBlock(contentKey: string) {
    const { error: deleteError } = await createClient().rpc('admin_delete_site_content', { p_content_key: contentKey });
    if (deleteError) { setError('Impossible de supprimer ce bloc.'); return; }
    setItems(current => current.filter(item => item.content_key !== contentKey));
    setDraft(current => current?.content_key === contentKey ? null : current);
    setNotice('Bloc supprimé.');
  }

  async function uploadImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Choisis une image JPG, PNG, WebP ou GIF.'); return; }
    if (file.size > 50 * 1024 * 1024) { setError('L’image doit faire 50 Mio maximum.'); return; }
    setUploading(true); setError('');
    const objectName = `${crypto.randomUUID()}-${file.name.replace(/[^\w.-]+/g, '-')}`;
    const { data, error: uploadError } = await createClient().storage.from('duck-site-media').upload(objectName, file, { contentType: file.type, upsert: false });
    setUploading(false);
    if (uploadError) { setError('Téléversement impossible. Vérifie le stockage de médias et les droits fondateur.'); return; }
    const { data: publicData } = createClient().storage.from('duck-site-media').getPublicUrl(data.path);
    setDraft(current => current ? { ...current, href: publicData.publicUrl } : current);
  }

  function renderBlock(item: ContentItem) {
    const safeHref = item.href ? mediaUrl(item.href) : '';
    if (item.content_type === 'image' && safeHref) return <figure className="site-custom-media"><img src={safeHref} alt={item.content}/>{item.content && <figcaption>{item.content}</figcaption>}</figure>;
    if (item.content_type === 'video' && safeHref) {
      const embedUrl = videoEmbedUrl(safeHref);
      return embedUrl ? <div className="site-custom-video"><iframe src={embedUrl} title={item.content} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/></div>
        : /\.(mp4|webm|ogg)(?:$|\?)/i.test(safeHref) ? <video className="site-custom-video-file" controls preload="metadata" src={safeHref}>{item.content}</video>
        : <p className="site-custom-block-error">Adresse vidéo non prise en charge.</p>;
    }
    if ((item.content_type === 'button' || item.content_type === 'download') && safeHref) return <a className={`button site-custom-button ${item.content_type === 'download' ? 'site-download-button' : ''}`} href={safeHref} download={item.content_type === 'download' ? true : undefined} target={safeHref.startsWith('http') ? '_blank' : undefined} rel={safeHref.startsWith('http') ? 'noreferrer' : undefined}>{item.content_type === 'download' && <ArrowDownToLine size={17}/>} {item.content}</a>;
    return <p className="site-custom-text">{item.content}</p>;
  }

  return <div
    id="site-page-content"
    ref={rootRef}
    className={editing ? 'site-page-content is-editing' : 'site-page-content'}
    onClickCapture={selectText}
  >
    {children}
    {blocks.map(item => <PositionedBlock key={item.content_key} item={item} rootRef={rootRef} editing={editing} onEdit={() => openDraft(item, true)} onDelete={() => void removeBlock(item.content_key)}>{renderBlock(item)}</PositionedBlock>)}

    {isFounder && <div className="site-editor-toolbar" data-site-editor-ui>
      {editing && <span>{placing ? 'Clique sur une zone pour placer le bloc' : 'Clique sur un texte pour le modifier'}</span>}
      {error && <span className="site-editor-message error" role="alert">{error}</span>}
      {notice && <span className="site-editor-message" role="status"><Check size={14}/>{notice}</span>}
      {editing && <button type="button" onClick={addBlock}><Plus size={15}/> Ajouter un bloc</button>}
      <button className={editing ? 'site-editor-active' : ''} type="button" onClick={() => { setEditing(value => !value); setPlacing(false); setDraft(null); setError(''); }}>
        {editing ? <><X size={15}/> Terminer</> : <><Pencil size={15}/> Modifier cette page</>}
      </button>
    </div>}

    {placing && <button className="site-editor-cancel-placement" data-site-editor-ui type="button" onClick={() => setPlacing(false)}>Annuler le placement</button>}
    {draft && <div className="site-editor-backdrop" data-site-editor-ui onMouseDown={event => { if (event.target === event.currentTarget) setDraft(null); }}>
      <section className="site-editor-dialog" role="dialog" aria-modal="true" aria-labelledby="site-editor-dialog-title">
        <header><div><span>DUCKADMIN · ÉDITION DE PAGE</span><h2 id="site-editor-dialog-title">{draft.isBlock ? 'Configurer le bloc' : 'Modifier le texte'}</h2></div><button className="site-editor-close" type="button" onClick={() => setDraft(null)} aria-label="Fermer"><X size={18}/></button></header>
        {draft.isBlock && <label>Type de bloc<select value={draft.content_type} onChange={event => setDraft({ ...draft, content_type: event.target.value as ContentType, href: null })}>
          <option value="text">Texte</option><option value="button">Bouton</option><option value="download">Bouton de téléchargement</option><option value="image">Image</option><option value="video">Vidéo</option>
        </select></label>}
        <form onSubmit={event => void saveDraft(event)}>
          <label>{draft.content_type === 'image' ? 'Texte alternatif ou légende' : draft.content_type === 'video' ? 'Titre de la vidéo' : draft.content_type === 'button' || draft.content_type === 'download' ? 'Texte du bouton' : 'Texte'}
            <textarea autoFocus value={draft.content} onChange={event => setDraft({ ...draft, content: event.target.value })} rows={draft.content_type === 'text' ? 5 : 2} maxLength={2000} required/>
          </label>
          {draft.content_type !== 'text' && <label>{draft.content_type === 'image' ? 'Adresse de l’image' : draft.content_type === 'video' ? 'Lien YouTube, Vimeo ou fichier MP4/WebM' : draft.content_type === 'download' ? 'Lien du fichier à télécharger' : 'Adresse du bouton'}
            <input type="url" value={draft.href ?? ''} onChange={event => setDraft({ ...draft, href: event.target.value })} placeholder={draft.content_type === 'video' ? 'https://youtu.be/…' : 'https://…'} required/>
          </label>}
          {draft.content_type === 'image' && <label className="site-editor-upload"><ImagePlus size={16}/>{uploading ? 'Téléversement…' : 'Téléverser une image (50 Mio max)'}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={event => void uploadImage(event.target.files?.[0])} disabled={uploading}/></label>}
          {draft.content_type === 'video' && <small>Les vidéos YouTube et Vimeo sont intégrées automatiquement. Les fichiers MP4, WebM et OGG sont lus avec le lecteur du site.</small>}
          {error && <p className="site-editor-form-error" role="alert">{error}</p>}
          <footer><button className="button button-secondary" type="button" onClick={() => setDraft(null)}>Annuler</button>{draft.isBlock && <button className="button button-secondary" type="button" onClick={() => void removeBlock(draft.content_key)}><Trash2 size={15}/> Supprimer</button>}<button className="button" type="submit" disabled={loading || uploading}><Save size={15}/>{loading ? 'Publication…' : 'Publier'}</button></footer>
        </form>
      </section>
    </div>}
  </div>;
}

function PositionedBlock({ item, rootRef, editing, onEdit, onDelete, children }: {
  item: ContentItem; rootRef: React.RefObject<HTMLDivElement | null>; editing: boolean; onEdit: () => void; onDelete: () => void; children: ReactNode;
}) {
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const target = item.anchor_key ? elementAtKey(root, item.anchor_key) : null;
    const mount = document.createElement('div');
    mount.className = 'site-custom-block-slot';
    mount.dataset.anchorKey = item.anchor_key;
    mount.dataset.sortOrder = String(item.sort_order);
    if (target?.parentElement) {
      const siblings = Array.from(target.parentElement.children).filter((element): element is HTMLDivElement => element instanceof HTMLDivElement && element.classList.contains('site-custom-block-slot') && element.dataset.anchorKey === item.anchor_key);
      const next = siblings.find(element => Number(element.dataset.sortOrder) > item.sort_order);
      if (next) target.parentElement.insertBefore(mount, next);
      else if (siblings.length) siblings[siblings.length - 1].insertAdjacentElement('afterend', mount);
      else target.insertAdjacentElement('afterend', mount);
    }
    else root.append(mount);
    setSlot(mount);
    return () => { setSlot(null); mount.remove(); };
  }, [item.anchor_key, item.sort_order, rootRef]);
  if (!slot) return null;
  return createPortal(<div className="site-custom-block" data-content-key={item.content_key}>
    {children}
    {editing && <div className="site-custom-block-tools" data-site-editor-ui><button type="button" onClick={onEdit}><Pencil size={13}/> Modifier</button><button type="button" onClick={onDelete} aria-label="Supprimer le bloc"><Trash2 size={13}/></button></div>}
  </div>, slot);
}
