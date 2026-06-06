export const SAVE_KEY = "neonMythos:rpgSave:v1";
export const SAVE_VERSION = 1;

export const WORLD_REGIONS = [
  {
    id: "ledger",
    nameKey: "region_ledger_name",
    descKey: "region_ledger_desc",
    theme: "#ffd34d",
    keeperIds: ["kane", "goldjack"],
    mapIds: ["central_plaza", "glitch_route_01", "golden_temple", "underground_vault", "data_causeway"],
    routeIds: ["glitch_route_01", "data_causeway"],
    unlockFlag: null
  },
  {
    id: "oracle",
    nameKey: "region_oracle_name",
    descKey: "region_oracle_desc",
    theme: "#00e5ff",
    keeperIds: ["oracle", "neon"],
    mapIds: ["oracle_gate"],
    routeIds: ["data_causeway"],
    unlockFlag: "chapter_ledger_complete"
  },
  {
    id: "trade",
    nameKey: "region_trade_name",
    descKey: "region_trade_desc",
    theme: "#ff62c6",
    keeperIds: ["nego", "pixel"],
    mapIds: [],
    routeIds: [],
    unlockFlag: "chapter_trade_unlocked"
  },
  {
    id: "shadow",
    nameKey: "region_shadow_name",
    descKey: "region_shadow_desc",
    theme: "#bf5fff",
    keeperIds: ["zero", "yami", "lira"],
    mapIds: [],
    routeIds: [],
    unlockFlag: "chapter_shadow_unlocked"
  },
  {
    id: "dragon",
    nameKey: "region_dragon_name",
    descKey: "region_dragon_desc",
    theme: "#00ff88",
    keeperIds: ["drone", "kitsune"],
    mapIds: [],
    routeIds: [],
    unlockFlag: "chapter_dragon_unlocked"
  },
  {
    id: "human",
    nameKey: "region_human_name",
    descKey: "region_human_desc",
    theme: "#9ca3af",
    keeperIds: ["human", "pixel"],
    mapIds: [],
    routeIds: [],
    unlockFlag: "chapter_human_unlocked"
  },
  {
    id: "sage",
    nameKey: "region_sage_name",
    descKey: "region_sage_desc",
    theme: "#55ffcc",
    keeperIds: ["sage", "neon"],
    mapIds: [],
    routeIds: [],
    unlockFlag: "chapter_sage_unlocked"
  },
  {
    id: "eyevoid",
    nameKey: "region_eyevoid_name",
    descKey: "region_eyevoid_desc",
    theme: "#8800ff",
    keeperIds: ["eyevoid"],
    mapIds: [],
    routeIds: [],
    unlockFlag: "chapter_eyevoid_unlocked"
  }
];

export const STORY_CHAPTERS = [
  {
    id: "ledger_dawn",
    titleKey: "chapter_ledger_title",
    summaryKey: "chapter_ledger_summary",
    requiredFlags: [],
    startNode: "nego_intro",
    completionFlags: ["chapter_ledger_complete"],
    rewards: { yen: 12000, data: 120, con: 2, rep: 12 },
    objectives: [
      { id: "meet_nego", textKey: "obj_meet_nego", flag: "met_nego", mapId: "central_plaza", target: { x: 18, y: 21 } },
      { id: "meet_kane", textKey: "obj_meet_kane", flag: "met_kane", mapId: "golden_temple", target: { x: 14, y: 10 } },
      { id: "patch_gate", textKey: "obj_patch_gate", flag: "zero_patch", mapId: "data_causeway", target: { x: 20, y: 16 } },
      { id: "recover_key", textKey: "obj_recover_key", flag: "lumen_key_ledger", mapId: "underground_vault", target: { x: 22, y: 14 } },
      { id: "report_kane", textKey: "obj_report_kane", flag: "chapter_ledger_complete", mapId: "golden_temple", target: { x: 14, y: 10 } }
    ]
  }
];

