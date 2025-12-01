// src/engine/systems/trapSystem.js
// Handles traps: glue (slow), fire, poison, spikes

import { handlePlayerDeath } from "../../modes/questMode.js";


const FIRE_DPS = 10;    // fire damage per second while standing in fire
const POISON_DPS = 5;   // poison damage per second while poisoned
const POISON_DURATION = 3; // seconds
const SPIKE_DAMAGE = 40;

function pointInsideRect(px, py, x, y, w, h) {
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

export function updateTraps(state, dt) {
  const { player, traps } = state;
  if (!traps || traps.length === 0) return;

  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;

  let onGlue = false;
  let inFireZone = false;
  let justHitSpike = false;

  traps.forEach((t) => {
    const inside = pointInsideRect(px, py, t.x, t.y, t.w, t.h);
    if (!inside) return;

    if (t.type === "glue") {
      onGlue = true;
    } else if (t.type === "fire") {
      inFireZone = true;
    } else if (t.type === "spike") {
      justHitSpike = true;
    } else if (t.type === "poison") {
      // apply or refresh poison effect
      player.poisonTimer = Math.max(player.poisonTimer || 0, POISON_DURATION);
    }
  });

  // GLUE: slow movement while standing in it
  player.slowFactor = onGlue ? 0.5 : 1;

  // FIRE: direct damage per second only while standing in fire
  if (inFireZone) {
    applyTrapDamage(state, FIRE_DPS * dt);
  }

  // POISON: continuous damage over time for a duration
  if (player.poisonTimer && player.poisonTimer > 0) {
    player.poisonTimer -= dt;
    if (player.poisonTimer < 0) player.poisonTimer = 0;

    applyTrapDamage(state, POISON_DPS * dt);
  }

  // SPIKES: large instant damage when touching
  if (justHitSpike) {
    applyTrapDamage(state, SPIKE_DAMAGE);
  }

  // status flag for HUD
  player.onFire = inFireZone;
}

// Trap damage helper (shares shield logic, no i-frames here)
function applyTrapDamage(state, amount) {
  const player = state.player;
  if (state.gameOver || state.gameWon) return;
  if (amount <= 0) return;

  // Shield blocks one trap event completely
  if (player.shieldTimer > 0) {
    player.shieldTimer = 0;
    return;
  }

  player.health -= amount;
  if (player.health <= 0) {
    player.health = 0;
    handlePlayerDeath(state);
  }
}
