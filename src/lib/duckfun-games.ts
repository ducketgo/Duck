export const DUCKFUN_GAMES = [
  { slug: 'memoire-de-la-mare', title: 'Mémoire de la mare', category: 'Réflexion', description: 'Retrouve les paires avant que ta mémoire ne fasse des vagues.', mark: '◎', color: 'mint' },
  { slug: 'plouf-reflexe', title: 'Plouf réflexe', category: 'Réflexes', description: 'Repère le canard lumineux et tape avant qu’il ne replonge.', mark: '✳', color: 'blue' },
  { slug: 'duck-stack', title: 'Duck Stack', category: 'Adresse', description: 'Empile les plateformes au bon moment et bâtis la plus haute tour.', mark: '▥', color: 'violet' },
] as const;

export type DuckFunGame = (typeof DUCKFUN_GAMES)[number];
