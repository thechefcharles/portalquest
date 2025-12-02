// src/editor/editorState.js
// Central place to track Level Creator state.

export const editorState = {
  currentLevel: null,        // LevelData we are editing
  activeTool: 'select',      // 'select' | 'wall' | 'spawn' | 'portal' | ...
  selectedEntity: null,      // { kind, index } | { kind: 'spawn' } | { kind: 'portal' } | null
  hover: null,               // { tool, gridX, gridY, isValid } or null
  isTesting: false,          // true when in in-editor playtest
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
  editorState.currentLevel.name = name || '';
}

/**
 * Build a payload representing the current level, ready to save.
 *
 * This is what your localStorage helper (or backend later) will receive:
 * {
 *   id: string | null,
 *   name: string,
 *   data: { ...level fields... }
 * }
 */
export function buildLevelPayloadForSave() {
  const lvl = editorState.currentLevel;
  if (!lvl) return null;

  // Normalize arrays so saves are consistent
  const data = {
    mode: lvl.mode ?? 'quest',
    width: lvl.width ?? 800,
    height: lvl.height ?? 600,
    start: lvl.start ?? { x: 100, y: 500 },
    portal: lvl.portal ?? { x: 700, y: 100, r: 20 },
    obstacles: Array.isArray(lvl.obstacles) ? lvl.obstacles : [],
    enemies: Array.isArray(lvl.enemies) ? lvl.enemies : [],
    powerups: Array.isArray(lvl.powerups) ? lvl.powerups : [],
    traps: Array.isArray(lvl.traps) ? lvl.traps : [],
    keys: Array.isArray(lvl.keys) ? lvl.keys : [],
    doors: Array.isArray(lvl.doors) ? lvl.doors : [],
    switches: Array.isArray(lvl.switches) ? lvl.switches : [],
  };

  return {
    id: lvl.id ?? null,
    name: (lvl.name && lvl.name.trim()) || 'Untitled Level',
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

  const data = saved.data || saved; // support both {id,name,data} and raw

  const id =
    saved.id ??
    data.id ??
    ('custom-' + Date.now());

  const name =
    (saved.name ??
      data.name ??
      'Untitled Level');

  editorState.currentLevel = {
    id,
    name,
    mode: data.mode ?? 'quest',
    width: data.width ?? 800,
    height: data.height ?? 600,
    start: data.start ?? { x: 100, y: 500 },
    portal: data.portal ?? { x: 700, y: 100, r: 20 },
    obstacles: Array.isArray(data.obstacles) ? data.obstacles : [],
    enemies: Array.isArray(data.enemies) ? data.enemies : [],
    powerups: Array.isArray(data.powerups) ? data.powerups : [],
    traps: Array.isArray(data.traps) ? data.traps : [],
    keys: Array.isArray(data.keys) ? data.keys : [],
    doors: Array.isArray(data.doors) ? data.doors : [],
    switches: Array.isArray(data.switches) ? data.switches : [],
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