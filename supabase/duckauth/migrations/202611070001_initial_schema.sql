-- Apply this migration to the dedicated DuckAuth Supabase project.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[A-Za-z0-9_]{3,24}$'),
  first_name text not null check (char_length(first_name) between 1 and 80),
  last_name text not null check (char_length(last_name) between 1 and 80),
  bio text check (bio is null or char_length(bio) <= 500),
  avatar_url text,
  is_profile_public boolean not null default false,
  duck_points integer not null default 500 check (duck_points >= 0),
  role text not null default 'member' check (role in ('admin', 'member')),
  terms_version text,
  terms_accepted_at timestamptz,
  check ((terms_version is null) = (terms_accepted_at is null)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.create_duck_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, username, first_name, last_name, is_profile_public, terms_version, terms_accepted_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'member_' || substr(new.id::text, 1, 12)),
    coalesce(nullif(new.raw_user_meta_data->>'first_name', ''), 'Membre'),
    coalesce(nullif(new.raw_user_meta_data->>'last_name', ''), 'DUCK'),
    coalesce(new.raw_user_meta_data->>'is_profile_public' = 'true', false),
    case when new.raw_user_meta_data->>'terms_version' = '2026-11-07-v1' then '2026-11-07-v1' else null end,
    case when new.raw_user_meta_data->>'terms_version' = '2026-11-07-v1' then now() else null end
  );
  return new;
end;
$$;

drop trigger if exists on_duckauth_user_created on auth.users;
create trigger on_duckauth_user_created after insert on auth.users
for each row execute procedure public.create_duck_profile();

alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (username, first_name, last_name, bio, avatar_url, is_profile_public) on public.profiles to authenticated;

create policy "Members can read their profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "Public profiles are visible to signed-in members" on public.profiles
  for select to authenticated using (is_profile_public = true);
create policy "Members can update their profile" on public.profiles
  for update to authenticated using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- No client policy permits changing role or points. Award points via a future
-- audited server-side RPC with idempotency protection.
