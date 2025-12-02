// src/editor/editorState.js
// Central place to track Level Creator state.

export const editorState = {
  currentLevel: null,
  activeTool: 'select',
  selectedEntity: null,
  hover: null,
  isTesting: false,

  // NEW: active placement types for tools
  activeTrapType: 'fire',
  activePowerupType: 'speed',
  activeWallType: 'solid', // future-proof, only "solid" for now
};

/**
 * Start a completely new level (used when hitting "Level Creator" / "New Level").
 */
export function startNewLevel() {
  editorState.currentLevel = {
    id: 'custom-' + Date.now(),   // local id for this editor session
    name: 'Untitled Level',
    mode: 'quest',
    width: 800,
    height: 600,
    start: { x: 100, y: 500 },
    portal: { x: 700, y: 100, r: 20 },
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

  const src = saved.data || saved; // support both {id,name,data} and raw
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

  editorState.currentLevel = {
    // Identity
    id,
    name,

    // Copy everything from the saved data
    ...base,

    // Then enforce defaults for the fields we rely on
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

  // Reset editor UI state
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