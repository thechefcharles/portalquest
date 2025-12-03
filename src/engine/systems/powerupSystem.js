// src/engine/systems/powerupSystem.js
// Handles powerup pickup and effect timers

function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function updatePowerups(state, dt) {
  const { player, powerups } = state;

  // Tick existing timers
  if (player.speedBoostTimer > 0) {
    player.speedBoostTimer -= dt;
    if (player.speedBoostTimer < 0) player.speedBoostTimer = 0;
  }

  if (player.shieldTimer > 0) {
    player.shieldTimer -= dt;
    if (player.shieldTimer < 0) player.shieldTimer = 0;
  }

  // Apply speed buff to speed used by movement system
  // (movement system can look at player.speedBoostTimer to adjust speed factor)

  // Check for pickups
  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;

  for (let i = powerups.length - 1; i >= 0; i--) {
    const p = powerups[i];
    const d = distance(px, py, p.x, p.y);

    if (d < (p.r || 10) + Math.min(player.w, player.h) / 2) {
      if (p.type === "speed") {
        player.speedBoostTimer = 4; // seconds
      } else if (p.type === "shield") {
        player.shieldTimer = 5;
      } else if (p.type === "dash") {
        player.dashCharges = (player.dashCharges || 0) + 3;
      }

      // Increase score slightly and remove powerup
      state.score += 25;
      powerups.splice(i, 1);
    }
  }
}