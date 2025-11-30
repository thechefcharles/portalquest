// render.js
// All drawing logic (field, obstacles, traps, actors, HUD, reset button)

export function draw(state) {
  // clear is done in main.js; this just draws
  drawField(state);
  drawObstacles(state);
  drawDoors(state);
  drawTraps(state);
   drawSwitches(state);
  drawPortal(state);
  drawPowerups(state);
  drawKeys(state);
  drawEnemies(state);
  drawPlayer(state);
}

/* -------------------------- FIELD / BACKGROUND -------------------------- */

function drawField(state) {
  const { ctx, fieldHeight, fieldWidth } = state;

  // subtle dark gradient background
  const bg = ctx.createLinearGradient(0, 0, 0, fieldHeight);
  bg.addColorStop(0, "#050914");
  bg.addColorStop(1, "#020308");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, fieldWidth, fieldHeight);

  // neon grid lines
  ctx.strokeStyle = "rgba(80, 130, 200, 0.35)";
  ctx.lineWidth = 1;
  for (let y = 40; y < fieldHeight; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(fieldWidth, y);
    ctx.stroke();
  }
  for (let x = 40; x < fieldWidth; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, fieldHeight);
    ctx.stroke();
  }
}

function drawObstacles(state) {
  const { ctx, currentLevel } = state;
  ctx.fillStyle = "#1b2535";
  currentLevel.obstacles.forEach((o) => {
    // wall base
    ctx.fillRect(o.x, o.y, o.w, o.h);
    // wall edge highlight
    ctx.strokeStyle = "#4f6a9a";
    ctx.lineWidth = 2;
    ctx.strokeRect(o.x, o.y, o.w, o.h);
  });
}

/* ------------------------------- DOORS ---------------------------------- */

function drawDoors(state) {
  const { ctx, doors } = state;
  if (!doors || doors.length === 0) return;

  doors.forEach((d) => {
    
    if (d.type === "key") {
      // 🔑 KEY DOOR: Purple glowing lock door
      const grad = ctx.createLinearGradient(d.x, d.y, d.x + d.w, d.y + d.h);
      grad.addColorStop(0, "#b07bff");
      grad.addColorStop(1, "#7b4cff");
      ctx.fillStyle = grad;
      ctx.fillRect(d.x, d.y, d.w, d.h);

      // lock icon
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.strokeRect(d.x, d.y, d.w, d.h);

      ctx.fillStyle = "#fff";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🔒", d.x + d.w / 2, d.y + d.h / 2);

    } else if (d.type === "switch") {
      // ⏻ SWITCH DOOR: Blue/teal glowing power-door
      const grad = ctx.createLinearGradient(d.x, d.y, d.x + d.w, d.y + d.h);
      grad.addColorStop(0, "#6fffd7");
      grad.addColorStop(1, "#1bb6aa");
      ctx.fillStyle = grad;
      ctx.fillRect(d.x, d.y, d.w, d.h);

      // power icon
      ctx.strokeStyle = "#eaffff";
      ctx.lineWidth = 2;
      ctx.strokeRect(d.x, d.y, d.w, d.h);

      ctx.fillStyle = "#eaffff";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("⏻", d.x + d.w / 2, d.y + d.h / 2);
    }
  });
}

/* ------------------------------- PLAYER --------------------------------- */

function drawPlayer(state) {
  const { ctx, player } = state;

  // glow if shielded
  if (player.shieldTimer > 0) {
    ctx.fillStyle = "rgba(0, 255, 255, 0.18)";
    ctx.fillRect(player.x - 6, player.y - 6, player.w + 12, player.h + 12);
  }

  // player body
  const grad = ctx.createLinearGradient(player.x, player.y, player.x, player.y + player.h);
  grad.addColorStop(0, "#ffdd66");
  grad.addColorStop(1, "#ff9f3b");
  ctx.fillStyle = grad;

  const r = 5;
  roundRect(ctx, player.x, player.y, player.w, player.h, r);
  ctx.fill();

  // face / visor
  ctx.fillStyle = "#2b1b00";
  ctx.fillRect(player.x + 4, player.y + 6, player.w - 8, 6);
}

/* ------------------------------- ENEMIES -------------------------------- */

