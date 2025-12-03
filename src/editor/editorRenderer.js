// src/editor/editorRenderer.js
import { GRID_SIZE, PORTAL_RADIUS } from "../core/config.js";
import { editorState } from "./editorState.js";

// Reuse the same renderer helpers as Quest mode
import {
  clearBackground,
  drawGrid,
  drawLevelStatic,
  drawEnemies,
} from "../renderer/renderGame.js";

export function renderEditor(ctx) {
  const canvas = ctx.canvas;
  const { width, height } = canvas;

  // Same background + grid as play mode
  clearBackground(ctx, width, height);
  drawGrid(ctx, width, height);

  const level = editorState.currentLevel;
  if (!level) return;

  // Build a "view state" in the same shape renderGame expects
  const viewState = {
    width,
    height,
    obstacles: level.obstacles || [],
    traps: level.traps || [],
    powerups: level.powerups || [],
    keys: level.keys || [],
    doors: level.doors || [],
    switches: level.switches || [],
    portal: level.portal || null,
    enemies: level.enemies || [],
    // no player in editor preview
  };

  // Draw all static level content + enemies with the exact same visuals
  drawLevelStatic(ctx, viewState);
  drawEnemies(ctx, viewState);

  // Editor-only overlays
  drawSelectionHighlight(ctx, level);
  drawSpawnMarker(ctx, level);
  drawHoverPreview(ctx);
  drawLogicLabels(ctx, level); // NEW: show key/switch IDs
}

/**
 * Orange outline around the currently selected entity.
 */
function drawSelectionHighlight(ctx, level) {
  const sel = editorState.selectedEntity;
  if (!sel) return;

  ctx.lineWidth = 3;
  ctx.strokeStyle = "#f97316"; // orange highlight

  if (sel.kind === "obstacle") {
    const o = (level.obstacles || [])[sel.index];
    if (o) ctx.strokeRect(o.x - 2, o.y - 2, o.w + 4, o.h + 4);

  } else if (sel.kind === "spawn" && level.start) {
    const sx = level.start.x;
    const sy = level.start.y;
    ctx.strokeRect(sx - 2, sy - 2, GRID_SIZE + 4, GRID_SIZE + 4);

  } else if (sel.kind === "portal" && level.portal) {
    const { x, y, r } = level.portal;
    ctx.beginPath();
    ctx.arc(x, y, (r || PORTAL_RADIUS) + 4, 0, Math.PI * 2);
    ctx.stroke();

  } else if (sel.kind === "trap") {
    const t = (level.traps || [])[sel.index];
    if (t) ctx.strokeRect(t.x - 2, t.y - 2, t.w + 4, t.h + 4);

  } else if (sel.kind === "powerup") {
    const p = (level.powerups || [])[sel.index];
    if (p) {
      const r = p.r || GRID_SIZE * 0.3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 4, 0, Math.PI * 2);
      ctx.stroke();
    }

  } else if (sel.kind === "key") {
    const k = (level.keys || [])[sel.index];
    if (k) {
      const r = k.r || GRID_SIZE * 0.3;
      ctx.beginPath();
      ctx.arc(k.x, k.y, r + 4, 0, Math.PI * 2);
      ctx.stroke();
    }

  } else if (sel.kind === "door") {
    const d = (level.doors || [])[sel.index];
    if (d) {
      ctx.strokeRect(d.x - 2, d.y - 2, d.w + 4, d.h + 4);
    }

  } else if (sel.kind === "switch") {
    const s = (level.switches || [])[sel.index];
    if (s) {
      ctx.strokeRect(s.x - 2, s.y - 2, s.w + 4, s.h + 4);
    }

  } else if (sel.kind === "enemy") {
    const e = (level.enemies || [])[sel.index];
    if (e) {
      ctx.strokeRect(e.x - 2, e.y - 2, e.w + 4, e.h + 4);
    }
  }
}

/**
 * Pretty spawn marker at the player start.
 */
