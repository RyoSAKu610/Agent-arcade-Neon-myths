import { AGENTS, AVATAR_IDS, PET_ATLAS, PET_ATLAS_LITE, PROFILE_METRICS, getAgent } from "./data/characters.js";
import { I18N, LANG_LIST, text } from "./data/i18n.js";
import { DIALOGUE_NODES, MAP_SCENES, QTE_EVENTS, STORY_CHAPTERS, WORLD_REGIONS } from "./data/world.js";
import { clearSave, loadSave, writeSave } from "./save.js";

const TILE_DESKTOP = 28;
const TILE_MOBILE = 24;
const STEP_MS = 190;
const SAVE_DEBOUNCE_MS = 650;
const GRAPHICS_KEY = "neonMythos:graphicsMode";
const DEAL_STRATEGIES = [
  {
    id: "read",
    labelKey: "dealChoiceRead",
    descKey: "dealChoiceReadDesc",
    success: 0.46,
    hold: 0.42,
    rewards: {
      success: { yen: 1800, data: 34, rep: 1 },
      hold: { data: 18 },
      fail: { data: -8 }
    }
  },
  {
    id: "push",
    labelKey: "dealChoicePush",
    descKey: "dealChoicePushDesc",
    success: 0.58,
    hold: 0.18,
    rewards: {
      success: { yen: 5200, con: 2 },
      hold: { yen: 900, data: 6 },
      fail: { con: -1, rep: -3 }
    }
  },
  {
    id: "trust",
    labelKey: "dealChoiceTrust",
    descKey: "dealChoiceTrustDesc",
    success: 0.42,
    hold: 0.44,
    rewards: {
      success: { yen: 2400, con: 1, rep: 4 },
      hold: { data: 12, rep: 1 },
      fail: { yen: -500 }
    }
  }
];

const root = document.getElementById("app");
const boot = loadSave();

const detectGraphicsMode = () => {
  try {
    const saved = localStorage.getItem(GRAPHICS_KEY);
    if (saved === "lite" || saved === "hd") return saved;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection?.saveData || Number(navigator.deviceMemory || 8) <= 4) return "lite";
  } catch {
    return "lite";
  }
  return "lite";
};

const state = {
  save: boot.save,
  saveExists: boot.exists,
  screen: boot.save.avatarId ? "game" : "language",
  selectedAvatar: boot.save.avatarId || AVATAR_IDS[0],
  destination: null,
  path: [],
  lastMoveAt: 0,
  dialogueNodeId: null,
  profileId: null,
  qte: null,
  cutin: null,
  activePanel: "quest",
  mobileOpen: false,
  graphicsMode: detectGraphicsMode(),
  frame: 0,
  lastSavedAt: 0,
  saveTimer: null,
  viewport: { w: window.innerWidth, h: window.innerHeight },
  logs: [
    { ch: "SYSTEM", msg: text(boot.save.lang, boot.corrupt ? "saveCorrupt" : "introLine"), color: "#00e5ff" }
  ],
  companion: [
    { role: "agent", msg: text(boot.save.lang, "companionOnline") }
  ],
  audio: null,
  audioOn: false
};

const t = (key) => text(state.save.lang, key);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (ch) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#39;"
})[ch]);
const classToken = (value, fallback = "default") => String(value || fallback).replace(/[^a-z0-9_-]/gi, "").toLowerCase() || fallback;

const hasFlag = (flag) => !flag || state.save.flags.includes(flag);
const setFlags = (flags = []) => {
  const next = new Set(state.save.flags);
  flags.forEach((flag) => next.add(flag));
  state.save.flags = [...next];
};
const getMap = () => MAP_SCENES[state.save.mapId] || MAP_SCENES.central_plaza;
const getChapter = () => STORY_CHAPTERS.find((chapter) => chapter.id === state.save.questState.chapterId) || STORY_CHAPTERS[0];
const getTilePx = () => window.innerWidth <= 900 ? TILE_MOBILE : TILE_DESKTOP;
const addLog = (ch, msg, color = "#00e5ff") => {
  state.logs.unshift({ ch, msg, color });
  state.logs = state.logs.slice(0, 60);
};
const getSaveAgent = (id) => state.save.agents.find((agent) => agent.id === id);
const getDisplayAgent = (id) => ({ ...getAgent(id), ...(getSaveAgent(id) || {}) });

const saveSoon = () => {
  window.clearTimeout(state.saveTimer);
  state.saveTimer = window.setTimeout(() => {
    writeSave(state.save);
    state.saveExists = true;
    state.lastSavedAt = Date.now();
    render();
  }, SAVE_DEBOUNCE_MS);
};

const saveNow = () => {
  window.clearTimeout(state.saveTimer);
  writeSave(state.save);
  state.saveExists = true;
  state.lastSavedAt = Date.now();
};

const applyResources = (delta = {}) => {
  const res = state.save.resources;
  Object.entries(delta).forEach(([key, value]) => {
    const next = (res[key] || 0) + value;
    res[key] = key === "rep" ? Math.max(0, Math.min(100, next)) : Math.max(0, next);
  });
};

const rectContains = (rect, x, y) => x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h;
const inAny = (rects = [], x, y) => rects.some((rect) => rectContains(rect, x, y));