function drawEnemies(state) {
  const { ctx, enemies } = state;
  enemies.forEach((e) => {
    if (e.type === "patrol") {
      // patrol = red blocker with stripes
      const grad = ctx.createLinearGradient(e.x, e.y, e.x + e.w, e.y + e.h);
      grad.addColorStop(0, "#ff5a5a");
      grad.addColorStop(1, "#b01717");
      ctx.fillStyle = grad;
      ctx.fillRect(e.x, e.y, e.w, e.h);

      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath();
      ctx.moveTo(e.x, e.y + 4);
      ctx.lineTo(e.x + e.w, e.y + 4);
      ctx.moveTo(e.x, e.y + e.h - 4);
      ctx.lineTo(e.x + e.w, e.y + e.h - 4);
      ctx.stroke();

    } else if (e.type === "chaser") {
      // chaser = triangular hunter
      ctx.fillStyle = "#ff3cd1";
      ctx.beginPath();
      ctx.moveTo(e.x + e.w / 2, e.y);          // top
      ctx.lineTo(e.x + e.w, e.y + e.h);        // bottom-right
      ctx.lineTo(e.x, e.y + e.h);              // bottom-left
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.stroke();

    } else if (e.type === "spinner") {
      // spinner = glowing teal ring
      const width = e.w || 20;
      const height = e.h || 20;

      const cx = e.x + width / 2;
      const cy = e.y + height / 2;
      const radius = (width / 2) - 1;

      ctx.strokeStyle = "#00ffcc";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "rgba(0, 255, 204, 0.3)";
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.3, 0, Math.PI * 2);
      ctx.fill();

    } else {
      ctx.fillStyle = "gray";
      ctx.fillRect(e.x, e.y, e.w, e.h);
    }
  });
}

/* ------------------------------- PORTAL --------------------------------- */

function drawPortal(state) {
  const { ctx, currentLevel } = state;
  const portal = currentLevel.portal;
  const gradient = ctx.createRadialGradient(
    portal.x, portal.y, 4,
    portal.x, portal.y, portal.r
  );
  gradient.addColorStop(0, "#6effff");
  gradient.addColorStop(0.5, "#00b9ff");
  gradient.addColorStop(1, "rgba(0, 20, 40, 0.1)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(portal.x, portal.y, portal.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.stroke();

  // inner swirl
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(portal.x, portal.y, portal.r * 0.55, 0.3, Math.PI * 1.3);
  ctx.stroke();
}

/* ----------------------------- POWER-UPS -------------------------------- */

function drawPowerups(state) {
  const { ctx, powerups } = state;
  powerups.forEach((p) => {
    if (p.type === "speed") {
      // SPEED ORB (yellow circle with S)
      const g = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.r);
      g.addColorStop(0, "#fff7b0");
      g.addColorStop(1, "#d4a600");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      // "S" label
      ctx.fillStyle = "#402900";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("S", p.x, p.y + 0.5);

    } else if (p.type === "shield") {
      // SHIELD ICON
      const r = p.r;
      const topY = p.y - r * 0.8;
      const bottomY = p.y + r * 0.9;

      // outer shield shape
      ctx.beginPath();
      ctx.moveTo(p.x, topY); // top
      ctx.quadraticCurveTo(p.x + r, topY + r * 0.4, p.x + r * 0.7, p.y + r * 0.2);
      ctx.quadraticCurveTo(p.x + r * 0.4, bottomY, p.x, bottomY);
      ctx.quadraticCurveTo(p.x - r * 0.4, bottomY, p.x - r * 0.7, p.y + r * 0.2);
      ctx.quadraticCurveTo(p.x - r, topY + r * 0.4, p.x, topY);
      ctx.closePath();

      const g = ctx.createLinearGradient(p.x, topY, p.x, bottomY);
      g.addColorStop(0, "#c0faff");
      g.addColorStop(1, "#00a3b8");
      ctx.fillStyle = g;
      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // inner cross
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p.x, topY + r * 0.25);
      ctx.lineTo(p.x, bottomY - r * 0.25);
      ctx.moveTo(p.x - r * 0.35, p.y);
      ctx.lineTo(p.x + r * 0.35, p.y);
      ctx.stroke();

    } else if (p.type === "dash") {
      // DASH SNEAKER
      const r = p.r;
      const x = p.x;
      const y = p.y;

      // shoe sole
      ctx.fillStyle = "#f5f5f5";
      ctx.beginPath();
      ctx.moveTo(x - r, y + r * 0.4);
      ctx.quadraticCurveTo(x, y + r * 0.9, x + r, y + r * 0.4);
      ctx.quadraticCurveTo(x + r * 0.6, y + r * 0.1, x - r * 0.5, y + r * 0.1);
      ctx.closePath();
      ctx.fill();

      // shoe upper
      ctx.fillStyle = "#2b5cff";
      ctx.beginPath();
      ctx.moveTo(x - r * 0.9, y);
      ctx.lineTo(x - r * 0.1, y - r * 0.6);
      ctx.lineTo(x + r * 0.6, y - r * 0.3);
      ctx.lineTo(x + r * 0.5, y + r * 0.05);
      ctx.lineTo(x - r * 0.9, y + r * 0.05);
      ctx.closePath();
      ctx.fill();

      // laces
      ctx.strokeStyle = "#f5f5f5";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - r * 0.6, y - r * 0.15);
      ctx.lineTo(x + r * 0.2, y - r * 0.25);
      ctx.moveTo(x - r * 0.6, y - r * 0.05);
      ctx.lineTo(x + r * 0.2, y - r * 0.15);
      ctx.stroke();

      // motion lines behind the shoe
      ctx.strokeStyle = "rgba(100, 180, 255, 0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - r * 1.2, y - r * 0.1);
      ctx.lineTo(x - r * 0.8, y - r * 0.1);
      ctx.moveTo(x - r * 1.2, y + r * 0.1);
      ctx.lineTo(x - r * 0.8, y + r * 0.1);
      ctx.stroke();
    }
  });
}

