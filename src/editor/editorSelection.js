// src/editor/editorSelection.js
import { editorState } from "./editorState.js";
import { GRID_SIZE, PORTAL_RADIUS } from "../core/config.js";

/**
 * Check if point (x,y) is inside the player spawn (level.start).
 */
function hitTestSpawn(level, x, y) {
  if (!level.start) return false;
  const sx = level.start.x;
  const sy = level.start.y;
  const size = GRID_SIZE;
  return x >= sx && x <= sx + size && y >= sy && y <= sy + size;
}

/**
 * Check if point (x,y) is inside/near the portal.
 * Portal is a circle.
 */
function hitTestPortal(level, x, y) {
  if (!level.portal) return false;
  const px = level.portal.x;
  const py = level.portal.y;
  const r = level.portal.r || PORTAL_RADIUS;

  const dx = x - px;
  const dy = y - py;
  return dx * dx + dy * dy <= r * r;
}

/**
 * Check if point (x,y) is inside an obstacle rectangle.
 */
function hitTestObstacle(o, x, y) {
  return (
    x >= o.x &&
    x <= o.x + o.w &&
    y >= o.y &&
    y <= o.y + o.h
  );
}

/**
 * Check if point (x,y) is inside a trap rectangle.
 */
function hitTestTrap(t, x, y) {
  return (
    x >= t.x &&
    x <= t.x + t.w &&
    y >= t.y &&
    y <= t.y + t.h
  );
}

/**
 * Check if point (x,y) is inside a powerup circle.
 */
function hitTestPowerup(p, x, y) {
  const r = p.r || 10;
  const dx = x - p.x;
  const dy = y - p.y;
  return dx * dx + dy * dy <= r * r;
}

/**
 * Check if point (x,y) is inside a key circle.
 */
function hitTestKey(k, x, y) {
  const r = k.r || 10;
  const dx = x - k.x;
  const dy = y - k.y;
  return dx * dx + dy * dy <= r * r;
}

/**
 * Check if point (x,y) is inside a door rect.
 */
function hitTestDoor(d, x, y) {
  return (
    x >= d.x &&
    x <= d.x + d.w &&
    y >= d.y &&
    y <= d.y + d.h
  );
}

/**
 * Check if point (x,y) is inside a switch rect.
 */
function hitTestSwitch(s, x, y) {
  return (
    x >= s.x &&
    x <= s.x + s.w &&
    y >= s.y &&
    y <= s.y + s.h
  );
}

/**
 * Check if point (x,y) is inside an enemy rect.
 */
function hitTestEnemy(e, x, y) {
  return (
    x >= e.x &&
    x <= e.x + e.w &&
    y >= e.y &&
    y <= e.y + e.h
  );
}

/**
 * Universal entity picker — returns whichever entity the cursor is over:
 *
 *  { kind: "spawn" }
 *  { kind: "portal" }
 *  { kind: "key", index }
 *  { kind: "door", index }
 *  { kind: "switch", index }
 *  { kind: "trap", index }
 *  { kind: "powerup", index }
 *  { kind: "enemy", index }
 *  { kind: "obstacle", index }
 *  null
 */
