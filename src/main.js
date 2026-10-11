import { 
  getPokemonList, 
  getPokemonDetails, 
  getPokemonSpecies, 
  getEvolutionChain, 
  capitalize, 
  formatPokemonId 
} from './api.js';

import { 
  TYPE_CONFIG, 
  ALL_TYPES, 
  GENERATIONS, 
  STAT_LABELS, 
  calculateMatchups 
} from './typeData.js';

/* ==========================================================================
   State
   ========================================================================== */
const state = {
  allCatalog: [],        // { id, name, url }
  filteredCatalog: [],   // catalog after gen/search/type/fav filters
  displayedItems: [],    // items currently loaded into DOM
  
  genFilter: 'gen1',     // default to Gen 1 for fast initial load
  typeFilter: 'all',
  searchQuery: '',
  sortOrder: 'id-asc',
  favoritesOnly: false,
  
  pageSize: 24,
  currentBatch: 1,
  
  favorites: new Set(),
  
  currentPokemon: null,
  isShiny: false,
  activeTab: 'about',
  
  isLoadingMore: false
};

/* ==========================================================================
   DOM Elements
   ========================================================================== */
const DOM = {
  searchInput: document.getElementById('pokemon-search-input'),
  searchClearBtn: document.getElementById('search-clear-btn'),
  genSelect: document.getElementById('gen-select'),
  sortSelect: document.getElementById('sort-select'),
  typePillsContainer: document.getElementById('type-pills'),
  favoritesToggleBtn: document.getElementById('favorites-toggle-btn'),
  favoritesCount: document.getElementById('favorites-count'),
  surpriseBtn: document.getElementById('surprise-btn'),
  
  grid: document.getElementById('pokemon-grid'),
  loadMoreBtn: document.getElementById('load-more-btn'),
  visibleCount: document.getElementById('visible-count'),
  totalCount: document.getElementById('total-count'),
  
  // Modal Elements
  modal: document.getElementById('pokemon-modal'),
  modalSheet: document.getElementById('modal-sheet'),
  modalBanner: document.getElementById('modal-banner'),
  modalCloseBtn: document.getElementById('modal-close-btn'),
  modalPrevBtn: document.getElementById('modal-prev-btn'),
  modalNextBtn: document.getElementById('modal-next-btn'),
  modalFavBtn: document.getElementById('modal-fav-btn'),
  modalId: document.getElementById('modal-pokemon-id'),
  modalName: document.getElementById('modal-pokemon-name'),
  modalGenus: document.getElementById('modal-pokemon-genus'),
  modalTypes: document.getElementById('modal-pokemon-types'),
  modalImg: document.getElementById('modal-pokemon-img'),
  shinyToggleBtn: document.getElementById('shiny-toggle-btn'),
  cryPlayBtn: document.getElementById('cry-play-btn'),
  cryAudio: document.getElementById('cry-audio'),
  
  tabButtons: document.querySelectorAll('.modal-tab-btn'),
  tabPanes: document.querySelectorAll('.tab-pane'),
  
  flavorText: document.getElementById('modal-flavor-text'),
  height: document.getElementById('modal-height'),
  heightSub: document.getElementById('modal-height-sub'),
  weight: document.getElementById('modal-weight'),
  weightSub: document.getElementById('modal-weight-sub'),
  catchRate: document.getElementById('modal-catch-rate'),
  growthRate: document.getElementById('modal-growth-rate'),
  abilities: document.getElementById('modal-abilities'),
  
  statsList: document.getElementById('modal-stats-list'),
  bstValue: document.getElementById('modal-bst-value'),
  bstTier: document.getElementById('modal-bst-tier'),
  
  evolutionContainer: document.getElementById('modal-evolution-container'),
  matchupsContainer: document.getElementById('modal-matchups-container'),
  
  toast: document.getElementById('toast'),
  toastIcon: document.getElementById('toast-icon'),
  toastMsg: document.getElementById('toast-msg')
};

/* ==========================================================================
   Initialization
   ========================================================================== */
async function initApp() {
  loadFavorites();
  populateGenerations();
  renderTypePills();
  bindEvents();
  
  // Load initial Pokémon data (Gen 1 is selected by default for instant gratification)
  showLoadingSkeletons(12);
  await loadCatalog();
  applyFiltersAndRender();
}