const tileKind = (map, x, y) => {
  if (inAny(map.tiles.roads, x, y)) return "road";
  if (inAny(map.tiles.plaza, x, y)) return "plaza";
  if (inAny(map.tiles.gardens, x, y)) return "garden";
  if (inAny(map.tiles.water, x, y)) return "water";
  return map.tiles.base || "grass";
};

// OPTIMIZATION: Lazily-evaluated WeakMap cache for collision lookups to avoid O(N) array scans and rectContains checks.
const collisionCache = new WeakMap();
const isBlocked = (map, x, y) => {
  if (x < 0 || y < 0 || x >= map.size.w || y >= map.size.h) return true;

  let grid = collisionCache.get(map);
  if (!grid) {
    grid = [];
    collisionCache.set(map, grid);
  }

  const key = y * map.size.w + x;
  if (grid[key] !== undefined) return grid[key];

  let blocked = false;
  if (!(map.warps || []).some((warp) => rectContains(warp, x, y))) {
    if (tileKind(map, x, y) === "water") {
      blocked = true;
    } else {
      blocked = map.buildings.some((building) => rectContains(building, x, y));
    }
  }

  grid[key] = blocked;
  return blocked;
};

const buildPath = (map, start, end) => {
  if (start.x === end.x && start.y === end.y) return [];

  // OPTIMIZATION: Use 1D integer index instead of string interpolation for map keys
  const mapWidth = map.size.w;
  const key = (x, y) => y * mapWidth + x;

  const queue = [start];
  const seen = new Set([key(start.x, start.y)]);
  const parent = new Map();

  // OPTIMIZATION: Flat coordinate arrays instead of object array to avoid closure allocations
  const dirX = [1, -1, 0, 0];
  const dirY = [0, 0, 1, -1];

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    if (current.x === end.x && current.y === end.y) break;

    for (let i = 0; i < 4; i += 1) {
      const nx = current.x + dirX[i];
      const ny = current.y + dirY[i];
      const nextKey = key(nx, ny);

      if (seen.has(nextKey) || isBlocked(map, nx, ny)) continue;

      seen.add(nextKey);
      const next = { x: nx, y: ny };
      parent.set(nextKey, current);
      queue.push(next);
    }
  }

  if (!seen.has(key(end.x, end.y))) return [];
  const path = [];
  let cursor = end;
  while (cursor.x !== start.x || cursor.y !== start.y) {
    path.unshift(cursor);
    cursor = parent.get(key(cursor.x, cursor.y));
    if (!cursor) return [];
  }
  return path;
};

const needsPathRefresh = (map, pos) => {
  const next = state.path[0];
  if (!next) return true;
  if (Math.abs(next.x - pos.x) + Math.abs(next.y - pos.y) !== 1) return true;
  return isBlocked(map, next.x, next.y);
};

const getActiveObjective = () => getChapter().objectives.find((objective) => !hasFlag(objective.flag)) || null;

const isRegionUnlocked = (region) => !region.unlockFlag || hasFlag(region.unlockFlag);

const resolveNpcNode = (npc) => {
  const choices = Array.isArray(npc.dialogue) ? npc.dialogue : [{ node: npc.dialogue }];
  const match = choices.find((entry) => {
    const all = (entry.allFlags || []).every(hasFlag);
    const missing = (entry.missingFlags || []).every((flag) => !hasFlag(flag));
    return all && missing;
  });
  return match?.node || choices[choices.length - 1]?.node;
};

const openDialogue = (nodeId) => {
  state.dialogueNodeId = nodeId;
  state.mobileOpen = false;
  render();
};

const applyEffects = (effects = {}) => {
  if (effects.setFlags) setFlags(effects.setFlags);
  if (effects.resources) applyResources(effects.resources);
  if (effects.logKey) addLog("STORY", t(effects.logKey), "#ffd34d");
  const completedNow = effects.setFlags?.includes("chapter_ledger_complete");
  if (completedNow) addLog("ATLAS", t("chapterComplete"), "#00e5ff");
  saveSoon();
};

const chooseDialogue = (choiceIndex) => {
  const node = DIALOGUE_NODES[state.dialogueNodeId];
  const choice = node?.choices?.[choiceIndex];
  if (!choice) return;
  applyEffects(choice.effects || {});
  if (choice.to) {
    state.dialogueNodeId = choice.to;
  } else if (choice.effects?.close) {
    state.dialogueNodeId = null;
  }
  render();
};

const moveToMap = (warp) => {
  if (warp.requiredFlag && !hasFlag(warp.requiredFlag)) {
    addLog("GATE", t(warp.lockedTextKey || "lockedGate"), "#ff3355");
    state.destination = null;
    state.path = [];
    render();
    return;
  }
  state.save.mapId = warp.toMap;
  state.save.position = { ...warp.to };
  state.destination = null;
  state.path = [];
  addLog("MAP", t(MAP_SCENES[warp.toMap].nameKey), MAP_SCENES[warp.toMap].theme.accent);
  saveSoon();
  render();
};

const checkWarp = () => {
  const map = getMap();
  const { x, y } = state.save.position;
  const warp = map.warps.find((item) => rectContains(item, x, y));
  if (warp) moveToMap(warp);
};

