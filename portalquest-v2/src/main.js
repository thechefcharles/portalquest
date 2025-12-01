// src/main.js
// Entry: setup canvas, state, input, modes, and main loop

import { createGameState } from "./core/state.js";
import { updateGame } from "./engine/engine.js";
import { drawGame } from "./renderer/renderGame.js";
import { tryDash } from "./engine/systems/dashSystem.js";
import {
  startQuest,
  restartQuest,
  restartCurrentLevel,
  startQuestAtLevel,
} from "./modes/questMode.js";
import {
  showMainMenu,
  showQuestScreen,
  showLevelSelectScreen,
} from "./ui/menuDom.js";
import { updateHUDDom } from "./ui/hudDom.js";
import { QUEST_LEVELS } from "./data/questLevels.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const state = createGameState();

// ----- UI: Buttons -----

// Main menu
const btnPlayQuest = document.getElementById("btnPlayQuest");
const btnLevelSelect = document.getElementById("btnLevelSelect");
const btnQuit = document.getElementById("btnQuit");

// Quest screen
const btnRestartLevel = document.getElementById("btnRestartLevel");
const btnRestartQuest = document.getElementById("btnRestartQuest");
const btnBackToMenu = document.getElementById("btnBackToMenu");

// Level select screen
const levelSelectList = document.getElementById("levelSelectList");
const btnLevelSelectBack = document.getElementById("btnLevelSelectBack");

// ----- Hook up Main Menu -----

btnPlayQuest.addEventListener("click", () => {
  startQuest(state);
  showQuestScreen();
});

btnLevelSelect.addEventListener("click", () => {
  buildLevelSelectList();
  showLevelSelectScreen();
});

btnQuit.addEventListener("click", () => {
  showMainMenu();
});

// ----- Hook up Quest sidebar -----

btnRestartLevel.addEventListener("click", () => {
  if (state.mode === "quest") {
    restartCurrentLevel(state);
  }
});

btnRestartQuest.addEventListener("click", () => {
  if (state.mode === "quest") {
    restartQuest(state);
  }
});

btnBackToMenu.addEventListener("click", () => {
  showMainMenu();
  state.mode = "menu";
});

// ----- Hook up Level Select -----

btnLevelSelectBack.addEventListener("click", () => {
  showMainMenu();
});

// Build level buttons dynamically from QUEST_LEVELS
function buildLevelSelectList() {
  // Clear existing
  levelSelectList.innerHTML = "";

  QUEST_LEVELS.forEach((level, index) => {
    const btn = document.createElement("button");
    btn.className = "menu-btn";
    btn.textContent = `Level ${index + 1}: ${level.name ?? level.id}`;
    btn.addEventListener("click", () => {
      startQuestAtLevel(state, index);
      showQuestScreen();
    });
    levelSelectList.appendChild(btn);
  });
}

// ----- Input -----

function handleKeyDown(e) {
  state.keysDown[e.key] = true;

  // Dash on Space (only in quest mode)
  if (e.key === " " && state.mode === "quest") {
    tryDash(state);
  }
}

function handleKeyUp(e) {
  state.keysDown[e.key] = false;
}

window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

// ----- Main Loop -----

function loop(timestamp) {
  if (!state.lastTime) state.lastTime = timestamp;
  const dt = (timestamp - state.lastTime) / 1000; // seconds
  state.lastTime = timestamp;

  if (state.mode === "quest") {
    updateGame(state, dt);
    drawGame(state, ctx);
    updateHUDDom(state);
  } else {
    // In menu/level select, we don't update game world.
    // Optionally clear canvas or leave last frame.
  }

  requestAnimationFrame(loop);
}

// Start in main menu
showMainMenu();
requestAnimationFrame(loop);