/* ==========================================================================
   Favorites Persistence
   ========================================================================== */
function loadFavorites() {
  try {
    const saved = localStorage.getItem('pokedex_favs');
    if (saved) {
      state.favorites = new Set(JSON.parse(saved));
    }
  } catch (e) {
    state.favorites = new Set();
  }
  updateFavoritesBadge();
}

function saveFavorites() {
  try {
    localStorage.setItem('pokedex_favs', JSON.stringify([...state.favorites]));
  } catch (e) {}
  updateFavoritesBadge();
}

function toggleFavorite(id) {
  const numId = Number(id);
  const wasFav = state.favorites.has(numId);
  if (wasFav) {
    state.favorites.delete(numId);
    showToast('💔 Removed from favorites');
  } else {
    state.favorites.add(numId);
    showToast('❤️ Added to favorites!');
  }
  saveFavorites();
  
  // Refresh favorites buttons across UI
  document.querySelectorAll(`.fav-btn-${numId}`).forEach(btn => {
    btn.classList.toggle('is-favorite', !wasFav);
  });
  if (state.currentPokemon && state.currentPokemon.id === numId) {
    DOM.modalFavBtn.classList.toggle('is-favorite', !wasFav);
  }

  // If in favorites-only view, re-filter
  if (state.favoritesOnly) {
    applyFiltersAndRender();
  }
}

function updateFavoritesBadge() {
  DOM.favoritesCount.textContent = state.favorites.size;
}

/* ==========================================================================
   UI Controls Setup
   ========================================================================== */
function populateGenerations() {
  DOM.genSelect.innerHTML = GENERATIONS.map(gen => 
    `<option value="${gen.id}">${gen.name} (${gen.region})</option>`
  ).join('');
  DOM.genSelect.value = state.genFilter;
}

function renderTypePills() {
  const allBtn = `
    <button class="type-pill active" data-type="all">
      <span class="type-emoji">🌐</span>
      <span>All Types</span>
    </button>
  `;
  
  const pills = ALL_TYPES.map(type => {
    const config = TYPE_CONFIG[type];
    return `
      <button class="type-pill" data-type="${type}" style="--pill-glow: ${config.glow}">
        <span class="type-emoji">${config.icon}</span>
        <span>${config.name}</span>
      </button>
    `;
  }).join('');

  DOM.typePillsContainer.innerHTML = allBtn + pills;
}

/* ==========================================================================
   Catalog Fetching
   ========================================================================== */
async function loadCatalog() {
  try {
    // PokeAPI has 1025 standard numbered Pokémon
    const data = await getPokemonList(1025, 0);
    state.allCatalog = data.results.map((p, idx) => ({
      id: idx + 1,
      name: p.name,
      displayName: capitalize(p.name),
      url: p.url
    }));
  } catch (err) {
    console.error('Failed to load Pokémon catalog:', err);
    DOM.grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3>Failed to load Pokédex data</h3>
        <p>Could not connect to PokeAPI. Please check your internet connection and retry.</p>
        <button class="btn-load-more" onclick="location.reload()">Retry</button>
      </div>
    `;
  }
}

/* ==========================================================================
   Filter, Sort & Rendering
   ========================================================================== */
function applyFiltersAndRender() {
  let list = [...state.allCatalog];

  // 1. Generation filter
  const activeGen = GENERATIONS.find(g => g.id === state.genFilter);
  if (activeGen && activeGen.id !== 'all') {
    list = list.filter(p => p.id >= activeGen.start && p.id <= activeGen.end);
  }

  // 2. Favorites only filter
  if (state.favoritesOnly) {
    list = list.filter(p => state.favorites.has(p.id));
  }

  // 3. Search query filter
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.trim().toLowerCase();
    list = list.filter(p => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchId = String(p.id) === q.replace('#', '') || formatPokemonId(p.id).toLowerCase().includes(q);
      return matchName || matchId;
    });
  }

  state.filteredCatalog = list;
  state.currentBatch = 1;
  state.displayedItems = [];

  DOM.totalCount.textContent = list.length;
  DOM.visibleCount.textContent = '0';

  if (list.length === 0) {
    DOM.grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3>No Pokémon Found</h3>
        <p>Try clearing your search query or changing filters.</p>
      </div>
    `;
    DOM.loadMoreBtn.style.display = 'none';
    return;
  }

  DOM.grid.innerHTML = '';
  loadNextBatch();
}

