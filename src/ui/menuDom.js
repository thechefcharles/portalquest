// src/ui/menuDom.js

// Screens — match HTML IDs
const mainMenu = document.getElementById("homeScreen");
const levelSelectScreen = document.getElementById("levelSelectScreen");
const questScreen = document.getElementById("questScreen");

// Overlays (may not exist yet, so we guard before using them)
const pauseOverlay = document.getElementById("pause-overlay");
const levelCompleteOverlay = document.getElementById("level-complete-overlay");
const gameOverOverlay = document.getElementById("game-over-overlay");
const questCompleteOverlay = document.getElementById("quest-complete-overlay");

function hideElement(el) {
  if (!el) return;
  el.classList.add("hidden");
}

function showElement(el) {
  if (!el) return;
  el.classList.remove("hidden");
}

function hideAllScreens() {
  hideElement(mainMenu);
  hideElement(levelSelectScreen);
  hideElement(questScreen);
}

export function showMainMenu() {
  hideAllScreens();
  showElement(mainMenu);
  hideAllOverlays();
}

export function showLevelSelectScreen() {
  hideAllScreens();
  showElement(levelSelectScreen);
  hideAllOverlays();
}

export function showQuestScreen() {
  hideAllScreens();
  showElement(questScreen);
  hideAllOverlays();
}

// ===== Overlays =====
export function hideAllOverlays() {
  hideElement(pauseOverlay);
  hideElement(levelCompleteOverlay);
  hideElement(gameOverOverlay);
  hideElement(questCompleteOverlay);
}

export function showPauseOverlay() {
  showElement(pauseOverlay);
}

export function hidePauseOverlay() {
  hideElement(pauseOverlay);
}

export function showLevelCompleteOverlay() {
  showElement(levelCompleteOverlay);
}

export function showGameOverOverlay() {
  showElement(gameOverOverlay);
}

export function showQuestCompleteOverlay() {
  showElement(questCompleteOverlay);
}
