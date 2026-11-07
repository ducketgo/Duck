-- Apply after 202611070002_founder_admin.sql in the DuckAuth project.
create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references auth.users(id),
  target_user_id uuid not null references auth.users(id),
  action text not null check (action = 'profile.update'),
  changed_fields text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.admin_audit_log enable row level security;
revoke all on public.admin_audit_log from public, anon, authenticated;
grant select on public.admin_audit_log to authenticated;
drop policy if exists "Admins can read admin audit log" on public.admin_audit_log;
create policy "Admins can read admin audit log" on public.admin_audit_log
  for select to authenticated using (public.is_duck_admin());

create or replace function public.admin_update_profile(
  p_user_id uuid,
  p_username text,
  p_first_name text,
  p_last_name text,
  p_bio text,
  p_avatar_url text,
  p_is_profile_public boolean,
  p_role text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_profile public.profiles%rowtype;
  target_email text;
  changed_fields text[];
begin
  if not public.is_duck_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  if p_username !~ '^[A-Za-z0-9_]{3,24}$' then
    raise exception 'Invalid username' using errcode = '22023';
  end if;
  if char_length(trim(p_first_name)) not between 1 and 80
    or char_length(trim(p_last_name)) not between 1 and 80 then
    raise exception 'Invalid name' using errcode = '22023';
  end if;
  if p_bio is not null and char_length(p_bio) > 500 then
    raise exception 'Bio is too long' using errcode = '22023';
  end if;
  if p_avatar_url is not null and p_avatar_url !~ '^https://' then
    raise exception 'Avatar URL must use HTTPS' using errcode = '22023';
  end if;
  if p_role not in ('admin', 'member') then
    raise exception 'Invalid role' using errcode = '22023';
  end if;

  select * into current_profile
  from public.profiles
  where id = p_user_id
  for update;
  if not found then
    raise exception 'Profile not found' using errcode = 'P0002';
  end if;

  select lower(email) into target_email
  from auth.users
  where id = p_user_id;
  if target_email = 'duckdev-service@protonmail.com' and p_role <> 'admin' then
    raise exception 'The founder account must remain an administrator' using errcode = '42501';
  end if;

  changed_fields := array_remove(array[
    case when current_profile.username is distinct from p_username then 'username' end,
    case when current_profile.first_name is distinct from trim(p_first_name) then 'first_name' end,
    case when current_profile.last_name is distinct from trim(p_last_name) then 'last_name' end,
    case when current_profile.bio is distinct from p_bio then 'bio' end,
    case when current_profile.avatar_url is distinct from p_avatar_url then 'avatar_url' end,
    case when current_profile.is_profile_public is distinct from p_is_profile_public then 'is_profile_public' end,
    case when current_profile.role is distinct from p_role then 'role' end
  ], null);

  update public.profiles
  set username = p_username,
      first_name = trim(p_first_name),
      last_name = trim(p_last_name),
      bio = p_bio,
      avatar_url = p_avatar_url,
      is_profile_public = p_is_profile_public,
      role = p_role,
      updated_at = now()
  where id = p_user_id;

  if cardinality(changed_fields) > 0 then
    insert into public.admin_audit_log (actor_user_id, target_user_id, action, changed_fields)
    values ((select auth.uid()), p_user_id, 'profile.update', changed_fields);
  end if;

  return p_user_id;
end;
$$;

revoke all on function public.admin_update_profile(uuid, text, text, text, text, text, boolean, text) from public, anon;
grant execute on function public.admin_update_profile(uuid, text, text, text, text, text, boolean, text) to authenticated;
