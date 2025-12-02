// src/editor/editorState.js
// Central place to track Level Creator state.

export const editorState = {
  currentLevel: null,        // LevelData we are editing
  activeTool: 'select',      // 'select' | 'wall' | 'spawn' | 'portal' | ...
  selectedEntity: null,      // { kind, index } | { kind: 'spawn' } | { kind: 'portal' } | null
  hover: null,               // { tool, gridX, gridY, isValid } or null
  isTesting: false,          // NEW: true when in in-editor playtest
};

export function startNewLevel() {
  editorState.currentLevel = {
    id: 'custom-' + Date.now(),
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
  editorState.isTesting = false;  // reset
}

export function setActiveTool(toolName) {
  editorState.activeTool = toolName;
  if (toolName !== 'select') {
    editorState.selectedEntity = null;
  }
}