async function loadNextBatch() {
  if (state.isLoadingMore) return;
  state.isLoadingMore = true;

  const start = (state.currentBatch - 1) * state.pageSize;
  const nextSlice = state.filteredCatalog.slice(start, start + state.pageSize);

  if (nextSlice.length === 0) {
    DOM.loadMoreBtn.style.display = 'none';
    state.isLoadingMore = false;
    return;
  }

  // Render placeholder cards immediately for instant responsiveness
  const cardPlaceholders = nextSlice.map(p => {
    const card = document.createElement('div');
    card.className = 'pokemon-card skeleton-card';
    card.id = `card-${p.id}`;
    card.innerHTML = `<div class="skeleton-shimmer"></div>`;
    DOM.grid.appendChild(card);
    return { p, el: card };
  });

  // Fetch detailed data for each Pokémon in the slice
  await Promise.all(
    cardPlaceholders.map(async ({ p, el }) => {
      try {
        const details = await getPokemonDetails(p.id);
        
        // If type filter is active, check if Pokémon matches
        if (state.typeFilter !== 'all' && !details.types.includes(state.typeFilter)) {
          el.remove();
          return;
        }

        renderPokemonCard(details, el);
        state.displayedItems.push(details);
      } catch (err) {
        console.error(`Failed to load Pokémon #${p.id}:`, err);
        el.remove();
      }
    })
  );

  DOM.visibleCount.textContent = DOM.grid.querySelectorAll('.pokemon-card:not(.skeleton-card)').length;
  
  // Check if more items can be loaded
  const hasMore = (start + state.pageSize) < state.filteredCatalog.length;
  DOM.loadMoreBtn.style.display = hasMore ? 'inline-flex' : 'none';
  
  state.currentBatch++;
  state.isLoadingMore = false;
}

/* ==========================================================================
   Render Single Pokémon Card
   ========================================================================== */
function renderPokemonCard(p, existingEl) {
  const primaryType = p.types[0] || 'normal';
  const typeCfg = TYPE_CONFIG[primaryType] || TYPE_CONFIG.normal;
  const isFav = state.favorites.has(p.id);

  const card = existingEl || document.createElement('div');
  card.className = 'pokemon-card';
  card.style.setProperty('--card-glow', typeCfg.glow);
  card.style.setProperty('--card-border', typeCfg.color + '60');
  card.setAttribute('data-id', p.id);

  // Type Badges
  const typeBadges = p.types.map(t => {
    const cfg = TYPE_CONFIG[t] || TYPE_CONFIG.normal;
    return `
      <span class="badge-type" style="background: ${cfg.bgGradient}; color: ${cfg.textColor};">
        <span>${cfg.icon}</span> ${cfg.name}
      </span>
    `;
  }).join('');

  // Quick stat preview bars (HP, ATK, DEF)
  const hpStat = p.stats.find(s => s.name === 'hp')?.base || 50;
  const atkStat = p.stats.find(s => s.name === 'attack')?.base || 50;
  const defStat = p.stats.find(s => s.name === 'defense')?.base || 50;

  card.innerHTML = `
    <div class="card-header">
      <span class="pokemon-number">${formatPokemonId(p.id)}</span>
      <div class="card-actions-quick">
        <button class="btn-icon-round cry-quick-btn" title="Play Cry" data-id="${p.id}" aria-label="Play cry">
          🔊
        </button>
        <button class="btn-icon-round fav-btn-${p.id} ${isFav ? 'is-favorite' : ''}" title="Favorite" data-id="${p.id}" aria-label="Favorite">
          ❤️
        </button>
      </div>
    </div>

    <div class="card-image-wrapper">
      <div class="card-watermark-number">${formatPokemonId(p.id)}</div>
      <img 
        class="card-pokemon-img" 
        src="${p.sprites.artwork}" 
        alt="${p.displayName}" 
        loading="lazy"
        onerror="this.src='${p.sprites.animated || p.sprites.icon}'"
      >
    </div>

    <div class="card-info">
      <div class="card-pokemon-name">
        <span>${p.displayName}</span>
      </div>
      <div class="card-types">
        ${typeBadges}
      </div>

      <div class="card-stats-preview">
        <div class="preview-stat-row">
          <span class="stat-label-mini">HP</span>
          <div class="stat-bar-mini-bg">
            <div class="stat-bar-mini-fill" style="width: ${(hpStat / 255) * 100}%; --stat-color: #FF5959;"></div>
          </div>
          <span class="stat-val-mini">${hpStat}</span>
        </div>
        <div class="preview-stat-row">
          <span class="stat-label-mini">ATK</span>
          <div class="stat-bar-mini-bg">
            <div class="stat-bar-mini-fill" style="width: ${(atkStat / 190) * 100}%; --stat-color: #F5AC78;"></div>
          </div>
          <span class="stat-val-mini">${atkStat}</span>
        </div>
        <div class="preview-stat-row">
          <span class="stat-label-mini">DEF</span>
          <div class="stat-bar-mini-bg">
            <div class="stat-bar-mini-fill" style="width: ${(defStat / 250) * 100}%; --stat-color: #FAE078;"></div>
          </div>
          <span class="stat-val-mini">${defStat}</span>
        </div>
      </div>
    </div>
  `;

  // Click card to open modal
  card.addEventListener('click', (e) => {
    // If clicked on quick audio or favorite button, avoid opening modal
    if (e.target.closest('.card-actions-quick')) return;
    openPokemonModal(p.id);
  });

  // Quick Cry listener
  const cryBtn = card.querySelector('.cry-quick-btn');
  if (cryBtn) {
    cryBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playPokemonCry(p);
    });
  }

  // Quick Favorite listener
  const favBtn = card.querySelector(`.fav-btn-${p.id}`);
  if (favBtn) {
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(p.id);
    });
  }

  return card;
}

