// state.js
// Central game state + helpers (loadLevel, resetGame, playerHit)

import { levels, MAX_LIVES } from "./levels.js";

export function createInitialState(canvas, ctx) {
  const state = {
    canvas,
    ctx,
    fieldWidth: canvas.width,
    fieldHeight: canvas.height,

    levels,
    currentLevelIndex: 0,
    currentLevel: levels[0],

    player: {
      x: 0,
      y: 0,
      w: 20,
      h: 20,
      baseSpeed: 3,
      speed: 3,
      speedBoostTimer: 0,
      shieldTimer: 0,
      isSlowed: false,
      poisonTimer: 0,
      hazardInvulnTimer: 0,
      dashCharges: 0,
      lastMoveDirX: 1,
      lastMoveDirY: 0
    },

    enemies: [],
    powerups: [],
    traps: [],

    // new key / door state
    keyItems: [],
    doors: [],
    switches: [],
    hasKey: false,

    timeLeft: 90,
    score: 0,
    lives: MAX_LIVES,
    gameOver: false,
    gameWon: false,

    lastTime: 0,

    keys: {},

    resetButton: {
      x: canvas.width / 2 - 60,
      y: canvas.height / 2 + 40,
      w: 120,
      h: 30
    },

    // Editor / custom-level flags
    editorMode: false,
    editorTool: "wall",
    isCustomTestMode: false,
    customLevelTemplate: null,
    selectedEntity: null
  };
  
  loadLevel(state, 0);
  return state;
}

export function placePlayerAtStart(state) {
  state.player.x = state.currentLevel.start.x;
  state.player.y = state.currentLevel.start.y;
}

export function loadLevel(state, index) {
  state.currentLevelIndex = index;
  state.currentLevel = state.levels[state.currentLevelIndex];

  state.enemies = state.currentLevel.enemies.map((e) => ({ ...e }));
  state.powerups = state.currentLevel.powerups
    ? state.currentLevel.powerups.map((p) => ({ ...p }))
    : [];
  state.traps = state.currentLevel.traps
    ? state.currentLevel.traps.map((t) => ({ ...t }))
    : [];

  state.keyItems = state.currentLevel.keys
    ? state.currentLevel.keys.map((k) => ({ ...k }))
    : [];
  state.doors = state.currentLevel.doors
    ? state.currentLevel.doors.map((d) => ({ ...d }))
    : [];
  state.switches = state.currentLevel.switches
    ? state.currentLevel.switches.map((s) => ({ ...s, activated: false }))
    : [];
  state.hasKey = false;    

  validateEnemiesNotInWalls(state);
  validatePowerupsNotInWalls(state);
  validateTrapsNotInWalls(state);
  placePlayerAtStart(state);
}

export function loadCustomLevel(state, levelObj) {
  // Use -1 to indicate "custom level", not a built-in one
  state.currentLevelIndex = -1;
  state.currentLevel = levelObj;
  state.customLevelTemplate = levelObj;

  state.enemies = levelObj.enemies ? levelObj.enemies.map((e) => ({ ...e })) : [];
  state.powerups = levelObj.powerups ? levelObj.powerups.map((p) => ({ ...p })) : [];
  state.traps = levelObj.traps ? levelObj.traps.map((t) => ({ ...t })) : [];
  state.keyItems = levelObj.keys ? levelObj.keys.map((k) => ({ ...k })) : [];
  state.doors = levelObj.doors ? levelObj.doors.map((d) => ({ ...d })) : [];
  state.switches = levelObj.switches
    ? levelObj.switches.map((s) => ({ ...s, activated: s.activated || false }))
    : [];
  state.hasKey = false;

  validateEnemiesNotInWalls(state);
  validatePowerupsNotInWalls(state);
  validateTrapsNotInWalls(state);
  placePlayerAtStart(state);
}

export function advanceToNextLevel(state) {
  const nextIndex = state.currentLevelIndex + 1;
  if (nextIndex < state.levels.length) {
    loadLevel(state, nextIndex);
  } else {
    state.gameWon = true;
  }
}

export function resetGame(state) {
  state.score = 0;
  state.lives = MAX_LIVES;
  state.timeLeft = 90;
  state.gameOver = false;
  state.gameWon = false;
  

  const p = state.player;
  p.speedBoostTimer = 0;
  p.shieldTimer = 0;
  p.isSlowed = false;
  p.poisonTimer = 0;
  p.hazardInvulnTimer = 0;
  p.speed = p.baseSpeed;
  p.dashCharges = 0;
  p.lastMoveDirX = 1;
  p.lastMoveDirY = 0;

  state.hasKey = false;
  state.keyItems = [];
  state.doors = [];
  state.switches = [];

  state.isCustomTestMode = false;
  state.customLevelTemplate = null;
  

  loadLevel(state, 0);
}

// generic damage handler (used by enemies & traps)
export function playerHit(state, damage = 1, scorePenalty = 50) {
  if (state.gameOver || state.gameWon) return;

  const p = state.player;

  // shield absorbs
  if (p.shieldTimer > 0) {
    p.shieldTimer = 0;
    p.hazardInvulnTimer = 0.5;
    return;
  }

  // brief invulnerability so we don't chain-hit
  if (p.hazardInvulnTimer > 0) return;

  state.lives = Math.max(0, state.lives - damage);
  state.score = Math.max(0, state.score - scorePenalty);

  if (state.lives <= 0) {
    state.lives = 0;
    state.gameOver = true;
  } else {
    placePlayerAtStart(state);
    p.hazardInvulnTimer = 1.0; // 1 sec invuln
  }
}

// --- validation helpers (for level design) ---
function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function validateEnemiesNotInWalls(state) {
  const { enemies, currentLevel } = state;
  const obstacles = currentLevel.obstacles;

  enemies.forEach((e, index) => {
    for (const obs of obstacles) {
      if (rectsOverlap(e, obs)) {
        console.warn(
          `⚠️ Enemy #${index} (type=${e.type}) starts inside an obstacle`,
          e,
          obs
        );
      }
    }
  });
}

function validatePowerupsNotInWalls(state) {
  const { powerups, currentLevel } = state;
  const obstacles = currentLevel.obstacles;

  powerups.forEach((p, index) => {
    for (const obs of obstacles) {
      if (
        p.x + p.r > obs.x &&
        p.x - p.r < obs.x + obs.w &&
        p.y + p.r > obs.y &&
        p.y - p.r < obs.y + obs.h
      ) {
        console.warn(
          `⚠️ Power-up #${index} (type=${p.type}) starts inside a wall`,
          p,
          obs
        );
      }
    }
  });
}

function validateTrapsNotInWalls(state) {
  const { traps, currentLevel } = state;
  const obstacles = currentLevel.obstacles;

  traps.forEach((t, index) => {
    for (const obs of obstacles) {
      if (rectsOverlap(t, obs)) {
        console.warn(
          `⚠️ Trap #${index} (type=${t.type}) overlaps an obstacle`,
          t,
          obs
        );
      }
    }
  });
}