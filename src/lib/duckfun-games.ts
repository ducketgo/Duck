export type DuckFunEngine = 'memory' | 'reflex' | 'stack' | 'number' | 'math' | 'color' | 'path' | 'sequence';
export type DuckFunGame = {
  slug: string;
  title: string;
  category: string;
  description: string;
  mark: string;
  color: 'mint' | 'blue' | 'violet';
  engine: DuckFunEngine;
  level: number;
};

const themes = [
  'Mare des lucioles', 'Archipel lunaire', 'Lagune des bulles', 'Jardin flottant', 'Rivière de cristal',
  'Baie des comètes', 'Île des roseaux', 'Étang des étoiles', 'Cascade secrète', 'Océan pastel',
  'Crique des coquillages', 'Marais enchanté', 'Lac des reflets', 'Plage des nuages', 'Delta sauvage',
  'Vallée des nénuphars', 'Récif arc-en-ciel', 'Port des petits bateaux', 'Forêt aquatique', 'Polder magique',
  'Source des rêves', 'Atoll électrique', 'Grotte des échos', 'Mer des aurores',
];

const engines: Array<Pick<DuckFunGame, 'engine' | 'title' | 'category' | 'description' | 'mark'>> = [
  { engine: 'memory', title: 'Mémoire de la mare', category: 'Mémoire', description: 'Retrouve toutes les paires avec un plateau qui grandit selon le niveau.', mark: '◎' },
  { engine: 'reflex', title: 'Plouf réflexe', category: 'Réflexes', description: 'Tape la cible avant qu’elle ne change de place. Le rythme accélère.', mark: '✳' },
  { engine: 'stack', title: 'Duck Stack', category: 'Adresse', description: 'Empile les plateformes au bon moment et bâtis la plus haute tour.', mark: '▥' },
  { engine: 'number', title: 'Plouf ou plus', category: 'Déduction', description: 'Un nombre se cache sous la mare. Retrouve-le avec des indices.', mark: '?' },
  { engine: 'math', title: 'Calcul marée', category: 'Calcul', description: 'Résous un maximum de calculs avant la prochaine vague.', mark: '＋' },
  { engine: 'color', title: 'Palette Plouf', category: 'Couleurs', description: 'Suis la consigne, choisis la bonne couleur et garde ta série.', mark: '◉' },
  { engine: 'path', title: 'Parcours éclair', category: 'Vitesse', description: 'Retrouve les nombres dans l’ordre et bats ton meilleur temps.', mark: '↗' },
  { engine: 'sequence', title: 'Suite de canards', category: 'Observation', description: 'Observe la séquence lumineuse et reproduis-la sans te tromper.', mark: '⌁' },
];

const gameSeries: DuckFunGame[][] = engines.map((engine, engineIndex) => [
  { ...engine, slug: ['memoire-de-la-mare', 'plouf-reflexe', 'duck-stack', 'plouf-ou-plus', 'calcul-maree', 'palette-plouf', 'parcours-eclair', 'suite-de-canards'][engineIndex], color: (['mint', 'blue', 'violet'] as const)[engineIndex % 3], level: 1 },
  ...themes.map((theme, index) => ({
    ...engine,
    title: `${engine.title} · ${theme}`,
    slug: `${engine.engine}-${String(index + 2).padStart(2, '0')}`,
    color: (['mint', 'blue', 'violet'] as const)[(engineIndex + index + 1) % 3],
    level: index + 2,
  })),
]);

// Interleave the catalog so each page shows a mix of game types and difficulty levels.
export const DUCKFUN_GAMES: DuckFunGame[] = Array.from({ length: themes.length + 1 }, (_, levelIndex) =>
  gameSeries.map(series => series[levelIndex])
).flat();