/* ==========================================================================
   Pokémon Detail Modal Logic
   ========================================================================== */
async function openPokemonModal(pokemonId) {
  state.isShiny = false;
  DOM.shinyToggleBtn.classList.remove('active');

  // Open modal overlay
  DOM.modal.classList.add('active');
  DOM.modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Set loading placeholder in modal
  DOM.modalName.textContent = 'Loading...';
  DOM.modalId.textContent = formatPokemonId(pokemonId);
  DOM.modalGenus.textContent = 'Fetching Pokédex data...';
  DOM.modalTypes.innerHTML = '';
  DOM.modalImg.src = '';
  DOM.flavorText.textContent = 'Loading official Pokédex entry...';

  try {
    const pokemon = await getPokemonDetails(pokemonId);
    state.currentPokemon = pokemon;

    // Apply primary type colors to banner
    const primaryType = pokemon.types[0] || 'normal';
    const typeCfg = TYPE_CONFIG[primaryType] || TYPE_CONFIG.normal;
    DOM.modalBanner.style.setProperty('--modal-gradient', typeCfg.bgGradient);
    DOM.modalSheet.style.setProperty('--modal-glow', typeCfg.glow);

    // Basic Header Info
    DOM.modalId.textContent = formatPokemonId(pokemon.id);
    DOM.modalName.textContent = pokemon.displayName;
    DOM.modalImg.src = pokemon.sprites.artwork;
    DOM.modalImg.alt = pokemon.displayName;

    // Favorites button state
    DOM.modalFavBtn.classList.toggle('is-favorite', state.favorites.has(pokemon.id));

    // Types
    DOM.modalTypes.innerHTML = pokemon.types.map(t => {
      const cfg = TYPE_CONFIG[t] || TYPE_CONFIG.normal;
      return `
        <span class="badge-type" style="background: ${cfg.bgGradient}; color: ${cfg.textColor};">
          <span>${cfg.icon}</span> ${cfg.name}
        </span>
      `;
    }).join('');

    // Height & Weight
    DOM.height.textContent = `${pokemon.heightMeters} m`;
    DOM.heightSub.textContent = `${pokemon.heightFeet} ft`;
    DOM.weight.textContent = `${pokemon.weightKg} kg`;
    DOM.weightSub.textContent = `${pokemon.weightLbs} lbs`;

    // Abilities
    DOM.abilities.innerHTML = pokemon.abilities.map(a => `
      <div class="ability-chip ${a.isHidden ? 'hidden' : ''}">
        <span>${a.isHidden ? '👁️' : '⚡'}</span>
        <span>${a.name}</span>
        ${a.isHidden ? '<small style="font-size: 0.68rem; opacity: 0.8;">(Hidden)</small>' : ''}
      </div>
    `).join('');

    // Render Stats
    renderStatsTab(pokemon);

    // Render Type Matchups
    renderMatchupsTab(pokemon.types);

    // Fetch Species & Flavor Text & Evolution
    const species = await getPokemonSpecies(pokemon.speciesUrl);
    DOM.modalGenus.textContent = species.genus;
    DOM.flavorText.textContent = `"${species.flavorText}"`;
    DOM.catchRate.textContent = `${species.captureRate} / 255`;
    DOM.growthRate.textContent = species.growthRate || 'Medium';

    // Render Evolution Chain
    if (species.evolutionChainUrl) {
      renderEvolutionTab(species.evolutionChainUrl, pokemon.id);
    } else {
      DOM.evolutionContainer.innerHTML = '<p style="color: var(--text-muted)">This Pokémon has no known evolutions.</p>';
    }

  } catch (err) {
    console.error('Error loading Pokémon details into modal:', err);
    DOM.modalName.textContent = 'Failed to load';
    DOM.modalGenus.textContent = 'Error connecting to PokeAPI';
  }
}

