// Complete Pokémon Type System, Colors, Multipliers, and Generation metadata

export const TYPE_CONFIG = {
  normal: {
    name: 'Normal',
    color: '#9FA19F',
    bgGradient: 'linear-gradient(135deg, #9FA19F 0%, #6D6D6E 100%)',
    glow: 'rgba(159, 161, 159, 0.45)',
    textColor: '#ffffff',
    icon: '⚪'
  },
  fire: {
    name: 'Fire',
    color: '#E62829',
    bgGradient: 'linear-gradient(135deg, #FF5722 0%, #D32F2F 100%)',
    glow: 'rgba(255, 87, 34, 0.55)',
    textColor: '#ffffff',
    icon: '🔥'
  },
  water: {
    name: 'Water',
    color: '#2980EF',
    bgGradient: 'linear-gradient(135deg, #2980EF 0%, #1565C0 100%)',
    glow: 'rgba(41, 128, 239, 0.55)',
    textColor: '#ffffff',
    icon: '💧'
  },
  grass: {
    name: 'Grass',
    color: '#3FA129',
    bgGradient: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
    glow: 'rgba(76, 175, 80, 0.55)',
    textColor: '#ffffff',
    icon: '🌿'
  },
  electric: {
    name: 'Electric',
    color: '#FAC000',
    bgGradient: 'linear-gradient(135deg, #FFC107 0%, #FFA000 100%)',
    glow: 'rgba(255, 193, 7, 0.55)',
    textColor: '#1a1a1a',
    icon: '⚡'
  },
  ice: {
    name: 'Ice',
    color: '#3DCEF3',
    bgGradient: 'linear-gradient(135deg, #00E5FF 0%, #00B0FF 100%)',
    glow: 'rgba(0, 229, 255, 0.55)',
    textColor: '#102027',
    icon: '❄️'
  },
  fighting: {
    name: 'Fighting',
    color: '#FF8000',
    bgGradient: 'linear-gradient(135deg, #FF6D00 0%, #DD2C00 100%)',
    glow: 'rgba(255, 109, 0, 0.55)',
    textColor: '#ffffff',
    icon: '🥊'
  },
  poison: {
    name: 'Poison',
    color: '#9141CB',
    bgGradient: 'linear-gradient(135deg, #AB47BC 0%, #7B1FA2 100%)',
    glow: 'rgba(171, 71, 188, 0.55)',
    textColor: '#ffffff',
    icon: '☠️'
  },
  ground: {
    name: 'Ground',
    color: '#915121',
    bgGradient: 'linear-gradient(135deg, #A1887F 0%, #6D4C41 100%)',
    glow: 'rgba(161, 136, 127, 0.55)',
    textColor: '#ffffff',
    icon: '🏜️'
  },
  flying: {
    name: 'Flying',
    color: '#81B9EF',
    bgGradient: 'linear-gradient(135deg, #81D4FA 0%, #29B6F6 100%)',
    glow: 'rgba(129, 212, 250, 0.55)',
    textColor: '#102027',
    icon: '🕊️'
  },
  psychic: {
    name: 'Psychic',
    color: '#EF4179',
    bgGradient: 'linear-gradient(135deg, #EC407A 0%, #C2185B 100%)',
    glow: 'rgba(236, 64, 122, 0.55)',
    textColor: '#ffffff',
    icon: '🔮'
  },
  bug: {
    name: 'Bug',
    color: '#91A119',
    bgGradient: 'linear-gradient(135deg, #8BC34A 0%, #558B2F 100%)',
    glow: 'rgba(139, 195, 74, 0.55)',
    textColor: '#ffffff',
    icon: '🐛'
  },
  rock: {
    name: 'Rock',
    color: '#AFA981',
    bgGradient: 'linear-gradient(135deg, #B0BEC5 0%, #78909C 100%)',
    glow: 'rgba(176, 190, 197, 0.55)',
    textColor: '#1a1a1a',
    icon: '🪨'
  },
  ghost: {
    name: 'Ghost',
    color: '#704170',
    bgGradient: 'linear-gradient(135deg, #7E57C2 0%, #512DA8 100%)',
    glow: 'rgba(126, 87, 194, 0.55)',
    textColor: '#ffffff',
    icon: '👻'
  },
  dragon: {
    name: 'Dragon',
    color: '#5060E1',
    bgGradient: 'linear-gradient(135deg, #5C6BC0 0%, #283593 100%)',
    glow: 'rgba(92, 107, 192, 0.55)',
    textColor: '#ffffff',
    icon: '🐉'
  },
  dark: {
    name: 'Dark',
    color: '#624D4E',
    bgGradient: 'linear-gradient(135deg, #424242 0%, #212121 100%)',
    glow: 'rgba(66, 66, 66, 0.55)',
    textColor: '#ffffff',
    icon: '🌑'
  },
  steel: {
    name: 'Steel',
    color: '#60A1B8',
    bgGradient: 'linear-gradient(135deg, #90A4AE 0%, #607D8B 100%)',
    glow: 'rgba(144, 164, 174, 0.55)',
    textColor: '#ffffff',
    icon: '⚙️'
  },
  fairy: {
    name: 'Fairy',
    color: '#EF70EF',
    bgGradient: 'linear-gradient(135deg, #F48FB1 0%, #D81B60 100%)',
    glow: 'rgba(244, 143, 177, 0.55)',
    textColor: '#ffffff',
    icon: '✨'
  }
};