export const MAP_SCENES = {
  central_plaza: {
    id: "central_plaza",
    nameKey: "map_central_plaza",
    size: { w: 64, h: 46 },
    musicKey: "city",
    theme: { sky: "#122041", ground: "#173a37", accent: "#00e5ff" },
    tiles: {
      base: "grass",
      plaza: [{ x: 17, y: 16, w: 22, h: 13 }, { x: 24, y: 8, w: 9, h: 33 }],
      roads: [{ x: 0, y: 22, w: 64, h: 4 }, { x: 30, y: 0, w: 4, h: 46 }, { x: 8, y: 35, w: 45, h: 3 }],
      water: [{ x: 0, y: 43, w: 64, h: 3 }],
      gardens: [{ x: 5, y: 6, w: 9, h: 8 }, { x: 45, y: 7, w: 11, h: 8 }, { x: 46, y: 30, w: 9, h: 8 }]
    },
    buildings: [
      { id: "north_arcology", x: 2, y: 2, w: 4, h: 8, color: "#00e5ff", label: "A-01", kind: "tower" },
      { id: "capsule_stack", x: 58, y: 5, w: 4, h: 8, color: "#55ffcc", label: "POD", kind: "tower" },
      { id: "quest_board", x: 17, y: 20, w: 3, h: 2, color: "#ffd34d", label: "QUEST", kind: "notice" },
      { id: "trade_arch", x: 7, y: 18, w: 5, h: 4, color: "#ff62c6", label: "TRADE", kind: "guild" },
      { id: "atlas_terminal", x: 39, y: 18, w: 5, h: 4, color: "#00e5ff", label: "ATLAS", kind: "terminal" },
      { id: "skyline_market", x: 48, y: 16, w: 6, h: 5, color: "#ff62c6", label: "NITE", kind: "street" },
      { id: "human_bridge_preview", x: 25, y: 35, w: 7, h: 3, color: "#9ca3af", label: "BRIDGE", kind: "bridge" },
      { id: "mono_station", x: 41, y: 38, w: 8, h: 4, color: "#00ff88", label: "METRO", kind: "station" }
    ],
    warps: [
      { id: "to_glitch", x: 60, y: 20, w: 4, h: 7, toMap: "glitch_route_01", to: { x: 3, y: 14 } },
      { id: "to_data", x: 30, y: 0, w: 4, h: 2, toMap: "data_causeway", to: { x: 30, y: 27 } },
      { id: "to_oracle_preview", x: 52, y: 7, w: 5, h: 5, toMap: "oracle_gate", to: { x: 10, y: 16 }, requiredFlag: "chapter_ledger_complete", lockedTextKey: "lockedGate" }
    ],
    npcs: [
      { id: "npc_nego", agentId: "nego", x: 18, y: 21, dialogue: [{ node: "nego_after_start", allFlags: ["met_nego"] }, { node: "nego_intro" }] },
      { id: "npc_archivist", agentId: "sage", x: 26, y: 19, dialogue: [{ node: "archivist_intro" }] },
      { id: "npc_human", agentId: "human", x: 29, y: 24, dialogue: [{ node: "archivist_intro" }] }
    ],
    props: [
      { x: 23, y: 14, label: "LUMEN", color: "#ffd34d", kind: "holo" },
      { x: 36, y: 29, label: "SYNC", color: "#00ff88", kind: "holo" },
      { x: 10, y: 10, label: "PARK", color: "#55ffcc", kind: "sign" },
      { x: 21, y: 21, label: "AD", color: "#ff62c6", kind: "billboard" },
      { x: 28, y: 20, label: "BUS", color: "#9ca3af", kind: "stop" },
      { x: 34, y: 21, label: "LAMP", color: "#00e5ff", kind: "streetlight" },
      { x: 38, y: 25, label: "VEND", color: "#55ffcc", kind: "vending" },
      { x: 46, y: 28, label: "BENCH", color: "#9ca3af", kind: "bench" },
      { x: 13, y: 31, label: "CONE", color: "#ffd34d", kind: "barrier" },
      { x: 56, y: 15, label: "CAM", color: "#00e5ff", kind: "antenna" },
      { x: 6, y: 39, label: "TAXI", color: "#ffd34d", kind: "vehicle" },
      { x: 51, y: 39, label: "FOOD", color: "#ff62c6", kind: "stall" }
    ]
  },
  glitch_route_01: {
    id: "glitch_route_01",
    nameKey: "map_glitch_route_01",
    size: { w: 72, h: 30 },
    musicKey: "route",
    theme: { sky: "#1b1430", ground: "#18263f", accent: "#ff62c6" },
    tiles: {
      base: "field",
      roads: [{ x: 0, y: 13, w: 72, h: 4 }, { x: 36, y: 6, w: 4, h: 18 }],
      water: [{ x: 18, y: 25, w: 24, h: 3 }],
      gardens: [{ x: 8, y: 5, w: 9, h: 6 }, { x: 48, y: 5, w: 12, h: 8 }]
    },
    buildings: [
      { id: "route_motel", x: 4, y: 18, w: 8, h: 5, color: "#ff62c6", label: "MOTEL", kind: "street" },
      { id: "fiber_pylon", x: 24, y: 5, w: 5, h: 6, color: "#00e5ff", label: "FIBER", kind: "tower" },
      { id: "relay_kiosk", x: 34, y: 9, w: 5, h: 4, color: "#00ff88", label: "ROUTE", kind: "terminal" },
      { id: "glitch_shrine", x: 54, y: 18, w: 5, h: 4, color: "#bf5fff", label: "GLITCH", kind: "lab" },
      { id: "east_billboard_stack", x: 63, y: 5, w: 5, h: 7, color: "#ffd34d", label: "EXIT", kind: "tower" }
    ],
    warps: [
      { id: "to_central", x: 0, y: 12, w: 3, h: 7, toMap: "central_plaza", to: { x: 58, y: 23 } },
      { id: "to_temple", x: 69, y: 12, w: 3, h: 7, toMap: "golden_temple", to: { x: 3, y: 15 } }
    ],
    npcs: [
      { id: "npc_drone", agentId: "drone", x: 20, y: 11, dialogue: [{ node: "archivist_intro" }] },
      { id: "npc_pixel_route", agentId: "pixel", x: 49, y: 16, dialogue: [{ node: "archivist_intro" }] }
    ],
    props: [
      { x: 12, y: 12, label: "01", color: "#ff62c6", kind: "route" },
      { x: 41, y: 10, label: "LINK", color: "#00ff88", kind: "holo" },
      { x: 5, y: 12, label: "GAS", color: "#ffd34d", kind: "sign" },
      { x: 17, y: 17, label: "BIKE", color: "#9ca3af", kind: "vehicle" },
      { x: 31, y: 14, label: "TOLL", color: "#00e5ff", kind: "barrier" },
      { x: 40, y: 17, label: "WIRE", color: "#00e5ff", kind: "antenna" },
      { x: 47, y: 13, label: "VEND", color: "#55ffcc", kind: "vending" },
      { x: 60, y: 16, label: "SIGN", color: "#ff62c6", kind: "billboard" },
      { x: 67, y: 18, label: "LAMP", color: "#00e5ff", kind: "streetlight" }
    ]
  },
  golden_temple: {
    id: "golden_temple",
    nameKey: "map_golden_temple",
    size: { w: 46, h: 34 },
    musicKey: "temple",
    theme: { sky: "#2b2108", ground: "#2e2a16", accent: "#ffd34d" },
    tiles: {
      base: "gold",
      plaza: [{ x: 9, y: 8, w: 28, h: 17 }, { x: 17, y: 2, w: 12, h: 30 }],
      roads: [{ x: 0, y: 15, w: 46, h: 4 }, { x: 22, y: 0, w: 4, h: 34 }],
      water: [{ x: 4, y: 29, w: 38, h: 2 }],
      gardens: [{ x: 4, y: 5, w: 7, h: 7 }, { x: 35, y: 5, w: 7, h: 7 }]
    },
    buildings: [
      { id: "temple_hall", x: 16, y: 6, w: 14, h: 8, color: "#ffd34d", label: "TEMPLE", kind: "temple" },
      { id: "keeper_residence", x: 3, y: 21, w: 8, h: 5, color: "#55ffcc", label: "RYOKAN", kind: "street" },
      { id: "treasury_row", x: 32, y: 20, w: 8, h: 5, color: "#ffb000", label: "LEDGER", kind: "guild" },
      { id: "vault_lift", x: 20, y: 21, w: 7, h: 3, color: "#ffb000", label: "VAULT", kind: "vault" }
    ],
    warps: [
      { id: "to_route", x: 0, y: 13, w: 3, h: 8, toMap: "glitch_route_01", to: { x: 67, y: 15 } },
      { id: "to_vault", x: 21, y: 22, w: 5, h: 3, toMap: "underground_vault", to: { x: 22, y: 27 }, requiredFlag: "zero_patch", lockedTextKey: "dialog_kane_need_zero" }
    ],
    npcs: [
      {
        id: "npc_kane",
        agentId: "kane",
        x: 14,
        y: 10,
        dialogue: [
          { node: "kane_after_complete", allFlags: ["chapter_ledger_complete"] },
          { node: "kane_has_key", allFlags: ["lumen_key_ledger"] },
          { node: "kane_wait_key", allFlags: ["met_kane"], missingFlags: ["lumen_key_ledger"] },
          { node: "kane_intro" }
        ]
      },
      { id: "npc_goldjack", agentId: "goldjack", x: 8, y: 17, dialogue: [{ node: "archivist_intro" }] }
    ],
    props: [
      { x: 23, y: 4, label: "KEY I", color: "#ffd34d", kind: "monument" },
      { x: 18, y: 26, label: "YEN", color: "#ffb000", kind: "stall" },
      { x: 6, y: 13, label: "GATE", color: "#ffd34d", kind: "lantern" },
      { x: 39, y: 13, label: "GATE", color: "#ffd34d", kind: "lantern" },
      { x: 13, y: 18, label: "EMA", color: "#55ffcc", kind: "sign" },
      { x: 30, y: 18, label: "COIN", color: "#ffb000", kind: "vending" },
      { x: 22, y: 25, label: "SCAN", color: "#00e5ff", kind: "holo" },
      { x: 36, y: 27, label: "LAMP", color: "#ffd34d", kind: "streetlight" }
    ]
  },
  underground_vault: {
    id: "underground_vault",
    nameKey: "map_underground_vault",
    size: { w: 44, h: 32 },
    musicKey: "vault",
    theme: { sky: "#090b16", ground: "#111827", accent: "#ffd34d" },
    tiles: {
      base: "vault",
      plaza: [{ x: 7, y: 7, w: 30, h: 18 }],
      roads: [{ x: 20, y: 0, w: 5, h: 32 }, { x: 6, y: 14, w: 32, h: 4 }],
      water: [],
      gardens: []
    },
    buildings: [
      { id: "west_rack", x: 3, y: 6, w: 5, h: 8, color: "#00e5ff", label: "RACK", kind: "server" },
      { id: "vault_core", x: 18, y: 8, w: 8, h: 4, color: "#ffd34d", label: "CORE", kind: "vault" },
      { id: "cold_storage", x: 6, y: 20, w: 8, h: 4, color: "#00e5ff", label: "DATA", kind: "terminal" },
      { id: "risk_wall", x: 29, y: 20, w: 8, h: 4, color: "#ff3355", label: "RISK", kind: "lab" },
      { id: "east_rack", x: 36, y: 6, w: 5, h: 8, color: "#bf5fff", label: "RACK", kind: "server" }
    ],
    warps: [
      { id: "to_temple", x: 20, y: 29, w: 5, h: 3, toMap: "golden_temple", to: { x: 23, y: 20 } }
    ],
    npcs: [
      {
        id: "npc_vault_core",
        agentId: "oracle",
        x: 22,
        y: 14,
        dialogue: [
          { node: "vault_claimed", allFlags: ["lumen_key_ledger"] },
          { node: "vault_no_patch", missingFlags: ["zero_patch"] },
          { node: "vault_intro" }
        ]
      }
    ],
    props: [
      { x: 22, y: 8, label: "LUMEN KEY", color: "#ffd34d", kind: "monument" },
      { x: 15, y: 15, label: "HASH", color: "#00e5ff", kind: "holo" },
      { x: 11, y: 12, label: "LOCK", color: "#ff3355", kind: "barrier" },
      { x: 31, y: 12, label: "LOCK", color: "#ff3355", kind: "barrier" },
      { x: 12, y: 18, label: "CABLE", color: "#00e5ff", kind: "antenna" },
      { x: 28, y: 18, label: "CABLE", color: "#bf5fff", kind: "antenna" },
      { x: 5, y: 25, label: "FAN", color: "#9ca3af", kind: "vent" },
      { x: 37, y: 25, label: "FAN", color: "#9ca3af", kind: "vent" }
    ]
  },
  data_causeway: {
    id: "data_causeway",
    nameKey: "map_data_causeway",
    size: { w: 58, h: 30 },
    musicKey: "causeway",
    theme: { sky: "#08172c", ground: "#102633", accent: "#00e5ff" },
    tiles: {
      base: "causeway",
      roads: [{ x: 0, y: 14, w: 58, h: 5 }, { x: 28, y: 0, w: 5, h: 30 }],
      water: [{ x: 0, y: 0, w: 58, h: 5 }, { x: 0, y: 25, w: 58, h: 5 }],
      plaza: [{ x: 17, y: 10, w: 20, h: 10 }],
      gardens: [{ x: 42, y: 8, w: 7, h: 7 }]
    },
    buildings: [
      { id: "causeway_control", x: 6, y: 7, w: 7, h: 5, color: "#00e5ff", label: "CTRL", kind: "terminal" },
      { id: "zero_relay", x: 18, y: 12, w: 6, h: 5, color: "#ff3355", label: "ZERO", kind: "lab" },
      { id: "drone_hangar", x: 36, y: 19, w: 7, h: 4, color: "#00ff88", label: "DRONE", kind: "station" },
      { id: "oracle_gate", x: 48, y: 11, w: 6, h: 7, color: "#00e5ff", label: "GATE", kind: "terminal" }
    ],
    warps: [
      { id: "to_central", x: 28, y: 28, w: 5, h: 2, toMap: "central_plaza", to: { x: 32, y: 3 } },
      { id: "to_oracle", x: 55, y: 12, w: 3, h: 7, toMap: "oracle_gate", to: { x: 4, y: 16 }, requiredFlag: "chapter_ledger_complete", lockedTextKey: "lockedGate" }
    ],
    npcs: [
      {
        id: "npc_zero",
        agentId: "zero",
        x: 20,
        y: 16,
        dialogue: [
          { node: "zero_repeat", allFlags: ["zero_patch"] },
          { node: "zero_intro" }
        ]
      },
      { id: "npc_neon", agentId: "neon", x: 35, y: 17, dialogue: [{ node: "archivist_intro" }] }
    ],
    props: [
      { x: 48, y: 9, label: "ORACLE", color: "#00e5ff", kind: "holo" },
      { x: 27, y: 18, label: "PATCH", color: "#ff3355", kind: "holo" },
      { x: 9, y: 18, label: "TAXI", color: "#ffd34d", kind: "vehicle" },
      { x: 16, y: 18, label: "BOLL", color: "#9ca3af", kind: "barrier" },
      { x: 25, y: 13, label: "CAM", color: "#00e5ff", kind: "antenna" },
      { x: 34, y: 13, label: "LIGHT", color: "#00e5ff", kind: "streetlight" },
      { x: 42, y: 14, label: "KIOSK", color: "#55ffcc", kind: "vending" },
      { x: 53, y: 19, label: "LOCK", color: "#ff3355", kind: "barrier" }
    ]
  },
  oracle_gate: {
    id: "oracle_gate",
    nameKey: "map_oracle_gate",
    size: { w: 28, h: 24 },
    musicKey: "oracle",
    theme: { sky: "#071329", ground: "#0d2336", accent: "#00e5ff" },
    tiles: {
      base: "oracle",
      roads: [{ x: 0, y: 14, w: 28, h: 4 }],
      plaza: [{ x: 8, y: 6, w: 12, h: 12 }],
      water: [],
      gardens: []
    },
    buildings: [
      { id: "oracle_left_spire", x: 3, y: 5, w: 4, h: 8, color: "#55ffcc", label: "I/O", kind: "tower" },
      { id: "oracle_preview", x: 8, y: 6, w: 12, h: 7, color: "#00e5ff", label: "SKYLINE", kind: "terminal" },
      { id: "oracle_right_spire", x: 21, y: 5, w: 4, h: 8, color: "#bf5fff", label: "EYE", kind: "tower" }
    ],
    warps: [
      { id: "to_central", x: 0, y: 13, w: 3, h: 6, toMap: "central_plaza", to: { x: 52, y: 12 } },
      { id: "to_data", x: 0, y: 18, w: 3, h: 4, toMap: "data_causeway", to: { x: 53, y: 15 } }
    ],
    npcs: [
      { id: "npc_oracle_preview", agentId: "oracle", x: 14, y: 14, dialogue: [{ node: "archivist_intro" }] }
    ],
    props: [
      { x: 14, y: 5, label: "NEXT CHAPTER", color: "#00e5ff", kind: "holo" },
      { x: 6, y: 15, label: "PORT", color: "#55ffcc", kind: "barrier" },
      { x: 11, y: 18, label: "NODE", color: "#00e5ff", kind: "monument" },
      { x: 18, y: 18, label: "NODE", color: "#bf5fff", kind: "monument" },
      { x: 23, y: 15, label: "CAM", color: "#00e5ff", kind: "antenna" }
    ]
  }
};

