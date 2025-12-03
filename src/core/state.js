// src/core/state.js
// GameState: runtime state and level loading

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_BASE_SPEED,
} from "./config.js";
import { QUEST_LEVELS } from "../data/questLevels.js";
import { assertLevelValid } from "./levelValidator.js";

// Create a fresh GameState and load level 0
export function createGameState() {
  const state = {
    mode: "menu",
    isPaused: false, // used by pause menu & quest flow

    // NEW: custom test flag (for Creator playtest)
    customTest: false,
    customLevelName: null,

    // Quest-specific state
    quest: {
      currentLevelIndex: 0,
      lives: 3,
      // 'idle' until startQuest() is called
      // then 'playing' | 'levelComplete' | 'gameOver' | 'questComplete'
      status: "idle",
    },

    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,

    // Generic level info
    currentLevelIndex: 0,
    currentLevelId: null,
    currentLevel: null,

    // Player (will be positioned by loadLevel* functions)
    player: {
      x: 0,
      y: 0,
      w: PLAYER_WIDTH,
      h: PLAYER_HEIGHT,
      speed: PLAYER_BASE_SPEED,

      dashCharges: 0,
      health: 100,
      maxHealth: 100,

      shieldTimer: 0,
      speedBoostTimer: 0,
      poisonTimer: 0,
      hazardInvulnTimer: 0,
      lastMoveDirX: 1,
      lastMoveDirY: 0,
      slowFactor: 1,
      onFire: false,      // used for HUD + status
    },

    portal: { x: 0, y: 0, r: 18 },

    obstacles: [],
    enemies: [],
    powerups: [],
    traps: [],
    keys: [],
    doors: [],
    switches: [],

    hasKey: false,          // old single-key flag (can keep or ignore)
    keyCounts: {},          // NEW: inventory of keys by keyId

    keysDown: {},

    timeLeft: 999,
    score: 0,

    // Legacy / generic flags
    lives: 3,
    gameOver: false,
    gameWon: false,

    lastTime: 0,
  };

  // Preload level 0 so the canvas has something to draw even before quest starts.
  // startQuest() will re-load the level and set status = 'playing'.
  loadLevelIntoState(state, 0);

  return state;
}

// INTERNAL helper: apply a LevelData object to the state
function applyLevelToState(state, level) {
  state.currentLevelId = level.id;
  state.currentLevel = level;

  // Reset player state for new level
  state.player.x = level.start.x;
  state.player.y = level.start.y;
  state.player.health = state.player.maxHealth;
  state.player.shieldTimer = 0;
  state.player.speedBoostTimer = 0;
  state.player.poisonTimer = 0;
  state.player.hazardInvulnTimer = 0;
  state.player.slowFactor = 1;
  state.player.onFire = false;

  // Portal
  state.portal.x = level.portal.x;
  state.portal.y = level.portal.y;
  state.portal.r = level.portal.r;

  // Clone arrays so we don't mutate the originals
  state.obstacles = (level.obstacles || []).map((o) => ({ ...o }));
  state.enemies = (level.enemies || []).map((e) => ({ ...e }));
  state.powerups = (level.powerups || []).map((p) => ({ ...p }));
  state.traps = (level.traps || []).map((t) => ({ ...t }));
  state.keys = (level.keys || []).map((k) => ({ ...k }));
  state.doors = (level.doors || []).map((d) => ({ ...d }));
  state.switches = (level.switches || []).map((s) => ({ ...s }));

  state.hasKey = false;
  state.keyCounts = {};
  state.gameOver = false;
  state.gameWon = false;
}

// Re-load all level-specific data from QUEST_LEVELS[index]
export function loadLevelIntoState(state, levelIndex) {
  const level = QUEST_LEVELS[levelIndex];
  if (!level) {
    console.warn("No level at index", levelIndex);
    state.gameWon = true;
    return;
  }

  // 🔍 Validate built-in levels in dev
  assertLevelValid(level, `Quest level ${levelIndex} (${level.id})`);

  state.currentLevelIndex = levelIndex;
  applyLevelToState(state, level);
}

// NEW: Load arbitrary LevelData (from Creator) into state
export function loadLevelDataIntoState(state, level) {
  if (!level) {
    console.warn("No level data provided for custom test");
    state.gameWon = true;
    return;
  }

  // For custom levels, we trust the Creator's validator,
  // so we don't hard-assert here to avoid noisy logs.
  state.currentLevelIndex = -1;
  applyLevelToState(state, level);
}
