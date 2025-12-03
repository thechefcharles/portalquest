// src/editor/editorPlacementValidator.js
// Centralized placement validation for the Level Creator.
// Nothing is allowed to overlap anything else.

import { GRID_SIZE, PORTAL_RADIUS } from "../core/config.js";

/* ---------- Rect helpers ---------- */

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function inBounds(level, rect) {
  const w = level.width ?? GRID_SIZE * 30;
  const h = level.height ?? GRID_SIZE * 20;
  return (
    rect.x >= 0 &&
    rect.y >= 0 &&
    rect.x + rect.w <= w &&
    rect.y + rect.h <= h
  );
}

/**
 * Build a rectangle for an existing entity so we can test overlaps.
 */
function rectForExistingEntity(kind, entity) {
  if (!entity) return null;

  switch (kind) {
    case "obstacle":
    case "trap":
    case "door":
    case "switch":
    case "enemy":
      return { x: entity.x, y: entity.y, w: entity.w, h: entity.h };

    case "powerup": {
      const r = entity.r || GRID_SIZE * 0.3;
      return { x: entity.x - r, y: entity.y - r, w: r * 2, h: r * 2 };
    }

    case "key": {
      const r = entity.r || GRID_SIZE * 0.3;
      return { x: entity.x - r, y: entity.y - r, w: r * 2, h: r * 2 };
    }

    case "portal": {
      const r = entity.r || PORTAL_RADIUS;
      return { x: entity.x - r, y: entity.y - r, w: r * 2, h: r * 2 };
    }

    case "spawn":
      return { x: entity.x, y: entity.y, w: GRID_SIZE, h: GRID_SIZE };

    default:
      return null;
  }
}

/**
 * Check the proposed rect against ALL existing entities in the level.
 */
function canPlaceRect(level, rect) {
  if (!inBounds(level, rect)) return false;

  // Spawn
  if (level.start) {
    const r = rectForExistingEntity("spawn", level.start);
    if (r && rectsOverlap(rect, r)) return false;
  }

  // Portal
  if (level.portal) {
    const r = rectForExistingEntity("portal", level.portal);
    if (r && rectsOverlap(rect, r)) return false;
  }

  const obstacles = level.obstacles || [];
  for (const o of obstacles) {
    const r = rectForExistingEntity("obstacle", o);
    if (r && rectsOverlap(rect, r)) return false;
  }

  const traps = level.traps || [];
  for (const t of traps) {
    const r = rectForExistingEntity("trap", t);
    if (r && rectsOverlap(rect, r)) return false;
  }

  const powerups = level.powerups || [];
  for (const p of powerups) {
    const r = rectForExistingEntity("powerup", p);
    if (r && rectsOverlap(rect, r)) return false;
  }

  const keys = level.keys || [];
  for (const k of keys) {
    const r = rectForExistingEntity("key", k);
    if (r && rectsOverlap(rect, r)) return false;
  }

  const doors = level.doors || [];
  for (const d of doors) {
    const r = rectForExistingEntity("door", d);
    if (r && rectsOverlap(rect, r)) return false;
  }

  const switches = level.switches || [];
  for (const s of switches) {
    const r = rectForExistingEntity("switch", s);
    if (r && rectsOverlap(rect, r)) return false;
  }

  const enemies = level.enemies || [];
  for (const e of enemies) {
    const r = rectForExistingEntity("enemy", e);
    if (r && rectsOverlap(rect, r)) return false;
  }

  return true;
}

/* ---------- Public per-tool validators ---------- */

export function canPlaceWallAtGrid(level, gridX, gridY) {
  if (!level) return false;
  const rect = {
    x: gridX * GRID_SIZE,
    y: gridY * GRID_SIZE,
    w: GRID_SIZE,
    h: GRID_SIZE,
  };
  return canPlaceRect(level, rect);
}

export function canPlaceSpawnAtGrid(level, gridX, gridY) {
  if (!level) return false;
  const rect = {
    x: gridX * GRID_SIZE,
    y: gridY * GRID_SIZE,
    w: GRID_SIZE,
    h: GRID_SIZE,
  };
  return canPlaceRect(level, rect);
}

export function canPlacePortalAtGrid(level, gridX, gridY) {
  if (!level) return false;

  const cx = gridX * GRID_SIZE + GRID_SIZE / 2;
  const cy = gridY * GRID_SIZE + GRID_SIZE / 2;
  const r = PORTAL_RADIUS;

  const rect = {
    x: cx - r,
    y: cy - r,
    w: r * 2,
    h: r * 2,
  };
  return canPlaceRect(level, rect);
}

export function canPlaceTrapAtGrid(level, gridX, gridY) {
  if (!level) return false;
  const rect = {
    x: gridX * GRID_SIZE,
    y: gridY * GRID_SIZE,
    w: GRID_SIZE,
    h: GRID_SIZE,
  };
  return canPlaceRect(level, rect);
}

export function canPlacePowerupAtGrid(level, gridX, gridY) {
  if (!level) return false;

  const cx = gridX * GRID_SIZE + GRID_SIZE / 2;
  const cy = gridY * GRID_SIZE + GRID_SIZE / 2;
  const r = GRID_SIZE * 0.3;

  const rect = {
    x: cx - r,
    y: cy - r,
    w: r * 2,
    h: r * 2,
  };
  return canPlaceRect(level, rect);
}

export function canPlaceKeyAtGrid(level, gridX, gridY) {
  if (!level) return false;

  const cx = gridX * GRID_SIZE + GRID_SIZE / 2;
  const cy = gridY * GRID_SIZE + GRID_SIZE / 2;
  const r = GRID_SIZE * 0.3;

  const rect = {
    x: cx - r,
    y: cy - r,
    w: r * 2,
    h: r * 2,
  };
  return canPlaceRect(level, rect);
}

export function canPlaceDoorAtGrid(level, gridX, gridY) {
  if (!level) return false;

  const rect = {
    x: gridX * GRID_SIZE,
    y: gridY * GRID_SIZE,
    w: GRID_SIZE,
    h: GRID_SIZE * 1.5, // matches placeDoorAtGrid
  };
  return canPlaceRect(level, rect);
}

export function canPlaceSwitchAtGrid(level, gridX, gridY) {
  if (!level) return false;

  const w = GRID_SIZE * 0.8;
  const h = GRID_SIZE * 0.4;
  const x = gridX * GRID_SIZE + (GRID_SIZE - w) / 2;
  const y = gridY * GRID_SIZE + (GRID_SIZE - h) / 2;

  const rect = { x, y, w, h };
  return canPlaceRect(level, rect);
}

export function canPlaceEnemyAtGrid(level, gridX, gridY) {
  if (!level) return false;

  const w = GRID_SIZE * 0.8;
  const h = GRID_SIZE * 0.8;
  const x = gridX * GRID_SIZE + (GRID_SIZE - w) / 2;
  const y = gridY * GRID_SIZE + (GRID_SIZE - h) / 2;

  const rect = { x, y, w, h };
  return canPlaceRect(level, rect);
}