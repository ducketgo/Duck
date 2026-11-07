-- DuckAdmin is the founder's personal site editor, even if other admins exist.
create or replace function public.is_duck_founder()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from auth.users as user_row
    where user_row.id = (select auth.uid())
      and lower(coalesce(user_row.email, '')) = 'duckdev-service@protonmail.com'
      and user_row.email_confirmed_at is not null
  );
$$;

revoke all on function public.is_duck_founder() from public, anon;
grant execute on function public.is_duck_founder() to authenticated;

drop policy if exists "Admins can read site visual history" on public.site_visual_settings_history;
create policy "Founder can read site visual history" on public.site_visual_settings_history
  for select to authenticated using (public.is_duck_founder());

create or replace function public.admin_save_site_visual_settings(p_settings jsonb)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  previous jsonb;
  changed text[];
  updated timestamptz;
  allowed_keys constant text[] := array[
    'accent','accentLight','accentDark','violet','green','pageBackground','panelBackground','cardBackground','raisedBackground','textPrimary','textSecondary','textMuted','borderColor',
    'fontFamily','baseFontSize','bodyLineHeight','h1Size','h2Size','headingWeight','headingTracking','navFontSize','kickerSize','kickerTracking',
    'contentWidth','pageGutter','headerHeight','navGap','sectionSpace','heroHeight','gridGap','cardMinHeight','footerPadding','pageTopSpace',
    'cardRadius','cardPadding','cardBorderWidth','cardShadow','cardHoverLift','buttonRadius','buttonHeight','buttonTextSize','inputHeight','inputRadius','badgeRadius','dividerOpacity',
    'brandName','brandMark','navHomeLabel','navServicesLabel','navAboutLabel','navSoftwareLabel','navTransferLabel','navJournalLabel','headerBlur','headerOpacity','showBrandMark','showLoginLink','showSignupButton','activeNavUnderline',
    'heroEyebrow','heroTitleLine1','heroTitleLine2','heroDescription','heroPrimaryLabel','heroPrimaryHref','heroSecondaryLabel','introLabel','introText','servicesSectionLabel','servicesHeading','manifestoLabel','manifestoText','closingLabel','closingButtonLabel',
    'showHeroArtwork','showHeroNote','showIntroSection','showServicesSection','showManifestoSection','showClosingSection',
    'motionEnabled','motionDuration','glowIntensity','gradientStrength','focusRingWidth','focusRingColor','highContrast','underlineLinks','smoothScrolling','maxTextWidth','showFooter'
  ];
begin
  if not public.is_duck_founder() then
    raise exception 'Founder access required' using errcode = '42501';
  end if;
  if p_settings is null or jsonb_typeof(p_settings) <> 'object' or pg_column_size(p_settings) > 32768 then
    raise exception 'Invalid visual settings document' using errcode = '22023';
  end if;
  if exists (
    select 1 from jsonb_each(p_settings) as setting(key, value)
    where not (setting.key = any(allowed_keys))
      or jsonb_typeof(setting.value) not in ('string','number','boolean')
      or (jsonb_typeof(setting.value) = 'string' and char_length(setting.value #>> '{}') > 240)
      or (jsonb_typeof(setting.value) = 'number' and abs((setting.value #>> '{}')::numeric) > 2000)
  ) then
    raise exception 'Visual settings contain an unsupported field or value' using errcode = '22023';
  end if;

  insert into public.site_visual_settings(id, settings, updated_by, updated_at)
    values (1, '{}'::jsonb, (select auth.uid()), now()) on conflict (id) do nothing;
  select settings into previous from public.site_visual_settings where id = 1 for update;
  select coalesce(array_agg(keys.key order by keys.key), '{}'::text[]) into changed
  from jsonb_object_keys(previous || p_settings) as keys(key)
  where previous -> keys.key is distinct from p_settings -> keys.key;

  update public.site_visual_settings
  set settings = p_settings, updated_by = (select auth.uid()), updated_at = now()
  where id = 1 returning updated_at into updated;

  if cardinality(changed) > 0 then
    insert into public.site_visual_settings_history(actor_user_id, changed_fields, previous_settings, new_settings)
      values ((select auth.uid()), changed, previous, p_settings);
  end if;
  return updated;
end;
$$;

revoke all on function public.admin_save_site_visual_settings(jsonb) from public, anon;
grant execute on function public.admin_save_site_visual_settings(jsonb) to authenticated;
