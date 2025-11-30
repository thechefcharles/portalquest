// render.js
// All drawing logic (field, obstacles, traps, actors, HUD, reset button)

export function draw(state) {
  const { ctx, fieldWidth, fieldHeight } = state;

  // clear is done in main.js; this just draws
  drawField(state);
  drawObstacles(state);
  drawTraps(state);
  drawPortal(state);
  drawPowerups(state);
  drawEnemies(state);
  drawPlayer(state);
  drawHUD(state);
}

function drawField(state) {
  const { ctx, fieldHeight, fieldWidth } = state;
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 1;
  for (let y = 40; y < fieldHeight; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(fieldWidth, y);
    ctx.stroke();
  }
}

function drawObstacles(state) {
  const { ctx, currentLevel } = state;
  ctx.fillStyle = "#222";
  currentLevel.obstacles.forEach((o) => {
    ctx.fillRect(o.x, o.y, o.w, o.h);
  });
}

function drawPlayer(state) {
  const { ctx, player } = state;

  if (player.shieldTimer > 0) {
    ctx.fillStyle = "rgba(0, 255, 255, 0.3)";
    ctx.fillRect(player.x - 4, player.y - 4, player.w + 8, player.h + 8);
  }

  ctx.fillStyle = "orange";
  ctx.fillRect(player.x, player.y, player.w, player.h);
}

function drawEnemies(state) {
  const { ctx, enemies } = state;
  enemies.forEach((e) => {
    if (e.type === "patrol") {
      ctx.fillStyle = "purple";
    } else if (e.type === "chaser") {
      ctx.fillStyle = "red";
    } else if (e.type === "spinner") {
      ctx.fillStyle = "#00ffcc";
    } else {
      ctx.fillStyle = "gray";
    }
    ctx.fillRect(e.x, e.y, e.w, e.h);
  });
}

function drawPortal(state) {
  const { ctx, currentLevel } = state;
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

function drawPowerups(state) {
  const { ctx, powerups } = state;
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
    } else if (p.type === "dash") {
      const g = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.r);
      g.addColorStop(0, "#c0d8ff");
      g.addColorStop(1, "#2b5cff");
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

function drawTraps(state) {
  const { ctx, traps } = state;
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

function drawResetButton(state) {
  const { ctx, resetButton, gameOver, gameWon } = state;
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

function drawHUD(state) {
  const { ctx, fieldHeight, fieldWidth, currentLevelIndex, timeLeft, score, lives, player, gameOver, gameWon } = state;

  ctx.fillStyle = "white";
  ctx.font = "14px monospace";
  ctx.fillText(`LEVEL: ${currentLevelIndex + 1}`, 10, fieldHeight - 115);
  ctx.fillText(`TIME: ${timeLeft.toFixed(1)}`, 10, fieldHeight - 100);
  ctx.fillText(`SCORE: ${score}`, 10, fieldHeight - 85);
  ctx.fillText(`LIVES: ${lives}`, 10, fieldHeight - 70);
  ctx.fillText(`DASH: ${player.dashCharges || 0}`, 10, fieldHeight - 55);

  let statusPieces = [];
  if (player.speedBoostTimer > 0) statusPieces.push("SPEED");
  if (player.shieldTimer > 0) statusPieces.push("SHIELD");
  if (player.isSlowed) statusPieces.push("GLUE");
  if (player.poisonTimer > 0) statusPieces.push("POISON");

  const statusText =
    statusPieces.length === 0 ? "Status: normal" : `Status: ${statusPieces.join(" + ")}`;

  ctx.fillText(statusText, 10, fieldHeight - 40);
  ctx.fillText(`WASD / Arrows: move`, 10, fieldHeight - 25);
  ctx.fillText(`Space: dash | R: reset`, 10, fieldHeight - 10);

  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "24px monospace";
    ctx.fillText("GAME OVER", fieldWidth / 2 - 80, fieldHeight / 2);
  } else if (gameWon) {
    ctx.fillStyle = "yellow";
    ctx.font = "24px monospace";
    ctx.fillText("YOU ESCAPED!", fieldWidth / 2 - 90, fieldHeight / 2);
  }

  drawResetButton(state);
}