const stepPlayer = () => {
  if (!state.destination || state.dialogueNodeId || state.qte || state.cutin?.awaiting) return false;
  const now = Date.now();
  if (state.lastMoveAt && now - state.lastMoveAt < STEP_MS) return false;
  const stepsDue = Math.max(1, Math.min(6, Math.floor((now - (state.lastMoveAt || now - STEP_MS)) / STEP_MS)));
  let moved = false;
  for (let step = 0; step < stepsDue; step += 1) {
    const map = getMap();
    const pos = state.save.position;
    if (pos.x === state.destination.x && pos.y === state.destination.y) {
      state.destination = null;
      state.path = [];
      checkWarp();
      moved = true;
      break;
    }
    if (needsPathRefresh(map, pos)) state.path = buildPath(map, pos, state.destination);
    const next = state.path.shift();
    if (!next) {
      state.destination = null;
      state.path = [];
      moved = true;
      break;
    }
    state.save.position = next;
    moved = true;
    checkWarp();
    if (!state.destination) break;
  }
  if (moved) {
    state.lastMoveAt = now;
    saveSoon();
  }
  return moved;
};

const runEconomyTick = () => {
  if (state.frame % 36 !== 0) return false;
  const agentSave = state.save.agents[Math.floor(Math.random() * state.save.agents.length)];
  const agent = getAgent(agentSave.id);
  if (!agent) return false;
  const specialtyBonus = {
    investor: { yen: 420, data: 4, con: 0 },
    analyst: { yen: 90, data: 16, con: 0 },
    trader: { yen: 260, data: 4, con: 1 },
    engineer: { yen: 130, data: 12, con: 0 },
    diplomat: { yen: 120, data: 5, con: 1 },
    courier: { yen: 190, data: 6, con: 0 }
  }[agent.specialty] || { yen: 120, data: 4, con: 0 };
  const delta = {
    yen: Math.round(specialtyBonus.yen + Math.random() * 240),
    data: Math.round(specialtyBonus.data + Math.random() * 8),
    con: Math.random() < 0.24 ? specialtyBonus.con : 0,
    rep: Math.random() < 0.18 ? 1 : 0
  };
  applyResources(delta);
  agentSave.earn = (agentSave.earn || 0) + delta.yen;
  agentSave.mood = Math.max(35, Math.min(100, (agentSave.mood || 80) + (Math.random() > 0.5 ? 1 : -1)));
  if (state.frame % 36 === 0) {
    addLog(agent.name, `+${delta.yen.toLocaleString()} / DATA ${delta.data}`, agent.color);
  }
  if (state.frame % 180 === 0) state.save.day += 1;
  saveSoon();
  return true;
};

const triggerQte = () => {
  if (state.qte) return;
  const event = QTE_EVENTS[Math.floor(Math.random() * QTE_EVENTS.length)];
  state.qte = { event, startedAt: Date.now() };
  addLog("ALERT", t(event.titleKey), event.color);
  window.setTimeout(() => {
    if (state.qte?.event.id === event.id && Date.now() - state.qte.startedAt >= 4900) {
      resolveQte(false);
    }
  }, 5200);
  render();
};

const resolveQte = (success) => {
  if (!state.qte) return;
  const event = state.qte.event;
  applyResources(success ? event.rewards : event.penalty);
  addLog(success ? "QTE" : "QTE", success ? t("qteSuccess") : t("qteFail"), success ? "#00ff88" : "#ff3355");
  state.qte = null;
  saveSoon();
  render();
};

const runDeal = () => {
  if (state.cutin || state.qte || state.dialogueNodeId) return;
  const a = AGENTS[Math.floor(Math.random() * AGENTS.length)];
  let b = AGENTS[Math.floor(Math.random() * AGENTS.length)];
  if (b.id === a.id) b = AGENTS[(AGENTS.indexOf(a) + 3) % AGENTS.length];
  state.cutin = {
    a,
    b,
    awaiting: true,
    color: "#ffd34d",
    label: t("dealPrompt")
  };
  addLog(t("dealHeader"), `${a.name} <> ${b.name}: ${t("dealPrompt")}`, "#ffd34d");
  render();
};

const resolveDeal = (strategyId) => {
  if (!state.cutin?.awaiting) return;
  const strategy = DEAL_STRATEGIES.find((item) => item.id === strategyId) || DEAL_STRATEGIES[0];
  const { a, b } = state.cutin;
  const roll = Math.random();
  const outcome = roll < strategy.success ? "success" : roll < strategy.success + strategy.hold ? "hold" : "fail";
  const color = outcome === "success" ? "#00ff88" : outcome === "hold" ? "#ffd34d" : "#ff3355";
  const label = outcome === "success" ? t("dealSuccess") : outcome === "hold" ? t("dealHold") : t("dealFail");
  applyResources(strategy.rewards[outcome]);
  state.cutin = {
    a,
    b,
    awaiting: false,
    strategy,
    outcome,
    color,
    label
  };
  addLog(t("dealHeader"), `${a.name} <> ${b.name}: ${t(strategy.labelKey)} / ${label}`, color);
  saveSoon();
  window.setTimeout(() => {
    if (!state.cutin?.awaiting) {
      state.cutin = null;
      render();
    }
  }, 2600);
  render();
};

