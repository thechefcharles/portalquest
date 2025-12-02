// src/main.js
import { createGameState, loadLevelDataIntoState } from './core/state.js';
import { updateGame } from './engine/engine.js';
import { renderGame } from './renderer/renderGame.js';
import { updateHUDDom } from './ui/hudDom.js';
import { tryDash } from './engine/systems/dashSystem.js';

import { editorState, startNewLevel, setActiveTool } from './editor/editorState.js';
import { renderEditor } from './editor/editorRenderer.js';
import {
  placeWallAtGrid,
  placeSpawnAtGrid,
  placePortalAtGrid,
} from './editor/editorTools.js';
import {
  findEntityAtPixel,
  deleteSelectedEntity,
  moveSelectedEntity,
  moveSelectedEntityToGrid,
} from './editor/editorSelection.js';
import {
  canPlaceWallAtGrid,
  canPlaceSpawnAtGrid,
  canPlacePortalAtGrid,
} from './editor/editorPlacementValidator.js';

import { GRID_SIZE } from './core/config.js';
import {
  showMainMenu,
  showQuestScreen,
  showLevelSelectScreen,
  showPauseOverlay,
  hidePauseOverlay,
  hideAllOverlays,
  showLevelCompleteOverlay,
  showGameOverOverlay,
  showQuestCompleteOverlay,
  showCreatorScreen,
} from './ui/menuDom.js';

import { QUEST_LEVELS } from './data/questLevels.js';
import {
  startQuest,
  startQuestAtLevel,
  restartQuest,
  restartCurrentLevel,
  advanceQuestLevel,
} from './modes/questMode.js';
import { validateLevel } from './core/levelValidator.js';

// ===== Canvas Setup =====
const canvas = document.getElementById('game');
const ctx = canvas ? canvas.getContext('2d') : null;

const editorCanvas = document.getElementById('editorCanvas');
const editorCtx = editorCanvas ? editorCanvas.getContext('2d') : null;

const state = createGameState();

// ===== Buttons (match your HTML) =====
const playQuestBtn = document.getElementById('btnPlayQuest');
const openLevelSelectBtn = document.getElementById('btnLevelSelect');
const levelSelectBackBtn = document.getElementById('btnLevelSelectBack');
const levelSelectList = document.getElementById('levelSelectList');

const creatorBtn = document.getElementById('btnCreator');
const creatorBackBtn = document.getElementById('btnCreatorBack');
const creatorNewBtn = document.getElementById('btnCreatorNew');
const creatorPlaytestBtn = document.getElementById('btnCreatorPlaytest'); // not used yet
const creatorDeleteBtn = document.getElementById('btnCreatorDelete');
const endTestBtn = document.getElementById('btnEndTest');


const restartLevelBtn = document.getElementById('btnRestartLevel');
const restartQuestBtn = document.getElementById('btnRestartQuest');
const backToMenuBtn = document.getElementById('btnBackToMenu');

const pauseResumeBtn = document.getElementById('pause-resume-btn');
const pauseRestartLevelBtn = document.getElementById('pause-restart-level-btn');
const pauseRestartQuestBtn = document.getElementById('pause-restart-quest-btn');
const pauseMainMenuBtn = document.getElementById('pause-main-menu-btn');

const levelNextBtn = document.getElementById('level-next-btn');
const levelRestartQuestBtn = document.getElementById('level-restart-quest-btn');
const levelMainMenuBtn = document.getElementById('level-main-menu-btn');

const gameoverRestartQuestBtn = document.getElementById('gameover-restart-quest-btn');
const gameoverMainMenuBtn = document.getElementById('gameover-main-menu-btn');

const questcompleteRestartQuestBtn = document.getElementById('questcomplete-restart-quest-btn');
const questcompleteMainMenuBtn = document.getElementById('questcomplete-main-menu-btn');

const toolSelectBtn = document.getElementById('toolSelect');
const toolWallBtn = document.getElementById('toolWall');
const toolSpawnBtn = document.getElementById('toolSpawn');
const toolPortalBtn = document.getElementById('toolPortal');

