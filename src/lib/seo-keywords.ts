// SEO keyword catalogue for the DUCK platform.
// Generated to cover the ecosystem: learning, creation, community, tools, games, services.

const roots: string[] = [
  `duck`, `duck platform`, `écosystème duck`, `communauté duck`, `duckdev`, `djduck`, `duckos`, `ducktechnologies`,
  `duckweb`, `duckcommunity`, `duckauth`, `duckcommunication`, `duckfun`, `mini-jeux`, `jeux en ligne`, `jeux gratuits`,
  `jeux de mémoire`, `jeux de réflexes`, `jeux d adresse`, `jeux de calcul`, `jeux de couleurs`, `jeux de vitesse`,
  `jeux d observation`, `arcade en ligne`, `arcade gratuite`, `jeu de mémoire`, `jeu de réflexes`, `jeu de calcul`,
  `logiciels duck`, `logiciels open source`, `outils numériques`, `plateforme numérique`, `plateforme communautaire`,
  `apprendre en ligne`, `apprendre le code`, `apprendre la musique`, `créer ensemble`, `avancer ensemble`,
  `performer`, `productivité`, `développement web`, `développement logiciel`, `open source`, `logiciel libre`,
  `identité numérique`, `authentification`, `compte utilisateur`, `sécurité en ligne`, `confidentialité`,
  `messagerie`, `communication en ligne`, `système d exploitation`, `os open source`, `technologies du futur`,
  `innovation numérique`, `projets collaboratifs`, `communauté open source`, `développeur`, `musique en ligne`,
  `création musicale`, `jeux navigateur`, `jeux html5`, `jeux gratuits sans téléchargement`, `jeux éducatifs`,
  `jeux pour enfants`, `jeux pour adultes`, `jeux de pause`, `mini jeu gratuit`, `arcade gratuite en ligne`,
  `jeu de mémoire en ligne`, `jeu de calcul mental`, `jeu de couleurs en ligne`, `jeu de vitesse en ligne`,
  `jeu d observation en ligne`, `défi cérébral`, `entraînement cérébral`, `exercices cérébraux`,
  `apprendre en jouant`, `éducation numérique`, `numérique responsable`, `inclusion numérique`,
  `accessibilité numérique`, `outils gratuits`, `ressources gratuites`, `documentation technique`,
  `projets open source français`, `communauté tech française`, `écosystème tech`, `startup tech`,
  `plateforme éducative`, `apprentissage ludique`, `jeux de logique`, `jeux de réflexion`, `casse-tête en ligne`,
  `puzzle en ligne`, `memory game`, `reflex game`, `stack game`, `number game`, `math game`, `color game`,
  `path game`, `sequence game`, `duck game`, `duck fun`, `duck clicker`, `jeu du canard`,
];

const modifiers: string[] = [
  `gratuit`, `gratuite`, `en ligne`, `français`, `française`, `mobile`, `sans inscription`, `rapide`,
  `simple`, `accessible`, `moderne`, `ouvert`, `collaboratif`, `communautaire`, `éducatif`, `ludique`,
  `interactif`, `créatif`, `innovant`, `sécurisé`, `fiable`, `performant`, `léger`, `responsive`,
  `pour tous`, `pour débutants`, `pour enfants`, `pour adultes`, `sans téléchargement`, `navigateur`,
  `web`, `mobile et desktop`, `multiplateforme`, `open source`, `libre`, `communauté`, `partage`,
  `apprentissage`, `formation`, `tutoriel`, `guide`, `ressource`, `outil`, `service`, `plateforme`,
  `application`, `site web`, `projet`, `initiative`, `écosystème`, `réseau`, `espace`, `univers`,
];

const prefixes: string[] = [
  `comment`, `meilleur`, `meilleure`, `top`, `guide`, `tutoriel`, `astuce`, `conseil`, `découvrir`,
  `explorer`, `jouer`, `apprendre`, `créer`, `utiliser`, `télécharger`, `installer`, `configurer`,
  `comprendre`, `maîtriser`, `optimiser`, `améliorer`, `lancer`, `rejoindre`, `participer`,
];

const suffixes: string[] = [
  `2026`, `gratuit`, `en ligne`, `français`, `facile`, `rapide`, `complet`, `débutant`, `avancé`,
  `mobile`, `desktop`, `navigateur`, `open source`, `communauté`, `duck`, `duck platform`,
];

const services: string[] = [
  `DuckDev`, `DjDuck`, `DuckOS`, `DuckTechnologies`, `DuckWeb`, `DuckCommunity`, `DuckAuth`,
  `DuckCommunication`, `DuckFun`, `DuckAdmin`,
];

const games: string[] = [
  `mémoire de la mare`, `plouf réflexe`, `duck stack`, `plouf ou plus`, `calcul marée`, `palette plouf`,
  `parcours éclair`, `suite de canards`,
];

const en: string[] = [
  `duck platform`, `duck community`, `duck games`, `free online games`, `memory game online`,
  `reflex game online`, `math game online`, `color game online`, `speed game online`, `observation game`,
  `free arcade games`, `browser games free`, `html5 games free`, `educational games`, `brain training games`,
  `open source platform`, `community platform`, `digital ecosystem`, `learn to code`, `coding community`,
  `music creation`, `open source os`, `digital identity`, `secure authentication`, `online tools`,
  `free software`, `open source software`, `tech community`, `innovation platform`, `collaborative projects`,
];

function norm(v: string): string {
  return v.trim().replace(/\s+/g, ` `);
}

const set = new Set<string>();
function add(kw: string) {
  const v = norm(kw);
  if (v.length >= 3 && v.length <= 120) set.add(v.toLowerCase());
}

roots.forEach(add);
roots.forEach(r => modifiers.forEach(m => add(`${r} ${m}`)));
modifiers.forEach(m => roots.forEach(r => add(`${m} ${r}`)));
prefixes.forEach(p => roots.forEach(r => add(`${p} ${r}`)));
roots.forEach(r => suffixes.forEach(s => add(`${r} ${s}`)));
services.forEach(s => {
  add(s);
  modifiers.forEach(m => add(`${s} ${m}`));
  prefixes.forEach(p => add(`${p} ${s}`));
});
games.forEach(g => {
  add(g);
  modifiers.forEach(m => add(`${g} ${m}`));
  prefixes.forEach(p => add(`${p} ${g}`));
  suffixes.forEach(s => add(`${g} ${s}`));
});
en.forEach(add);
en.forEach(e => modifiers.forEach(m => add(`${e} ${m}`)));

for (let i = 0; i < roots.length && set.size < 2500; i++) {
  for (let j = i + 1; j < roots.length && set.size < 2500; j++) {
    add(`${roots[i]} et ${roots[j]}`);
    if (set.size >= 2500) break;
  }
}

let idx = 0;
while (set.size < 2100) {
  add(`${roots[idx % roots.length]} ${suffixes[idx % suffixes.length]} ${modifiers[idx % modifiers.length]}`);
  idx++;
}

export const SEO_KEYWORDS: string[] = [...set].slice(0, 2050);
export const SEO_KEYWORDS_COUNT: number = SEO_KEYWORDS.length;