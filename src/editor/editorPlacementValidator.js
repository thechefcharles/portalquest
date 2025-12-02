// src/editor/editorPlacementValidator.js
import { GRID_SIZE, PORTAL_RADIUS } from "../core/config.js";
import { rectOverlap, circleOverlap, rectCircleOverlap } from "../core/geometry.js";

/**
 * Build arrays of rect and circle shapes for existing level entities.
 * Used to test candidate placements for overlaps.
 */
function buildLevelShapes(level) {
  const rects = [];
  const circles = [];

  if (!level) return { rects, circles };

  // Obstacles (walls)
  (level.obstacles || []).forEach((o, i) => {
    rects.push({ kind: "obstacle", index: i, x: o.x, y: o.y, w: o.w, h: o.h });
  });

  // Doors
  (level.doors || []).forEach((d, i) => {
    rects.push({ kind: "door", index: i, x: d.x, y: d.y, w: d.w, h: d.h });
  });

  // Switches
  (level.switches || []).forEach((s, i) => {
    rects.push({ kind: "switch", index: i, x: s.x, y: s.y, w: s.w, h: s.h });
  });

  // Traps
  (level.traps || []).forEach((t, i) => {
    rects.push({ kind: "trap", index: i, x: t.x, y: t.y, w: t.w, h: t.h });
  });

  // Enemies
  (level.enemies || []).forEach((e, i) => {
    if (e.type === "spinner") {
      const w = e.radius * 2;
      const h = e.radius * 2;
      rects.push({
        kind: "enemy_spinner",
        index: i,
        x: e.cx - w / 2,
        y: e.cy - h / 2,
        w,
        h,
      });
    } else {
      rects.push({ kind: "enemy", index: i, x: e.x, y: e.y, w: e.w, h: e.h });
    }
  });

  // Spawn (player start) – rect
  if (level.start) {
    rects.push({
      kind: "spawn",
      index: 0,
      x: level.start.x,
      y: level.start.y,
      w: GRID_SIZE,
      h: GRID_SIZE,
    });
  }

  // Portal – circle
  if (level.portal) {
    circles.push({
      kind: "portal",
      index: 0,
      cx: level.portal.x,
      cy: level.portal.y,
      r: level.portal.r || PORTAL_RADIUS,
    });
  }

  // Keys – circle
  (level.keys || []).forEach((k, i) => {
    circles.push({
      kind: "key",
      index: i,
      cx: k.x,
      cy: k.y,
      r: k.r || 10,
    });
  });

  // Powerups – circle
  (level.powerups || []).forEach((p, i) => {
    circles.push({
      kind: "powerup",
      index: i,
      cx: p.x,
      cy: p.y,
      r: p.r || 10,
    });
  });

  return { rects, circles };
}

/**
 * Check if a candidate rect overlaps anything in the level.
 */
function rectOverlapsLevel(level, candidate) {
  const { rects, circles } = buildLevelShapes(level);

  // Rect vs rect
  for (const r of rects) {
    if (rectOverlap(candidate, r)) return true;
  }

  // Rect vs circle
  for (const c of circles) {
    if (rectCircleOverlap(candidate, c)) return true;
  }

  return false;
}

/**
 * Check if a candidate circle overlaps anything in the level.
 */
function circleOverlapsLevel(level, candidate) {
  const { rects, circles } = buildLevelShapes(level);

  // Circle vs rect
  for (const r of rects) {
    if (rectCircleOverlap(r, candidate)) return true;
  }

  // Circle vs circle
  for (const c of circles) {
    if (circleOverlap(candidate, c)) return true;
  }

  return false;
}

// ===== Public API =====

export function canPlaceWallAtGrid(level, gridX, gridY) {
  if (!level) return false;
  const x = gridX * GRID_SIZE;
  const y = gridY * GRID_SIZE;
  const candidate = { x, y, w: GRID_SIZE, h: GRID_SIZE };
  return !rectOverlapsLevel(level, candidate);
}

export function canPlaceSpawnAtGrid(level, gridX, gridY) {
  if (!level) return false;
  const x = gridX * GRID_SIZE;
  const y = gridY * GRID_SIZE;
  const candidate = { x, y, w: GRID_SIZE, h: GRID_SIZE };
  return !rectOverlapsLevel(level, candidate);
}

export function canPlacePortalAtGrid(level, gridX, gridY) {
  if (!level) return false;
  const cx = gridX * GRID_SIZE + GRID_SIZE / 2;
  const cy = gridY * GRID_SIZE + GRID_SIZE / 2;
  const candidate = { cx, cy, r: PORTAL_RADIUS };
  return !circleOverlapsLevel(level, candidate);
}
