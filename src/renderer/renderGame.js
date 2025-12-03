// src/renderer/renderGame.js
//
// UNIVERSAL renderer for both Quest mode AND Editor mode.
// Editor should reuse these helpers (clearBackground, drawGrid, drawLevelStatic, etc.)
// so everything (walls, traps, powerups, keys, doors, switches, portal, enemies, player)
// looks exactly the same in build mode and play mode.
//

import { GRID_SIZE, COLORS } from "../core/config.js";

//
// MAIN RENDERER
// NOTE: ctx FIRST, state SECOND — matches main.js
//
export function renderGame(ctx, state) {
  if (!state) return;

  const { width, height } = state;

  clearBackground(ctx, width, height);
  drawGrid(ctx, width, height);

  drawLevelStatic(ctx, state);
  drawEnemies(ctx, state);
  drawPlayer(ctx, state.player);
  drawHealthBar(ctx, state.player);

  if (state.gameWon) {
    drawOverlayText(ctx, width, height, "Yezzir!");
  } else if (state.gameOver) {
    drawOverlayText(ctx, width, height, "See Ya Bud!");
  }
}

//
// ─────────────────────────────
//  BACKGROUND + GRID
// ─────────────────────────────
//

export function clearBackground(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);

  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, COLORS.backgroundTop);
  bgGradient.addColorStop(1, COLORS.backgroundBottom);

  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);
}

export function drawGrid(ctx, width, height) {
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
}

//
// ─────────────────────────────
//  STATIC LEVEL CONTENT
// ─────────────────────────────
//

export function drawLevelStatic(ctx, state) {
  drawObstacles(ctx, state.obstacles);
  drawPortal(ctx, state.portal);
  drawTraps(ctx, state.traps);
  drawDoors(ctx, state.doors);
  drawSwitches(ctx, state.switches);
  drawKeys(ctx, state.keys);
  drawPowerups(ctx, state.powerups);
}

export function drawObstacles(ctx, obstacles) {
  if (!obstacles) return;

  ctx.fillStyle = COLORS.wallFill;
  ctx.strokeStyle = COLORS.wallStroke;
  ctx.lineWidth = 2;

  obstacles.forEach((o) => {
    ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.strokeRect(o.x, o.y, o.w, o.h);
  });
}

export function drawPortal(ctx, portal) {
  if (!portal) return;
  const { x, y, r } = portal;

  const g = ctx.createRadialGradient(x, y, 4, x, y, r);
  g.addColorStop(0, COLORS.portalInner);
  g.addColorStop(0.5, COLORS.portalMid);
  g.addColorStop(1, COLORS.portalOuter);

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.stroke();
}

export function drawTraps(ctx, traps) {
  if (!traps) return;
  traps.forEach((t) => drawTrap(ctx, t));
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

export function drawKeys(ctx, keys) {
  if (!keys) return;
  keys.forEach((k) => drawKey(ctx, k));
}

function drawKey(ctx, k) {
  const r = k.r || 10;
  const { x, y } = k;

  ctx.strokeStyle = "#ffd966";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.7, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "#facc15";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + r * 0.5, y);
  ctx.lineTo(x + r * 1.3, y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + r * 1.1, y);
  ctx.lineTo(x + r * 1.1, y + 4);
  ctx.moveTo(x + r * 0.9, y);
  ctx.lineTo(x + r * 0.9, y - 4);
  ctx.stroke();
}

export function drawDoors(ctx, doors) {
  if (!doors) return;
  doors.forEach((d) => drawDoor(ctx, d));
}

function drawDoor(ctx, d) {
  if (d.type === "key") {
    const g = ctx.createLinearGradient(d.x, d.y, d.x + d.w, d.y + d.h);
    g.addColorStop(0, "#b07bff");
    g.addColorStop(1, "#7b4cff");

    ctx.fillStyle = g;
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
    const g = ctx.createLinearGradient(d.x, d.y, d.x + d.w, d.y + d.h);
    g.addColorStop(0, "#6fffd7");
    g.addColorStop(1, "#1bb6aa");

    ctx.fillStyle = g;
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

export function drawSwitches(ctx, switches) {
  if (!switches) return;
  switches.forEach((s) => drawSwitch(ctx, s));
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

  ctx.fillStyle = "#111827";
  ctx.font = "10px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("⏺", x + w / 2, y + h / 2);
}

export function drawPowerups(ctx, powerups) {
  if (!powerups) return;
  powerups.forEach((p) => drawPowerup(ctx, p));
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

//
// ─────────────────────────────
//  ENEMIES + PLAYER + UI
// ─────────────────────────────
//

export function drawEnemies(ctx, state) {
  if (!state.enemies) return;
  state.enemies.forEach((e) => drawEnemy(ctx, e));
}

function drawEnemy(ctx, e) {
  if (e.type === "patrol") {
    const g = ctx.createLinearGradient(e.x, e.y, e.x + e.w, e.y + e.h);
    g.addColorStop(0, "#ff5a5a");
    g.addColorStop(1, "#b01717");
    ctx.fillStyle = g;
    ctx.fillRect(e.x, e.y, e.w, e.h);

    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.beginPath();
    ctx.moveTo(e.x, e.y + 4);
    ctx.lineTo(e.x + e.w, e.y + 4);
    ctx.moveTo(e.x, e.y + e.h - 4);
    ctx.lineTo(e.x + e.w, e.y + e.h - 4);
    ctx.stroke();
  } else if (e.type === "chaser") {
    ctx.fillStyle = "#ff3cd1";
    ctx.beginPath();
    ctx.moveTo(e.x + e.w / 2, e.y);
    ctx.lineTo(e.x + e.w, e.y + e.h);
    ctx.lineTo(e.x, e.y + e.h);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.stroke();
  } else if (e.type === "spinner") {
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

export function drawPlayer(ctx, player) {
  if (!player) return;

  const { x, y, w, h } = player;

  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, COLORS.playerFillTop);
  g.addColorStop(1, COLORS.playerFillBottom);

  ctx.fillStyle = g;
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

  ctx.fillStyle = "#2b1b00";
  ctx.fillRect(x + 4, y + 6, w - 8, 6);
}

export function drawHealthBar(ctx, player) {
  if (!player) return;

  const barWidth = 120;
  const barHeight = 8;
  const x = 10;
  const y = 10;

  const ratio = player.health / player.maxHealth;

  ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
  ctx.fillRect(x - 1, y - 1, barWidth + 2, barHeight + 2);

  const g = ctx.createLinearGradient(x, y, x + barWidth, y);
  g.addColorStop(0, "#22c55e");
  g.addColorStop(1, "#ef4444");

  ctx.fillStyle = g;
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