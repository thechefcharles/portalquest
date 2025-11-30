// =======================================================
// PORTAL ESCAPE - Traps (Glue / Fire / Poison / Spikes)
// =======================================================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const FIELD_WIDTH = canvas.width;
const FIELD_HEIGHT = canvas.height;

const MAX_LIVES = 3;

// ---------- INPUT ----------
const keys = {};
function handleKeyDown(e) {
  keys[e.key] = true;

  // Allow R to reset when game is over / won
  if ((gameOver || gameWon) && (e.key === "r" || e.key === "R")) {
    resetGame();
  }
}
function handleKeyUp(e) {
  keys[e.key] = false;
}
window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

// ---------- LEVEL DATA ----------
// start, portal, enemies, obstacles, powerups, traps

const levels = [
  {
    // Level 0 - corridor, patrol enemy, speed boost, glue patch, spike
    start: { x: 40, y: FIELD_HEIGHT - 60 },
    portal: { x: FIELD_WIDTH - 60, y: 60, r: 18 },
    enemies: [
      { type: "patrol", x: 250, y: 260, w: 20, h: 20, vx: 2 }
    ],
    obstacles: [
      // horizontal walls (bottom split to create doorway)
      { x: 80,  y: 320, w: 160, h: 20 },
      { x: 340, y: 320, w: 160, h: 20 },
      { x: 80,  y: 220, w: 180, h: 20 },
      { x: 320, y: 220, w: 180, h: 20 },
      { x: 80,  y: 140, w: 420, h: 20 },

      // vertical blockers
      { x: 80,  y: 160, w: 20,  h: 160 },
      { x: 480, y: 160, w: 20,  h: 160 }
    ],
    powerups: [
      // bottom lane, reachable
      { type: "speed", x: 220, y: FIELD_HEIGHT - 70, r: 10 }
    ],
    traps: [
      // glue patch in inner corridor
      { type: "glue",  x: 260, y: 240, w: 60, h: 40 },
      // spike near portal path
      { type: "spike", x: FIELD_WIDTH - 130, y: 260, w: 20, h: 20 }
    ]
  },
  {
    // Level 1 - maze, patrol + chaser, shield, fire & poison
    start: { x: FIELD_WIDTH - 80, y: FIELD_HEIGHT - 60 },
    portal: { x: 80, y: 60, r: 18 },
    enemies: [
      { type: "patrol", x: 220, y: 260, w: 20, h: 20, vx: 2.5 },
      { type: "chaser", x: 260, y: 210, w: 20, h: 20, speed: 1.5 }
    ],
    obstacles: [
      // outer frame-ish (bottom split for doorway)
      { x: 60,  y: 100, w: 440, h: 20 },
      { x: 60,  y: 300, w: 160, h: 20 },
      { x: 340, y: 300, w: 160, h: 20 },
      { x: 60,  y: 100, w: 20,  h: 220 },
      { x: 480, y: 120, w: 20,  h: 200 },

      // inner maze bits
      { x: 160, y: 180, w: 220, h: 20 },
      { x: 160, y: 220, w: 20,  h: 80 },
      { x: 360, y: 180, w: 20,  h: 80 }
    ],
    powerups: [
      { type: "shield", x: 330, y: 260, r: 10 }
    ],
    traps: [
      // fire strip near center
      { type: "fire",   x: 260, y: 200, w: 40, h: 20 },
      // poison pool on the way to portal
      { type: "poison", x: 140, y: 260, w: 40, h: 30 }
    ]
  }
];

let currentLevelIndex = 0;
let currentLevel = levels[currentLevelIndex];

// ---------- PLAYER ----------
const player = {
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
  hazardInvulnTimer: 0 // brief invuln after hits
};

function placePlayerAtStart() {
  player.x = currentLevel.start.x;
  player.y = currentLevel.start.y;
}

// ---------- ENEMY / POWER-UP / TRAP STATE ----------
let enemies = [];
let powerups = [];
let traps = [];

// ---------- GAME STATE ----------
let timeLeft = 90;
let score = 0;
let lives = MAX_LIVES;
let gameOver = false;
let gameWon = false;

let lastTime = 0;

// ---------- RESET BUTTON ----------
const resetButton = {
  x: FIELD_WIDTH / 2 - 60,
  y: FIELD_HEIGHT / 2 + 40,
  w: 120,
  h: 30
};

canvas.addEventListener("click", (e) => {
  if (!gameOver && !gameWon) return;

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  if (
    mx >= resetButton.x &&
    mx <= resetButton.x + resetButton.w &&
    my >= resetButton.y &&
    my <= resetButton.y + resetButton.h
  ) {
    resetGame();
  }
});

// ---------- UTILS ----------
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

