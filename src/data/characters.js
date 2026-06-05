export const PET_ATLAS = {
  kane: "pet-portable-bundle/kane-kami/assets/spritesheet.webp",
  zero: "pet-portable-bundle/zero/assets/spritesheet.webp",
  nego: "pet-portable-bundle/nego-chan/assets/spritesheet.webp",
  human: "pet-portable-bundle/404-human/assets/spritesheet.webp",
  oracle: "lumen-export/assets/spritesheet.webp",
  sage: "character-pets/sage-boy/spritesheet.webp",
  drone: "character-pets/drone-tan/spritesheet.webp",
  yami: "character-pets/yami-neko/spritesheet.webp",
  lira: "character-pets/lira/spritesheet.webp",
  kitsune: "character-pets/kitsune-x/spritesheet.webp",
  neon: "character-pets/neon/spritesheet.webp",
  eyevoid: "character-pets/eye-void/spritesheet.webp",
  goldjack: "character-pets/gold-jack/spritesheet.webp",
  pixel: "character-pets/pixel/spritesheet.webp"
};

export const PORTRAIT_ATLAS = {
  sage: "character-assets/sage-boy.png",
  drone: "character-assets/drone-tan.png",
  yami: "character-assets/yami-neko.png",
  lira: "character-assets/lira.png",
  kitsune: "character-assets/kitsune-x.png",
  neon: "character-assets/neon.png",
  eyevoid: "character-assets/eye-void.png",
  goldjack: "character-assets/gold-jack.png",
  pixel: "character-assets/pixel.png"
};

export const AGENTS = [
  {
    id: "kane",
    name: "KANE-KAMI",
    spriteId: "kane",
    color: "#ffd34d",
    specialty: "investor",
    homeMap: "golden_temple",
    home: { x: 14, y: 10 },
    roleKey: "role_kane",
    behavior: ["bank", "temple", "vault"]
  },
  {
    id: "zero",
    name: "ZERO",
    spriteId: "zero",
    color: "#ff3355",
    specialty: "engineer",
    homeMap: "data_causeway",
    home: { x: 20, y: 16 },
    roleKey: "role_zero",
    behavior: ["gate", "relay", "core"]
  },
  {
    id: "nego",
    name: "NEGO-CHAN",
    spriteId: "nego",
    color: "#ff62c6",
    specialty: "trader",
    homeMap: "central_plaza",
    home: { x: 18, y: 21 },
    roleKey: "role_nego",
    behavior: ["market", "quest", "deal"]
  },
  {
    id: "human",
    name: "404 HUMAN",
    spriteId: "human",
    color: "#9ca3af",
    specialty: "diplomat",
    homeMap: "central_plaza",
    home: { x: 29, y: 24 },
    roleKey: "role_human",
    behavior: ["bridge", "rumor", "care"]
  },
  {
    id: "oracle",
    name: "ORACLE-01",
    spriteId: "oracle",
    color: "#00e5ff",
    specialty: "analyst",
    homeMap: "central_plaza",
    home: { x: 43, y: 13 },
    roleKey: "role_oracle",
    behavior: ["forecast", "tower", "signal"]
  },
  {
    id: "sage",
    name: "SAGE-BOY",
    spriteId: "sage",
    color: "#55ffcc",
    specialty: "analyst",
    homeMap: "central_plaza",
    home: { x: 12, y: 31 },
    roleKey: "role_sage",
    behavior: ["academy", "lesson", "archive"]
  },
  {
    id: "drone",
    name: "DRONE-TAN",
    spriteId: "drone",
    color: "#00ff88",
    specialty: "courier",
    homeMap: "glitch_route_01",
    home: { x: 20, y: 11 },
    roleKey: "role_drone",
    behavior: ["route", "cargo", "scan"]
  },
  {
    id: "yami",
    name: "YAMI-NEKO",
    spriteId: "yami",
    color: "#bf5fff",
    specialty: "engineer",
    homeMap: "central_plaza",
    home: { x: 48, y: 28 },
    roleKey: "role_yami",
    behavior: ["shadow", "patch", "stealth"]
  },
  {
    id: "lira",
    name: "LIRA",
    spriteId: "lira",
    color: "#a46bff",
    specialty: "engineer",
    homeMap: "central_plaza",
    home: { x: 8, y: 14 },
    roleKey: "role_lira",
    behavior: ["cipher", "field", "mask"]
  },
  {
    id: "kitsune",
    name: "KITSUNE-X",
    spriteId: "kitsune",
    color: "#ff0033",
    specialty: "diplomat",
    homeMap: "central_plaza",
    home: { x: 39, y: 29 },
    roleKey: "role_kitsune",
    behavior: ["guard", "oath", "barrier"]
  },
  {
    id: "neon",
    name: "NEON",
    spriteId: "neon",
    color: "#00dfff",
    specialty: "analyst",
    homeMap: "central_plaza",
    home: { x: 35, y: 17 },
    roleKey: "role_neon",
    behavior: ["model", "trend", "pulse"]
  },
  {
    id: "eyevoid",
    name: "EYE-VOID",
    spriteId: "eyevoid",
    color: "#8800ff",
    specialty: "analyst",
    homeMap: "central_plaza",
    home: { x: 45, y: 33 },
    roleKey: "role_eyevoid",
    behavior: ["omen", "rift", "future"]
  },
  {
    id: "goldjack",
    name: "GOLD JACK",
    spriteId: "goldjack",
    color: "#ffb000",
    specialty: "investor",
    homeMap: "golden_temple",
    home: { x: 8, y: 17 },
    roleKey: "role_goldjack",
    behavior: ["arb", "vault", "risk"]
  },
  {
    id: "pixel",
    name: "PIXEL",
    spriteId: "pixel",
    color: "#f7f3ea",
    specialty: "diplomat",
    homeMap: "central_plaza",
    home: { x: 23, y: 33 },
    roleKey: "role_pixel",
    behavior: ["media", "memory", "story"]
  }
];

export const AVATAR_IDS = ["kane", "zero", "nego", "human", "sage", "drone", "yami", "neon", "pixel"];

export const PROFILE_METRICS = {
  investor: ["yield", "risk", "liquidity"],
  analyst: ["signal", "forecast", "clarity"],
  trader: ["deal", "tone", "contract"],
  engineer: ["patch", "defense", "uptime"],
  diplomat: ["trust", "bridge", "resolve"],
  courier: ["route", "speed", "handoff"]
};

export const getAgent = (id) => AGENTS.find((agent) => agent.id === id);
