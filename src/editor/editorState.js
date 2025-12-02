// src/editor/editorState.js
// Central place to track Level Creator state.

export const editorState = {
  currentLevel: null,        // will hold a LevelData object we'll modify
  activeTool: 'select',      // 'select' | 'wall' | later: 'enemy_patrol', etc.
  selectedEntity: null,      // { kind: string, index: number } or null
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
}

export function setActiveTool(toolName) {
  editorState.activeTool = toolName;
  // When switching tools, we can clear selection for now
  if (toolName !== 'select') {
    editorState.selectedEntity = null;
  }
}