const toggleSound = async () => {
  if (!state.audio) {
    state.audio = new Audio("music/neon-myths-english.mp3");
    state.audio.loop = true;
    state.audio.volume = 0.42;
  }
  try {
    if (state.audio.paused) {
      await state.audio.play();
      state.audioOn = true;
    } else {
      state.audio.pause();
      state.audioOn = false;
    }
  } catch {
    state.audioOn = false;
  }
  render();
};

const toggleGraphicsMode = () => {
  state.graphicsMode = state.graphicsMode === "lite" ? "hd" : "lite";
  localStorage.setItem(GRAPHICS_KEY, state.graphicsMode);
  addLog("VIDEO", t(state.graphicsMode === "lite" ? "graphicsLite" : "graphicsHd"), "#00e5ff");
  render();
};

const handleCompanion = (message) => {
  const trimmed = message.trim();
  if (!trimmed) return;
  state.companion.push({ role: "user", msg: trimmed });
  const lower = trimmed.toLowerCase();
  const agent = AGENTS.find((item) => lower.includes(item.name.toLowerCase()) || lower.includes(item.id));
  if (/objective|quest|next|次|目標|任务|퀘스트|objetivo|quête/i.test(trimmed)) {
    state.companion.push({ role: "agent", msg: t("companionReplyObjective") });
  } else if (agent) {
    const saveAgent = getSaveAgent(agent.id);
    if (saveAgent) {
      saveAgent.note = trimmed;
      saveAgent.state = "work";
      saveAgent.mood = Math.min(100, (saveAgent.mood || 80) + 4);
    }
    addLog("CHAT", `${agent.name}: ${trimmed}`, agent.color);
    state.companion.push({ role: "agent", msg: t("companionReplyCommand") });
  } else {
    state.companion.push({ role: "agent", msg: t("companionReplyDefault") });
  }
  state.companion = state.companion.slice(-18);
  saveSoon();
  render();
};

const cameraStyle = () => {
  const tile = getTilePx();
  const map = getMap();
  const mapW = map.size.w * tile;
  const mapH = map.size.h * tile;
  const stageW = Math.max(320, state.viewport.w - (window.innerWidth <= 900 ? 0 : 640));
  const stageH = Math.max(320, state.viewport.h - 96);
  const rawX = stageW / 2 - (state.save.position.x + 0.5) * tile;
  const rawY = stageH / 2 - (state.save.position.y + 0.5) * tile;
  const x = mapW <= stageW ? (stageW - mapW) / 2 : Math.max(stageW - mapW - 20, Math.min(20, rawX));
  const y = mapH <= stageH ? (stageH - mapH) / 2 : Math.max(stageH - mapH - 20, Math.min(20, rawY));
  return `--map-w:${map.size.w};--map-h:${map.size.h};--camera-x:${Math.round(x)}px;--camera-y:${Math.round(y)}px;`;
};

const terrainRectHtml = (kind, rect) => (
  `<div class="terrain tile-${kind}" style="--x:${rect.x};--y:${rect.y};--w:${rect.w};--h:${rect.h}"></div>`
);

const tileHtml = (map) => [
  terrainRectHtml(map.tiles.base || "grass", { x: 0, y: 0, w: map.size.w, h: map.size.h }),
  ...map.tiles.water.map((rect) => terrainRectHtml("water", rect)),
  ...map.tiles.gardens.map((rect) => terrainRectHtml("garden", rect)),
  ...map.tiles.plaza.map((rect) => terrainRectHtml("plaza", rect)),
  ...map.tiles.roads.map((rect) => terrainRectHtml("road", rect))
].join("");

const buildingHtml = (building) => {
  const kind = classToken(building.kind, "block");
  return `
    <div class="building building-${kind}" data-label="${esc(building.label)}" style="--x:${building.x};--y:${building.y};--w:${building.w};--h:${building.h};--color:${building.color}">
      <span class="building-label">${esc(building.label)}</span>
    </div>
  `;
};

const propHtml = (prop) => {
  const kind = classToken(prop.kind, "sign");
  return `
    <div class="prop prop-${kind}" data-label="${esc(prop.label)}" style="--x:${prop.x};--y:${prop.y};--color:${prop.color}">
      <span>${esc(prop.label)}</span>
    </div>
  `;
};

const spriteHtml = (agent, className = "entity", opts = {}) => {
  const spriteId = agent.spriteId || agent.id;
  const useLite = state.graphicsMode === "lite";
  const atlas = (useLite ? PET_ATLAS_LITE[spriteId] : PET_ATLAS[spriteId]) || PET_ATLAS[spriteId];
  const row = opts.row ?? (opts.state === "walk" ? 1 : opts.state === "work" ? 8 : 0);
  const frames = row === 1 ? 8 : 6;
  const frame = state.frame % frames;
  const color = agent.color || "#00e5ff";
  const frameW = useLite ? 96 : 192;
  const frameH = useLite ? 104 : 208;
  const scale = (opts.scale || 0.23) * (useLite ? 2 : 1);
  const sprite = atlas && !(useLite && opts.deferSprite)
    ? `<div class="sprite" style="background-image:url('${atlas}');--sprite-w:${frameW}px;--sprite-h:${frameH}px;--sprite-x:${frame * -frameW}px;--sprite-y:${row * -frameH}px;--color:${color};--sprite-scale:${scale}"></div>`
    : `<div class="sprite-fallback"></div>`;
  return `
    <div class="${className} ${useLite && opts.deferSprite ? "is-token" : ""}" style="--x:${agent.x};--y:${agent.y};--color:${color}">
      ${sprite}
      <div class="entity-name">${esc(agent.name || agent.id)}</div>
      ${opts.button ? `<button type="button" data-${opts.button}="${esc(agent.npcId || agent.id)}" aria-label="${esc(agent.name || agent.id)}"></button>` : ""}
    </div>
  `;
};