// ===== Creator status helper =====
function updateCreatorStatusFromLevel() {
  const statusEl = document.getElementById('creatorStatus');
  if (!statusEl || !editorState.currentLevel) return;
  const issues = validateLevel(editorState.currentLevel);
  if (issues.length === 0) {
    statusEl.textContent = 'Valid ✅';
  } else {
    statusEl.textContent = `${issues.length} issue(s) ⚠️ – ${issues[0]}`;
  }
}

// ===== Level Select Builder =====
function buildLevelSelectList() {
  if (!levelSelectList) return;

  levelSelectList.innerHTML = '';

  QUEST_LEVELS.forEach((level, index) => {
    const btn = document.createElement('button');
    btn.className = 'menu-btn';
    btn.textContent = `${index + 1}. ${level.name ?? level.id ?? 'Level ' + (index + 1)}`;
    btn.addEventListener('click', () => {
      startQuestAtLevel(state, index);
      showQuestScreen();
    });
    levelSelectList.appendChild(btn);
  });
}

// Build level list once at boot
buildLevelSelectList();

// ===== Creator UI helpers =====
function updateDeleteButtonState() {
  if (!creatorDeleteBtn) return;
  const hasSelection = !!editorState.selectedEntity;
  creatorDeleteBtn.disabled = !hasSelection;
  creatorDeleteBtn.classList.toggle('danger-btn-active', hasSelection);
  creatorDeleteBtn.classList.toggle('danger-btn-disabled', !hasSelection);
}

function showEndTestButton(show) {
  if (!endTestBtn) return;
  endTestBtn.classList.toggle('hidden', !show);
}

function updateTestButtonLabel() {
  if (!creatorPlaytestBtn) return;
  if (editorState.isTesting) {
    creatorPlaytestBtn.textContent = 'Restart';
  } else {
    creatorPlaytestBtn.textContent = 'Test Game';
  }
}



// Creator tools: manage active button visual
function setToolButtonActive(activeBtn) {
  [toolSelectBtn, toolWallBtn, toolSpawnBtn, toolPortalBtn].forEach((btn) => {
    if (!btn) return;
    btn.classList.remove('tool-btn-active');
  });
  if (activeBtn) {
    activeBtn.classList.add('tool-btn-active');
  }
}

// ===== Navigation / Click Handlers =====

// Main menu → Start Quest
if (playQuestBtn) {
  playQuestBtn.addEventListener('click', () => {
    state.customTest = false;
    showEndTestButton(false);
    startQuest(state);
    showQuestScreen();
  });
}

// Main menu → Level Select
if (openLevelSelectBtn) {
  openLevelSelectBtn.addEventListener('click', () => {
    state.customTest = false;
    showEndTestButton(false);
    showLevelSelectScreen();
  });
}

// Main menu → Level Creator
if (creatorBtn) {
  creatorBtn.addEventListener('click', () => {
    state.mode = 'creator';
    showCreatorScreen();
  });
}

// Creator → Back to main menu
if (creatorBackBtn) {
  creatorBackBtn.addEventListener('click', () => {
    state.mode = 'menu';
    showMainMenu();
    hideAllOverlays();
  });
}

// Creator → New Level
if (creatorNewBtn) {
  creatorNewBtn.addEventListener('click', () => {
    startNewLevel();

    // Reset tool to Select
    setActiveTool('select');
    if (toolSelectBtn) setToolButtonActive(toolSelectBtn);

    // Clear selection, hover, and update UI
    editorState.selectedEntity = null;
    editorState.hover = null;
    updateDeleteButtonState();
    updateCreatorStatusFromLevel();

    const nameEl = document.getElementById('creatorLevelName');
    if (nameEl && editorState.currentLevel) {
      nameEl.textContent = editorState.currentLevel.name || 'Untitled Level';
    }
  });
}

// Creator → Delete Selected (button)
if (creatorDeleteBtn) {
  creatorDeleteBtn.addEventListener('click', () => {
    if (!editorState.selectedEntity) return;
    deleteSelectedEntity();
    updateDeleteButtonState();
    updateCreatorStatusFromLevel();
  });
}

// Creator tools: Select vs Wall vs Spawn vs Portal
if (toolSelectBtn) {
  toolSelectBtn.addEventListener('click', () => {
    setActiveTool('select');
    setToolButtonActive(toolSelectBtn);
    editorState.hover = null;
  });
}