function drawSpawnMarker(ctx, level) {
  if (!level.start) return;

  const sx = level.start.x;
  const sy = level.start.y;
  const size = GRID_SIZE;

  ctx.save();
  const grad = ctx.createLinearGradient(sx, sy, sx, sy + size);
  grad.addColorStop(0, "#ffdd66");
  grad.addColorStop(1, "#ff9f3b");

  ctx.fillStyle = grad;
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(sx + size * 0.2, sy + size * 0.1);
  ctx.lineTo(sx + size * 0.8, sy + size * 0.1);
  ctx.lineTo(sx + size * 0.8, sy + size * 0.9);
  ctx.lineTo(sx + size * 0.2, sy + size * 0.9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/**
 * Hover preview: dashed outlines for placement before clicking.
 * We already have traps/powerups; extend easily later if you want.
 */
function drawHoverPreview(ctx) {
  const hover = editorState.hover;
  if (!hover) return; // if you want to hide invalid placement, also check hover.isValid

  const { tool, gridX, gridY, isValid } = hover;

  const x = gridX * GRID_SIZE;
  const y = gridY * GRID_SIZE;

  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1.5;

  // Green-ish if valid, red-ish if invalid
  ctx.strokeStyle = isValid
    ? "rgba(148, 163, 184, 0.9)"   // slate/neutral
    : "rgba(239, 68, 68, 0.95)";   // red for invalid (overlap, etc.)

  // Helper to draw rect and circle
  const rect = (rx, ry, rw, rh) => ctx.strokeRect(rx, ry, rw, rh);
  const circle = (cx, cy, r) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  };

  switch (tool) {
    case "wall": {
      rect(x, y, GRID_SIZE, GRID_SIZE);
      break;
    }

    case "spawn": {
      rect(x, y, GRID_SIZE, GRID_SIZE);
      break;
    }

    case "portal": {
      const cx = x + GRID_SIZE / 2;
      const cy = y + GRID_SIZE / 2;
      circle(cx, cy, PORTAL_RADIUS);
      break;
    }

    case "trap": {
      rect(x, y, GRID_SIZE, GRID_SIZE);
      break;
    }

    case "powerup": {
      const cx = x + GRID_SIZE / 2;
      const cy = y + GRID_SIZE / 2;
      circle(cx, cy, GRID_SIZE * 0.3);
      break;
    }

    case "key": {
      const cx = x + GRID_SIZE / 2;
      const cy = y + GRID_SIZE / 2;
      circle(cx, cy, GRID_SIZE * 0.3);
      break;
    }

    case "door": {
      // Same default size as placeDoorAtGrid
      const dw = GRID_SIZE;
      const dh = GRID_SIZE * 1.5;
      rect(x, y, dw, dh);
      break;
    }

    case "switch": {
      // Same sizing/centering as placeSwitchAtGrid
      const w = GRID_SIZE * 0.8;
      const h = GRID_SIZE * 0.4;
      const sx = x + (GRID_SIZE - w) / 2;
      const sy = y + (GRID_SIZE - h) / 2;
      rect(sx, sy, w, h);
      break;
    }

    case "enemy": {
      // Same sizing/centering as placeEnemyAtGrid
      const w = GRID_SIZE * 0.8;
      const h = GRID_SIZE * 0.8;
      const ex = x + (GRID_SIZE - w) / 2;
      const ey = y + (GRID_SIZE - h) / 2;
      rect(ex, ey, w, h);
      break;
    }

    default:
      break;
  }

  ctx.restore();
}

/**
 * Draw small ID badges on top of keys, doors, and switches so you can
 * see the puzzle wiring visually (key 1 → door 1, switch A → doors A, etc.).
 */
function drawLogicLabels(ctx, level) {
  ctx.save();
  ctx.font = "10px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Helper to draw a pill/badge behind text
  function drawBadge(x, y, text, fill, stroke) {
    if (!text) return;

    const paddingX = 4;
    const paddingY = 2;

    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const w = textWidth + paddingX * 2;
    const h = 10 + paddingY * 2;

    const left = x - w / 2;
    const top = y - h / 2;
    const radius = 4;

    ctx.beginPath();
    ctx.moveTo(left + radius, top);
    ctx.lineTo(left + w - radius, top);
    ctx.quadraticCurveTo(left + w, top, left + w, top + radius);
    ctx.lineTo(left + w, top + h - radius);
    ctx.quadraticCurveTo(left + w, top + h, left + w - radius, top + h);
    ctx.lineTo(left + radius, top + h);
    ctx.quadraticCurveTo(left, top + h, left, top + h - radius);
    ctx.lineTo(left, top + radius);
    ctx.quadraticCurveTo(left, top, left + radius, top);
    ctx.closePath();

    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#e5e7eb";
    ctx.fillText(text, x, y);
  }

  // 1) Keys – show keyId
  (level.keys || []).forEach((k) => {
    if (!k.keyId) return;
    // Slightly above the key
    drawBadge(k.x, k.y - GRID_SIZE * 0.45, `K:${k.keyId}`, "rgba(30,64,175,0.85)", "#60a5fa");
  });

  // 2) Key doors – show keyDoorId / keyId
  (level.doors || []).forEach((d) => {
    const isKeyDoor = !d.type || d.type === "key";
    if (!isKeyDoor) return;

    const id = d.keyDoorId ?? d.keyId;
    if (!id) return;

    const centerX = d.x + d.w / 2;
    const centerY = d.y - 6;
    drawBadge(centerX, centerY, `K:${id}`, "rgba(22,101,52,0.9)", "#4ade80");
  });

  // 3) Switches – show switchId
  (level.switches || []).forEach((sw) => {
    if (!sw.switchId) return;
    const centerX = sw.x + sw.w / 2;
    const centerY = sw.y - 6;
    drawBadge(centerX, centerY, `S:${sw.switchId}`, "rgba(126,34,206,0.9)", "#a855f7");
  });

  // 4) Switch doors – show switchDoorId / switchId
  (level.doors || []).forEach((d) => {
    if (d.type !== "switch") return;

    const id = d.switchDoorId ?? d.switchId;
    if (!id) return;

    const centerX = d.x + d.w / 2;
    const centerY = d.y - 6;
    drawBadge(centerX, centerY, `S:${id}`, "rgba(76,29,149,0.9)", "#c4b5fd");
  });

  ctx.restore();
}