const renderMap = () => {
  const map = getMap();
  const activeObjective = getActiveObjective();
  const currentNpcIds = new Set(map.npcs.map((npc) => npc.agentId));
  const npcHtml = map.npcs.map((npc) => {
    const agent = getAgent(npc.agentId);
    return spriteHtml({ ...agent, x: npc.x, y: npc.y, npcId: npc.id }, "entity", { button: "talk", scale: 0.24 });
  }).join("");
  const agentHtml = state.save.agents
    .filter((agent) => agent.mapId === map.id && !currentNpcIds.has(agent.id))
    .map((agent) => spriteHtml({ ...getAgent(agent.id), ...agent }, "entity", { button: "profile", state: agent.state, scale: 0.22, deferSprite: true }))
    .join("");
  const avatar = getAgent(state.save.avatarId) || getAgent(state.selectedAvatar) || getAgent("human");
  const playerHtml = spriteHtml({ ...avatar, ...state.save.position, name: "YOU" }, "player", { state: state.destination ? "walk" : "idle", scale: 0.25 });
  const marker = activeObjective && activeObjective.mapId === map.id
    ? `<div class="quest-marker" style="--x:${activeObjective.target.x};--y:${activeObjective.target.y}"></div>`
    : "";
  return `
    <section class="map-stage map-${classToken(map.id)}" data-map-stage style="--map-sky:${map.theme.sky};--map-ground:${map.theme.ground};--map-accent:${map.theme.accent}">
      <div class="map-ui">
        <div class="map-name">${esc(t(map.nameKey))}</div>
        <div class="map-hint">${activeObjective ? esc(t(activeObjective.textKey)) : esc(t("completed"))}</div>
      </div>
      <div class="world world-${classToken(map.id)}" data-world style="${cameraStyle()}--map-accent:${map.theme.accent};">
        ${tileHtml(map)}
        ${map.warps.map((warp) => `<div class="warp ${warp.requiredFlag && !hasFlag(warp.requiredFlag) ? "is-locked" : ""}" style="--x:${warp.x};--y:${warp.y};--w:${warp.w};--h:${warp.h}"></div>`).join("")}
        ${map.buildings.map(buildingHtml).join("")}
        ${map.props.map(propHtml).join("")}
        ${state.destination ? `<div class="destination" style="--x:${state.destination.x};--y:${state.destination.y}"></div>` : ""}
        ${marker}
        ${npcHtml}
        ${agentHtml}
        ${playerHtml}
      </div>
    </section>
  `;
};

const renderQuestPanel = () => {
  const chapter = getChapter();
  const active = getActiveObjective();
  return `
    <section class="panel-block">
      <div class="panel-head"><span>${esc(t(chapter.titleKey))}</span><span>${esc(t("objective"))}</span></div>
      <div class="panel-body">
        <p class="chapter-summary">${esc(t(chapter.summaryKey))}</p>
        <div class="objective-list">
          ${chapter.objectives.map((objective) => {
            const done = hasFlag(objective.flag);
            const cls = done ? "is-done" : active?.id === objective.id ? "is-active" : "";
            return `<div class="objective-item ${cls}"><span>${done ? "OK" : active?.id === objective.id ? ">>" : "--"}</span><span>${esc(t(objective.textKey))}</span></div>`;
          }).join("")}
        </div>
      </div>
    </section>
  `;
};

const renderAtlasPanel = () => `
  <section class="panel-block">
    <div class="panel-head"><span>${esc(t("atlasTab"))}</span><span>8</span></div>
    <div class="panel-body atlas-grid">
      ${WORLD_REGIONS.map((region) => `
        <div class="region-card ${isRegionUnlocked(region) ? "" : "is-locked"}" style="--region:${region.theme}">
          <div class="region-name">${esc(t(region.nameKey))} ${isRegionUnlocked(region) ? "" : ` / ${esc(t("locked"))}`}</div>
          <div class="region-desc">${esc(t(region.descKey))}</div>
        </div>
      `).join("")}
    </div>
  </section>
`;

const renderAgentsPanel = () => `
  <section class="panel-block">
    <div class="panel-head"><span>${esc(t("agentsTab"))}</span><span>${AGENTS.length}</span></div>
    <div class="panel-body agent-list">
      ${AGENTS.map((agent) => {
        const saved = getSaveAgent(agent.id) || {};
        return `
          <div class="agent-row">
            <div>
              <div class="agent-name" style="--agent-color:${agent.color}">${esc(agent.name)}</div>
              <div class="agent-meta">${esc(t(agent.roleKey))} / Lv${saved.level || 1} / ${esc(saved.state || "idle")}</div>
            </div>
            <button type="button" data-profile="${agent.id}">${esc(t("profileTitle"))}</button>
          </div>
        `;
      }).join("")}
    </div>
  </section>
`;