if (toolWallBtn) {
  toolWallBtn.addEventListener('click', () => {
    setActiveTool('wall');
    setToolButtonActive(toolWallBtn);
  });
}

if (toolSpawnBtn) {
  toolSpawnBtn.addEventListener('click', () => {
    setActiveTool('spawn');
    setToolButtonActive(toolSpawnBtn);
  });
}

if (toolPortalBtn) {
  toolPortalBtn.addEventListener('click', () => {
    setActiveTool('portal');
    setToolButtonActive(toolPortalBtn);
  });
}
// Creator → Test Game / Restart (in-editor)
if (creatorPlaytestBtn) {
  // enable button visually (it was disabled in HTML)
  creatorPlaytestBtn.disabled = false;
  creatorPlaytestBtn.style.opacity = '1';
  creatorPlaytestBtn.style.cursor = 'pointer';

  creatorPlaytestBtn.addEventListener('click', () => {
    if (!editorState.currentLevel) return;

    const issues = validateLevel(editorState.currentLevel);
    if (issues.length > 0) {
      // Show issues, don't start test
      updateCreatorStatusFromLevel();
      return;
    }

    // If already testing → this click means RESTART
    state.customTest = true;
    state.mode = 'creator';
    state.isPaused = false;
    state.quest.status = 'playing';
    state.quest.lives = 3;

    // Reload level into engine state (restart)
    loadLevelDataIntoState(state, editorState.currentLevel);

    editorState.isTesting = true;
    editorState.selectedEntity = null;
    editorState.hover = null;
    updateDeleteButtonState();
    showEndTestButton(true);
    updateTestButtonLabel(); // label becomes "Restart"

    const statusEl = document.getElementById('creatorStatus');
    if (statusEl) {
      statusEl.textContent = 'Testing level… (click End Test to return)';
    }
  });
}


// Level Select → Back to menu
if (levelSelectBackBtn) {
  levelSelectBackBtn.addEventListener('click', () => {
    showMainMenu();
    state.mode = 'menu';
    state.isPaused = false;
    hideAllOverlays();
  });
}

// Quest sidebar buttons
if (restartLevelBtn) {
  restartLevelBtn.addEventListener('click', () => {
    restartCurrentLevel(state);
    showQuestScreen();
    hideAllOverlays();
  });
}

if (restartQuestBtn) {
  restartQuestBtn.addEventListener('click', () => {
    restartQuest(state);
    showQuestScreen();
    hideAllOverlays();
  });
}

if (backToMenuBtn) {
  backToMenuBtn.addEventListener('click', () => {
    state.customTest = false;
    showEndTestButton(false);

    showMainMenu();
    state.mode = 'menu';
    state.isPaused = false;
    hideAllOverlays();
  });
}

// Creator → End Test (back to edit mode)
if (endTestBtn) {
  endTestBtn.addEventListener('click', () => {
    if (!state.customTest || !editorState.isTesting) return;

    state.customTest = false;
    state.isPaused = false;
    state.quest.status = 'idle';
    editorState.isTesting = false;

    showEndTestButton(false);
    updateTestButtonLabel();      // label back to "Test Game"
    updateCreatorStatusFromLevel();
  });
}


// Pause menu buttons
if (pauseResumeBtn) {
  pauseResumeBtn.addEventListener('click', () => {
    state.isPaused = false;
    hidePauseOverlay();
  });
}

if (pauseRestartLevelBtn) {
  pauseRestartLevelBtn.addEventListener('click', () => {
    restartCurrentLevel(state);
    hideAllOverlays();
  });
}

if (pauseRestartQuestBtn) {
  pauseRestartQuestBtn.addEventListener('click', () => {
    restartQuest(state);
    hideAllOverlays();
  });
}

if (pauseMainMenuBtn) {
  pauseMainMenuBtn.addEventListener('click', () => {
    showMainMenu();
    state.mode = 'menu';
    state.isPaused = false;
    hideAllOverlays();
  });
}

// Level complete buttons
if (levelNextBtn) {
  levelNextBtn.addEventListener('click', () => {
    advanceQuestLevel(state);
    hideAllOverlays();
  });
}

