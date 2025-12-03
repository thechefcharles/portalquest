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

export function placeTrapAtGrid(gridX, gridY, type = 'spike') {
  const level = editorState.currentLevel;
  if (!level) return;

  const size = GRID_SIZE;
  const x = gridX * GRID_SIZE;
  const y = gridY * GRID_SIZE;

  level.traps = level.traps || [];
  level.traps.push({
    x,
    y,
    w: size,
    h: size,
    type,             // "glue" | "fire" | "poison" | "spike"
  });
}

// NEW: Place a powerup at the given grid cell
export function placePowerupAtGrid(gridX, gridY, type = 'speed') {
  const level = editorState.currentLevel;
  if (!level) return;

  const cx = gridX * GRID_SIZE + GRID_SIZE / 2;
  const cy = gridY * GRID_SIZE + GRID_SIZE / 2;
  const r = GRID_SIZE * 0.3;    // radius for editor + game

  level.powerups = level.powerups || [];
  level.powerups.push({
    x: cx,
    y: cy,
    r,
    type,           // used by powerupSystem
  });
}

// Place a key at the given grid cell
export function placeKeyAtGrid(gridX, gridY) {
  const level = editorState.currentLevel;
  if (!level) return;

  const cx = gridX * GRID_SIZE + GRID_SIZE / 2;
  const cy = gridY * GRID_SIZE + GRID_SIZE / 2;
  const r = GRID_SIZE * 0.3;

  level.keys = level.keys || [];
  level.keys.push({
    x: cx,
    y: cy,
    r,
  });
}

// Place a door at the given grid cell
// Place a door at the given grid cell
export function placeDoorAtGrid(gridX, gridY, type = "key") {
  const level = editorState.currentLevel;
  if (!level) return;

  // Pull subtype from editor
  type = editorState.activeDoorType || type;

  const x = gridX * GRID_SIZE;
  const y = gridY * GRID_SIZE;

  level.doors = level.doors || [];
  level.doors.push({
    type,
    keyDoorId: null,
    switchDoorId: null,
    x,
    y,
    w: GRID_SIZE,
    h: GRID_SIZE * 1.5,
    isOpen: false
  });
}

// Place a switch at the given grid cell
export function placeSwitchAtGrid(gridX, gridY) {
  const level = editorState.currentLevel;
  if (!level) return;

  const x = gridX * GRID_SIZE;
  const y = gridY * GRID_SIZE;

  const w = GRID_SIZE * 0.8;
  const h = GRID_SIZE * 0.4;

  level.switches = level.switches || [];
  level.switches.push({
    switchId: null,   // will be set in inspector
    x: x + (GRID_SIZE - w) / 2,
    y: y + (GRID_SIZE - h) / 2,
    w,
    h,
    isPressed: false, // used by logic system
  });
}

// Place an enemy at the given grid cell
export function placeEnemyAtGrid(gridX, gridY, type) {
  const level = editorState.currentLevel;
  if (!level) return;

  // If a specific subtype is active, use it
  type = editorState.activeEnemyType || type || "patrol";

  const x = gridX * GRID_SIZE;
  const y = gridY * GRID_SIZE;
  const w = GRID_SIZE * 0.8;
  const h = GRID_SIZE * 0.8;
  
  level.enemies = level.enemies || [];

  if (type === "patrol") {
    level.enemies.push({
      type: "patrol",
      x: x + (GRID_SIZE - w) / 2,
      y: y + (GRID_SIZE - h) / 2,
      w,
      h,
      vx: 1.5,
      axis: "horizontal", // horizontal patrol by default
    });
  } else if (type === "chaser") {
    level.enemies.push({
      type: "chaser",
      x: x + (GRID_SIZE - w) / 2,
      y: y + (GRID_SIZE - h) / 2,
      w,
      h,
      speed: 1.2,
    });
  } else if (type === "spinner") {
    const cx = x + GRID_SIZE / 2;
    const cy = y + GRID_SIZE / 2;
    const radius = GRID_SIZE * 1.2;
    level.enemies.push({
      type: "spinner",
      cx,
      cy,
      radius,
      angle: 0,
      angularSpeed: 1.8,
      w,
      h,
      x: cx - w / 2,
      y: cy - h / 2,
    });
  }
}