const renderEconomyPanel = () => {
  const res = state.save.resources;
  const rows = [
    ["YEN", res.yen.toLocaleString(), "#ffd34d"],
    ["DATA", `${res.data} TB`, "#00e5ff"],
    ["CON", res.con, "#ff62c6"],
    ["REP", res.rep, "#00ff88"]
  ];
  return `
    <section class="panel-block">
      <div class="panel-head"><span>${esc(t("economyTab"))}</span><span>${esc(t("day"))} ${state.save.day}</span></div>
      <div class="panel-body econ-list">
        ${rows.map(([label, value, color]) => `<div class="econ-row"><strong style="color:${color}">${label}</strong><span>${esc(value)}</span><span>${Math.round(Math.random() * 8 + 91)}%</span></div>`).join("")}
      </div>
    </section>
  `;
};

const renderLogsPanel = () => `
  <section class="panel-block">
    <div class="panel-head"><span>${esc(t("liveFeed"))}</span><span>LIVE</span></div>
    <div class="panel-body log-list">
      ${state.logs.slice(0, 14).map((log) => `<div class="log-item" style="--log-color:${log.color}"><strong>${esc(log.ch)}</strong><span>${esc(log.msg)}</span></div>`).join("")}
    </div>
  </section>
`;

const renderCompanionPanel = () => `
  <section class="panel-block">
    <div class="panel-head"><span>${esc(t("companionTab"))}</span><span>NEGO</span></div>
    <div class="panel-body companion">
      <div class="companion-log">
        ${state.companion.map((message) => `<div class="message ${message.role === "user" ? "user" : ""}">${esc(message.msg)}</div>`).join("")}
      </div>
      <form class="companion-form" data-companion-form>
        <input name="message" autocomplete="off" placeholder="${esc(t("companionPlaceholder"))}">
        <button type="submit">OK</button>
      </form>
    </div>
  </section>
`;

const renderSidePanel = () => {
  const panels = {
    quest: renderQuestPanel(),
    atlas: renderAtlasPanel(),
    agents: renderAgentsPanel(),
    econ: renderEconomyPanel()
  };
  return `
    <aside class="side-panel ${state.mobileOpen ? "is-open" : ""}" data-side-panel>
      ${panels[state.activePanel] || panels.quest}
    </aside>
  `;
};

const renderRightPanel = () => `
  <aside class="side-panel right-panel">
    ${renderEconomyPanel()}
    ${renderCompanionPanel()}
    ${renderLogsPanel()}
  </aside>
`;

const renderTopbar = () => {
  const res = state.save.resources;
  const savedText = Date.now() - state.lastSavedAt < 2200 ? t("saveStatus") : "";
  return `
    <header class="topbar">
      <div class="brand">
        <div class="brand-title">${esc(t("title"))}</div>
        <div class="brand-sub">${esc(t("subtitle"))} ${savedText ? `/ ${esc(savedText)}` : ""}</div>
      </div>
      <div class="resource-row">
        <span class="chip">${esc(t("day"))}<strong>${state.save.day}</strong></span>
        <span class="chip">${esc(t("yen"))}<strong>${res.yen.toLocaleString()}</strong></span>
        <span class="chip">${esc(t("data"))}<strong>${res.data}</strong></span>
        <span class="chip">${esc(t("con"))}<strong>${res.con}</strong></span>
        <span class="chip">${esc(t("rep"))}<strong>${res.rep}</strong></span>
      </div>
      <div class="top-actions">
        <button class="icon-btn" type="button" data-sound title="${esc(t("soundOn"))}">${state.audioOn ? "ON" : "♪"}</button>
        <button class="icon-btn" type="button" data-toggle-graphics title="${esc(t("graphicsToggle"))}">${state.graphicsMode === "lite" ? "HD" : "LT"}</button>
        <button class="icon-btn" type="button" data-trigger-qte title="${esc(t("spawnEvent"))}">!</button>
        <button class="icon-btn" type="button" data-run-deal title="${esc(t("runDeal"))}">⇄</button>
        <button class="icon-btn" type="button" data-reset-save title="${esc(t("resetSave"))}">R</button>
      </div>
    </header>
  `;
};

const renderDialogue = () => {
  if (!state.dialogueNodeId) return "";
  const node = DIALOGUE_NODES[state.dialogueNodeId];
  if (!node) return "";
  const speaker = getAgent(node.speakerId) || { name: "SYSTEM", color: "#00e5ff" };
  return `
    <section class="dialogue-card" style="--speaker-color:${speaker.color}">
      <div class="dialogue-speaker">${esc(speaker.name)}</div>
      <div class="dialogue-text">${esc(t(node.textKey))}</div>
      <div class="choice-row">
        ${(node.choices || []).map((choice, index) => `<button type="button" data-dialogue-choice="${index}">${esc(t(choice.labelKey))}</button>`).join("")}
      </div>
    </section>
  `;
};

