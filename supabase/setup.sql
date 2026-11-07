-- DUCK backend v2: Firebase Auth + Supabase Database/Storage/Realtime.
-- Rebuilds DUCK-managed PostgreSQL objects and clears their data.
-- It leaves auth.users, unrelated project data, and Storage objects intact.
-- Empty the two Storage buckets in the Supabase Dashboard/API first if you also
-- want to delete existing file contents; deleting storage.objects in SQL is unsafe.
-- First enable Firebase Auth as a Third-Party Auth provider in Supabase.
-- Firebase project ID is inferred from the supplied RTDB URL: duckauth2026.

begin;

create extension if not exists pgcrypto with schema extensions;

-- Reset objects created by earlier DUCK setups before installing the Firebase model.
drop policy if exists "Conversation members download message files" on storage.objects;
drop policy if exists "Members upload their own message files" on storage.objects;
drop policy if exists "Members delete their own message files" on storage.objects;
drop policy if exists "Firebase JWT required for message file bucket" on storage.objects;

drop table if exists public.duck_messages cascade;
drop table if exists public.duck_conversation_members cascade;
drop table if exists public.duck_conversations cascade;
drop table if exists public.duck_profiles cascade;
drop table if exists public.guest_transfers cascade;
drop table if exists public.guest_transfer_rate_limits cascade;
drop table if exists public.profiles cascade;
drop table if exists public.software cascade;
drop function if exists public.create_duck_conversation(text[], text, text);
drop function if exists public.is_duck_conversation_member(text);
drop function if exists public.consume_guest_transfer_rate_limit(text, integer, integer);
drop function if exists public.increment_guest_transfer_downloads(uuid);
drop function if exists public.cleanup_guest_transfer_rate_limits();
drop function if exists public.firebase_uid();
drop function if exists public.is_duck_admin();
drop function if exists public.set_updated_at();

-- Stop the legacy Supabase Auth profile trigger. Firebase identities are external
-- string UIDs and must not reference auth.users (whose IDs are Supabase UUIDs).
drop trigger if exists on_duckauth_user_created on auth.users;
drop function if exists public.create_duck_profile();

-- Return a Firebase UID only for tokens from the configured Firebase project.
create or replace function public.firebase_uid()
returns text
language sql stable security invoker set search_path = ''
as $$
  select case
    when auth.jwt()->>'iss' = 'https://securetoken.google.com/duckauth2026'
      and auth.jwt()->>'aud' = 'duckauth2026'
      and auth.jwt()->>'role' = 'authenticated'
      and auth.jwt()->>'email_verified' = 'true'
    then auth.jwt()->>'sub'
    else null
  end;
$$;
revoke all on function public.firebase_uid() from public, anon;
grant execute on function public.firebase_uid() to authenticated;

create or replace function public.is_duck_admin()
returns boolean language sql stable security invoker set search_path = '' as $$
  select public.firebase_uid() is not null and coalesce(auth.jwt()->>'admin' = 'true', false);
$$;
revoke all on function public.is_duck_admin() from public, anon;
grant execute on function public.is_duck_admin() to authenticated;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Firebase-user profile mirror. Identity and primary authentication remain in Firebase.
create table if not exists public.duck_profiles (
  firebase_uid text primary key check (char_length(firebase_uid) between 1 and 128),
  username text unique check (username is null or username ~ '^[A-Za-z0-9_]{3,24}$'),
  display_name text not null default 'Membre' check (char_length(display_name) between 1 and 80),
  avatar_url text check (avatar_url is null or avatar_url ~ '^https://'),
  is_public boolean not null default false,
  terms_version text,
  terms_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint duck_profiles_terms_pair check ((terms_version is null) = (terms_accepted_at is null))
);
alter table public.duck_profiles add column if not exists terms_version text;
alter table public.duck_profiles add column if not exists terms_accepted_at timestamptz;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'duck_profiles_terms_pair' and conrelid = 'public.duck_profiles'::regclass) then
    alter table public.duck_profiles add constraint duck_profiles_terms_pair check ((terms_version is null) = (terms_accepted_at is null));
  end if;