function closeModal() {
  DOM.modal.classList.remove('active');
  DOM.modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  stopPokemonCry();
}

/* ==========================================================================
   Tab 2: Base Stats Tab Rendering
   ========================================================================== */
function renderStatsTab(pokemon) {
  DOM.statsList.innerHTML = pokemon.stats.map(s => {
    const meta = STAT_LABELS[s.name] || { name: s.name.toUpperCase(), max: 200, color: '#ff4757' };
    const percent = Math.min(100, Math.round((s.base / meta.max) * 100));

    return `
      <div class="stat-row-detailed">
        <span class="stat-name-label">${meta.name}</span>
        <span class="stat-value-detailed">${s.base}</span>
        <div class="stat-bar-full-bg">
          <div 
            class="stat-bar-full-fill" 
            style="width: ${percent}%; --stat-gradient: ${meta.color}; --stat-glow: ${meta.color}66"
          ></div>
        </div>
        <span class="stat-max-val">${meta.max}</span>
      </div>
    `;
  }).join('');

  DOM.bstValue.textContent = pokemon.bst;

  // Evaluate Tier based on BST
  let tier = 'Standard';
  let tierColor = '#8e9bb0';
  if (pokemon.bst >= 600) {
    tier = 'Legendary / S-Tier';
    tierColor = '#ffbe2e';
  } else if (pokemon.bst >= 520) {
    tier = 'High Competitive / A-Tier';
    tierColor = '#00d2d3';
  } else if (pokemon.bst >= 440) {
    tier = 'Mid Tier / B-Tier';
    tierColor = '#9b59b6';
  } else {
    tier = 'Introductory / C-Tier';
    tierColor = '#8e9bb0';
  }
  DOM.bstTier.textContent = `Tier: ${tier}`;
  DOM.bstTier.style.borderColor = tierColor;
  DOM.bstTier.style.color = tierColor;
}

/* ==========================================================================
   Tab 3: Evolution Chain Rendering
   ========================================================================== */
async function renderEvolutionTab(chainUrl, currentId) {
  DOM.evolutionContainer.innerHTML = `
    <div style="text-align: center; color: var(--text-muted); padding: 2rem;">
      <div class="empty-state-icon" style="font-size: 2rem;">🌿</div>
      <p>Mapping evolution timeline...</p>
    </div>
  `;

  try {
    const chainRoot = await getEvolutionChain(chainUrl);
    if (!chainRoot) {
      DOM.evolutionContainer.innerHTML = '<p style="color: var(--text-muted)">No evolution chain available.</p>';
      return;
    }

    DOM.evolutionContainer.innerHTML = '';
    const chainDOM = buildEvolutionDOM(chainRoot, currentId);
    DOM.evolutionContainer.appendChild(chainDOM);
  } catch (err) {
    console.error('Failed to render evolution chain:', err);
    DOM.evolutionContainer.innerHTML = '<p style="color: var(--text-muted)">Failed to parse evolution chain.</p>';
  }
}

