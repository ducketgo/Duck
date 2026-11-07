-- Apply after 202611070001_initial_schema.sql in the DuckAuth project.
-- Only the verified founder identity receives the initial admin role.
create or replace function public.is_duck_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles as profile
    where profile.id = (select auth.uid())
      and profile.role = 'admin'
  );
$$;

revoke all on function public.is_duck_admin() from public, anon;
grant execute on function public.is_duck_admin() to authenticated;

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles" on public.profiles
  for select to authenticated
  using (public.is_duck_admin());

create or replace function public.sync_duck_founder_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  founder_email constant text := 'duckdev-service@protonmail.com';
  founder_username text;
  accepted_terms_version text;
begin
  if tg_op = 'UPDATE'
    and lower(coalesce(old.email, '')) = founder_email
    and lower(coalesce(new.email, '')) <> founder_email then
    update public.profiles
      set role = 'member', updated_at = now()
      where id = new.id and role = 'admin';
    return new;
  end if;

  if lower(coalesce(new.email, '')) <> founder_email
    or new.email_confirmed_at is null then
    return new;
  end if;

  founder_username := 'founder_' || substr(replace(new.id::text, '-', ''), 1, 12);
  accepted_terms_version := case
    when new.raw_user_meta_data->>'terms_version' = '2026-11-07-v1' then '2026-11-07-v1'
    else null
  end;

  insert into public.profiles (
    id, username, first_name, last_name, is_profile_public,
    role, terms_version, terms_accepted_at
  ) values (
    new.id,
    founder_username,
    coalesce(nullif(left(trim(new.raw_user_meta_data->>'first_name'), 80), ''), 'Leopold'),
    coalesce(nullif(left(trim(new.raw_user_meta_data->>'last_name'), 80), ''), 'Bonin'),
    false,
    'admin',
    accepted_terms_version,
    case when accepted_terms_version is not null then now() else null end
  )
  on conflict (id) do update
    set role = 'admin', updated_at = now();

  return new;
end;
$$;

revoke all on function public.sync_duck_founder_admin() from public, anon, authenticated;

drop trigger if exists sync_duck_founder_admin on auth.users;
create trigger sync_duck_founder_admin
  after insert or update on auth.users
  for each row execute function public.sync_duck_founder_admin();

-- Promote the already-verified founder account when this migration is applied.
insert into public.profiles (
  id, username, first_name, last_name, is_profile_public,
  role, terms_version, terms_accepted_at
)
select
  user_row.id,
  'founder_' || substr(replace(user_row.id::text, '-', ''), 1, 12),
  coalesce(nullif(left(trim(user_row.raw_user_meta_data->>'first_name'), 80), ''), 'Leopold'),
  coalesce(nullif(left(trim(user_row.raw_user_meta_data->>'last_name'), 80), ''), 'Bonin'),
  false,
  'admin',
  case when user_row.raw_user_meta_data->>'terms_version' = '2026-11-07-v1' then '2026-11-07-v1' else null end,
  case when user_row.raw_user_meta_data->>'terms_version' = '2026-11-07-v1' then now() else null end
from auth.users as user_row
where lower(user_row.email) = 'duckdev-service@protonmail.com'
  and user_row.email_confirmed_at is not null
on conflict (id) do update
  set role = 'admin', updated_at = now();