end $$;
alter table public.duck_profiles enable row level security;
revoke all on public.duck_profiles from public, anon, authenticated;
grant select on public.duck_profiles to authenticated;
grant insert (firebase_uid, username, display_name, avatar_url, is_public, terms_version, terms_accepted_at) on public.duck_profiles to authenticated;
grant update (username, display_name, avatar_url, is_public, terms_version, terms_accepted_at) on public.duck_profiles to authenticated;
drop policy if exists "Firebase users read visible profiles" on public.duck_profiles;
create policy "Firebase users read visible profiles" on public.duck_profiles for select to authenticated
  using (firebase_uid = (select public.firebase_uid()) or is_public = true);
drop policy if exists "Firebase users create their profile" on public.duck_profiles;
create policy "Firebase users create their profile" on public.duck_profiles for insert to authenticated
  with check (
    firebase_uid = (select public.firebase_uid())
    and username is not distinct from (select auth.jwt()->>'username')
    and terms_version is not distinct from (select auth.jwt()->>'terms_version')
    and terms_accepted_at is not distinct from ((select auth.jwt()->>'terms_accepted_at')::timestamptz)
  );
drop policy if exists "Firebase users update their profile" on public.duck_profiles;
create policy "Firebase users update their profile" on public.duck_profiles for update to authenticated
  using (firebase_uid = (select public.firebase_uid()))
  with check (
    firebase_uid = (select public.firebase_uid())
    and username is not distinct from (select auth.jwt()->>'username')
    and terms_version is not distinct from (select auth.jwt()->>'terms_version')
    and terms_accepted_at is not distinct from ((select auth.jwt()->>'terms_accepted_at')::timestamptz)
  );
drop trigger if exists duck_profiles_set_updated_at on public.duck_profiles;
create trigger duck_profiles_set_updated_at before update on public.duck_profiles
  for each row execute procedure public.set_updated_at();

