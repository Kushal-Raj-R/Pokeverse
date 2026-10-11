// PokeAPI Client with memory & session caching and complete evolution parser

const pokemonCache = new Map();
const speciesCache = new Map();
const chainCache = new Map();

// Helper to capitalize strings
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatPokemonId(id) {
  return `#${String(id).padStart(4, '0')}`;
}

export function cleanFlavorText(text) {
  if (!text) return '';
  return text
    .replace(/\f/g, '\n')
    .replace(/\u00ad\n/g, '')
    .replace(/\u00ad/g, '')
    .replace(/[\n\r]+/g, ' ')
    .trim();
}

/**
 * Fetch a list of Pokémon references (name and url)
 */
export async function getPokemonList(limit = 151, offset = 0) {
  const cacheKey = `list_${limit}_${offset}`;
  if (pokemonCache.has(cacheKey)) {
    return pokemonCache.get(cacheKey);
  }

  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error(`Failed to fetch Pokémon list: ${res.statusText}`);
  const data = await res.json();
  
  pokemonCache.set(cacheKey, data);
  return data;
}

/**
 * Fetch detailed Pokémon data
 */
export async function getPokemonDetails(nameOrId) {
  const key = String(nameOrId).toLowerCase().trim();
  if (pokemonCache.has(key)) {
    return pokemonCache.get(key);
  }

  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${key}`);
  if (!res.ok) throw new Error(`Failed to fetch Pokémon: ${nameOrId}`);
  const raw = await res.json();

  // Normalize stats
  const stats = raw.stats.map(s => ({
    name: s.stat.name,
    base: s.base_stat,
    effort: s.effort
  }));
  const bst = stats.reduce((acc, curr) => acc + curr.base, 0);

  // Sprites
  const officialArtwork = raw.sprites.other?.['official-artwork']?.front_default;
  const officialArtworkShiny = raw.sprites.other?.['official-artwork']?.front_shiny;
  const showdownSprite = raw.sprites.other?.showdown?.front_default;
  const showdownShiny = raw.sprites.other?.showdown?.front_shiny;
  const homeSprite = raw.sprites.other?.home?.front_default;
  const defaultSprite = raw.sprites.front_default;
  const shinySprite = raw.sprites.front_shiny;

  const parsed = {
    id: raw.id,
    name: raw.name,
    displayName: capitalize(raw.name),
    heightMeters: (raw.height / 10).toFixed(1),
    weightKg: (raw.weight / 10).toFixed(1),
    heightFeet: ((raw.height / 10) * 3.28084).toFixed(1),
    weightLbs: ((raw.weight / 10) * 2.20462).toFixed(1),
    types: raw.types.map(t => t.type.name),
    stats,
    bst,
    sprites: {
      artwork: officialArtwork || homeSprite || defaultSprite,
      artworkShiny: officialArtworkShiny || shinySprite,
      animated: showdownSprite || defaultSprite,
      animatedShiny: showdownShiny || shinySprite,
      icon: defaultSprite
    },
    cries: {
      latest: raw.cries?.latest,
      legacy: raw.cries?.legacy
    },
    abilities: raw.abilities.map(a => ({
      name: a.ability.name.replace(/-/g, ' '),
      isHidden: a.is_hidden
    })),
    speciesUrl: raw.species.url
  };

  pokemonCache.set(key, parsed);
  pokemonCache.set(String(raw.id), parsed);
  return parsed;
}

/**
 * Fetch Pokémon species information (genus, flavor text, evolution chain url)
 */
export async function getPokemonSpecies(speciesUrlOrId) {
  const url = typeof speciesUrlOrId === 'string' && speciesUrlOrId.startsWith('http')
    ? speciesUrlOrId
    : `https://pokeapi.co/api/v2/pokemon-species/${speciesUrlOrId}`;

  if (speciesCache.has(url)) {
    return speciesCache.get(url);
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch species data');
  const raw = await res.json();

  // Find English genus (e.g. "Seed Pokémon")
  const genusObj = raw.genera?.find(g => g.language.name === 'en');
  const genus = genusObj ? genusObj.genus : 'Pokémon';

  // Find English flavor texts
  const flavorEntries = raw.flavor_text_entries
    ? raw.flavor_text_entries.filter(f => f.language.name === 'en')
    : [];

  const flavorText = flavorEntries.length > 0
    ? cleanFlavorText(flavorEntries[flavorEntries.length - 1].flavor_text)
    : 'No Pokédex entry recorded yet.';

  const parsed = {
    id: raw.id,
    genus,
    flavorText,
    evolutionChainUrl: raw.evolution_chain?.url,
    generation: raw.generation?.name,
    isLegendary: raw.is_legendary,
    isMythical: raw.is_mythical,
    captureRate: raw.capture_rate,
    baseHappiness: raw.base_happiness,
    growthRate: raw.growth_rate?.name?.replace(/-/g, ' ')
  };

  speciesCache.set(url, parsed);
  return parsed;
}

/**
 * Parses evolution trigger details into friendly human-readable text
 */
function parseEvolutionDetails(details) {
  if (!details || details.length === 0) return 'Special Evolution';

  const d = details[0];
  const parts = [];

  if (d.trigger?.name === 'level-up') {
    if (d.min_level) parts.push(`Lvl ${d.min_level}`);
    if (d.min_happiness) parts.push(`High Friendship (${d.min_happiness})`);
    if (d.time_of_day) parts.push(capitalize(d.time_of_day));
    if (d.known_move) parts.push(`Knowing ${capitalize(d.known_move.name.replace('-', ' '))}`);
    if (d.known_move_type) parts.push(`${capitalize(d.known_move_type.name)} Move`);
    if (d.location) parts.push(`at ${capitalize(d.location.name.replace('-', ' '))}`);
    if (d.held_item) parts.push(`Holding ${capitalize(d.held_item.name.replace('-', ' '))}`);
    if (d.needs_overworld_rain) parts.push('During Rain');
    if (parts.length === 0) parts.push('Level Up');
  } else if (d.trigger?.name === 'use-item') {
    parts.push(capitalize(d.item?.name?.replace(/-/g, ' ') || 'Item'));
  } else if (d.trigger?.name === 'trade') {
    parts.push('Trade');
    if (d.held_item) parts.push(`holding ${capitalize(d.held_item.name.replace('-', ' '))}`);
  } else if (d.trigger?.name === 'shed') {
    parts.push('Pokéball in Bag & Open Slot');
  } else {
    parts.push(capitalize(d.trigger?.name?.replace(/-/g, ' ') || 'Condition'));
  }

  return parts.join(' + ');
}

/**
 * Extract Pokémon ID from species URL (e.g., https://pokeapi.co/api/v2/pokemon-species/25/)
 */
function extractIdFromUrl(url) {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Fetch and parse the full evolution chain into a tree of nodes
 */
export async function getEvolutionChain(chainUrl) {
  if (!chainUrl) return null;

  if (chainCache.has(chainUrl)) {
    return chainCache.get(chainUrl);
  }

  const res = await fetch(chainUrl);
  if (!res.ok) throw new Error('Failed to fetch evolution chain');
  const data = await res.json();

  // Recursively build tree nodes with ID, name, sprites, trigger
  async function parseNode(node) {
    const id = extractIdFromUrl(node.species.url);
    const name = node.species.name;
    
    // Quick sprite URL from PokeAPI raw github repo without requiring full fetch
    const artwork = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
    const animated = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`;
    const fallback = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

    const evolvesTo = await Promise.all(
      node.evolves_to.map(async next => {
        const nextNode = await parseNode(next);
        return {
          ...nextNode,
          triggerText: parseEvolutionDetails(next.evolution_details)
        };
      })
    );

    return {
      id,
      name,
      displayName: capitalize(name),
      artwork,
      animated,
      fallback,
      evolvesTo
    };
  }

  const root = await parseNode(data.chain);
  chainCache.set(chainUrl, root);
  return root;
}
