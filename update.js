// update.js
// All per-frame game logic (player, enemies, powerups, traps, portal)

import { advanceToNextLevel, playerHit } from "./state.js";

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

function updatePlayer(state, dt) {
  const { player, currentLevel, fieldWidth, fieldHeight, keys } = state;
  const oldX = player.x;
  const oldY = player.y;

  let moveX = 0;
  let moveY = 0;

  if (keys["ArrowLeft"] || keys["a"]) moveX -= 1;
  if (keys["ArrowRight"] || keys["d"]) moveX += 1;
  if (keys["ArrowUp"] || keys["w"]) moveY -= 1;
  if (keys["ArrowDown"] || keys["s"]) moveY += 1;

  if (moveX !== 0 || moveY !== 0) {
    const len = Math.sqrt(moveX * moveX + moveY * moveY);
    moveX /= len;
    moveY /= len;

    player.x += moveX * player.speed;
    player.y += moveY * player.speed;

    player.lastMoveDirX = moveX;
    player.lastMoveDirY = moveY;
  }

  player.x = Math.max(0, Math.min(fieldWidth - player.w, player.x));
  player.y = Math.max(0, Math.min(fieldHeight - player.h, player.y));

  // collide with walls
  for (const obs of currentLevel.obstacles) {
    if (rectsOverlap(player, obs)) {
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

  // collide with locked doors
  for (let i = state.doors.length - 1; i >= 0; i--) {
    const door = state.doors[i];

    if (rectsOverlap(player, door)) {
      if (state.hasKey) {
        // use key to unlock door
        state.hasKey = false;
        state.doors.splice(i, 1); // remove door
      } else {
        // treat as wall
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
} // 👈 this was missing

function updateEnemies(state, dt) {
  const { enemies, currentLevel, player } = state;
  const obstacles = currentLevel.obstacles;

  enemies.forEach((e) => {
    const oldX = e.x;
    const oldY = e.y;

    if (e.type === "patrol") {
      e.x += e.vx;
      if (e.x < 0 || e.x + e.w > state.fieldWidth) {
        e.vx *= -1;
        e.x = Math.max(0, Math.min(state.fieldWidth - e.w, e.x));
      }
    } else if (e.type === "chaser") {
      const playerCenterX = player.x + player.w / 2;
      const playerCenterY = player.y + player.h / 2;
      const enemyCenterX = e.x + e.w / 2;
      const enemyCenterY = e.y + e.h / 2;

      const dx = playerCenterX - enemyCenterX;
      const dy = playerCenterY - enemyCenterY;

      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const stepX = (dx / len) * e.speed;
      const stepY = (dy / len) * e.speed;

      e.x += stepX;
      e.y += stepY;
    } else if (e.type === "spinner") {
      if (e.angle == null) e.angle = 0;
      if (e.angularSpeed == null) e.angularSpeed = 1.5;
      if (e.radius == null) e.radius = 60;
      if (e.cx == null) e.cx = state.fieldWidth / 2;
      if (e.cy == null) e.cy = state.fieldHeight / 2;

      e.angle += e.angularSpeed * dt;

      const ex = e.cx + Math.cos(e.angle) * e.radius;
      const ey = e.cy + Math.sin(e.angle) * e.radius;

      e.x = ex - e.w / 2;
      e.y = ey - e.h / 2;
    }

    for (const obs of obstacles) {
      if (rectsOverlap(e, obs)) {
        e.x = oldX;
        e.y = oldY;
        if (e.type === "patrol") {
          e.vx *= -1;
        }
      }
    }

    if (rectsOverlap(player, e)) {
      playerHit(state, 1, 50);
    }
  });
}

function updatePowerups(state, dt) {
  const { player, powerups } = state;

  if (player.speedBoostTimer > 0) {
    player.speedBoostTimer -= dt;
    if (player.speedBoostTimer <= 0) {
      player.speedBoostTimer = 0;
      player.speed = player.baseSpeed * (player.isSlowed ? 0.5 : 1);
    }
  }

  if (player.shieldTimer > 0) {
    player.shieldTimer -= dt;
    if (player.shieldTimer <= 0) {
      player.shieldTimer = 0;
    }
  }

  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;

  for (let i = powerups.length - 1; i >= 0; i--) {
    const p = powerups[i];
    const d = distance(px, py, p.x, p.y);

    if (d < p.r + Math.min(player.w, player.h) / 2) {
      if (p.type === "speed") {
        player.speedBoostTimer = 5;
        const boostFactor = 1.8;
        const slowFactor = player.isSlowed ? 0.5 : 1;
        player.speed = player.baseSpeed * boostFactor * slowFactor;
      } else if (p.type === "shield") {
        player.shieldTimer = 5;
      } else if (p.type === "dash") {
        player.dashCharges = (player.dashCharges || 0) + 3;
      }

      state.score += 25;
      powerups.splice(i, 1);
    }
  }
}

function updateTraps(state, dt) {
  const { player, traps } = state;

  if (player.hazardInvulnTimer > 0) {
    player.hazardInvulnTimer -= dt;
    if (player.hazardInvulnTimer < 0) player.hazardInvulnTimer = 0;
  }

  let wasSlowed = player.isSlowed;
  let isOnGlueNow = false;

  const px = player.x + player.w / 2;
  const py = player.y + player.w / 2;

  traps.forEach((t) => {
    const inside =
      px >= t.x &&
      px <= t.x + t.w &&
      py >= t.y &&
      py <= t.y + t.h;

    if (!inside) return;

    if (t.type === "glue") {
      isOnGlueNow = true;
    } else if (t.type === "fire") {
      playerHit(state, 1, 25);
    } else if (t.type === "spike") {
      playerHit(state, 1, 75);
    } else if (t.type === "poison") {
      player.poisonTimer = 3; // seconds
    }
  });

  if (isOnGlueNow && !wasSlowed) {
    player.isSlowed = true;
    const slowFactor = 0.5;
    const boostFactor = player.speedBoostTimer > 0 ? 1.8 : 1;
    player.speed = player.baseSpeed * slowFactor * boostFactor;
  } else if (!isOnGlueNow && wasSlowed) {
    player.isSlowed = false;
    const boostFactor = player.speedBoostTimer > 0 ? 1.8 : 1;
    player.speed = player.baseSpeed * boostFactor;
  }

  if (player.poisonTimer > 0) {
    player.poisonTimer -= dt;
    if (player.poisonTimer < 0) player.poisonTimer = 0;
    state.timeLeft = Math.max(0, state.timeLeft - dt * 0.5);
  }
}

function updateKeys(state, dt) {
  const { player, keyItems } = state;
  if (!keyItems || keyItems.length === 0) return;

  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;

  for (let i = keyItems.length - 1; i >= 0; i--) {
    const k = keyItems[i];
    const d = distance(px, py, k.x, k.y);

    if (d < k.r + Math.min(player.w, player.h) / 2) {
      state.hasKey = true;
      keyItems.splice(i, 1);
      state.score += 50;
    }
  }
}

function updateSwitches(state, dt) {
  const { player, switches, doors } = state;
  if (!switches || switches.length === 0) return;
  if (!doors || doors.length === 0) return;

  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;

  switches.forEach((sw) => {
    if (sw.activated) return;

    const inside =
      px >= sw.x &&
      px <= sw.x + sw.w &&
      py >= sw.y &&
      py <= sw.y + sw.h;

    if (!inside) return;

    // Activate the switch
    sw.activated = true;

    // Open doors that match any of sw.doorIds
    if (sw.doorIds && sw.doorIds.length > 0) {
      for (let i = doors.length - 1; i >= 0; i--) {
        const d = doors[i];
        if (d.id && sw.doorIds.includes(d.id)) {
          doors.splice(i, 1); // remove door (permanently open)
        }
      }
    }
  });
}

function checkPortalCollision(state) {
  const { player, currentLevel } = state;
  const portal = currentLevel.portal;

  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;

  if (distance(px, py, portal.x, portal.y) < portal.r) {
    state.score += 150;
    advanceToNextLevel(state);
  }
}

export function tryDash(state) {
  const { player, currentLevel, fieldWidth, fieldHeight } = state;

  if (state.gameOver || state.gameWon) return;
  if (!player.dashCharges || player.dashCharges <= 0) return;

  let dirX = player.lastMoveDirX;
  let dirY = player.lastMoveDirY;

  if (dirX === 0 && dirY === 0) return;

  const dashDistance = 80;
  const steps = 8;
  const stepX = (dirX * dashDistance) / steps;
  const stepY = (dirY * dashDistance) / steps;

  const obstacles = currentLevel.obstacles;

  for (let i = 0; i < steps; i++) {
    const oldX = player.x;
    const oldY = player.y;

    player.x += stepX;
    player.y += stepY;

    player.x = Math.max(0, Math.min(fieldWidth - player.w, player.x));
    player.y = Math.max(0, Math.min(fieldHeight - player.h, player.y));

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

  player.hazardInvulnTimer = Math.max(player.hazardInvulnTimer, 0.2);
}

export function update(state, dt) {
  if (state.gameOver || state.gameWon) return;

  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.gameOver = true;
    return;
  }

  updatePlayer(state, dt);
  updateEnemies(state, dt);
  updatePowerups(state, dt);
  updateTraps(state, dt);
  updateKeys(state, dt);
  updateSwitches(state, dt);
  checkPortalCollision(state);
}