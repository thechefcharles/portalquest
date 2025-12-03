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
    // no player in editor view
  };

  // Draw all static level content + enemies with the exact same visuals
  drawLevelStatic(ctx, viewState);
  drawEnemies(ctx, viewState);

  // Editor-only overlays
  drawSelectionHighlight(ctx, level);
  drawSpawnMarker(ctx, level);
  drawHoverPreview(ctx);
}

/**
 * Draw an orange outline around whatever is currently selected.
 */
function drawSelectionHighlight(ctx, level) {
  const sel = editorState.selectedEntity;
  if (!sel) return;

  ctx.save();
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

  ctx.restore();
}

/**
 * Draws a nice little player spawn marker so it's obvious where the player starts.
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
 * Draws a dashed preview of the thing you're about to place.
 * (Right now just traps + powerups; we can expand later.)
 */
function drawHoverPreview(ctx) {
  const hover = editorState.hover;
  if (!hover) return;

  const { tool, gridX: gx, gridY: gy, isValid } = hover;

  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 2;
  // Green-ish if valid, red-ish if invalid (future overlap rules)
  ctx.strokeStyle = isValid
    ? "rgba(34, 197, 94, 0.9)"
    : "rgba(248, 113, 113, 0.9)";

  const tileX = gx * GRID_SIZE;
  const tileY = gy * GRID_SIZE;

  switch (tool) {
    case "wall": {
      // 1 tile wall
      ctx.strokeRect(tileX, tileY, GRID_SIZE, GRID_SIZE);
      break;
    }

    case "spawn": {
      // Player spawn tile
      ctx.strokeRect(tileX, tileY, GRID_SIZE, GRID_SIZE);
      break;
    }

    case "portal": {
      // Portal centered in tile
      const cx = tileX + GRID_SIZE / 2;
      const cy = tileY + GRID_SIZE / 2;
      const r = PORTAL_RADIUS;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case "trap": {
      ctx.strokeRect(tileX, tileY, GRID_SIZE, GRID_SIZE);
      break;
    }

    case "powerup": {
      const cx = tileX + GRID_SIZE / 2;
      const cy = tileY + GRID_SIZE / 2;
      const r = GRID_SIZE * 0.3;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case "key": {
      // Same size as powerup
      const cx = tileX + GRID_SIZE / 2;
      const cy = tileY + GRID_SIZE / 2;
      const r = GRID_SIZE * 0.3;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case "door": {
      // Default door placement: 1 tile wide, 1.5 tiles tall
      const w = GRID_SIZE;
      const h = GRID_SIZE * 1.5;
      ctx.strokeRect(tileX, tileY, w, h);
      break;
    }

    case "switch": {
      // Match placeSwitchAtGrid sizing
      const w = GRID_SIZE * 0.8;
      const h = GRID_SIZE * 0.4;
      const x = tileX + (GRID_SIZE - w) / 2;
      const y = tileY + (GRID_SIZE - h) / 2;
      ctx.strokeRect(x, y, w, h);
      break;
    }

    case "enemy": {
      // Match placeEnemyAtGrid sizing (0.8 tile centered)
      const w = GRID_SIZE * 0.8;
      const h = GRID_SIZE * 0.8;
      const x = tileX + (GRID_SIZE - w) / 2;
      const y = tileY + (GRID_SIZE - h) / 2;
      ctx.strokeRect(x, y, w, h);
      break;
    }

    default:
      // no preview for select / unknown tools
      break;
  }

  ctx.restore();
}
