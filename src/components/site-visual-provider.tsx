'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isPlatformConfigured } from '@/lib/supabase/config';
import { DEFAULT_VISUAL_SETTINGS, normalizeVisualSettings, type VisualSettings } from '@/lib/visual-settings';

type SiteVisualContextValue = {
  settings: VisualSettings;
  setSettings: (settings: VisualSettings) => void;
  defaults: VisualSettings;
};

const SiteVisualContext = createContext<SiteVisualContextValue | null>(null);

function colorRgb(value: VisualSettings[string]) {
  if (typeof value !== 'string' || !/^#[\da-f]{6}$/i.test(value)) return '56 216 232';
  const hex = value.slice(1);
  return `${parseInt(hex.slice(0, 2), 16)} ${parseInt(hex.slice(2, 4), 16)} ${parseInt(hex.slice(4, 6), 16)}`;
}

function cssVariables(settings: VisualSettings): CSSProperties {
  const px: Record<string, string> = {
    '--duck-base-size': 'baseFontSize', '--duck-h1-size': 'h1Size', '--duck-h2-size': 'h2Size',
    '--duck-heading-weight': 'headingWeight', '--duck-heading-tracking': 'headingTracking', '--duck-nav-size': 'navFontSize',
    '--duck-kicker-size': 'kickerSize', '--duck-content-width': 'contentWidth',
    '--duck-page-gutter': 'pageGutter', '--duck-header-height': 'headerHeight', '--duck-nav-gap': 'navGap',
    '--duck-section-space': 'sectionSpace', '--duck-hero-height': 'heroHeight', '--duck-grid-gap': 'gridGap',
    '--duck-card-min-height': 'cardMinHeight', '--duck-footer-padding': 'footerPadding', '--duck-page-top': 'pageTopSpace',
    '--duck-card-radius': 'cardRadius', '--duck-card-padding': 'cardPadding', '--duck-card-border-width': 'cardBorderWidth',
    '--duck-card-hover-lift': 'cardHoverLift', '--duck-button-radius': 'buttonRadius', '--duck-button-height': 'buttonHeight',
    '--duck-button-size': 'buttonTextSize', '--duck-input-height': 'inputHeight', '--duck-input-radius': 'inputRadius',
    '--duck-badge-radius': 'badgeRadius', '--duck-header-blur': 'headerBlur',
    '--duck-focus-width': 'focusRingWidth', '--duck-max-text-width': 'maxTextWidth',
  };
  const vars: Record<string, string> = {
    '--duck-accent': settings.accent as string,
    '--duck-accent-rgb': colorRgb(settings.accent),
    '--duck-accent-light': settings.accentLight as string,
    '--duck-accent-dark': settings.accentDark as string,
    '--duck-accent-dark-rgb': colorRgb(settings.accentDark),
    '--duck-violet': settings.violet as string,
    '--duck-violet-rgb': colorRgb(settings.violet),
    '--duck-green': settings.green as string,
    '--duck-green-rgb': colorRgb(settings.green),
    '--duck-page-bg': settings.pageBackground as string,
    '--duck-panel-bg': settings.panelBackground as string,
    '--duck-card-bg': settings.cardBackground as string,
    '--duck-raised-bg': settings.raisedBackground as string,
    '--duck-text': settings.textPrimary as string,
    '--duck-text-secondary': settings.textSecondary as string,
    '--duck-text-muted': settings.textMuted as string,
    '--duck-border': settings.borderColor as string,
    '--duck-border-rgb': colorRgb(settings.borderColor),
    '--duck-font': settings.fontFamily as string,
    '--duck-line-height': String(settings.bodyLineHeight),
    '--duck-kicker-tracking': `${settings.kickerTracking}px`,
    '--duck-motion-duration': `${settings.motionDuration}ms`,
    '--duck-divider-opacity': String(settings.dividerOpacity),
    '--duck-card-shadow': String(Number(settings.cardShadow) / 100),
    '--duck-header-opacity': String(settings.headerOpacity),
    '--duck-focus-color': settings.focusRingColor as string,
    '--duck-glow-opacity': String(Number(settings.glowIntensity) / 100),
    '--duck-gradient-opacity': String(Number(settings.gradientStrength) / 100),
    '--duck-high-contrast': settings.highContrast ? '1' : '0',
    '--duck-page-rgb': colorRgb(settings.pageBackground),
  };
  for (const [variable, key] of Object.entries(px)) vars[variable] = `${settings[key]}px`;
  return vars as CSSProperties;
}

export function SiteVisualProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<VisualSettings>({ ...DEFAULT_VISUAL_SETTINGS });
  const setSettings = useCallback((next: VisualSettings) => setSettingsState(normalizeVisualSettings(next)), []);

  useEffect(() => {
    if (!isPlatformConfigured()) return;
    let active = true;
    void (async () => {
      try {
        const { data } = await createClient().from('site_visual_settings').select('settings').eq('id', 1).maybeSingle();
        if (active && data?.settings) setSettingsState(normalizeVisualSettings(data.settings));
      } catch { /* The public site keeps its local theme defaults until the settings table is installed. */ }
    })();
    return () => { active = false; };
  }, []);

  const value = useMemo<SiteVisualContextValue>(() => ({ settings, defaults: DEFAULT_VISUAL_SETTINGS, setSettings }), [settings, setSettings]);

  return <SiteVisualContext.Provider value={value}>
    <div
      className="site-visual-root"
      style={cssVariables(settings)}
      data-motion={settings.motionEnabled ? 'on' : 'off'}
      data-smooth-scroll={settings.smoothScrolling ? 'on' : 'off'}
      data-links-underlined={settings.underlineLinks ? 'yes' : 'no'}
      data-high-contrast={settings.highContrast ? 'yes' : 'no'}
    >{children}</div>
  </SiteVisualContext.Provider>;
}

export function useSiteVisualSettings() {
  const context = useContext(SiteVisualContext);
  if (!context) throw new Error('useSiteVisualSettings must be used inside SiteVisualProvider');
  return context;
}