const renderProfile = () => {
  if (!state.profileId) return "";
  const agent = getAgent(state.profileId);
  const saved = getSaveAgent(state.profileId) || {};
  if (!agent) return "";
  const metrics = PROFILE_METRICS[agent.specialty] || ["focus", "skill", "sync"];
  return `
    <div class="modal" data-close-profile>
      <section class="modal-card" style="--agent-color:${agent.color}" data-stop>
        <div class="modal-head">
          <div class="modal-title">${esc(t("profileTitle"))}: ${esc(agent.name)}</div>
          <button type="button" data-close-profile>${esc(t("close"))}</button>
        </div>
        <div class="modal-body">
          <div class="agent-row">
            <div>
              <div class="agent-name" style="--agent-color:${agent.color}">${esc(t(agent.roleKey))}</div>
              <div class="agent-meta">${esc(agent.specialty.toUpperCase())} / Lv${saved.level || 1} / ${esc(t("profileCta"))}</div>
            </div>
            <strong style="color:${agent.color}">¥${(saved.earn || 0).toLocaleString()}</strong>
          </div>
          <div class="econ-list" style="margin-top:10px">
            ${metrics.map((metric, index) => `<div class="econ-row"><strong style="color:${agent.color}">${esc(metric.toUpperCase())}</strong><span>${82 + ((agent.id.charCodeAt(0) + index * 7) % 18)}%</span><span>${esc(saved.note ? "NOTE" : "READY")}</span></div>`).join("")}
          </div>
        </div>
      </section>
    </div>
  `;
};

const renderQte = () => {
  if (!state.qte) return "";
  const event = state.qte.event;
  return `
    <div class="modal">
      <section class="modal-card qte-card" style="border-color:${event.color}">
        <div class="modal-body">
          <div class="qte-title">${esc(t("qteTitle"))}: ${esc(t(event.titleKey))}</div>
          <p class="chapter-summary">${esc(t("qteSuccess"))} / ${esc(t("qteFail"))}</p>
          <button type="button" class="qte-button" data-qte-success>${esc(t("qteAction"))}</button>
        </div>
      </section>
    </div>
  `;
};

const renderCutin = () => {
  if (!state.cutin) return "";
  const { a, b, color, label, awaiting } = state.cutin;
  return `
    <div class="cutin ${awaiting ? "is-choice" : ""}" style="--cutin-color:${color}">
      <div class="cutin-card">
        <div class="cutin-agent" style="--agent-color:${a.color}">${spriteHtml({ ...a, x: 0, y: 0 }, "entity", { state: "work", scale: 0.74 })}</div>
        <div class="cutin-vs">VS</div>
        <div class="cutin-agent" style="--agent-color:${b.color}">${spriteHtml({ ...b, x: 0, y: 0 }, "entity", { state: "work", scale: 0.74 })}</div>
        ${awaiting ? `
          <div class="deal-choice-panel">
            <div class="deal-choice-title">${esc(t("dealPrompt"))}</div>
            <div class="deal-choice-grid">
              ${DEAL_STRATEGIES.map((strategy) => `
                <button type="button" data-deal-choice="${strategy.id}">
                  <strong>${esc(t(strategy.labelKey))}</strong>
                  <span>${esc(t(strategy.descKey))}</span>
                </button>
              `).join("")}
            </div>
          </div>
        ` : `<div class="cutin-result">${esc(label)}</div>`}
      </div>
    </div>
  `;
};

const renderMobileTabs = () => `
  <nav class="mobile-tabs">
    ${[
      ["quest", "questTab"],
      ["atlas", "atlasTab"],
      ["agents", "agentsTab"],
      ["econ", "economyTab"]
    ].map(([panel, key]) => `<button type="button" data-panel="${panel}">${esc(t(key))}</button>`).join("")}
  </nav>
`;

const renderLanguageScreen = () => `
  <div class="modal">
    <section class="modal-card">
      <div class="modal-head">
        <div>
          <div class="modal-title">${esc(t("title"))}</div>
          <div class="brand-sub">${esc(t("subtitle"))}</div>
        </div>
        ${state.saveExists ? `<button type="button" data-continue-save>${esc(t("continueJourney"))}</button>` : ""}
      </div>
      <div class="modal-body">
        <p class="chapter-summary">${esc(t("selectLanguage"))}</p>
        <div class="language-grid">
          ${LANG_LIST.map((lang) => `<button type="button" class="select-card ${state.save.lang === lang.code ? "is-selected" : ""}" data-lang="${lang.code}"><strong>${esc(lang.flag)}</strong><span>${esc(lang.label)}</span></button>`).join("")}
        </div>
      </div>
    </section>
  </div>
`;

const renderAvatarScreen = () => `
  <div class="modal">
    <section class="modal-card">
      <div class="modal-head">
        <div class="modal-title">${esc(t("selectAvatar"))}</div>
        <button type="button" data-start-game>${esc(t("startJourney"))}</button>
      </div>
      <div class="modal-body">
        <div class="avatar-grid">
          ${AVATAR_IDS.map((id) => {
            const agent = getAgent(id);
            return `<button type="button" class="select-card ${state.selectedAvatar === id ? "is-selected" : ""}" data-avatar="${id}"><strong style="color:${agent.color}">${esc(agent.name)}</strong><span>${esc(t(agent.roleKey))}</span></button>`;
          }).join("")}
        </div>
      </div>
    </section>
  </div>
`;

