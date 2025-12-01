// main.js
// Entry point: main menu, play mode, and level creator mode.

import { createInitialState, resetGame, loadLevel, loadCustomLevel } from "./state.js";
import { update, tryDash } from "./update.js";
import { draw } from "./render.js";
import { createBlankLevel, applyEditorTool } from "./creatorLevel.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Main menu & shells
const homeScreen = document.getElementById("homeScreen");
const app = document.getElementById("app");
const playModeBtn = document.getElementById("playModeBtn");
const creatorModeBtn = document.getElementById("creatorModeBtn");

const leftPanelPlay = document.getElementById("leftPanelPlay");
const leftPanelEditor = document.getElementById("leftPanelEditor");
const backFromPlayBtn = document.getElementById("backFromPlayBtn");
const backFromEditorBtn = document.getElementById("backFromEditorBtn");

// Creator buttons
const testCustomBtn = document.getElementById("testCustomBtn");
const endTestBtn = document.getElementById("endTestBtn");
const selectionInfo = document.getElementById("selectionInfo");
const deleteBtn = document.getElementById("deleteBtn");
const togglePatrolAxisBtn = document.getElementById("togglePatrolAxisBtn");

// create state AFTER we have canvas + ctx
const state = createInitialState(canvas, ctx);

// Custom level for Creator Mode only
let customLevel = createBlankLevel(canvas.width, canvas.height);

// ----- HUD DOM refs -----
const hudLevel = document.getElementById("hudLevel");
const hudTime = document.getElementById("hudTime");
const hudScore = document.getElementById("hudScore");
const hudLives = document.getElementById("hudLives");
const hudDash = document.getElementById("hudDash");
const hudKey = document.getElementById("hudKey");
const statusText = document.getElementById("statusText");

// ----- Level select (Play mode) -----
const levelButtons = document.querySelectorAll(".level-btn");
const resetBtn = document.getElementById("resetBtn");

// ----- Creator UI -----
const toolButtons = document.querySelectorAll(".tool-btn");

// ===================== VIEW HELPERS =====================

function showHome() {
  homeScreen.style.display = "flex";
  app.style.display = "none";
  state.editorMode = false;
  state.isCustomTestMode = false;
  clearSelection();
  setEditorTool(null);
}

function showPlay() {
  homeScreen.style.display = "none";
  app.style.display = "grid";
  leftPanelPlay.style.display = "block";
  leftPanelEditor.style.display = "none";
  state.editorMode = false;
  state.isCustomTestMode = false;
  clearSelection();
  setEditorTool(null);
}

function showEditor() {
  homeScreen.style.display = "none";
  app.style.display = "grid";
  leftPanelPlay.style.display = "none";
  leftPanelEditor.style.display = "block";
  state.editorMode = true;
  state.isCustomTestMode = false;

  // reset creator buttons
  testCustomBtn.disabled = false;
  endTestBtn.style.display = "none";

  clearSelection();
  setEditorTool("wall");
}

// ===================== MAIN MENU BUTTONS =====================

playModeBtn.addEventListener("click", () => {
  showPlay();
  resetGame(state); // start from Level 1 (index 0)
  setActiveLevelButton(state.currentLevelIndex);
});

creatorModeBtn.addEventListener("click", () => {
  showEditor();
  loadCustomLevel(state, customLevel);
  setActiveLevelButton(-1);
});

// Back buttons
backFromPlayBtn.addEventListener("click", () => {
  showHome();
});

backFromEditorBtn.addEventListener("click", () => {
  showHome();
});

// ===================== LEVEL SELECT (Play mode only) =====================

function setActiveLevelButton(index) {
  levelButtons.forEach((btn) => {
    const lvl = parseInt(btn.dataset.level, 10);
    if (lvl === index) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

levelButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (state.editorMode) return;

    const lvl = parseInt(btn.dataset.level, 10);
    if (lvl >= 0 && lvl < state.levels.length) {
      state.gameOver = false;
      state.gameWon = false;
      state.timeLeft = 90;
      loadLevel(state, lvl);
      setActiveLevelButton(lvl);
    }
  });
});

// RESET entire run in play mode
resetBtn.addEventListener("click", () => {
  resetGame(state);
  setActiveLevelButton(state.currentLevelIndex);
});

// ===================== CREATOR / EDITOR MODE =====================
//  Tools, selection, move, delete, test

function setEditorTool(tool) {
  state.editorTool = tool || null; // null = selection mode

  toolButtons.forEach((btn) => {
    const t = btn.dataset.tool;
    if (tool && t === tool) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

// initialize default tool
setEditorTool("wall");

toolButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tool = btn.dataset.tool;
    setEditorTool(tool);
    clearSelection(); // switching tools clears current selection
  });
});