// For validation while designing
function validateEnemiesNotInWalls() {
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

function validatePowerupsNotInWalls() {
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

function validateTrapsNotInWalls() {
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

// Generic damage handler (used by enemies & traps)
function playerHit(damage = 1, scorePenalty = 50) {
  if (gameOver || gameWon) return;

  // shield absorbs
  if (player.shieldTimer > 0) {
    player.shieldTimer = 0;
    player.hazardInvulnTimer = 0.5;
    return;
  }

  // brief invulnerability so we don't chain-hit
  if (player.hazardInvulnTimer > 0) return;

  lives = Math.max(0, lives - damage);
  score = Math.max(0, score - scorePenalty);

  if (lives <= 0) {
    lives = 0;
    gameOver = true;
  } else {
    placePlayerAtStart();
    player.hazardInvulnTimer = 1.0; // 1 sec invuln
  }
}

// ---------- LEVEL LOADING / RESET ----------

function loadLevel(index) {
  currentLevelIndex = index;
  currentLevel = levels[currentLevelIndex];

  enemies = currentLevel.enemies.map(e => ({ ...e }));
  powerups = currentLevel.powerups
    ? currentLevel.powerups.map(p => ({ ...p }))
    : [];
  traps = currentLevel.traps
    ? currentLevel.traps.map(t => ({ ...t }))
    : [];

  validateEnemiesNotInWalls();
  validatePowerupsNotInWalls();
  validateTrapsNotInWalls();
  placePlayerAtStart();
}

function advanceToNextLevel() {
  const nextIndex = currentLevelIndex + 1;
  if (nextIndex < levels.length) {
    loadLevel(nextIndex);
  } else {
    gameWon = true;
  }
}

function resetGame() {
  score = 0;
  lives = MAX_LIVES;
  timeLeft = 90;
  gameOver = false;
  gameWon = false;

  player.speedBoostTimer = 0;
  player.shieldTimer = 0;
  player.isSlowed = false;
  player.poisonTimer = 0;
  player.hazardInvulnTimer = 0;
  player.speed = player.baseSpeed;

  loadLevel(0);
}

// ---------- UPDATE LOGIC ----------

function updatePlayer(dt) {
  const oldX = player.x;
  const oldY = player.y;

  if (keys["ArrowLeft"] || keys["a"])  player.x -= player.speed;
  if (keys["ArrowRight"] || keys["d"]) player.x += player.speed;
  if (keys["ArrowUp"] || keys["w"])    player.y -= player.speed;
  if (keys["ArrowDown"] || keys["s"])  player.y += player.speed;

  player.x = Math.max(0, Math.min(FIELD_WIDTH - player.w, player.x));
  player.y = Math.max(0, Math.min(FIELD_HEIGHT - player.h, player.y));

  const obstacles = currentLevel.obstacles;
  for (const obs of obstacles) {
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
}

function updateEnemies(dt) {
  const obstacles = currentLevel.obstacles;

  enemies.forEach((e) => {
    const oldX = e.x;
    const oldY = e.y;

    if (e.type === "patrol") {
      e.x += e.vx;
      if (e.x < 0 || e.x + e.w > FIELD_WIDTH) {
        e.vx *= -1;
        e.x = Math.max(0, Math.min(FIELD_WIDTH - e.w, e.x));
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

    // Enemy hits player
    if (rectsOverlap(player, e)) {
      playerHit(1, 50);
    }
  });
}

function updatePowerups(dt) {
  // timers
  if (player.speedBoostTimer > 0) {
    player.speedBoostTimer -= dt;
    if (player.speedBoostTimer <= 0) {
      player.speedBoostTimer = 0;
      // if slowed by glue, stay slow, otherwise normal
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
      }

      score += 25;
      powerups.splice(i, 1);
    }
  }
}

function updateTraps(dt) {
  if (player.hazardInvulnTimer > 0) {
    player.hazardInvulnTimer -= dt;
    if (player.hazardInvulnTimer < 0) player.hazardInvulnTimer = 0;
  }

  let wasSlowed = player.isSlowed;
  let isOnGlueNow = false;

  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;

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
      // fire: hurts on contact
      playerHit(1, 25);
    } else if (t.type === "spike") {
      // spike: big penalty
      playerHit(1, 75);
    } else if (t.type === "poison") {
      // poison: drains time over a short period
      player.poisonTimer = 3; // seconds
    }
  });

  // handle glue slow effect
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

  // poison drains time while active
  if (player.poisonTimer > 0) {
    player.poisonTimer -= dt;
    if (player.poisonTimer < 0) player.poisonTimer = 0;
    timeLeft = Math.max(0, timeLeft - dt * 0.5); // slower drain than 1:1
  }
}

function checkPortalCollision() {
  const portal = currentLevel.portal;
  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;

  if (distance(px, py, portal.x, portal.y) < portal.r) {
    score += 150;
    advanceToNextLevel();
  }
}

function update(dt) {
  if (gameOver || gameWon) return;

  timeLeft -= dt;
  if (timeLeft <= 0) {
    timeLeft = 0;
    gameOver = true;
    return;
  }

  updatePlayer(dt);
  updateEnemies(dt);
  updatePowerups(dt);
  updateTraps(dt);
  checkPortalCollision();
}

// ---------- DRAWING ----------

function drawField() {
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 1;
  for (let y = 40; y < FIELD_HEIGHT; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(FIELD_WIDTH, y);
    ctx.stroke();
  }
}

function drawObstacles() {
  const obstacles = currentLevel.obstacles;
  ctx.fillStyle = "#222";
  obstacles.forEach((o) => {
    ctx.fillRect(o.x, o.y, o.w, o.h);
  });
}

function drawPlayer() {
  if (player.shieldTimer > 0) {
    ctx.fillStyle = "rgba(0, 255, 255, 0.3)";
    ctx.fillRect(player.x - 4, player.y - 4, player.w + 8, player.h + 8);
  }

  ctx.fillStyle = "orange";
  ctx.fillRect(player.x, player.y, player.w, player.h);
}

function drawEnemies() {
  enemies.forEach((e) => {
    if (e.type === "patrol") {
      ctx.fillStyle = "purple";
    } else if (e.type === "chaser") {
      ctx.fillStyle = "red";
    } else {
      ctx.fillStyle = "gray";
    }
    ctx.fillRect(e.x, e.y, e.w, e.h);
  });
}

function drawPortal() {
  const portal = currentLevel.portal;
  const gradient = ctx.createRadialGradient(
    portal.x, portal.y, 4,
    portal.x, portal.y, portal.r
  );
  gradient.addColorStop(0, "#00fff0");
  gradient.addColorStop(1, "#004466");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(portal.x, portal.y, portal.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawPowerups() {
  powerups.forEach((p) => {
    if (p.type === "speed") {
      const g = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.r);
      g.addColorStop(0, "#fff7b0");
      g.addColorStop(1, "#d4a600");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === "shield") {
      const g = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.r);
      g.addColorStop(0, "#c0faff");
      g.addColorStop(1, "#00a3b8");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
}

function drawTraps() {
  traps.forEach((t) => {
    if (t.type === "glue") {
      ctx.fillStyle = "rgba(150, 200, 255, 0.8)";
    } else if (t.type === "fire") {
      ctx.fillStyle = "rgba(255, 120, 0, 0.9)";
    } else if (t.type === "poison") {
      ctx.fillStyle = "rgba(0, 200, 80, 0.9)";
    } else if (t.type === "spike") {
      ctx.fillStyle = "rgba(220, 220, 220, 0.95)";
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    }
    ctx.fillRect(t.x, t.y, t.w, t.h);
  });
}

function drawResetButton() {
  if (!gameOver && !gameWon) return;

  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(resetButton.x, resetButton.y, resetButton.w, resetButton.h);

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.strokeRect(resetButton.x, resetButton.y, resetButton.w, resetButton.h);

  ctx.fillStyle = "#ffffff";
  ctx.font = "14px monospace";
  ctx.fillText(
    "RESET (R)",
    resetButton.x + 15,
    resetButton.y + 20
  );
}

function drawHUD() {
  ctx.fillStyle = "white";
  ctx.font = "14px monospace";
  ctx.fillText(`LEVEL: ${currentLevelIndex + 1}`, 10, FIELD_HEIGHT - 100);
  ctx.fillText(`TIME: ${timeLeft.toFixed(1)}`, 10, FIELD_HEIGHT - 85);
  ctx.fillText(`SCORE: ${score}`, 10, FIELD_HEIGHT - 70);
  ctx.fillText(`LIVES: ${lives}`, 10, FIELD_HEIGHT - 55);

  let statusPieces = [];
  if (player.speedBoostTimer > 0) statusPieces.push("SPEED");
  if (player.shieldTimer > 0) statusPieces.push("SHIELD");
  if (player.isSlowed) statusPieces.push("GLUE");
  if (player.poisonTimer > 0) statusPieces.push("POISON");

  const statusText =
    statusPieces.length === 0 ? "Status: normal" : `Status: ${statusPieces.join(" + ")}`;

  ctx.fillText(statusText, 10, FIELD_HEIGHT - 40);
  ctx.fillText(`WASD / Arrows to move`, 10, FIELD_HEIGHT - 25);
  ctx.fillText(`R or button to reset`, 10, FIELD_HEIGHT - 10);

  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "24px monospace";
    ctx.fillText("GAME OVER", FIELD_WIDTH / 2 - 80, FIELD_HEIGHT / 2);
  } else if (gameWon) {
    ctx.fillStyle = "yellow";
    ctx.font = "24px monospace";
    ctx.fillText("YOU ESCAPED!", FIELD_WIDTH / 2 - 90, FIELD_HEIGHT / 2);
  }

  drawResetButton();
}

// ---------- MAIN LOOP ----------

function loop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  ctx.clearRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);

  drawField();
  drawObstacles();
  drawTraps();
  drawPortal();
  drawPowerups();
  drawEnemies();
  drawPlayer();
  drawHUD();
  update(dt);

  requestAnimationFrame(loop);
}

// Start the first level and game loop
loadLevel(0);
requestAnimationFrame(loop);