const renderGame = () => `
  ${renderTopbar()}
  <main class="shell">
    ${renderSidePanel()}
    ${renderMap()}
    ${renderRightPanel()}
  </main>
  <footer class="footer"><span>${esc(t(getMap().nameKey))}</span><span>${esc(t("saveStatus"))}: ${state.saveExists ? "OK" : "--"}</span></footer>
  ${renderMobileTabs()}
  ${renderDialogue()}
  ${renderProfile()}
  ${renderQte()}
  ${renderCutin()}
`;

function render() {
  document.documentElement.style.setProperty("--tile", `${getTilePx()}px`);
  if (state.screen === "language") {
    root.innerHTML = renderLanguageScreen();
    return;
  }
  if (state.screen === "avatar") {
    root.innerHTML = renderAvatarScreen();
    return;
  }
  root.innerHTML = renderGame();
}

const mapClickToTile = (event) => {
  const world = event.target.closest("[data-world]");
  const stage = event.target.closest("[data-map-stage]");
  if (!world || !stage) return null;
  const tile = getTilePx();
  const style = getComputedStyle(world);
  const matrix = new DOMMatrixReadOnly(style.transform);
  const rect = stage.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left - matrix.m41) / tile);
  const y = Math.floor((event.clientY - rect.top - matrix.m42) / tile);
  return { x, y };
};

document.addEventListener("click", (event) => {
  const stop = event.target.closest("[data-stop]");
  if (stop) return;
  const lang = event.target.closest("[data-lang]")?.dataset.lang;
  if (lang) {
    state.save.lang = lang;
    state.screen = "avatar";
    render();
    return;
  }
  const avatar = event.target.closest("[data-avatar]")?.dataset.avatar;
  if (avatar) {
    state.selectedAvatar = avatar;
    render();
    return;
  }
  if (event.target.closest("[data-start-game]")) {
    state.save.avatarId = state.selectedAvatar;
    state.screen = "game";
    addLog("SYSTEM", t("introLine"), "#00e5ff");
    saveNow();
    render();
    return;
  }
  if (event.target.closest("[data-continue-save]")) {
    state.screen = state.save.avatarId ? "game" : "avatar";
    render();
    return;
  }
  if (event.target.closest("[data-reset-save]")) {
    clearSave();
    window.location.reload();
    return;
  }
  if (event.target.closest("[data-sound]")) {
    toggleSound();
    return;
  }
  if (event.target.closest("[data-toggle-graphics]")) {
    toggleGraphicsMode();
    return;
  }
  if (event.target.closest("[data-trigger-qte]")) {
    triggerQte();
    return;
  }
  if (event.target.closest("[data-run-deal]")) {
    runDeal();
    return;
  }
  const dealChoice = event.target.closest("[data-deal-choice]")?.dataset.dealChoice;
  if (dealChoice) {
    resolveDeal(dealChoice);
    return;
  }
  if (event.target.closest("[data-qte-success]")) {
    resolveQte(true);
    return;
  }
  const choice = event.target.closest("[data-dialogue-choice]")?.dataset.dialogueChoice;
  if (choice != null) {
    chooseDialogue(Number(choice));
    return;
  }
  const closeProfile = event.target.closest("[data-close-profile]");
  if (closeProfile) {
    state.profileId = null;
    render();
    return;
  }
  const panel = event.target.closest("[data-panel]")?.dataset.panel;
  if (panel) {
    state.activePanel = panel;
    state.mobileOpen = true;
    render();
    return;
  }
  const profile = event.target.closest("[data-profile]")?.dataset.profile;
  if (profile) {
    state.profileId = profile;
    render();
    return;
  }
  const talk = event.target.closest("[data-talk]")?.dataset.talk;
  if (talk) {
    const npc = getMap().npcs.find((item) => item.id === talk);
    if (npc) openDialogue(resolveNpcNode(npc));
    return;
  }
  const tile = mapClickToTile(event);
  if (tile) {
    const map = getMap();
    if (!isBlocked(map, tile.x, tile.y)) {
      state.destination = tile;
      state.path = buildPath(map, state.save.position, tile);
      state.mobileOpen = false;
      render();
    }
  }
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-companion-form]");
  if (!form) return;
  event.preventDefault();
  const data = new FormData(form);
  handleCompanion(String(data.get("message") || ""));
});

document.addEventListener("keydown", (event) => {
  if (state.qte && (event.key === " " || event.key === "Enter")) {
    event.preventDefault();
    resolveQte(true);
  }
  if (event.key === "Escape") {
    state.dialogueNodeId = null;
    state.profileId = null;
    state.mobileOpen = false;
    render();
  }
});

window.addEventListener("resize", () => {
  state.viewport = { w: window.innerWidth, h: window.innerHeight };
  render();
});

window.setInterval(() => {
  if (state.screen !== "game") return;
  state.frame += 1;
  let changed = false;
  changed = stepPlayer() || changed;
  changed = runEconomyTick() || changed;
  if (state.frame % 360 === 0) triggerQte();
  if (state.frame % 240 === 0) runDeal();
  if (changed) render();
}, STEP_MS);

render();