/**
 * Builds visual layout for single-line or multi-branched evolution trees
 */
function buildEvolutionDOM(rootNode, currentId) {
  const wrapper = document.createElement('div');
  wrapper.className = 'evolution-tree-branch';

  // Render Root Stage (Stage 1)
  const rootCard = createEvolutionCard(rootNode, currentId);
  wrapper.appendChild(rootCard);

  // If evolves into other stages
  if (rootNode.evolvesTo && rootNode.evolvesTo.length > 0) {
    const branchesContainer = document.createElement('div');
    branchesContainer.className = 'evo-branches-container';

    rootNode.evolvesTo.forEach(stage2Node => {
      const branchRow = document.createElement('div');
      branchRow.className = 'evolution-tree-branch';

      // Connector arrow & requirement
      const connector = document.createElement('div');
      connector.className = 'evo-connector';
      connector.innerHTML = `
        <span class="evo-trigger-badge">${stage2Node.triggerText || 'Evolves'}</span>
        <span class="evo-arrow">➔</span>
      `;
      branchRow.appendChild(connector);

      // Stage 2 Card
      const stage2Card = createEvolutionCard(stage2Node, currentId);
      branchRow.appendChild(stage2Card);

      // Stage 3 (if any)
      if (stage2Node.evolvesTo && stage2Node.evolvesTo.length > 0) {
        stage2Node.evolvesTo.forEach(stage3Node => {
          const connector3 = document.createElement('div');
          connector3.className = 'evo-connector';
          connector3.innerHTML = `
            <span class="evo-trigger-badge">${stage3Node.triggerText || 'Evolves'}</span>
            <span class="evo-arrow">➔</span>
          `;
          branchRow.appendChild(connector3);

          const stage3Card = createEvolutionCard(stage3Node, currentId);
          branchRow.appendChild(stage3Card);
        });
      }

      branchesContainer.appendChild(branchRow);
    });

    wrapper.appendChild(branchesContainer);
  }

  return wrapper;
}

function createEvolutionCard(node, currentId) {
  const card = document.createElement('div');
  card.className = `evo-card ${node.id === currentId ? 'current' : ''}`;
  card.innerHTML = `
    <img 
      class="evo-card-img" 
      src="${node.artwork}" 
      alt="${node.displayName}" 
      loading="lazy"
      onerror="this.src='${node.fallback}'"
    >
    <div class="evo-card-name">${node.displayName}</div>
    <div class="evo-card-id">${formatPokemonId(node.id)}</div>
  `;

  card.addEventListener('click', () => {
    if (node.id !== currentId) {
      openPokemonModal(node.id);
    }
  });

  return card;
}

/* ==========================================================================
   Tab 4: Type Matchups (Defensive Multipliers)
   ========================================================================== */
function renderMatchupsTab(types) {
  const matchups = calculateMatchups(types);

  function createChip(typeName, multiplierText, multiplierClass) {
    const cfg = TYPE_CONFIG[typeName] || TYPE_CONFIG.normal;
    return `
      <div class="matchup-chip" style="background: ${cfg.bgGradient}; color: ${cfg.textColor};">
        <span>${cfg.icon}</span>
        <span>${cfg.name}</span>
        <span class="multiplier-tag ${multiplierClass}">${multiplierText}</span>
      </div>
    `;
  }

  let html = '';

  // Weaknesses (4x & 2x)
  const weakChips = [
    ...matchups.quadWeak.map(t => createChip(t, '4×', 'weak-quad')),
    ...matchups.doubleWeak.map(t => createChip(t, '2×', 'weak-double'))
  ];
  html += `
    <div class="matchup-group">
      <div class="matchup-heading">
        <span>⚠️ Weaknesses (Takes More Damage)</span>
      </div>
      <div class="matchup-chips-row">
        ${weakChips.length > 0 ? weakChips.join('') : '<span style="color: var(--text-muted); font-size: 0.85rem;">None</span>'}
      </div>
    </div>
  `;

  // Resistances (0.5x & 0.25x)
  const resistChips = [
    ...matchups.halfResist.map(t => createChip(t, '½×', 'resist-half')),
    ...matchups.quadResist.map(t => createChip(t, '¼×', 'resist-quad'))
  ];
  html += `
    <div class="matchup-group">
      <div class="matchup-heading">
        <span>🛡️ Resistances (Takes Less Damage)</span>
      </div>
      <div class="matchup-chips-row">
        ${resistChips.length > 0 ? resistChips.join('') : '<span style="color: var(--text-muted); font-size: 0.85rem;">None</span>'}
      </div>
    </div>
  `;

  // Immunities (0x)
  const immuneChips = matchups.immune.map(t => createChip(t, '0×', 'immune'));
  html += `
    <div class="matchup-group">
      <div class="matchup-heading">
        <span>✨ Immunities (Takes Zero Damage)</span>
      </div>
      <div class="matchup-chips-row">
        ${immuneChips.length > 0 ? immuneChips.join('') : '<span style="color: var(--text-muted); font-size: 0.85rem;">None</span>'}
      </div>
    </div>
  `;

  DOM.matchupsContainer.innerHTML = html;
}