// ---- Selection helpers ----

function clearSelection() {
  state.selectedEntity = null;
  if (selectionInfo) selectionInfo.textContent = "Nothing selected";

  // delete button disabled / gray
  deleteBtn.disabled = true;
  deleteBtn.style.opacity = 0.4;
  deleteBtn.style.background = "#111827";
  deleteBtn.style.borderColor = "#4b5563";
  deleteBtn.style.cursor = "default";

  togglePatrolAxisBtn.style.display = "none";
}

function setSelection(kind, index) {
  state.selectedEntity = { kind, index };

  const lvl = state.currentLevel;
  let label = `${kind} #${index + 1}`;

  if (kind === "enemy" && lvl && lvl.enemies && lvl.enemies[index]) {
    const e = lvl.enemies[index];
    if (e.type === "patrol") {
      const axis = e.axis || "horizontal";
      label = `patrol enemy (${axis})`;
      togglePatrolAxisBtn.style.display = "block";
    } else {
      togglePatrolAxisBtn.style.display = "none";
    }
  } else {
    togglePatrolAxisBtn.style.display = "none";
  }

  selectionInfo.textContent = `Selected: ${label}`;

  // delete button active / red
  deleteBtn.disabled = false;
  deleteBtn.style.opacity = 1;
  deleteBtn.style.background = "#b91c1c";
  deleteBtn.style.borderColor = "#f97373";
  deleteBtn.style.cursor = "pointer";
}

function findEntityAt(level, gx, gy) {
  const hit = (o) => gx >= o.x && gx < o.x + o.w && gy >= o.y && gy < o.y + o.h;
  const hitCircle = (o) => {
    const r = o.r || 10;
    const cx = o.x;
    const cy = o.y;
    return gx >= cx - r && gx <= cx + r && gy >= cy - r && gy <= cy + r;
  };

  if (level.doors) {
    for (let i = level.doors.length - 1; i >= 0; i--) {
      if (hit(level.doors[i])) return { kind: "door", index: i };
    }
  }
  if (level.switches) {
    for (let i = level.switches.length - 1; i >= 0; i--) {
      if (hit(level.switches[i])) return { kind: "switch", index: i };
    }
  }
  if (level.keys) {
    for (let i = level.keys.length - 1; i >= 0; i--) {
      if (hitCircle(level.keys[i])) return { kind: "key", index: i };
    }
  }
  if (level.powerups) {
    for (let i = level.powerups.length - 1; i >= 0; i--) {
      if (hitCircle(level.powerups[i])) return { kind: "powerup", index: i };
    }
  }
  if (level.traps) {
    for (let i = level.traps.length - 1; i >= 0; i--) {
      if (hit(level.traps[i])) return { kind: "trap", index: i };
    }
  }
  if (level.enemies) {
    for (let i = level.enemies.length - 1; i >= 0; i--) {
      if (hit(level.enemies[i])) return { kind: "enemy", index: i };
    }
  }
  if (level.obstacles) {
    for (let i = level.obstacles.length - 1; i >= 0; i--) {
      if (hit(level.obstacles[i])) return { kind: "wall", index: i };
    }
  }
  return null;
}

// ---- Canvas click for Creator ----

canvas.addEventListener("click", (e) => {
  if (!state.editorMode) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const gridSize = 20;
  const gx = Math.floor(x / gridSize) * gridSize;
  const gy = Math.floor(y / gridSize) * gridSize;

  // CASE 1: a tool is active → one-shot placement
  if (state.editorTool) {
    applyEditorTool(customLevel, state.editorTool, gx, gy, state);
    loadCustomLevel(state, customLevel);
    clearSelection();
    setEditorTool(null); // deselect tool, go back to selection mode
    return;
  }

  // CASE 2: no tool, something selected → move it
  if (!state.editorTool && state.selectedEntity) {
    const sel = state.selectedEntity;

    const arrMap = {
      wall: "obstacles",
      enemy: "enemies",
      powerup: "powerups",
      trap: "traps",
      door: "doors",
      switch: "switches",
      key: "keys"
    };

    const arrName = arrMap[sel.kind];
    if (arrName && customLevel[arrName] && customLevel[arrName][sel.index]) {
      const o = customLevel[arrName][sel.index];
      if (sel.kind === "powerup" || sel.kind === "key") {
        o.x = gx + gridSize / 2;
        o.y = gy + gridSize / 2;
      } else {
        o.x = gx;
        o.y = gy;
      }
    }

    loadCustomLevel(state, customLevel);
    return;
  }

  // CASE 3: no tool, nothing selected → select entity at that cell
  const picked = findEntityAt(customLevel, gx, gy);
  if (picked) {
    setSelection(picked.kind, picked.index);
    loadCustomLevel(state, customLevel);
  } else {
    clearSelection();
    loadCustomLevel(state, customLevel);
  }
});

