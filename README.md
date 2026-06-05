# Agent Arcade: Neon Myths

Agent Arcade: Neon Myths is now a static browser RPG/simulation hybrid called **NEON MYTHOS: Lumen Atlas**. It keeps the original Codex pet sprites, character artwork, BGM, agent economy, QTE alerts, negotiation cut-ins, companion chat, and profile overlays, while adding a larger adventure map structure and Chapter 1 progression.

## Start

[![START SIMULATION](https://img.shields.io/badge/START-LUMEN_ATLAS-00e5ff?style=for-the-badge&labelColor=0b1020)](https://ryosaku610.github.io/Agent-arcade-Neon-myths/neon-mythos-codex-pets.html?v=lumen-atlas-negotiation-20260605)

Open the Start button above from any phone, tablet, or computer. Nothing needs to be installed.
Use the **SOUND ON** button in the top-right corner if the browser does not start BGM automatically.
The app starts in lightweight graphics mode for gentler mobile/data usage; use the **HD/LT** button to switch graphics quality.

Direct URL:
https://ryosaku610.github.io/Agent-arcade-Neon-myths/neon-mythos-codex-pets.html?v=lumen-atlas-negotiation-20260605

## Lumen Atlas

- 8-region world atlas: Golden Vault, Oracle Skyline, Trade Guild, Shadow Lab, Dragon Route, Human Bridge, Sage Academy, and Eye-Void Nexus
- Chapter 1: **Ledger Dawn**, playable from start to completion
- Explorable maps: Central Plaza, Glitch Route 01, Golden Temple, Underground Vault, Data Causeway, plus Oracle Gate preview
- Click/tap movement, camera follow, warps, locked gate feedback, NPC dialogue choices, quest log, region atlas, and browser save
- Three-choice negotiation events where the player's stance changes risk, rewards, reputation, and contract outcomes
- Story/UI text for English, Japanese, Chinese, Korean, Spanish, and French
- Lightweight sprites, terrain-layer rendering, and a user-toggleable HD mode for broader device support

Progress is saved in browser `localStorage` under:

```text
neonMythos:rpgSave:v1
```

## Included Files

- `index.html` public launch page
- `neon-mythos-codex-pets.html` compatibility app shell
- `src/` modular static app source
- `scripts/validate-data.mjs` static build/data validation
- `character-assets/` character portraits used by the simulation
- `character-pets/` Codex pet spritesheets used by the simulation
- `character-pets-lite/` lightweight spritesheets used by default
- `pet-portable-bundle/` portable Codex pet spritesheets used by the simulation
- `lumen-export/` Lumen spritesheet export used by the simulation
- `music/` BGM used by the simulation

## Local Start

For the most reliable local test, run:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

Validate the static data/build:

```bash
npm run build
```
