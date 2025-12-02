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
 * Universal entity picker — returns whichever entity the cursor is over:
 *
 *  { kind: "spawn" }
 *  { kind: "portal" }
 *  { kind: "obstacle", index }
 *  null
 */
export function findEntityAtPixel(x, y) {
  const level = editorState.currentLevel;
  if (!level) return null;

  // --- Priority 1: Portal (visually large, easy to click) ---
  if (hitTestPortal(level, x, y)) {
    return { kind: "portal" };
  }

  // --- Priority 2: Player spawn (square) ---
  if (hitTestSpawn(level, x, y)) {
    return { kind: "spawn" };
  }

  // --- Priority 3: Obstacles ---
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
      const obstacles = level.obstacles || [];
      if (sel.index >= 0 && sel.index < obstacles.length) {
        obstacles.splice(sel.index, 1);
      }
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
      const obstacles = level.obstacles || [];
      const o = obstacles[sel.index];
      if (!o) return;
      o.x += dx;
      o.y += dy;
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
      const obstacles = level.obstacles || [];
      const o = obstacles[sel.index];
      if (!o) return;

      o.x = x;
      o.y = y;
      break;
    }
  }
}