// ---- Delete Selected ----

deleteBtn.addEventListener("click", () => {
  const sel = state.selectedEntity;
  if (!sel) return;

  const arrMap = {
    wall: "obstacles",
    enemy: "enemies",
    powerup: "powerups",
    trap: "traps",
    door: "doors",
    switch: "switches",
    key: "keys"
  };

  const arrName = arrMap[sel.kind];
  if (!arrName) return;

  const arr = customLevel[arrName];
  if (!arr || !arr[sel.index]) return;

  arr.splice(sel.index, 1);
  clearSelection();
  loadCustomLevel(state, customLevel);
});

// ---- Toggle Patrol Direction ----

togglePatrolAxisBtn.addEventListener("click", () => {
  const sel = state.selectedEntity;
  if (!sel || sel.kind !== "enemy") return;

  const enemies = customLevel.enemies;
  if (!enemies || !enemies[sel.index]) return;

  const e = enemies[sel.index];
  if (e.type !== "patrol") return;

  e.axis = e.axis === "horizontal" ? "vertical" : "horizontal";
  selectionInfo.textContent = `Selected: patrol enemy (${e.axis})`;
  loadCustomLevel(state, customLevel);
});

// ---- Test Custom Level / Return to Editor ----

testCustomBtn.addEventListener("click", () => {
  if (state.isCustomTestMode) return; // already testing

  state.editorMode = false;
  state.isCustomTestMode = true;

  testCustomBtn.disabled = true;
  endTestBtn.style.display = "block";

  state.gameOver = false;
  state.gameWon = false;
  state.timeLeft = 90;
  state.score = 0;
  state.lives = 3;

  loadCustomLevel(state, customLevel);
  setActiveLevelButton(-1);
});

endTestBtn.addEventListener("click", () => {
  if (!state.isCustomTestMode) return;

  state.isCustomTestMode = false;
  state.editorMode = true;

  testCustomBtn.disabled = false;
  endTestBtn.style.display = "none";

  loadCustomLevel(state, customLevel);
});

// ===================== INPUT =====================

function onKeyDown(e) {
  // In editor mode, ignore gameplay controls
  if (state.editorMode) {
    state.keys[e.key] = true;
    return;
  }

  state.keys[e.key] = true;

  // reset with R in play mode
  if ((state.gameOver || state.gameWon) && (e.key === "r" || e.key === "R")) {
    resetGame(state);
    setActiveLevelButton(state.currentLevelIndex);
  }

  // dash with Space
  if (e.key === " ") {
    tryDash(state);
  }
}

function onKeyUp(e) {
  state.keys[e.key] = false;
}

window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);

// ===================== HUD update =====================

function updateHUD(state) {
  const {
    currentLevelIndex,
    timeLeft,
    score,
    lives,
    player,
    hasKey,
    gameOver,
    gameWon,
    editorMode
  } = state;

  if (currentLevelIndex >= 0) {
    hudLevel.textContent = currentLevelIndex + 1;
  } else {
    hudLevel.textContent = "C"; // Custom
  }

  hudTime.textContent = timeLeft.toFixed(1);
  hudScore.textContent = score;
  hudLives.textContent = lives;
  hudDash.textContent = player.dashCharges || 0;
  hudKey.textContent = hasKey ? "YES" : "NO";

  let statusPieces = [];
  if (player.speedBoostTimer > 0) statusPieces.push("SPEED");
  if (player.shieldTimer > 0) statusPieces.push("SHIELD");
  if (player.isSlowed) statusPieces.push("GLUE");
  if (player.poisonTimer > 0) statusPieces.push("POISON");

  let status = "Status: normal";
  if (statusPieces.length > 0) {
    status = "Status: " + statusPieces.join(" + ");
  }

  if (editorMode) status = "Status: CREATOR MODE";
  if (gameOver) status = "Status: GAME OVER";
  if (gameWon) status = "Status: YOU ESCAPED";

  statusText.textContent = status;
}

// ===================== GAME LOOP =====================

function loop(timestamp) {
  if (!state.lastTime) state.lastTime = timestamp;
  const dt = (timestamp - state.lastTime) / 1000;
  state.lastTime = timestamp;

  ctx.clearRect(0, 0, state.fieldWidth, state.fieldHeight);

  if (!state.editorMode) {
    update(state, dt); // normal game updates (play mode or custom test)
  }
  draw(state);          // render world + selection (selection drawn in render.js)
  updateHUD(state);

  requestAnimationFrame(loop);
}

// Start on HOME screen
showHome();
requestAnimationFrame(loop);