if (levelRestartQuestBtn) {
  levelRestartQuestBtn.addEventListener('click', () => {
    restartQuest(state);
    hideAllOverlays();
  });
}

if (levelMainMenuBtn) {
  levelMainMenuBtn.addEventListener('click', () => {
    showMainMenu();
    state.mode = 'menu';
    hideAllOverlays();
  });
}

// Game over buttons
if (gameoverRestartQuestBtn) {
  gameoverRestartQuestBtn.addEventListener('click', () => {
    restartQuest(state);
    hideAllOverlays();
  });
}

if (gameoverMainMenuBtn) {
  gameoverMainMenuBtn.addEventListener('click', () => {
    showMainMenu();
    state.mode = 'menu';
    hideAllOverlays();
  });
}

// Quest complete buttons
if (questcompleteRestartQuestBtn) {
  questcompleteRestartQuestBtn.addEventListener('click', () => {
    restartQuest(state);
    hideAllOverlays();
  });
}

if (questcompleteMainMenuBtn) {
  questcompleteMainMenuBtn.addEventListener('click', () => {
    showMainMenu();
    state.mode = 'menu';
    hideAllOverlays();
  });
}

// ===== Keyboard: Movement + Pause + Dash =====
window.addEventListener('keydown', (e) => {
  const movementKeys = [
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
    'w', 'a', 's', 'd', 'W', 'A', 'S', 'D',
    ' ', 'Spacebar',
  ];

  if (movementKeys.includes(e.key)) {
    e.preventDefault();
  }

  // ===== Creator mode =====
  if (state.mode === 'creator') {
    // TEST MODE: use quest controls
    if (state.customTest && editorState.isTesting) {
      state.keysDown[e.key] = true;

      if (e.key === ' ' || e.code === 'Space') {
        tryDash(state);
      }

      // Optional: ESC ends test
      if (e.key === 'Escape') {
        state.customTest = false;
        state.quest.status = 'idle';
        editorState.isTesting = false;
        showEndTestButton(false);
        updateTestButtonLabel();
        updateCreatorStatusFromLevel();
      }

      return;
    }

    // EDIT MODE controls (only when not testing)
    if (e.key === 'Delete' || e.key === 'Backspace') {
      deleteSelectedEntity();
      updateDeleteButtonState();
      updateCreatorStatusFromLevel();
      return;
    }

    const sel = editorState.selectedEntity;
    if (sel && editorState.activeTool === 'select') {
      if (e.key === 'ArrowLeft') {
        moveSelectedEntity(-GRID_SIZE, 0);
      } else if (e.key === 'ArrowRight') {
        moveSelectedEntity(GRID_SIZE, 0);
      } else if (e.key === 'ArrowUp') {
        moveSelectedEntity(0, -GRID_SIZE);
      } else if (e.key === 'ArrowDown') {
        moveSelectedEntity(0, GRID_SIZE);
      }
      updateCreatorStatusFromLevel();
    }

    return;
  }

  // ===== Quest controls (unchanged) =====
  if (state.mode === 'quest' && state.quest && state.quest.status === 'playing') {
    state.keysDown[e.key] = true;

    if (e.key === ' ' || e.code === 'Space') {
      tryDash(state);
    }
  }

  if (e.key === 'Escape') {
    if (state.mode === 'quest' && state.quest && state.quest.status === 'playing') {
      state.isPaused = !state.isPaused;
      if (state.isPaused) {
        showPauseOverlay();
      } else {
        hidePauseOverlay();
      }
    }
  }
});

window.addEventListener('keyup', (e) => {
  if (state.keysDown && state.keysDown[e.key]) {
    state.keysDown[e.key] = false;
  }
});

