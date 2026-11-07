-- Apply after 202611070003_admin_profile_management.sql in DuckAuth.
create table if not exists public.admin_action_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references auth.users(id),
  action text not null check (action ~ '^(profile|software)\.[a-z_]+$'),
  target_project text not null check (target_project in ('duckauth', 'platform')),
  target_id uuid,
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'failed')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.admin_action_log enable row level security;
revoke all on public.admin_action_log from public, anon, authenticated;
grant select on public.admin_action_log to authenticated;
drop policy if exists "Admins can read admin action log" on public.admin_action_log;
create policy "Admins can read admin action log" on public.admin_action_log
  for select to authenticated using (public.is_duck_admin());

create or replace function public.admin_log_action(
  p_action text,
  p_target_project text,
  p_target_id uuid,
  p_details jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  action_id uuid;
begin
  if not public.is_duck_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  if p_action !~ '^(profile|software)\.[a-z_]+$'
    or p_target_project not in ('duckauth', 'platform') then
    raise exception 'Invalid admin action' using errcode = '22023';
  end if;
  insert into public.admin_action_log (actor_user_id, action, target_project, target_id, details)
  values ((select auth.uid()), p_action, p_target_project, p_target_id, coalesce(p_details, '{}'::jsonb))
  returning id into action_id;
  return action_id;
end;
$$;

create or replace function public.admin_finish_action(
  p_action_id uuid,
  p_status text,
  p_target_id uuid default null,
  p_result jsonb default '{}'::jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_count integer;
begin
  if not public.is_duck_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  if p_status not in ('succeeded', 'failed') then
    raise exception 'Invalid admin action status' using errcode = '22023';
  end if;
  update public.admin_action_log
  set status = p_status,
      target_id = coalesce(p_target_id, target_id),
      details = details || coalesce(p_result, '{}'::jsonb),
      completed_at = now()
  where id = p_action_id and actor_user_id = (select auth.uid()) and status = 'pending';
  get diagnostics updated_count = row_count;
  return updated_count = 1;
end;
$$;

revoke all on function public.admin_log_action(text, text, uuid, jsonb) from public, anon;
grant execute on function public.admin_log_action(text, text, uuid, jsonb) to authenticated;
revoke all on function public.admin_finish_action(uuid, text, uuid, jsonb) from public, anon;
grant execute on function public.admin_finish_action(uuid, text, uuid, jsonb) to authenticated;