export const ALL_TYPES = Object.keys(TYPE_CONFIG);

// Attack type effectiveness chart (row: attacking type, col: defending type)
// 2 = Super effective, 0.5 = Not very effective, 0 = No effect, 1 = Normal
const TYPE_CHART = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, grass: 0.5, electric: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:   { fire: 2, grass: 0.5, electric: 2, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:   { grass: 2, electric: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:      { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy:    { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

/**
 * Calculates defense matchups for a Pokémon given its types array.
 * e.g. types = ['water', 'ground'] -> returns weaknesses, resistances, immunities
 */
export function calculateMatchups(defendingTypes) {
  const result = {
    quadWeak: [],    // 4x
    doubleWeak: [],  // 2x
    halfResist: [],  // 0.5x
    quadResist: [],  // 0.25x
    immune: []       // 0x
  };

  const normalized = defendingTypes.map(t => t.toLowerCase());

  ALL_TYPES.forEach(attacker => {
    let multiplier = 1;
    normalized.forEach(defender => {
      const effect = TYPE_CHART[attacker]?.[defender];
      if (effect !== undefined) {
        multiplier *= effect;
      }
    });

    if (multiplier === 0) {
      result.immune.push(attacker);
    } else if (multiplier === 4) {
      result.quadWeak.push(attacker);
    } else if (multiplier === 2) {
      result.doubleWeak.push(attacker);
    } else if (multiplier === 0.5) {
      result.halfResist.push(attacker);
    } else if (multiplier === 0.25) {
      result.quadResist.push(attacker);
    }
  });

  return result;
}

export const GENERATIONS = [
  { id: 'all', name: 'All Generations', start: 1, end: 1025, region: 'National' },
  { id: 'gen1', name: 'Gen 1', start: 1, end: 151, region: 'Kanto' },
  { id: 'gen2', name: 'Gen 2', start: 152, end: 251, region: 'Johto' },
  { id: 'gen3', name: 'Gen 3', start: 252, end: 386, region: 'Hoenn' },
  { id: 'gen4', name: 'Gen 4', start: 387, end: 493, region: 'Sinnoh' },
  { id: 'gen5', name: 'Gen 5', start: 494, end: 649, region: 'Unova' },
  { id: 'gen6', name: 'Gen 6', start: 650, end: 721, region: 'Kalos' },
  { id: 'gen7', name: 'Gen 7', start: 722, end: 809, region: 'Alola' },
  { id: 'gen8', name: 'Gen 8', start: 810, end: 905, region: 'Galar' },
  { id: 'gen9', name: 'Gen 9', start: 906, end: 1025, region: 'Paldea' },
];

export const STAT_LABELS = {
  hp: { name: 'HP', full: 'Hit Points', max: 255, color: '#FF5959' },
  attack: { name: 'ATK', full: 'Attack', max: 190, color: '#F5AC78' },
  defense: { name: 'DEF', full: 'Defense', max: 250, color: '#FAE078' },
  'special-attack': { name: 'SPA', full: 'Sp. Attack', max: 194, color: '#9DB7F5' },
  'special-defense': { name: 'SPD', full: 'Sp. Defense', max: 250, color: '#A7DB8D' },
  speed: { name: 'SPD', full: 'Speed', max: 200, color: '#FA92B2' }
};