/* ==========================================================================
   Audio Cry Player
   ========================================================================== */
function playPokemonCry(pokemon) {
  const cryUrl = pokemon?.cries?.latest || pokemon?.cries?.legacy;

  if (cryUrl) {
    DOM.cryPlayBtn.classList.add('cry-playing');
    DOM.cryAudio.src = cryUrl;
    DOM.cryAudio.volume = 0.6;
    DOM.cryAudio.play().catch(err => {
      console.warn('Audio play prevented by browser:', err);
      // Fallback synthesizer sound so feedback is always audible
      playFallbackTone();
    });

    DOM.cryAudio.onended = () => {
      DOM.cryPlayBtn.classList.remove('cry-playing');
    };
    DOM.cryAudio.onerror = () => {
      DOM.cryPlayBtn.classList.remove('cry-playing');
      playFallbackTone();
    };
  } else {
    playFallbackTone();
  }
}

function stopPokemonCry() {
  DOM.cryAudio.pause();
  DOM.cryAudio.currentTime = 0;
  DOM.cryPlayBtn.classList.remove('cry-playing');
}

// Web Audio API fallback tone for devices blocking external ogg audio
function playFallbackTone() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  } catch (e) {}
}

/* ==========================================================================
   Toast Notifications
   ========================================================================== */
let toastTimeout;
function showToast(message, icon = '✨') {
  clearTimeout(toastTimeout);
  DOM.toastIcon.textContent = icon;
  DOM.toastMsg.textContent = message;
  DOM.toast.classList.add('show');
  toastTimeout = setTimeout(() => {
    DOM.toast.classList.remove('show');
  }, 2200);
}

/* ==========================================================================
   Event Listeners
   ========================================================================== */