/* ------------------------------- KEYS ----------------------------------- */

function drawKeys(state) {
  const { ctx, keyItems } = state;
  if (!keyItems || keyItems.length === 0) return;

  keyItems.forEach((k) => {
    // key ring
    ctx.strokeStyle = "#ffd966";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(k.x, k.y, k.r * 0.7, 0, Math.PI * 2);
    ctx.stroke();

    // key stem
    ctx.strokeStyle = "#ffcc33";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(k.x + k.r * 0.5, k.y);
    ctx.lineTo(k.x + k.r * 1.3, k.y);
    ctx.stroke();

    // teeth
    ctx.beginPath();
    ctx.moveTo(k.x + k.r * 1.1, k.y);
    ctx.lineTo(k.x + k.r * 1.1, k.y + 4);
    ctx.moveTo(k.x + k.r * 0.9, k.y);
    ctx.lineTo(k.x + k.r * 0.9, k.y - 4);
    ctx.stroke();
  });
}

/* ------------------------------ TRAPS ----------------------------------- */

function drawTraps(state) {
  const { ctx, traps } = state;
  traps.forEach((t) => {
    if (t.type === "glue") {
      // puddle
      ctx.fillStyle = "rgba(150, 200, 255, 0.65)";
      roundedBlob(ctx, t.x, t.y, t.w, t.h);
    } else if (t.type === "fire") {
      ctx.fillStyle = "rgba(255, 120, 0, 0.9)";
      ctx.fillRect(t.x, t.y, t.w, t.h);
      ctx.fillStyle = "#ffd37a";
      ctx.beginPath();
      ctx.moveTo(t.x + t.w / 2, t.y);
      ctx.lineTo(t.x + t.w * 0.7, t.y + t.h);
      ctx.lineTo(t.x + t.w * 0.3, t.y + t.h);
      ctx.closePath();
      ctx.fill();
    } else if (t.type === "poison") {
      ctx.fillStyle = "rgba(0, 200, 80, 0.9)";
      roundedBlob(ctx, t.x, t.y, t.w, t.h);
      ctx.fillStyle = "#caffc4";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("☠", t.x + t.w / 2, t.y + t.h / 2 + 1);
    } else if (t.type === "spike") {
      // spike strip
      ctx.fillStyle = "#888";
      ctx.fillRect(t.x, t.y + t.h / 2, t.w, t.h / 2);
      ctx.fillStyle = "#ddd";
      const spikes = 3;
      const step = t.w / spikes;
      for (let i = 0; i < spikes; i++) {
        const sx = t.x + i * step;
        ctx.beginPath();
        ctx.moveTo(sx, t.y + t.h / 2);
        ctx.lineTo(sx + step / 2, t.y);
        ctx.lineTo(sx + step, t.y + t.h / 2);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.fillRect(t.x, t.y, t.w, t.h);
    }
  });
}

function drawSwitches(state) {
  const { ctx, switches } = state;
  if (!switches || switches.length === 0) return;

  switches.forEach((sw) => {
    // base plate
    ctx.fillStyle = sw.activated
      ? "rgba(180, 255, 120, 0.9)"
      : "rgba(255, 210, 80, 0.9)";
    const r = 4;
    const x = sw.x;
    const y = sw.y;
    const w = sw.w;
    const h = sw.h;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();

    // outline
    ctx.strokeStyle = "rgba(0, 0, 0, 0.7)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // tiny icon
    ctx.fillStyle = "#000";
    ctx.font = "8px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⏻", x + w / 2, y + h / 2 + 0.5);
  });
}


