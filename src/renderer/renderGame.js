// src/renderer/renderGame.js
// Draw the current GameState to the canvas

import { GRID_SIZE, COLORS } from "../core/config.js";


// NOTE: ctx FIRST, state SECOND — matches main.js
export function renderGame(ctx, state) {
  const {
    width,
    height,
    obstacles,
    portal,
    player,
    enemies,
    powerups,
    traps,
    keys,
    doors,
    switches,
    gameWon,
    gameOver,
  } = state;
    
  // Background
  ctx.clearRect(0, 0, width, height);

  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, COLORS.backgroundTop);
  bgGradient.addColorStop(1, COLORS.backgroundBottom);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

// Neon grid
ctx.strokeStyle = COLORS.gridLine;
ctx.lineWidth = 1;
for (let y = GRID_SIZE; y < height; y += GRID_SIZE) {
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(width, y);
  ctx.stroke();
}
for (let x = GRID_SIZE; x < width; x += GRID_SIZE) {
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, height);
  ctx.stroke();
}

  // Walls
  ctx.fillStyle = COLORS.wallFill;
  ctx.strokeStyle = COLORS.wallStroke;
  ctx.lineWidth = 2;
  obstacles.forEach((o) => {
    ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.strokeRect(o.x, o.y, o.w, o.h);
  });

// Portal
  drawPortal(ctx, portal);

  // Traps
  traps.forEach((t) => drawTrap(ctx, t));

  // Doors
  doors.forEach((d) => drawDoor(ctx, d));

  // Switches
  switches.forEach((s) => drawSwitch(ctx, s));

  // Keys
  keys.forEach((k) => drawKey(ctx, k));

  // Powerups
  powerups.forEach((p) => drawPowerup(ctx, p));

  // Enemies
  enemies.forEach((e) => drawEnemy(ctx, e));

  // Player
  drawPlayer(ctx, player);

  // Health bar
  drawHealthBar(ctx, player);

  // Overlays
  if (gameWon) {
    drawOverlayText(ctx, width, height, "Yezzir!");
  } else if (gameOver) {
    drawOverlayText(ctx, width, height, "See Ya Bud!");
  }
}

function drawPortal(ctx, portal) {
  const { x, y, r } = portal;

  const gradient = ctx.createRadialGradient(x, y, 4, x, y, r);
  gradient.addColorStop(0, COLORS.portalInner);
  gradient.addColorStop(0.5, COLORS.portalMid);
  gradient.addColorStop(1, COLORS.portalOuter);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawTrap(ctx, t) {
  if (t.type === "glue") {
    ctx.fillStyle = "rgba(150, 200, 255, 0.7)";
    ctx.beginPath();
    ctx.moveTo(t.x, t.y + t.h * 0.3);
    ctx.quadraticCurveTo(t.x + t.w * 0.5, t.y - t.h * 0.2, t.x + t.w, t.y + t.h * 0.3);
    ctx.quadraticCurveTo(t.x + t.w * 0.7, t.y + t.h, t.x + t.w * 0.3, t.y + t.h);
    ctx.quadraticCurveTo(t.x, t.y + t.h * 0.8, t.x, t.y + t.h * 0.3);
    ctx.closePath();
    ctx.fill();
  } else if (t.type === "fire") {
    ctx.fillStyle = "rgba(239, 68, 68, 0.9)";
    ctx.fillRect(t.x, t.y + t.h / 2, t.w, t.h / 2);

    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.moveTo(t.x + t.w * 0.2, t.y + t.h / 2);
    ctx.lineTo(t.x + t.w * 0.5, t.y);
    ctx.lineTo(t.x + t.w * 0.8, t.y + t.h / 2);
    ctx.closePath();
    ctx.fill();
  } else if (t.type === "poison") {
    ctx.fillStyle = "rgba(22, 163, 74, 0.9)";
    ctx.fillRect(t.x, t.y, t.w, t.h);
    ctx.fillStyle = "#bbf7d0";
    ctx.font = "12px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("☠", t.x + t.w / 2, t.y + t.h / 2);
  } else if (t.type === "spike") {
    ctx.fillStyle = "#6b7280";
    ctx.fillRect(t.x, t.y + t.h / 2, t.w, t.h / 2);

    ctx.fillStyle = "#e5e7eb";
    const spikes = 4;
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
  }
}

function drawPlayer(ctx, player) {
  const { x, y, w, h } = player;

  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, COLORS.playerFillTop);
  grad.addColorStop(1, COLORS.playerFillBottom);

  ctx.fillStyle = grad;
  const r = 5;

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

  // visor
  ctx.fillStyle = "#2b1b00";
  ctx.fillRect(x + 4, y + 6, w - 8, 6);
}

