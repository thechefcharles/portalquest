// src/engine/systems/projectileSystem.js
// Shooting + projectiles + projectile collisions (walls + enemies)

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

// projectile is a circle-ish; use a small AABB for cheap collision
function projectileAABB(p) {
  return {
    x: p.x - p.r,
    y: p.y - p.r,
    w: p.r * 2,
    h: p.r * 2,
  };
}

export function tryShoot(state) {
  // Only shoot while actively playing a quest (or creator test run)
  if (!state.quest || state.quest.status !== "playing") return;
  if (state.isPaused) return;

  const player = state.player;

  // Stop firing during dash (we'll formalize dash state in Phase 2)
  if (player.dashTimer > 0) return;

  const now = performance.now() / 1000;

  // Semi-auto + cooldown
  const weapon = state.weapon;
  if (!weapon) return;

  if (now - weapon.lastShotTime < weapon.cooldown) return;

  // Ammo (Phase 1: supports finite ammo; you can keep Infinity for now)
  if (Number.isFinite(player.ammo) && player.ammo <= 0) return;

  // Facing direction from last move
  let dx = player.lastMoveDirX ?? 1;
  let dy = player.lastMoveDirY ?? 0;

  // Avoid NaN / zero vector
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  dx /= len;
  dy /= len;

  // Spawn from player center
  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;

  const p = {
    x: px,
    y: py,
    vx: dx * weapon.projectileSpeed,
    vy: dy * weapon.projectileSpeed,
    r: weapon.projectileRadius,
    damage: weapon.damage,
    life: weapon.projectileLife,
    // bullet passes through enemies: track which enemies we've already hit
    hitSet: new Set(),
    dead: false,
  };

  state.projectiles.push(p);
  weapon.lastShotTime = now;

  if (Number.isFinite(player.ammo)) {
    player.ammo -= 1;
    if (player.ammo < 0) player.ammo = 0;
  }
}

export function updateProjectiles(state, dt) {
  const obstacles = state.obstacles || [];
  const projectiles = state.projectiles || [];

  for (const p of projectiles) {
    if (p.dead) continue;

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    p.life -= dt;
    if (p.life <= 0) {
      p.dead = true;
      continue;
    }

    // Stop at walls
    const box = projectileAABB(p);
    for (const obs of obstacles) {
      if (rectsOverlap(box, obs)) {
        p.dead = true;
        break;
      }
    }

    // Optional: also kill if off-canvas (prevents infinite travel)
    if (
      p.x < -50 || p.x > state.width + 50 ||
      p.y < -50 || p.y > state.height + 50
    ) {
      p.dead = true;
    }
  }

  // Compact array
  state.projectiles = projectiles.filter((p) => !p.dead);
}

export function handleProjectileEnemyCollisions(state) {
  const enemies = state.enemies || [];
  const projectiles = state.projectiles || [];

  if (!enemies.length || !projectiles.length) return;

  for (const p of projectiles) {
    if (p.dead) continue;

    const box = projectileAABB(p);

    for (const e of enemies) {
      if (e.dead) continue;

      // Require stable id on enemies
      const id = e._id;
      if (id == null) continue;

      // Bullet passes through enemies: only apply damage once per enemy per bullet
      if (p.hitSet && p.hitSet.has(id)) continue;

      if (rectsOverlap(box, e)) {
        p.hitSet.add(id);

        e.hp -= p.damage;
        if (e.hp <= 0) {
          e.hp = 0;
          e.dead = true;
        }
      }
    }
  }

  // Remove dead enemies
  state.enemies = enemies.filter((e) => !e.dead);
}