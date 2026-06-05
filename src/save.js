import { AGENTS } from "./data/characters.js";
import { SAVE_KEY, SAVE_VERSION } from "./data/world.js";

export const createDefaultSave = (overrides = {}) => ({
  version: SAVE_VERSION,
  lang: "ja",
  avatarId: null,
  mapId: "central_plaza",
  position: { x: 26, y: 24 },
  flags: [],
  questState: { chapterId: "ledger_dawn" },
  agents: AGENTS.map((agent, index) => ({
    id: agent.id,
    mapId: agent.homeMap,
    x: agent.home.x,
    y: agent.home.y,
    state: index % 4 === 0 ? "work" : "idle",
    earn: 0,
    mood: 82,
    level: 1,
    note: ""
  })),
  resources: { yen: 50000, data: 100, con: 5, rep: 60 },
  day: 1,
  ...overrides
});

const normalizeSave = (candidate) => {
  if (!candidate || candidate.version !== SAVE_VERSION) return null;
  const base = createDefaultSave();
  const agentById = new Map((candidate.agents || []).map((agent) => [agent.id, agent]));
  return {
    ...base,
    ...candidate,
    position: { ...base.position, ...(candidate.position || {}) },
    flags: Array.isArray(candidate.flags) ? [...new Set(candidate.flags)] : [],
    questState: { ...base.questState, ...(candidate.questState || {}) },
    resources: { ...base.resources, ...(candidate.resources || {}) },
    agents: base.agents.map((agent) => ({ ...agent, ...(agentById.get(agent.id) || {}) }))
  };
};

export const loadSave = () => {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { save: createDefaultSave(), corrupt: false, exists: false };
    const save = normalizeSave(JSON.parse(raw));
    if (!save) return { save: createDefaultSave(), corrupt: true, exists: false };
    return { save, corrupt: false, exists: true };
  } catch {
    return { save: createDefaultSave(), corrupt: true, exists: false };
  }
};

export const writeSave = (save) => {
  localStorage.setItem(SAVE_KEY, JSON.stringify(normalizeSave(save) || createDefaultSave()));
};

export const clearSave = () => {
  localStorage.removeItem(SAVE_KEY);
};
