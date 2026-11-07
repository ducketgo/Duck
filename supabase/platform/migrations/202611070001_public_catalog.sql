-- Apply to the main DUCK platform Supabase project (separate from DuckAuth).
create extension if not exists pgcrypto;

create table if not exists public.software (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 100),
  description text not null check (char_length(description) <= 500),
  long_description text not null default '',
  image_urls text[] not null default '{}',
  categories text[] not null default '{}',
  current_version text not null,
  download_url text not null check (download_url ~ '^https://github\.com/'),
  repository_url text check (repository_url is null or repository_url ~ '^https://github\.com/'),
  documentation_url text check (documentation_url is null or documentation_url ~ '^https://'),
  branch text not null check (branch in ('duckdev','djduck','duckos','ducktechnologies','duckweb','duckcommunity','duckauth','duckcommunication')),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.software enable row level security;
revoke all on public.software from anon, authenticated;
grant select on public.software to anon, authenticated;
drop policy if exists "Only published software is public" on public.software;
create policy "Only published software is public" on public.software
  for select to anon, authenticated using (is_published = true);
-- No client write policies: content management must be implemented using a
-- separately authenticated server-side admin workflow.