export function findEntityAtPixel(x, y) {
  const level = editorState.currentLevel;
  if (!level) return null;

  // 1. Portal
  if (hitTestPortal(level, x, y)) {
    return { kind: "portal" };
  }

  // 2. Spawn
  if (hitTestSpawn(level, x, y)) {
    return { kind: "spawn" };
  }

  // 3. Keys
  const keys = level.keys || [];
  for (let i = 0; i < keys.length; i++) {
    if (hitTestKey(keys[i], x, y)) {
      return { kind: "key", index: i };
    }
  }

  // 4. Doors
  const doors = level.doors || [];
  for (let i = 0; i < doors.length; i++) {
    if (hitTestDoor(doors[i], x, y)) {
      return { kind: "door", index: i };
    }
  }

  // 5. Switches
  const switches = level.switches || [];
  for (let i = 0; i < switches.length; i++) {
    if (hitTestSwitch(switches[i], x, y)) {
      return { kind: "switch", index: i };
    }
  }

  // 6. Traps
  const traps = level.traps || [];
  for (let i = 0; i < traps.length; i++) {
    if (hitTestTrap(traps[i], x, y)) {
      return { kind: "trap", index: i };
    }
  }

  // 7. Powerups
  const powerups = level.powerups || [];
  for (let i = 0; i < powerups.length; i++) {
    if (hitTestPowerup(powerups[i], x, y)) {
      return { kind: "powerup", index: i };
    }
  }

  // 8. Enemies
  const enemies = level.enemies || [];
  for (let i = 0; i < enemies.length; i++) {
    if (hitTestEnemy(enemies[i], x, y)) {
      return { kind: "enemy", index: i };
    }
  }

  // 9. Obstacles
  const obstacles = level.obstacles || [];
  for (let i = 0; i < obstacles.length; i++) {
    if (hitTestObstacle(obstacles[i], x, y)) {
      return { kind: "obstacle", index: i };
    }
  }

  return null;
}

/**
 * Delete the currently selected entity.
 */
export function deleteSelectedEntity() {
  const level = editorState.currentLevel;
  const sel = editorState.selectedEntity;
  if (!level || !sel) return;

  switch (sel.kind) {
    case "spawn":
      level.start = null;
      break;
    case "portal":
      level.portal = null;
      break;
    case "obstacle": {
      const arr = level.obstacles || [];
      if (sel.index >= 0 && sel.index < arr.length) arr.splice(sel.index, 1);
      break;
    }
    case "trap": {
      const arr = level.traps || [];
      if (sel.index >= 0 && sel.index < arr.length) arr.splice(sel.index, 1);
      break;
    }
    case "powerup": {
      const arr = level.powerups || [];
      if (sel.index >= 0 && sel.index < arr.length) arr.splice(sel.index, 1);
      break;
    }
    case "key": {
      const arr = level.keys || [];
      if (sel.index >= 0 && sel.index < arr.length) arr.splice(sel.index, 1);
      break;
    }
    case "door": {
      const arr = level.doors || [];
      if (sel.index >= 0 && sel.index < arr.length) arr.splice(sel.index, 1);
      break;
    }
    case "switch": {
      const arr = level.switches || [];
      if (sel.index >= 0 && sel.index < arr.length) arr.splice(sel.index, 1);
      break;
    }
    case "enemy": {
      const arr = level.enemies || [];
      if (sel.index >= 0 && sel.index < arr.length) arr.splice(sel.index, 1);
      break;
    }
  }

  editorState.selectedEntity = null;
}

/**
 * Move the currently selected entity to a pixel offset (for arrow key nudges).
 */
export function moveSelectedEntity(dx, dy) {
  const level = editorState.currentLevel;
  const sel = editorState.selectedEntity;
  if (!level || !sel) return;

  switch (sel.kind) {
    case "spawn":
      if (!level.start) return;
      level.start.x += dx;
      level.start.y += dy;
      break;

    case "portal":
      if (!level.portal) return;
      level.portal.x += dx;
      level.portal.y += dy;
      break;

    case "obstacle": {
      const o = (level.obstacles || [])[sel.index];
      if (!o) return;
      o.x += dx;
      o.y += dy;
      break;
    }

    case "trap": {
      const t = (level.traps || [])[sel.index];
      if (!t) return;
      t.x += dx;
      t.y += dy;
      break;
    }

    case "powerup": {
      const p = (level.powerups || [])[sel.index];
      if (!p) return;
      p.x += dx;
      p.y += dy;
      break;
    }

    case "key": {
      const k = (level.keys || [])[sel.index];
      if (!k) return;
      k.x += dx;
      k.y += dy;
      break;
    }

    case "door": {
      const d = (level.doors || [])[sel.index];
      if (!d) return;
      d.x += dx;
      d.y += dy;
      break;
    }

    case "switch": {
      const s = (level.switches || [])[sel.index];
      if (!s) return;
      s.x += dx;
      s.y += dy;
      break;
    }

    case "enemy": {
      const e = (level.enemies || [])[sel.index];
      if (!e) return;
      e.x += dx;
      e.y += dy;
      // for spinner, keep center in sync
      if (e.type === "spinner" && typeof e.cx === "number" && typeof e.cy === "number") {
        e.cx += dx;
        e.cy += dy;
      }
      break;
    }
  }
}