function bindEvents() {
  // Search Input with Debounce
  let searchTimer;
  DOM.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    DOM.searchClearBtn.classList.toggle('visible', state.searchQuery.length > 0);
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      applyFiltersAndRender();
    }, 280);
  });

  // Search Clear
  DOM.searchClearBtn.addEventListener('click', () => {
    DOM.searchInput.value = '';
    state.searchQuery = '';
    DOM.searchClearBtn.classList.remove('visible');
    applyFiltersAndRender();
  });

  // Generation Select
  DOM.genSelect.addEventListener('change', (e) => {
    state.genFilter = e.target.value;
    applyFiltersAndRender();
  });

  // Sort Select
  DOM.sortSelect.addEventListener('change', (e) => {
    state.sortOrder = e.target.value;
    sortCatalogAndRerender();
  });

  // Type Filter Pills (Delegated click)
  DOM.typePillsContainer.addEventListener('click', (e) => {
    const pill = e.target.closest('.type-pill');
    if (!pill) return;

    DOM.typePillsContainer.querySelectorAll('.type-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    state.typeFilter = pill.getAttribute('data-type');
    applyFiltersAndRender();
  });

  // Favorites Toggle in Header
  DOM.favoritesToggleBtn.addEventListener('click', () => {
    state.favoritesOnly = !state.favoritesOnly;
    DOM.favoritesToggleBtn.classList.toggle('active', state.favoritesOnly);
    applyFiltersAndRender();
  });

  // Surprise Me (Random Pokémon)
  DOM.surpriseBtn.addEventListener('click', () => {
    const randomId = Math.floor(Math.random() * 1025) + 1;
    openPokemonModal(randomId);
    showToast(`🎲 Met Pokémon #${randomId}!`);
  });

  // Load More Button
  DOM.loadMoreBtn.addEventListener('click', () => {
    loadNextBatch();
  });

  // Modal Close
  DOM.modalCloseBtn.addEventListener('click', closeModal);
  DOM.modal.addEventListener('click', (e) => {
    if (e.target === DOM.modal) {
      closeModal();
    }
  });

  // Modal Prev / Next Buttons
  DOM.modalPrevBtn.addEventListener('click', () => {
    if (!state.currentPokemon) return;
    const prevId = state.currentPokemon.id > 1 ? state.currentPokemon.id - 1 : 1025;
    openPokemonModal(prevId);
  });

  DOM.modalNextBtn.addEventListener('click', () => {
    if (!state.currentPokemon) return;
    const nextId = state.currentPokemon.id < 1025 ? state.currentPokemon.id + 1 : 1;
    openPokemonModal(nextId);
  });

  // Modal Favorite Toggle
  DOM.modalFavBtn.addEventListener('click', () => {
    if (state.currentPokemon) {
      toggleFavorite(state.currentPokemon.id);
    }
  });

  // Shiny Toggle
  DOM.shinyToggleBtn.addEventListener('click', () => {
    if (!state.currentPokemon) return;
    state.isShiny = !state.isShiny;
    DOM.shinyToggleBtn.classList.toggle('active', state.isShiny);

    const targetImg = state.isShiny 
      ? state.currentPokemon.sprites.artworkShiny || state.currentPokemon.sprites.animatedShiny
      : state.currentPokemon.sprites.artwork || state.currentPokemon.sprites.animated;

    DOM.modalImg.src = targetImg;
  });

  // Cry Play Button in Modal
  DOM.cryPlayBtn.addEventListener('click', () => {
    if (state.currentPokemon) {
      playPokemonCry(state.currentPokemon);
    }
  });

  // Modal Tabs Switching
  DOM.tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabKey = btn.getAttribute('data-tab');
      DOM.tabButtons.forEach(b => b.classList.remove('active'));
      DOM.tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(`tab-${tabKey}`);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (DOM.modal.classList.contains('active')) {
        closeModal();
      }
    } else if (e.key === 'ArrowLeft') {
      if (DOM.modal.classList.contains('active') && state.currentPokemon) {
        const prevId = state.currentPokemon.id > 1 ? state.currentPokemon.id - 1 : 1025;
        openPokemonModal(prevId);
      }
    } else if (e.key === 'ArrowRight') {
      if (DOM.modal.classList.contains('active') && state.currentPokemon) {
        const nextId = state.currentPokemon.id < 1025 ? state.currentPokemon.id + 1 : 1;
        openPokemonModal(nextId);
      }
    } else if (e.key === '/' && document.activeElement !== DOM.searchInput) {
      e.preventDefault();
      DOM.searchInput.focus();
    }
  });
}

/* ==========================================================================
   Sort Order Handling
   ========================================================================== */
function sortCatalogAndRerender() {
  if (state.sortOrder === 'id-asc') {
    state.filteredCatalog.sort((a, b) => a.id - b.id);
  } else if (state.sortOrder === 'id-desc') {
    state.filteredCatalog.sort((a, b) => b.id - a.id);
  } else if (state.sortOrder === 'name-asc') {
    state.filteredCatalog.sort((a, b) => a.name.localeCompare(b.name));
  } else if (state.sortOrder === 'name-desc') {
    state.filteredCatalog.sort((a, b) => b.name.localeCompare(a.name));
  } else if (state.sortOrder === 'bst-desc') {
    // For BST sort, we can sort known cached items or keep as-is
    state.filteredCatalog.sort((a, b) => b.id - a.id);
  }

  state.currentBatch = 1;
  DOM.grid.innerHTML = '';
  loadNextBatch();
}

/* ==========================================================================
   Skeleton Helper
   ========================================================================== */
function showLoadingSkeletons(count = 12) {
  DOM.grid.innerHTML = Array.from({ length: count }).map(() => `
    <div class="pokemon-card skeleton-card">
      <div class="skeleton-shimmer"></div>
    </div>
  `).join('');
}

// Start application
initApp();