-- Conversations and memberships. Membership changes are handled by the RPC below.
create table if not exists public.duck_conversations (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('direct', 'group')),
  title text check (title is null or char_length(title) between 1 and 120),
  created_by_uid text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.duck_conversation_members (
  conversation_id uuid not null references public.duck_conversations(id) on delete cascade,
  firebase_uid text not null,
  member_role text not null default 'member' check (member_role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (conversation_id, firebase_uid)
);
create index if not exists duck_conversation_members_user_idx on public.duck_conversation_members(firebase_uid, conversation_id);

create or replace function public.is_duck_conversation_member(p_conversation_id text)
returns boolean language sql stable security definer set search_path = '' as $$
  select public.firebase_uid() is not null and exists (
    select 1 from public.duck_conversation_members m
    where m.conversation_id::text = p_conversation_id
      and m.firebase_uid = public.firebase_uid()
  );
$$;
revoke all on function public.is_duck_conversation_member(text) from public, anon;
grant execute on function public.is_duck_conversation_member(text) to authenticated;

create or replace function public.create_duck_conversation(
  p_member_uids text[], p_kind text default 'direct', p_title text default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_caller_uid text := public.firebase_uid();
  v_conversation_id uuid;
  member_count integer;
begin
  if v_caller_uid is null then raise exception 'Valid Firebase identity required' using errcode = '42501'; end if;
  if p_kind is null or p_kind not in ('direct', 'group') then raise exception 'Invalid conversation kind'; end if;
  if p_member_uids is null or cardinality(p_member_uids) < 2 or cardinality(p_member_uids) > 50 then
    raise exception 'Conversation must have between 2 and 50 members';
  end if;
  if exists (select 1 from unnest(p_member_uids) as members(uid) where uid is null or btrim(uid) = '') then
    raise exception 'Member UIDs cannot be empty';
  end if;
  select count(distinct uid) into member_count from unnest(p_member_uids) as members(uid);
  if member_count <> cardinality(p_member_uids) then raise exception 'Duplicate member UIDs'; end if;
  if not (v_caller_uid = any(p_member_uids)) then raise exception 'Creator must be a member'; end if;
  if p_kind = 'direct' and member_count <> 2 then raise exception 'Direct conversations require exactly 2 members'; end if;
  if p_title is not null and char_length(p_title) > 120 then raise exception 'Title is too long'; end if;

  insert into public.duck_conversations(kind, title, created_by_uid)
    values (p_kind, nullif(btrim(p_title), ''), v_caller_uid) returning id into v_conversation_id;
  insert into public.duck_conversation_members(conversation_id, firebase_uid, member_role)
    select v_conversation_id, uid, case when uid = v_caller_uid then 'owner' else 'member' end
    from unnest(p_member_uids) as members(uid);
  return v_conversation_id;
end;
$$;
revoke all on function public.create_duck_conversation(text[], text, text) from public, anon;
grant execute on function public.create_duck_conversation(text[], text, text) to authenticated;

create table if not exists public.duck_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.duck_conversations(id) on delete cascade,
  sender_uid text not null,
  body text not null default '' check (char_length(body) <= 10000),
  attachment_path text,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz,
  constraint duck_messages_body_or_file check (char_length(btrim(body)) > 0 or attachment_path is not null)
);
create index if not exists duck_messages_conversation_created_idx on public.duck_messages(conversation_id, created_at desc);
alter table public.duck_profiles enable row level security;
alter table public.duck_conversations enable row level security;
alter table public.duck_conversation_members enable row level security;
alter table public.duck_messages enable row level security;

revoke all on public.duck_conversations, public.duck_conversation_members, public.duck_messages from public, anon, authenticated;
grant select on public.duck_conversations, public.duck_conversation_members, public.duck_messages to authenticated;
grant insert (conversation_id, sender_uid, body, attachment_path) on public.duck_messages to authenticated;
grant update (body, attachment_path, edited_at, deleted_at) on public.duck_messages to authenticated;
grant delete on public.duck_messages to authenticated;

drop policy if exists "Members read their conversations" on public.duck_conversations;
create policy "Members read their conversations" on public.duck_conversations for select to authenticated
  using ((select public.is_duck_conversation_member(id::text)));
drop policy if exists "Members read memberships in their conversations" on public.duck_conversation_members;
create policy "Members read memberships in their conversations" on public.duck_conversation_members for select to authenticated
  using (firebase_uid = (select public.firebase_uid()) or (select public.is_duck_conversation_member(conversation_id::text)));
drop policy if exists "Members read messages" on public.duck_messages;
create policy "Members read messages" on public.duck_messages for select to authenticated
  using ((select public.is_duck_conversation_member(conversation_id::text)));
drop policy if exists "Members send messages as themselves" on public.duck_messages;
create policy "Members send messages as themselves" on public.duck_messages for insert to authenticated
  with check (
    sender_uid = (select public.firebase_uid())
    and (select public.is_duck_conversation_member(conversation_id::text))
    and (attachment_path is null or attachment_path like conversation_id::text || '/' || (select public.firebase_uid()) || '/%')
  );
drop policy if exists "Authors edit their messages" on public.duck_messages;
create policy "Authors edit their messages" on public.duck_messages for update to authenticated
  using (sender_uid = (select public.firebase_uid()) and (select public.is_duck_conversation_member(conversation_id::text)) and deleted_at is null)
  with check (
    sender_uid = (select public.firebase_uid())
    and (select public.is_duck_conversation_member(conversation_id::text))
    and (attachment_path is null or attachment_path like conversation_id::text || '/' || (select public.firebase_uid()) || '/%')
  );
drop policy if exists "Authors delete their messages" on public.duck_messages;
create policy "Authors delete their messages" on public.duck_messages for delete to authenticated
  using (sender_uid = (select public.firebase_uid()) and (select public.is_duck_conversation_member(conversation_id::text)));

-- Private storage for message attachments, path: <conversation UUID>/<Firebase UID>/<filename>.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('duck-message-files', 'duck-message-files', false, 26214400, null)
on conflict (id) do update set public = false, file_size_limit = 26214400, allowed_mime_types = null;
drop policy if exists "Conversation members download message files" on storage.objects;
create policy "Conversation members download message files" on storage.objects for select to authenticated
  using (bucket_id = 'duck-message-files' and (select public.is_duck_conversation_member((storage.foldername(name))[1])));
drop policy if exists "Members upload their own message files" on storage.objects;
create policy "Members upload their own message files" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'duck-message-files'
    and (storage.foldername(name))[2] = (select public.firebase_uid())
    and (select public.is_duck_conversation_member((storage.foldername(name))[1]))
  );
