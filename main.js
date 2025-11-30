// main.js
// Entry point: sets up canvas, input, loop, HUD, and level select.

import { createInitialState, resetGame, loadLevel } from "./state.js";
import { update, tryDash } from "./update.js";
import { draw } from "./render.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// create state AFTER we have canvas + ctx
const state = createInitialState(canvas, ctx);

// ----- HUD DOM refs -----
const hudLevel = document.getElementById("hudLevel");
const hudTime = document.getElementById("hudTime");
const hudScore = document.getElementById("hudScore");
const hudLives = document.getElementById("hudLives");
const hudDash = document.getElementById("hudDash");
const hudKey = document.getElementById("hudKey");
const statusText = document.getElementById("statusText");

// ----- Level select -----
const levelButtons = document.querySelectorAll(".level-btn");
const resetBtn = document.getElementById("resetBtn");

// highlight active level button
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

// level button click
levelButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const lvl = parseInt(btn.dataset.level, 10);
    // basic safety: within range
    if (lvl >= 0 && lvl < state.levels.length) {
      state.gameOver = false;
      state.gameWon = false;
      state.timeLeft = 90;
      // don't reset score automatically for testing; optional:
      // state.score = 0;
      loadLevel(state, lvl);
      setActiveLevelButton(lvl);
    }
  });
});

// reset button
resetBtn.addEventListener("click", () => {
  resetGame(state);
  setActiveLevelButton(state.currentLevelIndex);
});

// ----- Input -----
function onKeyDown(e) {
  state.keys[e.key] = true;

  // reset with R
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

// ----- HUD update -----
function updateHUD(state) {
  const { currentLevelIndex, timeLeft, score, lives, player, hasKey, gameOver, gameWon } = state;

  hudLevel.textContent = currentLevelIndex + 1;
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

  if (gameOver) status = "Status: GAME OVER";
  if (gameWon) status = "Status: YOU ESCAPED";

  statusText.textContent = status;
}

// ----- Game Loop -----
function loop(timestamp) {
  if (!state.lastTime) state.lastTime = timestamp;
  const dt = (timestamp - state.lastTime) / 1000;
  state.lastTime = timestamp;

  ctx.clearRect(0, 0, state.fieldWidth, state.fieldHeight);

  update(state, dt);
  draw(state);
  updateHUD(state);

  requestAnimationFrame(loop);
}

// Initialize active button
setActiveLevelButton(state.currentLevelIndex);

requestAnimationFrame(loop);