// ===== Overlap helpers =====

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function rectFromEntity(kind, entity) {
  if (!entity) return null;

  // Rect types
  if (
    kind === "obstacle" ||
    kind === "trap" ||
    kind === "door" ||
    kind === "switch" ||
    kind === "enemy"
  ) {
    return { x: entity.x, y: entity.y, w: entity.w, h: entity.h };
  }

  // Circles (keys, powerups, portal) → approximate with box
  if (kind === "key" || kind === "powerup") {
    const r = entity.r || GRID_SIZE * 0.3;
    return { x: entity.x - r, y: entity.y - r, w: r * 2, h: r * 2 };
  }

  if (kind === "portal") {
    const r = entity.r || PORTAL_RADIUS;
    return { x: entity.x - r, y: entity.y - r, w: r * 2, h: r * 2 };
  }

  // Spawn uses one tile
  if (kind === "spawn") {
    return { x: entity.x, y: entity.y, w: GRID_SIZE, h: GRID_SIZE };
  }

  return null;
}

function hasOverlapAt(level, sel, targetRect) {
  if (!targetRect) return false;

  // Spawn (single)
  if (sel.kind !== "spawn" && level.start) {
    const spawnRect = rectFromEntity("spawn", level.start);
    if (rectsOverlap(targetRect, spawnRect)) return true;
  }

  // Portal (single)
  if (sel.kind !== "portal" && level.portal) {
    const portalRect = rectFromEntity("portal", level.portal);
    if (rectsOverlap(targetRect, portalRect)) return true;
  }

  // Arrays
  const arrays = [
    ["obstacle", level.obstacles],
    ["trap",     level.traps],
    ["powerup",  level.powerups],
    ["key",      level.keys],
    ["door",     level.doors],
    ["switch",   level.switches],
    ["enemy",    level.enemies],
  ];

  for (const [kind, arr] of arrays) {
    if (!Array.isArray(arr)) continue;
    for (let i = 0; i < arr.length; i++) {
      // Skip the one we're moving
      if (sel.kind === kind && sel.index === i) continue;
      const r = rectFromEntity(kind, arr[i]);
      if (!r) continue;
      if (rectsOverlap(targetRect, r)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Move the selected entity to a specific grid cell (used for click-to-move).
 * Now blocks moves that would overlap other entities, and deselects after a valid move.
 */
export function moveSelectedEntityToGrid(gridX, gridY) {
  const level = editorState.currentLevel;
  const sel   = editorState.selectedEntity;
  if (!level || !sel) return;

  const x = gridX * GRID_SIZE;
  const y = gridY * GRID_SIZE;

  let targetRect = null;

  switch (sel.kind) {
    case "spawn":
      targetRect = { x, y, w: GRID_SIZE, h: GRID_SIZE };
      break;

    case "portal": {
      const r  = (level.portal && level.portal.r) || PORTAL_RADIUS;
      const cx = x + GRID_SIZE / 2;
      const cy = y + GRID_SIZE / 2;
      targetRect = { x: cx - r, y: cy - r, w: 2 * r, h: 2 * r };
      break;
    }

    case "obstacle": {
      const o = (level.obstacles || [])[sel.index];
      if (!o) return;
      targetRect = { x, y, w: o.w, h: o.h };
      break;
    }

    case "trap": {
      const t = (level.traps || [])[sel.index];
      if (!t) return;
      targetRect = { x, y, w: t.w, h: t.h };
      break;
    }

    case "powerup": {
      const p = (level.powerups || [])[sel.index];
      if (!p) return;
      const r  = p.r || GRID_SIZE * 0.3;
      const cx = x + GRID_SIZE / 2;
      const cy = y + GRID_SIZE / 2;
      targetRect = { x: cx - r, y: cy - r, w: 2 * r, h: 2 * r };
      break;
    }

    case "key": {
      const k = (level.keys || [])[sel.index];
      if (!k) return;
      const r  = k.r || GRID_SIZE * 0.3;
      const cx = x + GRID_SIZE / 2;
      const cy = y + GRID_SIZE / 2;
      targetRect = { x: cx - r, y: cy - r, w: 2 * r, h: 2 * r };
      break;
    }

    case "door": {
      const d = (level.doors || [])[sel.index];
      if (!d) return;
      targetRect = { x, y, w: d.w, h: d.h };
      break;
    }

    case "switch": {
      const s = (level.switches || [])[sel.index];
      if (!s) return;
      const w  = s.w;
      const h  = s.h;
      const nx = x + (GRID_SIZE - w) / 2;
      const ny = y + (GRID_SIZE - h) / 2;
      targetRect = { x: nx, y: ny, w, h };
      break;
    }

    case "enemy": {
      const e = (level.enemies || [])[sel.index];
      if (!e) return;
      const nx = x + (GRID_SIZE - e.w) / 2;
      const ny = y + (GRID_SIZE - e.h) / 2;
      targetRect = { x: nx, y: ny, w: e.w, h: e.h };
      break;
    }

    default:
      return;
  }

  // If moving here would overlap anything else → abort
  if (hasOverlapAt(level, sel, targetRect)) {
    // console.log('[Editor] Move blocked due to overlap');
    return;
  }

  // Apply the move now that we know it's valid
  switch (sel.kind) {
    case "spawn":
      level.start = { x: targetRect.x, y: targetRect.y };
      break;

    case "portal": {
      const cx = targetRect.x + targetRect.w / 2;
      const cy = targetRect.y + targetRect.h / 2;
      level.portal = {
        x: cx,
        y: cy,
        r: level.portal?.r || PORTAL_RADIUS,
      };
      break;
    }

    case "obstacle": {
      const o = (level.obstacles || [])[sel.index];
      if (!o) return;
      o.x = targetRect.x;
      o.y = targetRect.y;
      break;
    }

    case "trap": {
      const t = (level.traps || [])[sel.index];
      if (!t) return;
      t.x = targetRect.x;
      t.y = targetRect.y;
      break;
    }

    case "powerup": {
      const p = (level.powerups || [])[sel.index];
      if (!p) return;
      const cx = targetRect.x + targetRect.w / 2;
      const cy = targetRect.y + targetRect.h / 2;
      p.x = cx;
      p.y = cy;
      break;
    }

    case "key": {
      const k = (level.keys || [])[sel.index];
      if (!k) return;
      const cx = targetRect.x + targetRect.w / 2;
      const cy = targetRect.y + targetRect.h / 2;
      k.x = cx;
      k.y = cy;
      break;
    }

    case "door": {
      const d = (level.doors || [])[sel.index];
      if (!d) return;
      d.x = targetRect.x;
      d.y = targetRect.y;
      break;
    }

    case "switch": {
      const s = (level.switches || [])[sel.index];
      if (!s) return;
      s.x = targetRect.x;
      s.y = targetRect.y;
      break;
    }

    case "enemy": {
      const e = (level.enemies || [])[sel.index];
      if (!e) return;
      e.x = targetRect.x;
      e.y = targetRect.y;

      if (e.type === "spinner" && typeof e.cx === "number" && typeof e.cy === "number") {
        const cx = targetRect.x + targetRect.w / 2;
        const cy = targetRect.y + targetRect.h / 2;
        e.cx = cx;
        e.cy = cy;
      }
      break;
    }
  }

  // After a successful move, deselect
  editorState.selectedEntity = null;
}