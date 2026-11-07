import { createClient } from 'npm:@supabase/supabase-js@2';

const bucket = 'guest-transfers';
const maxBytes = 25 * 1024 * 1024;
const allowedOrigins = (Deno.env.get('DUCK_APP_ORIGIN') ?? 'http://localhost:3000').split(',').map(value => value.trim()).filter(Boolean);
const corsHeaders = (req: Request) => ({
  'Access-Control-Allow-Origin': allowedOrigins.includes(req.headers.get('origin') ?? '') ? req.headers.get('origin')! : (allowedOrigins[0] ?? 'http://localhost:3000'),
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-cleanup-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
});
const json = (req: Request, body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(req), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const service = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });

async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}
function randomToken(bytes = 32) {
  const value = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...value)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}
function getClientIp(req: Request) {
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded?.split(',').at(-1)?.trim() || 'unknown';
}
async function rateLimit(req: Request, limit: number) {
  const secret = Deno.env.get('GUEST_TRANSFER_IP_HASH_SECRET');
  if (!secret) throw new Error('GUEST_TRANSFER_IP_HASH_SECRET is not set');
  const fingerprint = await sha256(`${secret}:${getClientIp(req)}`);
  const { data, error } = await service.rpc('consume_guest_transfer_rate_limit', { p_fingerprint: fingerprint, p_limit: limit, p_window_seconds: 3600 });
  if (error) throw error;
  return data === true;
}
async function readSmallBody(req: Request, maxLength: number) {
  const reader = req.body?.getReader();
  if (!reader) return '';
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > maxLength) {
      await reader.cancel();
      throw new RangeError('Request body too large');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder().decode(bytes);
}
function cleanName(name: string) {
  const normalized = name.normalize('NFKC').replace(/[\\/\u0000-\u001f\u007f]/g, '_').trim().slice(0, 120);
  return normalized || 'fichier';
}
function isAllowedOrigin(req: Request) {
  const origin = req.headers.get('origin');
  return !origin || allowedOrigins.includes(origin);
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json(req, { error: 'Méthode non autorisée.' }, 405);
  if (!isAllowedOrigin(req)) return json(req, { error: 'Origine non autorisée.' }, 403);

  try {
    const declaredLength = Number(req.headers.get('content-length') ?? 0);
    if (declaredLength > 8192) return json(req, { error: 'Requête trop volumineuse.' }, 413);
    let rawBody: string;
    try { rawBody = await readSmallBody(req, 8192); }
    catch (error) { if (error instanceof RangeError) return json(req, { error: 'Requête trop volumineuse.' }, 413); throw error; }
    let body: Record<string, unknown>;
    try { body = JSON.parse(rawBody); } catch { return json(req, { error: 'Requête invalide.' }, 400); }
    const action = body?.action;

    if (action === 'create') {
      if (!(await rateLimit(req, 3))) return json(req, { error: 'Limite atteinte : réessayez dans une heure.' }, 429);
      if (typeof body.name !== 'string' || typeof body.size !== 'number' || !Number.isSafeInteger(body.size) || body.size < 1 || body.size > maxBytes) {
        return json(req, { error: 'Le fichier doit peser entre 1 octet et 25 Mio.' }, 400);
      }
      const id = crypto.randomUUID();
      const token = randomToken();
      const uploadProof = randomToken();
      const name = cleanName(body.name);
      const path = `${id}/${name}`;
      const contentType = typeof body.contentType === 'string' && body.contentType.length < 128 ? body.contentType : 'application/octet-stream';
      const { error: insertError } = await service.from('guest_transfers').insert({ id, token_hash: await sha256(token), upload_proof_hash: await sha256(uploadProof), storage_path: path, original_name: name, content_type: contentType });
      if (insertError) throw insertError;
      const { data, error } = await service.storage.from(bucket).createSignedUploadUrl(path, { upsert: false });
      if (error) throw error;
      return json(req, { id, token, uploadProof, path: data.path, uploadToken: data.token });
    }

    if (action === 'complete') {
      if (typeof body.id !== 'string' || typeof body.uploadProof !== 'string') return json(req, { error: 'Requête invalide.' }, 400);
      const { data: transfer, error } = await service.from('guest_transfers').select('id, storage_path, expires_at').eq('id', body.id).eq('upload_proof_hash', await sha256(body.uploadProof)).eq('status', 'pending').maybeSingle();
      if (error || !transfer || new Date(transfer.expires_at) <= new Date()) return json(req, { error: 'Transfert expiré ou invalide.' }, 404);
      const separator = transfer.storage_path.lastIndexOf('/');
      const folder = transfer.storage_path.slice(0, separator);
      const filename = transfer.storage_path.slice(separator + 1);
      const { data: objects, error: listError } = await service.storage.from(bucket).list(folder, { search: filename, limit: 5 });
      if (listError) throw listError;
      const uploaded = objects?.find(object => object.name === filename);
      if (!uploaded || !uploaded.metadata?.size || uploaded.metadata.size > maxBytes) return json(req, { error: 'Le fichier n’a pas été envoyé ou dépasse la taille maximale.' }, 400);
      const { error: updateError } = await service.from('guest_transfers').update({ status: 'ready', size_bytes: uploaded.metadata.size }).eq('id', body.id);
      if (updateError) throw updateError;
      return json(req, { id: transfer.id, status: 'ready' });
    }

    if (action === 'download') {
      if (typeof body.token !== 'string' || body.token.length < 32 || body.token.length > 128) return json(req, { error: 'Lien de transfert invalide.' }, 404);
      if (!(await rateLimit(req, 20))) return json(req, { error: 'Trop de téléchargements depuis cette connexion. Réessayez dans une heure.' }, 429);
      const { data: transfer, error } = await service.from('guest_transfers').select('id, storage_path, original_name, expires_at, status').eq('token_hash', await sha256(body.token)).eq('status', 'ready').gt('expires_at', new Date().toISOString()).maybeSingle();
      if (error || !transfer) return json(req, { error: 'Ce transfert est introuvable ou a expiré.' }, 404);
      const { data, error: signError } = await service.storage.from(bucket).createSignedUrl(transfer.storage_path, 60, { download: transfer.original_name });
      if (signError) throw signError;
      const { error: countError } = await service.rpc('increment_guest_transfer_downloads', { p_transfer_id: transfer.id });
      if (countError) throw countError;
      return json(req, { url: data.signedUrl, name: transfer.original_name, expiresIn: 60 });
    }

    if (action === 'cleanup') {
      const configuredSecret = Deno.env.get('GUEST_TRANSFER_CLEANUP_SECRET');
      if (!configuredSecret || req.headers.get('x-cleanup-secret') !== configuredSecret) return json(req, { error: 'Non autorisé.' }, 401);
      const { data: expired, error } = await service.from('guest_transfers').select('id, storage_path').lte('expires_at', new Date().toISOString()).limit(500);
      if (error) throw error;
      if (expired?.length) {
        const { error: removeError } = await service.storage.from(bucket).remove(expired.map(item => item.storage_path));
        if (removeError) throw removeError;
        const { error: deleteError } = await service.from('guest_transfers').delete().in('id', expired.map(item => item.id));
        if (deleteError) throw deleteError;
      }
      const { data: rateLimitsRemoved, error: rateError } = await service.rpc('cleanup_guest_transfer_rate_limits');
      if (rateError) throw rateError;
      return json(req, { removed: expired?.length ?? 0, rateLimitsRemoved });
    }

    return json(req, { error: 'Action inconnue.' }, 400);
  } catch (error) {
    console.error('guest-transfer error', error);
    return json(req, { error: 'Le service de transfert est temporairement indisponible.' }, 500);
  }
});
