-- Private, short-lived guest file transfers. Apply to the main platform project.
create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('guest-transfers', 'guest-transfers', false, 26214400, null)
on conflict (id) do update set public = false, file_size_limit = 26214400;

create table if not exists public.guest_transfers (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  upload_proof_hash text not null,
  storage_path text not null unique,
  original_name text not null check (char_length(original_name) between 1 and 120),
  content_type text not null default 'application/octet-stream',
  size_bytes bigint check (size_bytes is null or size_bytes between 1 and 26214400),
  status text not null default 'pending' check (status in ('pending','ready')),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  download_count integer not null default 0 check (download_count >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.guest_transfer_rate_limits (
  fingerprint text primary key,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count >= 0)
);

create or replace function public.consume_guest_transfer_rate_limit(
  p_fingerprint text, p_limit integer, p_window_seconds integer
) returns boolean
language plpgsql security definer set search_path = '' as $$
declare current_count integer;
begin
  insert into public.guest_transfer_rate_limits as limits (fingerprint, window_started_at, request_count)
  values (p_fingerprint, now(), 1)
  on conflict (fingerprint) do update set
    window_started_at = case
      when limits.window_started_at <= now() - make_interval(secs => p_window_seconds) then now()
      else limits.window_started_at end,
    request_count = case
      when limits.window_started_at <= now() - make_interval(secs => p_window_seconds) then 1
      else limits.request_count + 1 end
  returning request_count into current_count;
  return current_count <= p_limit;
end;
$$;

alter table public.guest_transfers enable row level security;
alter table public.guest_transfer_rate_limits enable row level security;
revoke all on public.guest_transfers from anon, authenticated;
revoke all on public.guest_transfer_rate_limits from anon, authenticated;
revoke all on function public.consume_guest_transfer_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_guest_transfer_rate_limit(text, integer, integer) to service_role;
create or replace function public.increment_guest_transfer_downloads(p_transfer_id uuid)
returns void language sql security definer set search_path = '' as $$
  update public.guest_transfers set download_count = download_count + 1 where id = p_transfer_id;
$$;
revoke all on function public.increment_guest_transfer_downloads(uuid) from public, anon, authenticated;
grant execute on function public.increment_guest_transfer_downloads(uuid) to service_role;
create or replace function public.cleanup_guest_transfer_rate_limits()
returns integer language plpgsql security definer set search_path = '' as $$
declare deleted_count integer;
begin
  delete from public.guest_transfer_rate_limits
  where window_started_at < now() - interval '24 hours';
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;
revoke all on function public.cleanup_guest_transfer_rate_limits() from public, anon, authenticated;
grant execute on function public.cleanup_guest_transfer_rate_limits() to service_role;
-- The bucket is private and has no anon/authenticated object policies. The
-- Edge Function uses the server-only service-role key for narrowly scoped,
-- short-expiry signed URLs.