export const DIALOGUE_NODES = {
  nego_intro: {
    id: "nego_intro",
    speakerId: "nego",
    textKey: "dialog_nego_intro",
    choices: [
      { labelKey: "dialog_nego_accept", to: "nego_hint", effects: { setFlags: ["met_nego"], logKey: "introLine" } }
    ]
  },
  nego_hint: {
    id: "nego_hint",
    speakerId: "nego",
    textKey: "dialog_nego_hint",
    choices: [{ labelKey: "continueLabel", effects: { close: true } }]
  },
  nego_after_start: {
    id: "nego_after_start",
    speakerId: "nego",
    textKey: "dialog_nego_repeat",
    choices: [{ labelKey: "continueLabel", effects: { close: true } }]
  },
  kane_intro: {
    id: "kane_intro",
    speakerId: "kane",
    textKey: "dialog_kane_intro",
    choices: [
      { labelKey: "dialog_kane_accept", to: "kane_need_zero", effects: { setFlags: ["met_kane"], resources: { rep: 2 } } }
    ]
  },
  kane_need_zero: {
    id: "kane_need_zero",
    speakerId: "kane",
    textKey: "dialog_kane_need_zero",
    choices: [{ labelKey: "continueLabel", effects: { close: true } }]
  },
  kane_wait_key: {
    id: "kane_wait_key",
    speakerId: "kane",
    textKey: "dialog_kane_wait_key",
    choices: [{ labelKey: "continueLabel", effects: { close: true } }]
  },
  kane_has_key: {
    id: "kane_has_key",
    speakerId: "kane",
    textKey: "dialog_kane_complete",
    choices: [
      {
        labelKey: "dialog_kane_finish",
        effects: {
          setFlags: ["chapter_ledger_complete"],
          resources: { yen: 12000, data: 120, con: 2, rep: 12 },
          logKey: "chapterComplete",
          close: true
        }
      }
    ]
  },
  kane_after_complete: {
    id: "kane_after_complete",
    speakerId: "kane",
    textKey: "chapterComplete",
    choices: [{ labelKey: "continueLabel", effects: { close: true } }]
  },
  zero_intro: {
    id: "zero_intro",
    speakerId: "zero",
    textKey: "dialog_zero_intro",
    choices: [
      { labelKey: "dialog_zero_patch", to: "zero_done", effects: { setFlags: ["zero_patch"], resources: { data: 40, rep: 1 } } }
    ]
  },
  zero_done: {
    id: "zero_done",
    speakerId: "zero",
    textKey: "dialog_zero_done",
    choices: [{ labelKey: "continueLabel", effects: { close: true } }]
  },
  zero_repeat: {
    id: "zero_repeat",
    speakerId: "zero",
    textKey: "dialog_zero_repeat",
    choices: [{ labelKey: "continueLabel", effects: { close: true } }]
  },
  vault_no_patch: {
    id: "vault_no_patch",
    speakerId: "oracle",
    textKey: "dialog_vault_no_patch",
    choices: [{ labelKey: "continueLabel", effects: { close: true } }]
  },
  vault_intro: {
    id: "vault_intro",
    speakerId: "oracle",
    textKey: "dialog_vault_intro",
    choices: [
      {
        labelKey: "dialog_vault_open",
        to: "vault_success",
        effects: { setFlags: ["lumen_key_ledger"], resources: { data: 80, rep: 4 } }
      }
    ]
  },
  vault_success: {
    id: "vault_success",
    speakerId: "oracle",
    textKey: "dialog_vault_success",
    choices: [{ labelKey: "continueLabel", effects: { close: true } }]
  },
  vault_claimed: {
    id: "vault_claimed",
    speakerId: "oracle",
    textKey: "dialog_vault_claimed",
    choices: [{ labelKey: "continueLabel", effects: { close: true } }]
  },
  archivist_intro: {
    id: "archivist_intro",
    speakerId: "sage",
    textKey: "dialog_archivist",
    choices: [{ labelKey: "continueLabel", effects: { close: true } }]
  }
};

export const QTE_EVENTS = [
  { id: "qte_fire", titleKey: "qte_fire", color: "#ff5533", rewards: { yen: 2800, rep: 3 }, penalty: { yen: -3200, rep: -2 } },
  { id: "qte_data", titleKey: "qte_data", color: "#00e5ff", rewards: { data: 45 }, penalty: { data: -30 } },
  { id: "qte_route", titleKey: "qte_route", color: "#ff62c6", rewards: { yen: 1800, con: 1 }, penalty: { rep: -3 } }
];
