import { AGENTS } from "../src/data/characters.js";
import { I18N, LANG_CODES } from "../src/data/i18n.js";
import { DIALOGUE_NODES, MAP_SCENES, QTE_EVENTS, STORY_CHAPTERS, WORLD_REGIONS } from "../src/data/world.js";

const errors = [];
const agentIds = new Set(AGENTS.map((agent) => agent.id));
const mapIds = new Set(Object.keys(MAP_SCENES));
const dialogueIds = new Set(Object.keys(DIALOGUE_NODES));
const textKeys = new Set();
const producedFlags = new Set();

const needText = (key, where) => {
  if (!key) return;
  textKeys.add(key);
  LANG_CODES.forEach((lang) => {
    if (!I18N[lang] || I18N[lang][key] == null || I18N[lang][key] === "") {
      errors.push(`missing i18n key "${key}" for ${lang} (${where})`);
    }
  });
};

[
  "subtitle",
  "selectLanguage",
  "selectAvatar",
  "startJourney",
  "continueJourney",
  "resetSave",
  "soundOn",
  "graphicsToggle",
  "graphicsLite",
  "graphicsHd",
  "mapTab",
  "questTab",
  "atlasTab",
  "agentsTab",
  "economyTab",
  "companionTab",
  "talk",
  "close",
  "choose",
  "continueLabel",
  "objective",
  "completed",
  "locked",
  "lockedGate",
  "saveStatus",
  "day",
  "resources",
  "yen",
  "data",
  "con",
  "rep",
  "liveFeed",
  "qteTitle",
  "qteAction",
  "qteSuccess",
  "qteFail",
  "spawnEvent",
  "runDeal",
  "dealPrompt",
  "dealChoiceRead",
  "dealChoiceReadDesc",
  "dealChoicePush",
  "dealChoicePushDesc",
  "dealChoiceTrust",
  "dealChoiceTrustDesc"
].forEach((key) => needText(key, "core ui"));

AGENTS.forEach((agent) => {
  needText(agent.roleKey, `agent ${agent.id}`);
  if (!agentIds.has(agent.id)) errors.push(`agent missing id ${agent.id}`);
});

WORLD_REGIONS.forEach((region) => {
  needText(region.nameKey, `region ${region.id}`);
  needText(region.descKey, `region ${region.id}`);
  region.keeperIds.forEach((id) => {
    if (!agentIds.has(id)) errors.push(`region ${region.id} references unknown keeper ${id}`);
  });
  region.mapIds.forEach((id) => {
    if (!mapIds.has(id)) errors.push(`region ${region.id} references unknown map ${id}`);
  });
});

Object.values(MAP_SCENES).forEach((map) => {
  needText(map.nameKey, `map ${map.id}`);
  if (!map.size || map.size.w <= 0 || map.size.h <= 0) errors.push(`map ${map.id} has invalid size`);
  map.warps.forEach((warp) => {
    if (!mapIds.has(warp.toMap)) errors.push(`map ${map.id} warp ${warp.id} targets unknown map ${warp.toMap}`);
    if (!warp.to || typeof warp.to.x !== "number" || typeof warp.to.y !== "number") {
      errors.push(`map ${map.id} warp ${warp.id} has invalid target position`);
    }
    if (warp.lockedTextKey) needText(warp.lockedTextKey, `warp ${warp.id}`);
  });
  map.npcs.forEach((npc) => {
    if (!agentIds.has(npc.agentId)) errors.push(`map ${map.id} npc ${npc.id} references unknown agent ${npc.agentId}`);
    const entries = Array.isArray(npc.dialogue) ? npc.dialogue : [{ node: npc.dialogue }];
    entries.forEach((entry) => {
      if (!dialogueIds.has(entry.node)) errors.push(`map ${map.id} npc ${npc.id} references unknown dialogue ${entry.node}`);
    });
  });
});

STORY_CHAPTERS.forEach((chapter) => {
  needText(chapter.titleKey, `chapter ${chapter.id}`);
  needText(chapter.summaryKey, `chapter ${chapter.id}`);
  if (!dialogueIds.has(chapter.startNode)) errors.push(`chapter ${chapter.id} references unknown start node ${chapter.startNode}`);
  chapter.objectives.forEach((objective) => {
    needText(objective.textKey, `objective ${objective.id}`);
    if (!mapIds.has(objective.mapId)) errors.push(`objective ${objective.id} references unknown map ${objective.mapId}`);
  });
});

Object.values(DIALOGUE_NODES).forEach((node) => {
  if (!agentIds.has(node.speakerId)) errors.push(`dialogue ${node.id} references unknown speaker ${node.speakerId}`);
  needText(node.textKey, `dialogue ${node.id}`);
  node.choices.forEach((choice, index) => {
    needText(choice.labelKey, `dialogue ${node.id} choice ${index}`);
    if (choice.to && !dialogueIds.has(choice.to)) errors.push(`dialogue ${node.id} choice ${index} targets unknown node ${choice.to}`);
    (choice.effects?.setFlags || []).forEach((flag) => producedFlags.add(flag));
  });
});

QTE_EVENTS.forEach((event) => needText(event.titleKey, `qte ${event.id}`));

STORY_CHAPTERS.forEach((chapter) => {
  chapter.objectives.forEach((objective) => {
    if (!producedFlags.has(objective.flag)) {
      errors.push(`objective ${objective.id} flag "${objective.flag}" is not produced by any dialogue choice`);
    }
  });
});

const simulateChoice = (flags, nodeId, choiceIndex, requiredFlag) => {
  const node = DIALOGUE_NODES[nodeId];
  const choice = node?.choices?.[choiceIndex];
  if (!choice) {
    errors.push(`chapter simulation cannot find ${nodeId} choice ${choiceIndex}`);
    return;
  }
  (choice.effects?.setFlags || []).forEach((flag) => flags.add(flag));
  if (requiredFlag && !flags.has(requiredFlag)) {
    errors.push(`chapter simulation expected ${nodeId} to set ${requiredFlag}`);
  }
};

const ledgerChapter = STORY_CHAPTERS.find((chapter) => chapter.id === "ledger_dawn");
if (!ledgerChapter) {
  errors.push("missing ledger_dawn chapter");
} else {
  const flags = new Set();
  [
    ["nego_intro", 0, "met_nego"],
    ["kane_intro", 0, "met_kane"],
    ["zero_intro", 0, "zero_patch"],
    ["vault_intro", 0, "lumen_key_ledger"],
    ["kane_has_key", 0, "chapter_ledger_complete"]
  ].forEach(([nodeId, choiceIndex, flag]) => simulateChoice(flags, nodeId, choiceIndex, flag));
  const missing = ledgerChapter.completionFlags.filter((flag) => !flags.has(flag));
  if (missing.length) errors.push(`ledger_dawn simulation missing completion flags: ${missing.join(", ")}`);
  const unfinished = ledgerChapter.objectives.filter((objective) => !flags.has(objective.flag));
  if (unfinished.length) errors.push(`ledger_dawn simulation leaves unfinished objectives: ${unfinished.map((objective) => objective.id).join(", ")}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`validated ${Object.keys(MAP_SCENES).length} maps, ${WORLD_REGIONS.length} regions, ${Object.keys(DIALOGUE_NODES).length} dialogue nodes, ${textKeys.size} i18n keys`);
