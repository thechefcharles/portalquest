// src/engine/systems/dashSystem.js
// Handles dash movement when triggered (Space key)

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export function tryDash(state) {
  const player = state.player;
  if (state.gameOver || state.gameWon) return;
  if (!player.dashCharges || player.dashCharges <= 0) return;

  let dirX = player.lastMoveDirX;
  let dirY = player.lastMoveDirY;

  // If we haven't moved yet, dash to the right by default
  if (dirX === 0 && dirY === 0) {
    dirX = 1;
  }

  const dashDistance = 80; // pixels
  const steps = 8;
  const stepX = (dirX * dashDistance) / steps;
  const stepY = (dirY * dashDistance) / steps;

  const obstacles = state.obstacles;

  for (let i = 0; i < steps; i++) {
    const oldX = player.x;
    const oldY = player.y;

    player.x += stepX;
    player.y += stepY;

    // Clamp to canvas
    player.x = Math.max(0, Math.min(state.width - player.w, player.x));
    player.y = Math.max(0, Math.min(state.height - player.h, player.y));

    let collided = false;
    for (const obs of obstacles) {
      if (rectsOverlap(player, obs)) {
        collided = true;
        break;
      }
    }

    if (collided) {
      player.x = oldX;
      player.y = oldY;
      break;
    }
  }

  player.dashCharges -= 1;
  if (player.dashCharges < 0) player.dashCharges = 0;

  // brief invulnerability while dashing
  player.hazardInvulnTimer = Math.max(player.hazardInvulnTimer || 0, 0.2);
}