/* ---------------------------- RESET BUTTON ------------------------------ */

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
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    "RESET (R)",
    resetButton.x + resetButton.w / 2,
    resetButton.y + resetButton.h / 2 + 1
  );
}

/* -------------------------------- HUD ----------------------------------- */

function drawHUD(state) {
  const { ctx, fieldHeight, fieldWidth, currentLevelIndex, timeLeft, score, lives, player, hasKey, gameOver, gameWon } = state;

  // HUD panel at top-left instead of bottom so it doesn't cover player
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fillRect(0, 0, 190, 110);

  ctx.fillStyle = "white";
  ctx.font = "14px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.fillText(`LEVEL: ${currentLevelIndex + 1}`, 10, 20);
  ctx.fillText(`TIME:  ${timeLeft.toFixed(1)}`, 10, 35);
  ctx.fillText(`SCORE: ${score}`, 10, 50);
  ctx.fillText(`LIVES: ${lives}`, 10, 65);
  ctx.fillText(`DASH:  ${player.dashCharges || 0}`, 10, 80);
  ctx.fillText(`KEY:   ${hasKey ? "YES" : "NO"}`, 10, 95);

  // Status + controls down near bottom-left
  let statusPieces = [];
  if (player.speedBoostTimer > 0) statusPieces.push("SPEED");
  if (player.shieldTimer > 0) statusPieces.push("SHIELD");
  if (player.isSlowed) statusPieces.push("GLUE");
  if (player.poisonTimer > 0) statusPieces.push("POISON");

  const statusText =
    statusPieces.length === 0 ? "Status: normal" : `Status: ${statusPieces.join(" + ")}`;

  ctx.fillText(statusText, 10, fieldHeight - 25);

  ctx.font = "12px monospace";
  ctx.fillText("Arrows/WASD: move", 10, fieldHeight - 10);
  ctx.fillText("Space: dash | R: reset", 10, fieldHeight + 5);

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(fieldWidth / 2 - 100, fieldHeight / 2 - 40, 200, 80);
    ctx.fillStyle = "red";
    ctx.font = "24px monospace";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", fieldWidth / 2, fieldHeight / 2);
  } else if (gameWon) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(fieldWidth / 2 - 110, fieldHeight / 2 - 40, 220, 80);
    ctx.fillStyle = "yellow";
    ctx.font = "24px monospace";
    ctx.textAlign = "center";
    ctx.fillText("YOU ESCAPED!", fieldWidth / 2, fieldHeight / 2);
  }

  drawResetButton(state);
}

/* --------------------------- HELPER SHAPES ------------------------------ */

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function roundedBlob(ctx, x, y, w, h) {
  ctx.beginPath();
  ctx.moveTo(x + w * 0.2, y + h * 0.1);
  ctx.bezierCurveTo(
    x - w * 0.1, y + h * 0.2,
    x + w * 0.1, y + h * 0.9,
    x + w * 0.5, y + h * 0.9
  );
  ctx.bezierCurveTo(
    x + w * 0.9, y + h * 0.9,
    x + w * 1.1, y + h * 0.2,
    x + w * 0.8, y + h * 0.1
  );
  ctx.closePath();
  ctx.fill();
}