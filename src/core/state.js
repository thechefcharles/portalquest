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
    isPaused: false, // NEW: used by pause menu & quest flow

    // NEW: quest-specific state
    quest: {
      currentLevelIndex: 0,
      lives: 3,
      // 'idle' until startQuest() is called
      // then 'playing' | 'levelComplete' | 'gameOver' | 'questComplete'
      status: "idle",
    },

    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,

    // Legacy / generic level info (fine to keep)
    currentLevelIndex: 0,
    currentLevelId: null,
    currentLevel: null,

    // Player (will be positioned by loadLevelIntoState)
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

    hasKey: false,

    keysDown: {},

    timeLeft: 999,
    score: 0,

    // These are mostly for non-quest / generic modes now
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

// Re-load all level-specific data from QUEST_LEVELS[index]
export function loadLevelIntoState(state, levelIndex) {
  const level = QUEST_LEVELS[levelIndex];
  if (!level) {
    console.warn("No level at index", levelIndex);
    state.gameWon = true;
    return;
  }

  // 🔍 Validate for overlaps in dev
  assertLevelValid(level, `Quest level ${levelIndex} (${level.id})`);


  state.currentLevelIndex = levelIndex;
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
  state.player.onFire = false; // reset fire status

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
  state.gameOver = false;
  state.gameWon = false;
}