// ===== Editor Mouse Hover: set preview =====
if (editorCanvas) {
  editorCanvas.addEventListener('mousemove', (e) => {
    if (state.mode !== 'creator') return;
    if (!editorState.currentLevel) return;
     if (editorState.isTesting) return; // NEW: no hover during test

    const rect = editorCanvas.getBoundingClientRect();
    const scaleX = editorCanvas.width / rect.width;
    const scaleY = editorCanvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const tool = editorState.activeTool;
    if (tool === 'select') {
      editorState.hover = null;
      return;
    }

    const gridX = Math.floor(x / GRID_SIZE);
    const gridY = Math.floor(y / GRID_SIZE);
    const level = editorState.currentLevel;
    let isValid = false;

    if (tool === 'wall') {
      isValid = canPlaceWallAtGrid(level, gridX, gridY);
    } else if (tool === 'spawn') {
      isValid = canPlaceSpawnAtGrid(level, gridX, gridY);
    } else if (tool === 'portal') {
      isValid = canPlacePortalAtGrid(level, gridX, gridY);
    }

    editorState.hover = { tool, gridX, gridY, isValid };
  });

  editorCanvas.addEventListener('mouseleave', () => {
    editorState.hover = null;
  });
}

// ===== Editor Mouse Input: click to place or select+move =====
if (editorCanvas) {
  editorCanvas.addEventListener('mousedown', (e) => {
    if (state.mode !== 'creator') return;
    if (!editorState.currentLevel) return;
     if (editorState.isTesting) return; // NEW: no editing during test

    const rect = editorCanvas.getBoundingClientRect();
    const scaleX = editorCanvas.width / rect.width;
    const scaleY = editorCanvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const tool = editorState.activeTool;
    const level = editorState.currentLevel;

    if (tool === 'wall') {
      const gridX = Math.floor(x / GRID_SIZE);
      const gridY = Math.floor(y / GRID_SIZE);
      if (!canPlaceWallAtGrid(level, gridX, gridY)) return;
      placeWallAtGrid(gridX, gridY);
      updateCreatorStatusFromLevel();
    } else if (tool === 'spawn') {
      const gridX = Math.floor(x / GRID_SIZE);
      const gridY = Math.floor(y / GRID_SIZE);
      if (!canPlaceSpawnAtGrid(level, gridX, gridY)) return;
      placeSpawnAtGrid(gridX, gridY);
      updateCreatorStatusFromLevel();
    } else if (tool === 'portal') {
      const gridX = Math.floor(x / GRID_SIZE);
      const gridY = Math.floor(y / GRID_SIZE);
      if (!canPlacePortalAtGrid(level, gridX, gridY)) return;
      placePortalAtGrid(gridX, gridY);
      updateCreatorStatusFromLevel();
    } else if (tool === 'select') {
      const hit = findEntityAtPixel(x, y);
      const currentSel = editorState.selectedEntity;

      if (!currentSel) {
        editorState.selectedEntity = hit;
        updateDeleteButtonState();
      } else {
        if (hit) {
          editorState.selectedEntity = hit;
          updateDeleteButtonState();
        } else {
          const gridX = Math.floor(x / GRID_SIZE);
          const gridY = Math.floor(y / GRID_SIZE);
          moveSelectedEntityToGrid(gridX, gridY);
          editorState.selectedEntity = null;
          updateDeleteButtonState();
          updateCreatorStatusFromLevel();
        }
      }
    }
  });
}

// ===== Game Loop =====
let lastTime = 0;
let lastQuestStatus = null;

function gameLoop(timestamp) {
  const delta = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  if (state.mode === 'quest' && ctx) {
    updateGame(state, delta);
    renderGame(ctx, state);
    updateHUDDom(state);
    handleQuestStatusForUI(state);
  } else if (state.mode === 'creator' && editorCtx) {
    if (state.customTest && editorState.isTesting) {
      // In-editor test
      updateGame(state, delta);
      renderGame(editorCtx, state);
    } else {
      // Normal editor view
      renderEditor(editorCtx);
    }
  }

  requestAnimationFrame(gameLoop);
}

function handleQuestStatusForUI(state) {
  if (!state.quest) return;

  const status = state.quest.status;

  if (status === lastQuestStatus) return;
  lastQuestStatus = status;

  if (status === 'levelComplete') {
    state.isPaused = true;
    showLevelCompleteOverlay();
  } else if (status === 'gameOver') {
    state.isPaused = true;
    showGameOverOverlay();
  } else if (status === 'questComplete') {
    state.isPaused = true;
    showQuestCompleteOverlay();
  } else if (status === 'playing') {
    hideAllOverlays();
  }
}

// ===== Boot =====
showMainMenu();
requestAnimationFrame(gameLoop);
