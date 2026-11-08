-- Virtual DuckMoney wallets and founder-controlled coding contests.
-- Apply after 202611080001_site_page_builder.sql to the DuckAuth Supabase project.

create table if not exists public.duck_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  duck_rib text not null unique default ('DR-' || upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 16))),
  balance bigint not null default 100 check (balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.duck_contests (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 3 and 100),
  description text not null check (char_length(trim(description)) between 10 and 3000),
  status text not null default 'open' check (status in ('open', 'closed', 'completed')),
  entry_fee bigint not null default 5 check (entry_fee = 5),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  closed_at timestamptz,
  completed_at timestamptz
);

create unique index if not exists duck_contests_one_open_idx
  on public.duck_contests ((status)) where status = 'open';

create table if not exists public.duck_contest_entries (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.duck_contests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null check (char_length(trim(nickname)) between 2 and 32),
  duck_rib text not null,
  project_url text not null check (project_url ~ '^https://[^[:space:]]{3,2040}$'),
  placement smallint check (placement between 1 and 5),
  prize bigint not null default 0 check (prize >= 0),
  submitted_at timestamptz not null default now(),
  unique (contest_id, user_id)
);

create unique index if not exists duck_contest_entries_nickname_idx
  on public.duck_contest_entries (contest_id, lower(nickname));

create table if not exists public.duck_wallet_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount bigint not null check (amount <> 0),
  balance_after bigint not null check (balance_after >= 0),
  event_type text not null check (event_type in ('signup_bonus', 'contest_entry', 'contest_prize')),
  contest_id uuid references public.duck_contests(id) on delete set null,
  contest_entry_id uuid references public.duck_contest_entries(id) on delete set null,
  note text not null,
  created_at timestamptz not null default now(),
  unique (user_id, event_type, contest_entry_id)
);

