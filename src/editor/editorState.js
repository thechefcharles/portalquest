// src/editor/editorState.js
// Central place to track Level Creator state.

import { CANVAS_WIDTH, CANVAS_HEIGHT, GRID_SIZE, PORTAL_RADIUS } from "../core/config.js";

export const editorState = {
  currentLevel: null,
  activeTool: 'select',
  selectedEntity: null,
  hover: null,
  isTesting: false,

  activeTrapType: 'fire',
  activePowerupType: 'speed',
  activeWallType: 'solid',
};

export function startNewLevel() {
  const w = CANVAS_WIDTH || 568;   // fallbacks in case
  const h = CANVAS_HEIGHT || 390;

  editorState.currentLevel = {
    id: 'custom-' + Date.now(),   // local id for this editor session
    name: 'Untitled Level',
    mode: 'quest',
    width: w,
    height: h,

    // ✅ spawn & portal start *inside* the visible area
    start: { 
      x: GRID_SIZE * 2,           // ~2 tiles from left
      y: h - GRID_SIZE * 3        // near bottom, but visible
    },
    portal: { 
      x: w - GRID_SIZE * 2,       // ~2 tiles from right
      y: GRID_SIZE * 2,           // near top
      r: PORTAL_RADIUS || 20
    },

    obstacles: [],
    enemies: [],
    powerups: [],
    traps: [],
    keys: [],
    doors: [],
    switches: [],
  };

  editorState.activeTool = 'select';
  editorState.selectedEntity = null;
  editorState.hover = null;
  editorState.isTesting = false;
}

/**
 * Change the active tool in the Level Creator.
 */
export function setActiveTool(toolName) {
  editorState.activeTool = toolName;
  if (toolName !== 'select') {
    editorState.selectedEntity = null;
  }
}

/**
 * Update the current level's name (bound to the "Level Name" input).
 */
export function setLevelName(name) {
  if (!editorState.currentLevel) return;
  editorState.currentLevel.name = typeof name === 'string' ? name : '';
}

/**
 * Build a payload representing the current level, ready to save.
 *
 * This is what your localStorage helper (or backend later) will receive:
 * {
 *   id: string | null,
 *   name: string,
 *   data: { ...full level data... }
 * }
 */
export function buildLevelPayloadForSave() {
  const lvl = editorState.currentLevel;
  if (!lvl) return null;

  // Copy everything *except* id and name into data
  const { id, name, ...rest } = lvl;
  const base = { ...rest };

  // Start with all existing fields, then enforce defaults
  const data = {
    // Everything that was on currentLevel
    ...base,

    // Core defaults
    mode: base.mode ?? 'quest',
    width: typeof base.width === 'number' ? base.width : 800,
    height: typeof base.height === 'number' ? base.height : 600,
    start: base.start ?? { x: 100, y: 500 },
    portal: base.portal ?? { x: 700, y: 100, r: 20 },

    obstacles: Array.isArray(base.obstacles) ? base.obstacles : [],
    enemies: Array.isArray(base.enemies) ? base.enemies : [],
    powerups: Array.isArray(base.powerups) ? base.powerups : [],
    traps: Array.isArray(base.traps) ? base.traps : [],
    keys: Array.isArray(base.keys) ? base.keys : [],
    doors: Array.isArray(base.doors) ? base.doors : [],
    switches: Array.isArray(base.switches) ? base.switches : [],
  };

  return {
    id: id ?? null,
    // Leave empty string as-is; storage layer can decide how to default
    name: typeof name === 'string' ? name : '',
    data,
  };
}

/**
 * Load a saved level into the editor.
 *
 * Accepts either:
 *  - a full saved object { id, name, data: {...} }
 *  - or a raw LevelData object (we fall back gracefully)
 */
export function loadLevelFromSave(saved) {
  if (!saved) return;

  const src  = saved.data || saved;
  const base = { ...src };

  const id =
    saved.id ??
    base.id ??
    'custom-' + Date.now();

  const name =
    typeof saved.name === 'string'
      ? saved.name
      : typeof base.name === 'string'
        ? base.name
        : 'Untitled Level';

  const w = base.width  ?? CANVAS_WIDTH  ?? 568;
  const h = base.height ?? CANVAS_HEIGHT ?? 390;

  editorState.currentementLevel = {
    id,
    name,
    ...base,

    mode:   base.mode   ?? 'quest',
    width:  w,
    height: h,

    // ✅ if missing, give visible defaults
    start:  base.start  ?? { x: GRID_SIZE * 2,     y: h - GRID_SIZE * 3 },
    portal: base.portal ?? { x: w - GRID_SIZE * 2, y: GRID_SIZE * 2, r: PORTAL_RADIUS || 20 },

    obstacles: Array.isArray(base.obstacles) ? base.obstacles : [],
    enemies:   Array.isArray(base.enemies)   ? base.enemies   : [],
    powerups:  Array.isArray(base.powerups)  ? base.powerups  : [],
    traps:     Array.isArray(base.traps)     ? base.traps     : [],
    keys:      Array.isArray(base.keys)      ? base.keys      : [],
    doors:     Array.isArray(base.doors)     ? base.doors     : [],
    switches:  Array.isArray(base.switches)  ? base.switches  : [],
  };

  editorState.activeTool = 'select';
  editorState.selectedEntity = null;
  editorState.hover = null;
  editorState.isTesting = false;
}

/**
 * Reset ONLY the editor UI state (keeps the currentLevel as-is).
 * Handy if you want to leave the level data alone but exit test mode, etc.
 */
export function resetEditorUiState() {
  editorState.activeTool = 'select';
  editorState.selectedEntity = null;
  editorState.hover = null;
  editorState.isTesting = false;
}