function drawEnemy(ctx, e) {
  if (e.type === "patrol") {
    // red square with stripes
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
    // pink triangle hunter
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
    // teal ring
    const cx = e.x + e.w / 2;
    const cy = e.y + e.h / 2;
    const radius = e.w / 2;

    ctx.strokeStyle = "#00ffcc";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(0, 255, 204, 0.3)";
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPowerup(ctx, p) {
  const { x, y, r } = p;

  if (p.type === "speed") {
    const g = ctx.createRadialGradient(x, y, 2, x, y, r);
    g.addColorStop(0, "#fff7b0");
    g.addColorStop(1, "#d4a600");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#402900";
    ctx.font = "10px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("S", x, y + 0.5);
  } else if (p.type === "shield") {
    const g = ctx.createRadialGradient(x, y, 2, x, y, r);
    g.addColorStop(0, "#c0faff");
    g.addColorStop(1, "#00a3b8");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#043840";
    ctx.font = "10px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🛡️", x, y + 0.5);
  } else if (p.type === "dash") {
    const g = ctx.createRadialGradient(x, y, 2, x, y, r);
    g.addColorStop(0, "#c0d8ff");
    g.addColorStop(1, "#2b5cff");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#06183a";
    ctx.font = "10px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("👟", x, y + 0.5);
  }
}

function drawKey(ctx, k) {
  const r = k.r || 10;
  const { x, y } = k;

  // key ring
  ctx.strokeStyle = "#ffd966";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.7, 0, Math.PI * 2);
  ctx.stroke();

  // key stem
  ctx.strokeStyle = "#facc15";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + r * 0.5, y);
  ctx.lineTo(x + r * 1.3, y);
  ctx.stroke();

  // teeth
  ctx.beginPath();
  ctx.moveTo(x + r * 1.1, y);
  ctx.lineTo(x + r * 1.1, y + 4);
  ctx.moveTo(x + r * 0.9, y);
  ctx.lineTo(x + r * 0.9, y - 4);
  ctx.stroke();
}

function drawDoor(ctx, d) {
  if (d.type === "key") {
    // Purple key door
    const grad = ctx.createLinearGradient(d.x, d.y, d.x + d.w, d.y + d.h);
    grad.addColorStop(0, "#b07bff");
    grad.addColorStop(1, "#7b4cff");
    ctx.fillStyle = grad;
    ctx.fillRect(d.x, d.y, d.w, d.h);

    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 2;
    ctx.strokeRect(d.x, d.y, d.w, d.h);

    ctx.fillStyle = "#ffffff";
    ctx.font = "10px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🔒", d.x + d.w / 2, d.y + d.h / 2);
  } else if (d.type === "switch") {
    // Teal switch door
    const grad = ctx.createLinearGradient(d.x, d.y, d.x + d.w, d.y + d.h);
    grad.addColorStop(0, "#6fffd7");
    grad.addColorStop(1, "#1bb6aa");
    ctx.fillStyle = grad;
    ctx.fillRect(d.x, d.y, d.w, d.h);

    ctx.strokeStyle = "#eaffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(d.x, d.y, d.w, d.h);

    ctx.fillStyle = "#eaffff";
    ctx.font = "10px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⏻", d.x + d.w / 2, d.y + d.h / 2);
  }
}

function drawSwitch(ctx, s) {
  ctx.fillStyle = s.activated ? "rgba(34,197,94,0.9)" : "rgba(250,204,21,0.9)";
  const r = 4;
  const { x, y, w, h } = s;

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

  ctx.strokeStyle = "rgba(15,23,42,0.9)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);

  // icon
  ctx.fillStyle = "#111827";
  ctx.font = "10px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("⏺", x + w / 2, y + h / 2);
}

function drawHealthBar(ctx, player) {
  const barWidth = 120;
  const barHeight = 8;
  const x = 10;
  const y = 10;

  const ratio = player.health / player.maxHealth;

  ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
  ctx.fillRect(x - 1, y - 1, barWidth + 2, barHeight + 2);

  const grad = ctx.createLinearGradient(x, y, x + barWidth, y);
  grad.addColorStop(0, "#22c55e");
  grad.addColorStop(1, "#ef4444");

  ctx.fillStyle = grad;
  ctx.fillRect(x, y, barWidth * Math.max(0, ratio), barHeight);

  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 1, y - 1, barWidth + 2, barHeight + 2);
}

function drawOverlayText(ctx, width, height, text) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
  ctx.fillRect(width / 2 - 150, height / 2 - 30, 300, 60);

  ctx.fillStyle = "#facc15";
  ctx.font = "18px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, width / 2, height / 2);
}