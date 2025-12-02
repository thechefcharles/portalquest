// src/editor/editorTools.js
import { GRID_SIZE, PORTAL_RADIUS } from "../core/config.js";
import { editorState } from "./editorState.js";

/**
 * Place a single GRID_SIZE x GRID_SIZE wall at the given grid cell.
 */
export function placeWallAtGrid(gridX, gridY) {
  const level = editorState.currentLevel;
  if (!level) return;

  const x = gridX * GRID_SIZE;
  const y = gridY * GRID_SIZE;

  level.obstacles.push({
    type: "solid",
    x,
    y,
    w: GRID_SIZE,
    h: GRID_SIZE,
  });
}

/**
 * Place / move the player spawn at the given grid cell.
 */
export function placeSpawnAtGrid(gridX, gridY) {
  const level = editorState.currentLevel;
  if (!level) return;

  const x = gridX * GRID_SIZE;
  const y = gridY * GRID_SIZE;

  level.start = { x, y };
}

/**
 * Place / move the portal at the given grid cell.
 * We treat portal.x/y as center coordinates.
 */
export function placePortalAtGrid(gridX, gridY) {
  const level = editorState.currentLevel;
  if (!level) return;

  const cx = gridX * GRID_SIZE + GRID_SIZE / 2;
  const cy = gridY * GRID_SIZE + GRID_SIZE / 2;

  level.portal = {
    x: cx,
    y: cy,
    r: PORTAL_RADIUS,
  };
}
