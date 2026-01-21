// src/engine/engine.js
// Core game update loop: movement, collisions, enemies, powerups, traps, logic, portal

import { PLAYER_BASE_SPEED } from "../core/config.js";
import { updateEnemies, handlePlayerEnemyCollisions } from "./systems/enemySystem.js";
import { updatePowerups } from "./systems/powerupSystem.js";
import { updateTraps } from "./systems/trapSystem.js";
import { updateLogic } from "./systems/logicSystem.js";
import { loadLevelDataIntoState } from "../core/state.js";
import {
  tryShoot,
  updateProjectiles,
  handleProjectileEnemyCollisions,
} from "./systems/projectileSystem.js";


function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

// Entry point: called once per frame
export function updateGame(state, dt) {
  const inQuest = state.mode === "quest";
  const inCreatorTest = state.mode === "creator" && state.customTest;

  if (inQuest || inCreatorTest) {
    if (state.isPaused) return;
    if (state.quest && state.quest.status !== "playing") return;
  } else {
    // Non-quest, non-test modes: bail if game over/won
    if (state.gameOver || state.gameWon) return;
  }

  updatePlayerMovementAndWalls(state, dt);
  updateEnemies(state, dt);
  updatePowerups(state, dt);
  updateTraps(state, dt);
  updateLogic(state, dt);
  handlePlayerEnemyCollisions(state, dt);
  checkPortal(state);
    // NEW: projectiles
  updateProjectiles(state, dt);
  handleProjectileEnemyCollisions(state);
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

// ------- Player movement + wall + DOOR collision -------

function updatePlayerMovementAndWalls(state, dt) {
  const player = state.player;
  let speed = PLAYER_BASE_SPEED;

  // Speed buff
  if (player.speedBoostTimer > 0) {
    speed *= 1.6;
  }

    // NEW: dash timer tick-down (used to block shooting during dash)
  if (state.player.dashTimer > 0) {
    state.player.dashTimer -= dt;
    if (state.player.dashTimer < 0) state.player.dashTimer = 0;
  }

  // Glue slow
  if (player.slowFactor != null) {
    speed *= player.slowFactor;
  }

  const { keysDown } = state;

  let moveX = 0;
  let moveY = 0;

  // Movement is always driven by keysDown
  if (keysDown["ArrowLeft"] || keysDown["a"]) moveX -= 1;
  if (keysDown["ArrowRight"] || keysDown["d"]) moveX += 1;
  if (keysDown["ArrowUp"] || keysDown["w"]) moveY -= 1;
  if (keysDown["ArrowDown"] || keysDown["s"]) moveY += 1;

  // Normalize diagonal movement (keyboard or virtual joystick)
  if (moveX !== 0 || moveY !== 0) {
    const len = Math.sqrt(moveX * moveX + moveY * moveY);
    moveX /= len;
    moveY /= len;
  }
    
  const oldX = player.x;
  const oldY = player.y;

  const speedFactor = speed * (dt * 60);
  player.x += moveX * speedFactor;
  player.y += moveY * speedFactor;

  // Save last direction for dash
  if (moveX !== 0 || moveY !== 0) {
    player.lastMoveDirX = moveX;
    player.lastMoveDirY = moveY;
  }

  // Clamp to canvas
  player.x = Math.max(0, Math.min(state.width - player.w, player.x));
  player.y = Math.max(0, Math.min(state.height - player.h, player.y));

  // Collide with solid walls
  for (const obs of state.obstacles) {
    if (!rectsOverlap(player, obs)) continue;

    const movedHorizontally = player.x !== oldX;
    const movedVertically = player.y !== oldY;

    if (movedHorizontally && !movedVertically) {
      player.x = oldX;
    } else if (!movedHorizontally && movedVertically) {
      player.y = oldY;
    } else {
      player.x = oldX;
      player.y = oldY;
    }
  }

  // Collide with doors (key + switch doors)
  const keyCounts = state.keyCounts || (state.keyCounts = {});

  for (let i = state.doors.length - 1; i >= 0; i--) {
    const door = state.doors[i];
    if (!rectsOverlap(player, door)) continue;

    const movedHorizontally = player.x !== oldX;
    const movedVertically   = player.y !== oldY;

    const blockAsWall = () => {
      if (movedHorizontally && !movedVertically) {
        player.x = oldX;
      } else if (!movedHorizontally && movedVertically) {
        player.y = oldY;
      } else {
        player.x = oldX;
        player.y = oldY;
      }
    };

const isSwitchDoor = door.type === 'switch';
const isKeyDoor    = !door.type || door.type === 'key';

// SWITCH DOORS: solid if CLOSED, pass-through if OPEN
if (isSwitchDoor) {
  // Default undefined isOpen to "closed"
  if (!door.isOpen) {
    blockAsWall();
  }
  // If isOpen === true, we DON'T block; player can walk through.
  continue;
}

// KEY DOORS: require a matching key in inventory
if (isKeyDoor) {
  // Support either keyDoorId (new) or keyId (legacy) on the door
  const id = door.keyDoorId || door.keyId || null;
  if (!id) {
    console.warn('[Engine] Key door missing keyId/keyDoorId; acting as wall:', door);
    blockAsWall();
    continue;
  }

  const currentCount = keyCounts[id] || 0;

  if (currentCount > 0) {
    // Consume one key and remove the door
    keyCounts[id] = currentCount - 1;
    if (keyCounts[id] <= 0) {
      delete keyCounts[id];
    }

    state.doors.splice(i, 1);
    console.log(`[Engine] Opened key door with id="${id}". Remaining keys:`, keyCounts);
    // do NOT block movement → player passes through
    continue;
  }

  // No matching key → treat as wall
  blockAsWall();
  continue;
}

    // Any unknown door types → just block
    blockAsWall();
  }
}

// ------- Portal win check -------

function checkPortal(state) {
  const portal = state.portal;
  if (!portal) return;

  const player = state.player;
  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;

  const distToPortal = distance(px, py, portal.x, portal.y);
  if (distToPortal >= portal.r) return;

  const inCreatorTest = state.mode === "creator" && state.customTest;
  const inQuest = state.mode === "quest";

  // 1) CREATOR TEST MODE – restart the same level
  if (inCreatorTest) {
    if (state.lastTestLevelData) {
      loadLevelDataIntoState(state, state.lastTestLevelData);
      state.quest.status = "playing";
      state.gameOver = false;
      state.gameWon = false;
    }
    return;
  }

  // 2) QUEST MODE – built-in or custom level
  if (inQuest && state.quest) {
    // If this is a single custom level run (My Levels → Play),
    // or a normal quest level, we just mark the level complete.
    // Your existing UI (handleQuestStatusForUI) will:
    //  - show the Level Complete overlay
    //  - let "Next Level" button call advanceQuestLevel(state)
    state.gameWon = true;
    state.quest.status = "levelComplete";
    return;
  }

  // 3) Fallback – any other mode: just mark win
  state.gameWon = true;
}