export const DUCKFUN_GAMES = [
  { slug: 'memoire-de-la-mare', title: 'Mémoire de la mare', category: 'Réflexion', description: 'Retrouve les paires avant que ta mémoire ne fasse des vagues.', mark: '◎', color: 'mint' },
  { slug: 'plouf-reflexe', title: 'Plouf réflexe', category: 'Réflexes', description: 'Repère le canard lumineux et tape avant qu’il ne replonge.', mark: '✳', color: 'blue' },
  { slug: 'duck-stack', title: 'Duck Stack', category: 'Adresse', description: 'Empile les plateformes au bon moment et bâtis la plus haute tour.', mark: '▥', color: 'violet' },
  { slug: 'plouf-ou-plus', title: 'Plouf ou plus', category: 'Déduction', description: 'Un nombre se cache sous la mare. Retrouve-le en sept essais.', mark: '?', color: 'mint' },
  { slug: 'calcul-maree', title: 'Calcul marée', category: 'Casse-tête', description: 'Résous un maximum de calculs avant la prochaine vague.', mark: '＋', color: 'blue' },
  { slug: 'palette-plouf', title: 'Palette Plouf', category: 'Couleurs', description: 'Suis la consigne, choisis la bonne couleur et garde ta série.', mark: '◉', color: 'violet' },
  { slug: 'parcours-eclair', title: 'Parcours éclair', category: 'Vitesse', description: 'Retrouve les nombres dans l’ordre avant que le chrono ne file.', mark: '↗', color: 'mint' },
  { slug: 'suite-de-canards', title: 'Suite de canards', category: 'Mémoire', description: 'Observe la séquence lumineuse et reproduis-la sans te tromper.', mark: '⌁', color: 'blue' },
] as const;

export type DuckFunGame = (typeof DUCKFUN_GAMES)[number];
