# PokéVerse Ultra ⚡

[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![PokéAPI](https://img.shields.io/badge/API-PokeAPI%20v2-EF5350?logo=pokemon&logoColor=white)](https://pokeapi.co/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **PokéVerse Ultra** is a modern, responsive, high-performance Pokédex web application. Explore Pokémon across all generations with real-time stats, animated battle sprites, authentic audio cries, complete evolution trees, and dynamic type matchup calculators.

---

## ✨ Features

- ⚡ **Multi-Generation Pokédex**: Seamlessly explore Pokémon from Generation 1 through Generation 9 (#1 to #1025) with dynamic batch loading.
- 🔍 **Instant Search & Multi-Filters**:
  - Live search by Pokémon name or Pokédex number (`#ID`).
  - Filter by Generation and interactive elemental Type pills.
  - Sort by ID (Lowest/Highest), Alphabetical (A–Z / Z–A), or highest Base Stat Total (BST).
- 🎨 **Dynamic Theming**: Custom color schemes and glowing backdrops dynamically tailored to each Pokémon's primary type.
- ✨ **Shiny Switcher**: Preview standard and shiny forms with a single click.
- 🔊 **Authentic Pokémon Cries**: Integrated sound player with an animated sound equalizer bar to listen to real cries directly from the API.
- 📊 **Deep-Dive Inspection Modal**:
  - **📖 About**: Physical measurements (Height in meters/feet, Weight in kg/lbs), Catch Rate, Leveling Growth Rate, and Abilities (with Hidden Ability indicators).
  - **📊 Base Stats**: Animated stat meters (HP, Attack, Defense, Sp. Atk, Sp. Def, Speed), total BST calculation, and competitive tier badges.
  - **🌿 Evolution Line**: Dynamic multi-stage evolution tree parser showing branch evolutions.
  - **🛡️ Type Matchup**: Real-time defensive damage multiplier calculator displaying weaknesses ($2\times$, $4\times$), resistances ($0.5\times$, $0.25\times$), and immunities ($0\times$).
- ❤️ **Favorites System**: Bookmark your favorite Pokémon with persistence via `localStorage`.
- 🎲 **Surprise Me!**: Discover random Pokémon with one tap.
- ⌨️ **Keyboard Navigation**: Navigate effortlessly using Left (`←`) and Right (`→`) arrow keys, and close modals with `Escape`.

---

## 🛠️ Tech Stack

- **Core**: JavaScript (ES6+ Modules), HTML5 Semantic Elements
- **Styling**: Vanilla CSS3 (Custom Design System, Glassmorphism, CSS Variables, Responsive Grid & Flexbox)
- **Tooling & Bundler**: [Vite](https://vitejs.dev/)
- **Data Provider**: [PokéAPI](https://pokeapi.co/)
- **Storage**: Browser `localStorage`

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Kushal-Raj-R/Pokeverse.git
   cd Pokeverse
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Open the local development URL displayed in your terminal (typically `http://localhost:5173/`).

### Production Build
To create an optimized production build:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

---

## 🎮 Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `←` / `Left Arrow` | Inspect Previous Pokémon |
| `→` / `Right Arrow` | Inspect Next Pokémon |
| `Escape` | Close Pokémon Inspection Modal |

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgements

- Data and sprites provided by [PokéAPI](https://pokeapi.co/).
- Pokémon and Pokémon character names are trademarks of Nintendo.
