export type VisualValue = string | number | boolean;
export type VisualSettings = Record<string, VisualValue>;

export type VisualField = {
  key: string;
  label: string;
  group: string;
  kind: 'color' | 'range' | 'text' | 'toggle' | 'select';
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: { label: string; value: string }[];
  help?: string;
};

export const VISUAL_GROUPS = [
  'Couleurs', 'Typographie', 'Mise en page', 'Composants', 'Navigation',
  'Accueil', 'Sections', 'Effets & accessibilité',
] as const;

export const VISUAL_FIELDS: VisualField[] = [
  // Colors (13)
  { key: 'accent', label: 'Couleur principale', group: 'Couleurs', kind: 'color' },
  { key: 'accentLight', label: 'Couleur principale claire', group: 'Couleurs', kind: 'color' },
  { key: 'accentDark', label: 'Couleur principale foncée', group: 'Couleurs', kind: 'color' },
  { key: 'violet', label: 'Couleur secondaire violette', group: 'Couleurs', kind: 'color' },
  { key: 'green', label: 'Couleur secondaire verte', group: 'Couleurs', kind: 'color' },
  { key: 'pageBackground', label: 'Fond de page', group: 'Couleurs', kind: 'color' },
  { key: 'panelBackground', label: 'Fond des panneaux', group: 'Couleurs', kind: 'color' },
  { key: 'cardBackground', label: 'Fond des cartes', group: 'Couleurs', kind: 'color' },
  { key: 'raisedBackground', label: 'Fond des éléments élevés', group: 'Couleurs', kind: 'color' },
  { key: 'textPrimary', label: 'Texte principal', group: 'Couleurs', kind: 'color' },
  { key: 'textSecondary', label: 'Texte secondaire', group: 'Couleurs', kind: 'color' },
  { key: 'textMuted', label: 'Texte discret', group: 'Couleurs', kind: 'color' },
  { key: 'borderColor', label: 'Couleur des bordures', group: 'Couleurs', kind: 'color' },

  // Typography (10)
  { key: 'fontFamily', label: 'Police du site', group: 'Typographie', kind: 'select', options: [
    { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
    { label: 'Inter / système', value: 'Inter, ui-sans-serif, system-ui, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Trebuchet', value: "'Trebuchet MS', sans-serif" },
    { label: 'Système', value: 'system-ui, sans-serif' },
  ] },
  { key: 'baseFontSize', label: 'Taille du texte de base', group: 'Typographie', kind: 'range', min: 12, max: 20, unit: 'px' },
  { key: 'bodyLineHeight', label: 'Interligne du texte', group: 'Typographie', kind: 'range', min: 1.25, max: 2, step: 0.05 },
  { key: 'h1Size', label: 'Taille des grands titres', group: 'Typographie', kind: 'range', min: 42, max: 96, unit: 'px' },
  { key: 'h2Size', label: 'Taille des titres de section', group: 'Typographie', kind: 'range', min: 24, max: 56, unit: 'px' },
  { key: 'headingWeight', label: 'Graisse des titres', group: 'Typographie', kind: 'range', min: 400, max: 800, step: 100 },
  { key: 'headingTracking', label: 'Espacement des titres', group: 'Typographie', kind: 'range', min: -5, max: 0, step: 0.1, unit: 'px' },
  { key: 'navFontSize', label: 'Taille du menu', group: 'Typographie', kind: 'range', min: 10, max: 16, unit: 'px' },
  { key: 'kickerSize', label: 'Taille des petits titres', group: 'Typographie', kind: 'range', min: 8, max: 14, unit: 'px' },
  { key: 'kickerTracking', label: 'Espacement des petits titres', group: 'Typographie', kind: 'range', min: 0.5, max: 3.5, step: 0.1, unit: 'px' },

  // Layout (10)
  { key: 'contentWidth', label: 'Largeur maximale du contenu', group: 'Mise en page', kind: 'range', min: 900, max: 1440, step: 10, unit: 'px' },
  { key: 'pageGutter', label: 'Marge latérale', group: 'Mise en page', kind: 'range', min: 12, max: 80, unit: 'px' },
  { key: 'headerHeight', label: 'Hauteur de navigation', group: 'Mise en page', kind: 'range', min: 56, max: 100, unit: 'px' },
  { key: 'navGap', label: 'Espacement du menu', group: 'Mise en page', kind: 'range', min: 12, max: 48, unit: 'px' },
  { key: 'sectionSpace', label: 'Espacement vertical des sections', group: 'Mise en page', kind: 'range', min: 48, max: 140, unit: 'px' },
  { key: 'heroHeight', label: 'Hauteur de la bannière d’accueil', group: 'Mise en page', kind: 'range', min: 440, max: 800, step: 10, unit: 'px' },
  { key: 'gridGap', label: 'Espacement des grilles', group: 'Mise en page', kind: 'range', min: 8, max: 32, unit: 'px' },
  { key: 'cardMinHeight', label: 'Hauteur minimale des cartes', group: 'Mise en page', kind: 'range', min: 140, max: 260, step: 5, unit: 'px' },
  { key: 'footerPadding', label: 'Marge intérieure du pied de page', group: 'Mise en page', kind: 'range', min: 16, max: 56, unit: 'px' },
  { key: 'pageTopSpace', label: 'Marge haute des pages', group: 'Mise en page', kind: 'range', min: 40, max: 120, unit: 'px' },

  // Components (12)
  { key: 'cardRadius', label: 'Arrondi des cartes', group: 'Composants', kind: 'range', min: 4, max: 32, unit: 'px' },
  { key: 'cardPadding', label: 'Marge intérieure des cartes', group: 'Composants', kind: 'range', min: 12, max: 40, unit: 'px' },
  { key: 'cardBorderWidth', label: 'Épaisseur des bordures', group: 'Composants', kind: 'range', min: 0, max: 3, step: 0.5, unit: 'px' },
  { key: 'cardShadow', label: 'Intensité des ombres', group: 'Composants', kind: 'range', min: 0, max: 60, unit: '%' },
  { key: 'cardHoverLift', label: 'Élévation au survol', group: 'Composants', kind: 'range', min: 0, max: 12, unit: 'px' },
  { key: 'buttonRadius', label: 'Arrondi des boutons', group: 'Composants', kind: 'range', min: 0, max: 24, unit: 'px' },
  { key: 'buttonHeight', label: 'Hauteur des boutons', group: 'Composants', kind: 'range', min: 36, max: 60, unit: 'px' },
  { key: 'buttonTextSize', label: 'Taille du texte des boutons', group: 'Composants', kind: 'range', min: 10, max: 18, unit: 'px' },
  { key: 'inputHeight', label: 'Hauteur des champs', group: 'Composants', kind: 'range', min: 34, max: 58, unit: 'px' },
  { key: 'inputRadius', label: 'Arrondi des champs', group: 'Composants', kind: 'range', min: 0, max: 18, unit: 'px' },
  { key: 'badgeRadius', label: 'Arrondi des badges', group: 'Composants', kind: 'range', min: 0, max: 24, unit: 'px' },
  { key: 'dividerOpacity', label: 'Opacité des séparateurs', group: 'Composants', kind: 'range', min: 0, max: 0.4, step: 0.02 },

  // Navigation (14)
  { key: 'brandName', label: 'Nom de marque', group: 'Navigation', kind: 'text' },
  { key: 'brandMark', label: 'Texte du symbole', group: 'Navigation', kind: 'text' },
  { key: 'navHomeLabel', label: 'Libellé Accueil', group: 'Navigation', kind: 'text' },
  { key: 'navServicesLabel', label: 'Libellé Services', group: 'Navigation', kind: 'text' },
  { key: 'navAboutLabel', label: 'Libellé À propos', group: 'Navigation', kind: 'text' },
  { key: 'navSoftwareLabel', label: 'Libellé Logiciels', group: 'Navigation', kind: 'text' },
  { key: 'navTransferLabel', label: 'Libellé Transfert', group: 'Navigation', kind: 'text' },
  { key: 'navJournalLabel', label: 'Libellé Journal', group: 'Navigation', kind: 'text' },
  { key: 'headerBlur', label: 'Flou du fond de navigation', group: 'Navigation', kind: 'range', min: 0, max: 30, unit: 'px' },
  { key: 'headerOpacity', label: 'Opacité de navigation', group: 'Navigation', kind: 'range', min: 0.65, max: 1, step: 0.01 },
  { key: 'showBrandMark', label: 'Afficher le symbole', group: 'Navigation', kind: 'toggle' },
  { key: 'showLoginLink', label: 'Afficher le lien membre', group: 'Navigation', kind: 'toggle' },
  { key: 'showSignupButton', label: 'Afficher le bouton inscription', group: 'Navigation', kind: 'toggle' },
  { key: 'activeNavUnderline', label: 'Souligner la page active', group: 'Navigation', kind: 'toggle' },

  // Home copy (15)
  { key: 'heroEyebrow', label: 'Sur-titre d’accueil', group: 'Accueil', kind: 'text' },
  { key: 'heroTitleLine1', label: 'Titre principal — ligne 1', group: 'Accueil', kind: 'text' },
  { key: 'heroTitleLine2', label: 'Titre principal — ligne 2', group: 'Accueil', kind: 'text' },
  { key: 'heroDescription', label: 'Description d’accueil', group: 'Accueil', kind: 'text' },
  { key: 'heroPrimaryLabel', label: 'Texte du bouton principal', group: 'Accueil', kind: 'text' },
  { key: 'heroPrimaryHref', label: 'Destination du bouton principal', group: 'Accueil', kind: 'select', options: [
    { label: 'Services', value: '/services' }, { label: 'À propos', value: '/about' },
    { label: 'Logiciels', value: '/software' }, { label: 'Espace membre', value: '/auth/login' },
  ] },
  { key: 'heroSecondaryLabel', label: 'Texte du lien secondaire', group: 'Accueil', kind: 'text' },
  { key: 'introLabel', label: 'Petit titre de présentation', group: 'Accueil', kind: 'text' },
  { key: 'introText', label: 'Texte de présentation', group: 'Accueil', kind: 'text' },
  { key: 'servicesSectionLabel', label: 'Petit titre des services', group: 'Accueil', kind: 'text' },
  { key: 'servicesHeading', label: 'Titre des services', group: 'Accueil', kind: 'text' },
  { key: 'manifestoLabel', label: 'Petit titre de la devise', group: 'Accueil', kind: 'text' },
  { key: 'manifestoText', label: 'Texte de la devise', group: 'Accueil', kind: 'text' },
  { key: 'closingLabel', label: 'Petit titre de conclusion', group: 'Accueil', kind: 'text' },
  { key: 'closingButtonLabel', label: 'Texte du bouton de conclusion', group: 'Accueil', kind: 'text' },

  // Sections (6)
  { key: 'showHeroArtwork', label: 'Illustration de la bannière', group: 'Sections', kind: 'toggle' },
  { key: 'showHeroNote', label: 'Note sous la bannière', group: 'Sections', kind: 'toggle' },
  { key: 'showIntroSection', label: 'Bandeau de présentation', group: 'Sections', kind: 'toggle' },
  { key: 'showServicesSection', label: 'Grille des services', group: 'Sections', kind: 'toggle' },
  { key: 'showManifestoSection', label: 'Section devise', group: 'Sections', kind: 'toggle' },
  { key: 'showClosingSection', label: 'Section de conclusion', group: 'Sections', kind: 'toggle' },

  // Effects and accessibility (11)
  { key: 'motionEnabled', label: 'Activer les animations décoratives', group: 'Effets & accessibilité', kind: 'toggle' },
  { key: 'motionDuration', label: 'Durée des transitions', group: 'Effets & accessibilité', kind: 'range', min: 100, max: 800, step: 50, unit: 'ms' },
  { key: 'glowIntensity', label: 'Intensité des halos', group: 'Effets & accessibilité', kind: 'range', min: 0, max: 60, unit: '%' },
  { key: 'gradientStrength', label: 'Intensité des dégradés', group: 'Effets & accessibilité', kind: 'range', min: 0, max: 100, unit: '%' },
  { key: 'focusRingWidth', label: 'Épaisseur du focus clavier', group: 'Effets & accessibilité', kind: 'range', min: 1, max: 5, unit: 'px' },
  { key: 'focusRingColor', label: 'Couleur du focus clavier', group: 'Effets & accessibilité', kind: 'color' },
  { key: 'highContrast', label: 'Contraste renforcé', group: 'Effets & accessibilité', kind: 'toggle' },
  { key: 'underlineLinks', label: 'Souligner les liens', group: 'Effets & accessibilité', kind: 'toggle' },
  { key: 'smoothScrolling', label: 'Défilement fluide', group: 'Effets & accessibilité', kind: 'toggle' },
  { key: 'maxTextWidth', label: 'Largeur maximale des paragraphes', group: 'Effets & accessibilité', kind: 'range', min: 420, max: 900, step: 10, unit: 'px' },
  { key: 'showFooter', label: 'Afficher le pied de page', group: 'Effets & accessibilité', kind: 'toggle' },
];

export const DEFAULT_VISUAL_SETTINGS: VisualSettings = {
  accent: '#38d8e8', accentLight: '#85f0f4', accentDark: '#0ea5b7', violet: '#a28bfa', green: '#6be0b2',
  pageBackground: '#080b12', panelBackground: '#10151e', cardBackground: '#101720', raisedBackground: '#202a37',
  textPrimary: '#eff4f7', textSecondary: '#a0adb7', textMuted: '#697782', borderColor: '#33404a',
  fontFamily: 'Arial, Helvetica, sans-serif', baseFontSize: 14, bodyLineHeight: 1.7, h1Size: 75, h2Size: 38,
  headingWeight: 600, headingTracking: -3, navFontSize: 12, kickerSize: 10, kickerTracking: 1.75,
  contentWidth: 1120, pageGutter: 28, headerHeight: 76, navGap: 30, sectionSpace: 98, heroHeight: 590,
  gridGap: 12, cardMinHeight: 190, footerPadding: 25, pageTopSpace: 86,
  cardRadius: 12, cardPadding: 22, cardBorderWidth: 1, cardShadow: 20, cardHoverLift: 3,
  buttonRadius: 9, buttonHeight: 46, buttonTextSize: 13, inputHeight: 44, inputRadius: 8, badgeRadius: 20, dividerOpacity: 0.12,
  brandName: 'Duck', brandMark: 'D', navHomeLabel: 'Accueil', navServicesLabel: 'Services', navAboutLabel: 'Qui sommes-nous ?',
  navSoftwareLabel: 'Logiciels', navTransferLabel: 'Transfert', navJournalLabel: 'Journal', headerBlur: 16, headerOpacity: 0.88,
  showBrandMark: true, showLoginLink: true, showSignupButton: true, activeNavUnderline: true,
  heroEyebrow: 'UN ÉCOSYSTÈME EN CONSTRUCTION', heroTitleLine1: 'Le numérique se construit', heroTitleLine2: 'ensemble.',
  heroDescription: 'DUCK rassemble des logiciels, des projets et une communauté pour apprendre, créer et avancer à son rythme.',
  heroPrimaryLabel: 'Explorer DUCK', heroPrimaryHref: '/services', heroSecondaryLabel: 'Découvrir notre histoire',
  introLabel: 'NOTRE INTENTION', introText: 'Un endroit accueillant pour se retrouver, échanger, créer et apprendre.',
  servicesSectionLabel: 'UN ÉCOSYSTÈME QUI GRANDIT', servicesHeading: 'Des espaces pour chaque idée.',
  manifestoLabel: 'LA DEVISE DUCK', manifestoText: 'Apprendre, avancer et performer.', closingLabel: 'LA SUITE S’ÉCRIT ENSEMBLE',
  closingButtonLabel: 'Rejoindre la communauté',
  showHeroArtwork: true, showHeroNote: true, showIntroSection: true, showServicesSection: true,
  showManifestoSection: true, showClosingSection: true,
  motionEnabled: true, motionDuration: 200, glowIntensity: 35, gradientStrength: 70, focusRingWidth: 2,
  focusRingColor: '#38d8e8', highContrast: false, underlineLinks: false, smoothScrolling: true,
  maxTextWidth: 620, showFooter: true,
};

export function normalizeVisualSettings(value: unknown): VisualSettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ...DEFAULT_VISUAL_SETTINGS };
  const candidate = value as Record<string, unknown>;
  const result: VisualSettings = { ...DEFAULT_VISUAL_SETTINGS };
  for (const field of VISUAL_FIELDS) {
    const raw = candidate[field.key];
    if (field.kind === 'color' && typeof raw === 'string' && /^#[\da-f]{6}$/i.test(raw)) result[field.key] = raw;
    else if (field.kind === 'range' && typeof raw === 'number' && Number.isFinite(raw)) {
      result[field.key] = Math.min(field.max ?? raw, Math.max(field.min ?? raw, raw));
    } else if (field.kind === 'toggle' && typeof raw === 'boolean') result[field.key] = raw;
    else if (field.kind === 'text' && typeof raw === 'string') result[field.key] = raw.slice(0, 240);
    else if (field.kind === 'select' && typeof raw === 'string' && field.options?.some(option => option.value === raw)) result[field.key] = raw;
  }
  return result;
}
