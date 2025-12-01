// src/main.js
import { createGameState } from './core/state.js';
import { updateGame } from './engine/engine.js';
import { renderGame } from './renderer/renderGame.js';
import { updateHUDDom } from './ui/hudDom.js';
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
} from './ui/menuDom.js';

import { QUEST_LEVELS } from './data/questLevels.js';
import {
  startQuest,
  startQuestAtLevel,   // NEW
  restartQuest,
  restartCurrentLevel,
  advanceQuestLevel,
} from './modes/questMode.js';

// ===== Canvas Setup =====
const canvas = document.getElementById('game');
const ctx = canvas ? canvas.getContext('2d') : null;

const state = createGameState();

// ===== Buttons (match your HTML) =====
const playQuestBtn = document.getElementById('btnPlayQuest');
const openLevelSelectBtn = document.getElementById('btnLevelSelect');
const levelSelectBackBtn = document.getElementById('btnLevelSelectBack');
const levelSelectList = document.getElementById('levelSelectList');

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

// ===== Level Select Builder =====
function buildLevelSelectList() {
  if (!levelSelectList) return;

  levelSelectList.innerHTML = '';

  QUEST_LEVELS.forEach((level, index) => {
    const btn = document.createElement('button');
    btn.className = 'menu-btn';
    btn.textContent = `${index + 1}. ${level.name ?? level.id ?? 'Level ' + (index + 1)}`;
    btn.addEventListener('click', () => {
      // Start quest at this level and switch to quest screen
      startQuestAtLevel(state, index);
      showQuestScreen();
    });
    levelSelectList.appendChild(btn);
  });
}

// Build level list once at boot
buildLevelSelectList();

// ===== Navigation / Click Handlers =====

// Main menu → Start Quest
if (playQuestBtn) {
  playQuestBtn.addEventListener('click', () => {
    startQuest(state);
    showQuestScreen();
  });
}

// Main menu → Level Select
if (openLevelSelectBtn) {
  openLevelSelectBtn.addEventListener('click', () => {
    showLevelSelectScreen();
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
    showMainMenu();
    state.mode = 'menu';
    state.isPaused = false;
    hideAllOverlays();
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

// ===== Keyboard: Movement + Pause + Dash-ready =====
window.addEventListener('keydown', (e) => {
  // Prevent arrow keys / space from scrolling the page
  const movementKeys = [
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
    'w', 'a', 's', 'd', 'W', 'A', 'S', 'D',
    ' ', 'Spacebar'
  ];

  if (movementKeys.includes(e.key)) {
    e.preventDefault();
  }

  // Movement input (only matters during quest gameplay)
  if (state.mode === 'quest' && state.quest && state.quest.status === 'playing') {
    state.keysDown[e.key] = true;

    // If your dash system listens to keysDown[' '] or keysDown['Space'],
    // it will now see spacebar presses properly.
    // If later we want a direct dash trigger, we can add it here.
  }

  // Pause toggle
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
