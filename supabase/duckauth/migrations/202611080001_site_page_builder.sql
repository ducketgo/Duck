-- Founder-only visual content editor with public, read-only published content.
create table if not exists public.site_content_items (
  content_key text primary key check (char_length(content_key) between 1 and 1000),
  page_path text not null check (page_path ~ '^/[A-Za-z0-9/_-]*$'),
  content_type text not null check (content_type in ('text', 'button', 'download', 'image', 'video')),
  content text not null check (char_length(content) between 1 and 2000),
  href text,
  anchor_key text not null default '' check (char_length(anchor_key) <= 1000),
  sort_order integer not null default 0,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint site_content_items_href_valid check (
    (content_type = 'text' and href is null)
    or (content_type <> 'text' and href is not null and (href ~ '^/' or href ~ '^https://'))
  )
);

create index if not exists site_content_items_page_order_idx
  on public.site_content_items(page_path, sort_order);

alter table public.site_content_items enable row level security;
revoke all on public.site_content_items from public, anon, authenticated;
grant select on public.site_content_items to anon, authenticated;
drop policy if exists "Public can read published site content" on public.site_content_items;
create policy "Public can read published site content" on public.site_content_items
  for select to anon, authenticated using (true);

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('duck-site-media', 'duck-site-media', true, 52428800, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view Duck site media" on storage.objects;
create policy "Public can view Duck site media" on storage.objects
  for select to anon, authenticated using (bucket_id = 'duck-site-media');
drop policy if exists "Founder can upload Duck site media" on storage.objects;
create policy "Founder can upload Duck site media" on storage.objects
  for insert to authenticated with check (bucket_id = 'duck-site-media' and public.is_duck_founder());
drop policy if exists "Founder can update Duck site media" on storage.objects;
create policy "Founder can update Duck site media" on storage.objects
  for update to authenticated using (bucket_id = 'duck-site-media' and public.is_duck_founder())
  with check (bucket_id = 'duck-site-media' and public.is_duck_founder());
drop policy if exists "Founder can delete Duck site media" on storage.objects;
create policy "Founder can delete Duck site media" on storage.objects
  for delete to authenticated using (bucket_id = 'duck-site-media' and public.is_duck_founder());

create or replace function public.admin_save_site_content(
  p_content_key text,
  p_page_path text,
  p_content_type text,
  p_content text,
  p_href text,
  p_anchor_key text default '',
  p_sort_order integer default 0
)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated timestamptz;
begin
  if not public.is_duck_founder() then
    raise exception 'Founder access required' using errcode = '42501';
  end if;
  if p_content_key is null or char_length(p_content_key) not between 1 and 1000
    or p_content_key ~ '[[:space:]]'
    or p_page_path is null or p_page_path !~ '^/[A-Za-z0-9/_-]*$'
    or p_content_type not in ('text', 'button', 'download', 'image', 'video')
    or p_content is null or char_length(trim(p_content)) not between 1 and 2000
    or coalesce(char_length(p_anchor_key), 0) > 1000 then
    raise exception 'Invalid site content' using errcode = '22023';
  end if;
  if (p_content_type = 'text' and p_href is not null)
    or (p_content_type <> 'text' and (p_href is null or char_length(p_href) > 2048 or p_href !~ '^(/|https://)')) then
    raise exception 'Invalid site content link' using errcode = '22023';
  end if;

  insert into public.site_content_items(content_key, page_path, content_type, content, href, anchor_key, sort_order, updated_by, updated_at)
  values (p_content_key, p_page_path, p_content_type, trim(p_content), p_href, coalesce(p_anchor_key, ''), coalesce(p_sort_order, 0), (select auth.uid()), now())
  on conflict (content_key) do update set
    page_path = excluded.page_path,
    content_type = excluded.content_type,
    content = excluded.content,
    href = excluded.href,
    anchor_key = excluded.anchor_key,
    sort_order = excluded.sort_order,
    updated_by = excluded.updated_by,
    updated_at = excluded.updated_at
  returning updated_at into updated;
  return updated;
end;
$$;

create or replace function public.admin_delete_site_content(p_content_key text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  removed integer;
begin
  if not public.is_duck_founder() then
    raise exception 'Founder access required' using errcode = '42501';
  end if;
  delete from public.site_content_items where content_key = p_content_key;
  get diagnostics removed = row_count;
  return removed > 0;
end;
$$;

revoke all on function public.admin_save_site_content(text, text, text, text, text, text, integer) from public, anon;
grant execute on function public.admin_save_site_content(text, text, text, text, text, text, integer) to authenticated;
revoke all on function public.admin_delete_site_content(text) from public, anon;
grant execute on function public.admin_delete_site_content(text) to authenticated;
