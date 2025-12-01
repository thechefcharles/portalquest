// src/engine/engine.js
// Core game update loop: movement, collisions, enemies, powerups, traps, logic, portal

import { PLAYER_BASE_SPEED } from "../core/config.js";
import { updateEnemies, handlePlayerEnemyCollisions } from "./systems/enemySystem.js";
import { updatePowerups } from "./systems/powerupSystem.js";
import { updateTraps } from "./systems/trapSystem.js";
import { updateLogic } from "./systems/logicSystem.js";
// import { advanceQuestLevel } from "../modes/questMode.js"; // REMOVED: now done via UI button

function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

// Entry point: called once per frame
export function updateGame(state, dt) {
  // UPDATED: handle quest vs non-quest modes properly

  if (state.mode === "quest") {
    // In quest mode, only update while actively playing
    if (state.isPaused) return; // NEW
    if (!state.quest || state.quest.status !== "playing") return; // NEW
  } else {
    // Non-quest modes can still use gameOver/gameWon if you want
    if (state.gameOver || state.gameWon) return;
  }

  updatePlayerMovementAndWalls(state, dt);
  updateEnemies(state, dt);
  updatePowerups(state, dt);
  updateTraps(state, dt);
  updateLogic(state, dt);
  handlePlayerEnemyCollisions(state, dt);
  checkPortal(state); // UPDATED behavior below
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

  // Glue slow
  if (player.slowFactor != null) {
    speed *= player.slowFactor;
  }

  const { keysDown } = state;

  let moveX = 0;
  let moveY = 0;

  if (keysDown["ArrowLeft"] || keysDown["a"]) moveX -= 1;
  if (keysDown["ArrowRight"] || keysDown["d"]) moveX += 1;
  if (keysDown["ArrowUp"] || keysDown["w"]) moveY -= 1;
  if (keysDown["ArrowDown"] || keysDown["s"]) moveY += 1;

  // Normalize diagonal movement
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
  for (let i = state.doors.length - 1; i >= 0; i--) {
    const door = state.doors[i];
    if (!rectsOverlap(player, door)) continue;

    const isSwitchDoor = door.type === "switch";
    const isKeyDoor = !door.type || door.type === "key";

    if (isSwitchDoor) {
      // Always behaves like a wall; switches open them
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
      continue;
    }

    if (isKeyDoor) {
      if (state.hasKey) {
        // Unlock this door using the key
        state.hasKey = false;
        state.doors.splice(i, 1);
        // Allow player to pass through (no position reset)
      } else {
        // No key → treat door as wall
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
    }
  }
}

// ------- Portal win check -------

function checkPortal(state) {
  const portal = state.portal;
  if (!portal) return; // NEW: guard if level forgot to define a portal

  const player = state.player;
  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;

  const distToPortal = distance(px, py, portal.x, portal.y);

  if (distToPortal < portal.r) {
    if (state.mode === "quest") {
      // UPDATED: don’t immediately advance level
      // Just flag LEVEL COMPLETE and let UI handle Next Level
      if (state.quest && state.quest.status === "playing") {
        state.quest.status = "levelComplete"; // NEW
        state.isPaused = true;                // NEW (optional, to freeze gameplay)
      }
    } else {
      // Non-quest modes can just mark gameWon directly
      state.gameWon = true;
    }
  }
}