drop policy if exists "Members delete their own message files" on storage.objects;
create policy "Members delete their own message files" on storage.objects for delete to authenticated
  using (
    bucket_id = 'duck-message-files'
    and (storage.foldername(name))[2] = (select public.firebase_uid())
    and (select public.is_duck_conversation_member((storage.foldername(name))[1]))
  );
drop policy if exists "Firebase JWT required for message file bucket" on storage.objects;
create policy "Firebase JWT required for message file bucket" on storage.objects as restrictive for all to authenticated
  using (bucket_id <> 'duck-message-files' or (select public.firebase_uid()) is not null)
  with check (bucket_id <> 'duck-message-files' or (select public.firebase_uid()) is not null);

-- Guest transfers remain account-free and are operated by the Edge Function using service_role.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('guest-transfers', 'guest-transfers', false, 26214400, null)
on conflict (id) do update set public = false, file_size_limit = 26214400, allowed_mime_types = null;
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
create index if not exists guest_transfers_expires_at_idx on public.guest_transfers(expires_at);
create index if not exists guest_transfer_rate_limits_window_idx on public.guest_transfer_rate_limits(window_started_at);
alter table public.guest_transfers enable row level security;
alter table public.guest_transfer_rate_limits enable row level security;
revoke all on public.guest_transfers, public.guest_transfer_rate_limits from public, anon, authenticated;
grant all on public.guest_transfers, public.guest_transfer_rate_limits to service_role;

create or replace function public.consume_guest_transfer_rate_limit(p_fingerprint text, p_limit integer, p_window_seconds integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare current_count integer;
begin
  insert into public.guest_transfer_rate_limits as limits (fingerprint, window_started_at, request_count)
  values (p_fingerprint, now(), 1)
  on conflict (fingerprint) do update set
    window_started_at = case when limits.window_started_at <= now() - make_interval(secs => p_window_seconds) then now() else limits.window_started_at end,
    request_count = case when limits.window_started_at <= now() - make_interval(secs => p_window_seconds) then 1 else limits.request_count + 1 end
  returning request_count into current_count;
  return current_count <= p_limit;
end;
$$;
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
  delete from public.guest_transfer_rate_limits where window_started_at < now() - interval '24 hours';
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;
revoke all on function public.cleanup_guest_transfer_rate_limits() from public, anon, authenticated;
grant execute on function public.cleanup_guest_transfer_rate_limits() to service_role;

-- Enable Realtime broadcasts for messages when the standard Supabase publication exists.
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'duck_messages') then
    alter publication supabase_realtime add table public.duck_messages;
  end if;
end $$;

commit;

-- Manual dashboard setup still required:
-- 1) Authentication > Third-Party Auth > Firebase, project ID duckauth2026.
-- 2) Ensure every Firebase ID token has custom claim {"role":"authenticated"}.
-- 3) Deploy guest-transfer and set its Edge secrets; schedule its cleanup action.
