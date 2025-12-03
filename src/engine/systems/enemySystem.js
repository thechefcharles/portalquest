// src/engine/systems/enemySystem.js
// Handles enemy movement and damage to the player

import { handlePlayerDeath } from "../../modes/questMode.js";


function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export function updateEnemies(state, dt) {
  const { enemies, player } = state;
  const obstacles = state.obstacles;

  enemies.forEach((e) => {
    const oldX = e.x;
    const oldY = e.y;

    if (e.type === "patrol") {
      const axis = e.axis || "horizontal";
      const vx = e.vx ?? 1.5;

      if (axis === "horizontal") {
        e.x += vx;
        // Bounce on canvas edges
        if (e.x < 0 || e.x + e.w > state.width) {
          e.vx = -vx;
          e.x = Math.max(0, Math.min(state.width - e.w, e.x));
        }
      } else {
        e.y += vx;
        if (e.y < 0 || e.y + e.h > state.height) {
          e.vx = -vx;
          e.y = Math.max(0, Math.min(state.height - e.h, e.y));
        }
      }
    } else if (e.type === "chaser") {
      const playerCenterX = player.x + player.w / 2;
      const playerCenterY = player.y + player.h / 2;
      const enemyCenterX = e.x + e.w / 2;
      const enemyCenterY = e.y + e.h / 2;

      const dx = playerCenterX - enemyCenterX;
      const dy = playerCenterY - enemyCenterY;

      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const stepX = (dx / len) * (e.speed ?? 1.2);
      const stepY = (dy / len) * (e.speed ?? 1.2);

      e.x += stepX;
      e.y += stepY;
    } else if (e.type === "spinner") {
      if (e.angle == null) e.angle = 0;
      const radius = e.radius ?? 40;
      const angularSpeed = e.angularSpeed ?? 1.8;

      e.angle += angularSpeed * dt;

      const ex = e.cx + Math.cos(e.angle) * radius;
      const ey = e.cy + Math.sin(e.angle) * radius;

      e.x = ex - e.w / 2;
      e.y = ey - e.h / 2;
    }

    // Bounce patrol off solid walls
    for (const obs of obstacles) {
      if (!rectsOverlap(e, obs)) continue;

      e.x = oldX;
      e.y = oldY;
      if (e.type === "patrol") {
        e.vx = -(e.vx ?? 1.5);
      }
    }
  });
}

// Damage: player touching enemies
export function handlePlayerEnemyCollisions(state, dt) {
  const { player, enemies } = state;

  enemies.forEach((e) => {
    if (!rectsOverlap(player, e)) return;

    const damage = 20;

    // Already invincible from a recent hit?
    if (player.hazardInvulnTimer > 0) return;

    // Shield active? Consume shield instead of reducing health
    if (player.shieldTimer > 0) {
      player.shieldTimer = 0;
      player.hazardInvulnTimer = 0.3;
      return;
    }

    player.health -= damage;
    player.hazardInvulnTimer = 0.5; // seconds of invuln after a hit

    if (player.health <= 0) {
      player.health = 0;
      handlePlayerDeath(state);
    }
  });

  // Tick invuln timer down
  if (player.hazardInvulnTimer > 0) {
    player.hazardInvulnTimer -= dt;
    if (player.hazardInvulnTimer < 0) player.hazardInvulnTimer = 0;
  }
}