create table if not exists public.duck_money_bank_ledger (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references auth.users(id),
  amount bigint not null check (amount <> 0),
  event_type text not null check (event_type in ('contest_entry_fee', 'contest_prize')),
  contest_id uuid not null references public.duck_contests(id) on delete cascade,
  contest_entry_id uuid not null references public.duck_contest_entries(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now(),
  unique (event_type, contest_entry_id)
);

-- Give all existing accounts a one-time 100 DuckMoney opening balance.
with new_wallets as (
  insert into public.duck_wallets (user_id)
  select user_row.id from auth.users as user_row
  on conflict (user_id) do nothing
  returning user_id, balance
)
insert into public.duck_wallet_ledger (user_id, amount, balance_after, event_type, note)
select user_id, balance, balance, 'signup_bonus', 'Solde de départ DuckMoney'
from new_wallets;

create or replace function public.create_duck_wallet()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  opening_balance bigint;
begin
  insert into public.duck_wallets (user_id)
  values (new.id)
  on conflict (user_id) do nothing
  returning balance into opening_balance;

  if opening_balance is not null then
    insert into public.duck_wallet_ledger (user_id, amount, balance_after, event_type, note)
    values (new.id, opening_balance, opening_balance, 'signup_bonus', 'Solde de départ DuckMoney');
  end if;
  return new;
end;
$$;

revoke all on function public.create_duck_wallet() from public, anon, authenticated;
drop trigger if exists on_duckauth_wallet_created on auth.users;
create trigger on_duckauth_wallet_created after insert on auth.users
for each row execute function public.create_duck_wallet();

create or replace function public.is_duck_founder()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select lower(coalesce((select auth.jwt()->>'email'), '')) = 'duckdev-service@protonmail.com'
    and exists (
      select 1 from public.profiles as profile
      where profile.id = (select auth.uid()) and profile.role = 'admin'
    );
$$;

revoke all on function public.is_duck_founder() from public, anon;
grant execute on function public.is_duck_founder() to anon, authenticated;

alter table public.duck_wallets enable row level security;
alter table public.duck_contests enable row level security;
alter table public.duck_contest_entries enable row level security;
alter table public.duck_wallet_ledger enable row level security;
alter table public.duck_money_bank_ledger enable row level security;

revoke all on public.duck_wallets, public.duck_contests, public.duck_contest_entries,
  public.duck_wallet_ledger, public.duck_money_bank_ledger from public, anon, authenticated;
grant select on public.duck_wallets, public.duck_wallet_ledger, public.duck_contests,
  public.duck_contest_entries, public.duck_money_bank_ledger to authenticated;
grant select on public.duck_contests to anon;

drop policy if exists "Members can read their DuckMoney wallet" on public.duck_wallets;
create policy "Members can read their DuckMoney wallet" on public.duck_wallets
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Members and founder can read contest entries" on public.duck_contest_entries;
create policy "Members and founder can read contest entries" on public.duck_contest_entries
  for select to authenticated using (user_id = (select auth.uid()) or public.is_duck_founder());
drop policy if exists "Members and founder can read wallet history" on public.duck_wallet_ledger;
create policy "Members and founder can read wallet history" on public.duck_wallet_ledger
  for select to authenticated using (user_id = (select auth.uid()) or public.is_duck_founder());
drop policy if exists "Founder can read bank ledger" on public.duck_money_bank_ledger;
create policy "Founder can read bank ledger" on public.duck_money_bank_ledger
  for select to authenticated using (public.is_duck_founder());
drop policy if exists "Visitors can read public contests" on public.duck_contests;
create policy "Visitors can read public contests" on public.duck_contests
  for select to anon, authenticated using (status in ('open', 'closed', 'completed') or public.is_duck_founder());

create or replace function public.duck_contest_register(
  p_contest_id uuid,
  p_nickname text,
  p_duck_rib text,
  p_project_url text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  contest_row public.duck_contests%rowtype;
  wallet_row public.duck_wallets%rowtype;
  entry_id uuid;
  new_balance bigint;
begin
  if current_user_id is null then
    raise exception 'Sign in to enter the contest' using errcode = '42501';
  end if;
  if char_length(trim(coalesce(p_nickname, ''))) not between 2 and 32 then
    raise exception 'Nickname must contain 2 to 32 characters' using errcode = '22023';
  end if;
  if length(coalesce(p_project_url, '')) > 2048 or p_project_url !~ '^https://[^[:space:]]{3,2040}$' then
    raise exception 'Project link must be a valid HTTPS URL' using errcode = '22023';
  end if;

  select * into contest_row from public.duck_contests
  where id = p_contest_id and status = 'open' for update;
  if not found then
    raise exception 'Contest is not accepting entries' using errcode = '55000';
  end if;
  select * into wallet_row from public.duck_wallets where user_id = current_user_id for update;
  if not found then
    raise exception 'DuckMoney wallet not found' using errcode = '55000';
  end if;
  if upper(trim(coalesce(p_duck_rib, ''))) <> wallet_row.duck_rib then
    raise exception 'DuckRIB does not match your receiving wallet' using errcode = '22023';
  end if;
  if wallet_row.balance < contest_row.entry_fee then
    raise exception 'Not enough DuckMoney to enter' using errcode = '22023';
  end if;

  insert into public.duck_contest_entries (contest_id, user_id, nickname, duck_rib, project_url)
  values (p_contest_id, current_user_id, trim(p_nickname), wallet_row.duck_rib, trim(p_project_url))
  returning id into entry_id;

  update public.duck_wallets set balance = balance - contest_row.entry_fee, updated_at = now()
  where user_id = current_user_id returning balance into new_balance;

  insert into public.duck_wallet_ledger
    (user_id, amount, balance_after, event_type, contest_id, contest_entry_id, note)
  values
    (current_user_id, -contest_row.entry_fee, new_balance, 'contest_entry', p_contest_id, entry_id, 'Frais de participation au concours');

  insert into public.duck_money_bank_ledger
    (actor_user_id, amount, event_type, contest_id, contest_entry_id, note)
  values
    (current_user_id, contest_row.entry_fee, 'contest_entry_fee', p_contest_id, entry_id, 'Frais de participation reçus par la banque DuckMoney');

  return entry_id;
end;
$$;

create or replace function public.admin_launch_duck_contest(p_title text, p_description text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  contest_id uuid;
begin
  if not public.is_duck_founder() then
    raise exception 'Founder access required' using errcode = '42501';
  end if;
  insert into public.duck_contests (title, description, created_by)
  values (trim(p_title), trim(p_description), (select auth.uid()))
  returning id into contest_id;
  return contest_id;
end;
$$;

create or replace function public.admin_close_duck_contest(p_contest_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed integer;
begin
  if not public.is_duck_founder() then
    raise exception 'Founder access required' using errcode = '42501';
  end if;
  update public.duck_contests set status = 'closed', closed_at = now()
  where id = p_contest_id and status = 'open';
  get diagnostics changed = row_count;
  if changed = 0 then raise exception 'Open contest not found' using errcode = '55000'; end if;
  return true;
end;
$$;

create or replace function public.admin_get_duck_contest_entries(p_contest_id uuid)
returns table (
  entry_id uuid,
  nickname text,
  duck_rib text,
  project_url text,
  placement smallint,
  prize bigint,
  submitted_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_duck_founder() then
    raise exception 'Founder access required' using errcode = '42501';
  end if;
  return query
    select entry.id, entry.nickname, entry.duck_rib, entry.project_url,
      entry.placement, entry.prize, entry.submitted_at
    from public.duck_contest_entries as entry
    where entry.contest_id = p_contest_id
    order by entry.submitted_at asc;
end;
$$;

create or replace function public.admin_finalize_duck_contest(
  p_contest_id uuid,
  p_ranked_entry_ids uuid[]
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  contest_row public.duck_contests%rowtype;
  entry_id uuid;
  winner_user_id uuid;
  wallet_balance bigint;
  prize_amount bigint;
  rank_number smallint := 0;
  total_prizes bigint := 0;
  ranked_count integer := coalesce(cardinality(p_ranked_entry_ids), 0);
begin
  if not public.is_duck_founder() then
    raise exception 'Founder access required' using errcode = '42501';
  end if;
  if ranked_count > 5 then
    raise exception 'Only the first five places can receive prizes' using errcode = '22023';
  end if;
  if ranked_count > 0 and (select count(distinct requested.value) from unnest(p_ranked_entry_ids) as requested(value)) <> ranked_count then
    raise exception 'Each winner must be unique' using errcode = '22023';
  end if;

  select * into contest_row from public.duck_contests
  where id = p_contest_id for update;
  if not found or contest_row.status <> 'closed' then
    raise exception 'Close the contest before publishing results' using errcode = '55000';
  end if;
  if exists (
    select 1 from unnest(coalesce(p_ranked_entry_ids, '{}'::uuid[])) as requested(id)
    left join public.duck_contest_entries as entry
      on entry.id = requested.id and entry.contest_id = p_contest_id
    where entry.id is null
  ) then
    raise exception 'A ranked entry does not belong to this contest' using errcode = '22023';
  end if;

  update public.duck_contest_entries set placement = null, prize = 0
  where contest_id = p_contest_id;

  foreach entry_id in array coalesce(p_ranked_entry_ids, '{}'::uuid[]) loop
    rank_number := rank_number + 1;
    prize_amount := case rank_number
      when 1 then 10000
      when 2 then 1000
      when 3 then 100
      when 4 then 10
      when 5 then 1
    end;
    select entry.user_id into winner_user_id
    from public.duck_contest_entries as entry
    where entry.id = entry_id and entry.contest_id = p_contest_id;

    update public.duck_wallets set balance = balance + prize_amount, updated_at = now()
    where user_id = winner_user_id returning balance into wallet_balance;
    if not found then raise exception 'Winner wallet not found' using errcode = '55000'; end if;

    update public.duck_contest_entries set placement = rank_number, prize = prize_amount
    where id = entry_id;

    insert into public.duck_wallet_ledger
      (user_id, amount, balance_after, event_type, contest_id, contest_entry_id, note)
    values
      (winner_user_id, prize_amount, wallet_balance, 'contest_prize', p_contest_id, entry_id, 'Prix du concours DuckFun — place ' || rank_number);

    insert into public.duck_money_bank_ledger
      (actor_user_id, amount, event_type, contest_id, contest_entry_id, note)
    values
      ((select auth.uid()), -prize_amount, 'contest_prize', p_contest_id, entry_id, 'Versement du prix DuckMoney — place ' || rank_number);

    total_prizes := total_prizes + prize_amount;
  end loop;

  update public.duck_contests set status = 'completed', completed_at = now()
  where id = p_contest_id;
  return total_prizes;
end;
$$;

create or replace function public.get_duck_contest_showcase(p_contest_id uuid)
returns table (
  nickname text,
  project_url text,
  placement smallint,
  prize bigint,
  submitted_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select entry.nickname, entry.project_url, entry.placement, entry.prize, entry.submitted_at
  from public.duck_contest_entries as entry
  join public.duck_contests as contest on contest.id = entry.contest_id
  where entry.contest_id = p_contest_id
    and contest.status in ('open', 'closed', 'completed')
  order by entry.placement nulls last, entry.submitted_at asc;
$$;

create or replace function public.admin_get_duck_bank_summary()
returns table (fees_collected bigint, prizes_paid bigint, net_total bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_duck_founder() then
    raise exception 'Founder access required' using errcode = '42501';
  end if;
  return query
    select coalesce(sum(case when event_type = 'contest_entry_fee' then amount else 0 end)::bigint, 0::bigint),
      coalesce((-sum(case when event_type = 'contest_prize' then amount else 0 end))::bigint, 0::bigint),
      coalesce(sum(amount)::bigint, 0::bigint)
    from public.duck_money_bank_ledger;
end;
$$;

revoke all on function public.duck_contest_register(uuid, text, text, text) from public, anon;
grant execute on function public.duck_contest_register(uuid, text, text, text) to authenticated;
revoke all on function public.admin_launch_duck_contest(text, text) from public, anon;
grant execute on function public.admin_launch_duck_contest(text, text) to authenticated;
revoke all on function public.admin_close_duck_contest(uuid) from public, anon;
grant execute on function public.admin_close_duck_contest(uuid) to authenticated;
revoke all on function public.admin_get_duck_contest_entries(uuid) from public, anon;
grant execute on function public.admin_get_duck_contest_entries(uuid) to authenticated;
revoke all on function public.admin_finalize_duck_contest(uuid, uuid[]) from public, anon;
grant execute on function public.admin_finalize_duck_contest(uuid, uuid[]) to authenticated;
revoke all on function public.get_duck_contest_showcase(uuid) from public;
grant execute on function public.get_duck_contest_showcase(uuid) to anon, authenticated;
revoke all on function public.admin_get_duck_bank_summary() from public, anon;
grant execute on function public.admin_get_duck_bank_summary() to authenticated;
