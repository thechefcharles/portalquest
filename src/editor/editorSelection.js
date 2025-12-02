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

/**
 * Move the selected entity to a specific grid cell (used for click-to-move).
 */
export function moveSelectedEntityToGrid(gridX, gridY) {
  const level = editorState.currentLevel;
  const sel = editorState.selectedEntity;
  if (!level || !sel) return;

  const x = gridX * GRID_SIZE;
  const y = gridY * GRID_SIZE;

  switch (sel.kind) {
    case "spawn":
      level.start = { x, y };
      break;

    case "portal": {
      const cx = x + GRID_SIZE / 2;
      const cy = y + GRID_SIZE / 2;
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
      o.x = x;
      o.y = y;
      break;
    }

    case "trap": {
      const t = (level.traps || [])[sel.index];
      if (!t) return;
      t.x = x;
      t.y = y;
      break;
    }

    case "powerup": {
      const p = (level.powerups || [])[sel.index];
      if (!p) return;
      const cx = x + GRID_SIZE / 2;
      const cy = y + GRID_SIZE / 2;
      p.x = cx;
      p.y = cy;
      break;
    }

    case "key": {
      const k = (level.keys || [])[sel.index];
      if (!k) return;
      const cx = x + GRID_SIZE / 2;
      const cy = y + GRID_SIZE / 2;
      k.x = cx;
      k.y = cy;
      break;
    }

    case "door": {
      const d = (level.doors || [])[sel.index];
      if (!d) return;
      d.x = x;
      d.y = y;
      break;
    }

    case "switch": {
      const s = (level.switches || [])[sel.index];
      if (!s) return;
      const w = s.w;
      const h = s.h;
      s.x = x + (GRID_SIZE - w) / 2;
      s.y = y + (GRID_SIZE - h) / 2;
      break;
    }

    case "enemy": {
      const e = (level.enemies || [])[sel.index];
      if (!e) return;
      const nx = x + (GRID_SIZE - e.w) / 2;
      const ny = y + (GRID_SIZE - e.h) / 2;
      const dx = nx - e.x;
      const dy = ny - e.y;
      e.x = nx;
      e.y = ny;
      if (e.type === "spinner" && typeof e.cx === "number" && typeof e.cy === "number") {
        e.cx += dx;
        e.cy += dy;
      }
      break;
    }
  }
}