// main.js
// Entry point: sets up canvas, input, loop, and wires state/update/render.

import { createInitialState, resetGame } from "./state.js";
import { update, tryDash } from "./update.js";
import { draw } from "./render.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// create state AFTER we have canvas + ctx
const state = createInitialState(canvas, ctx);

// ----- Input -----
function onKeyDown(e) {
  state.keys[e.key] = true;

  // reset with R
  if ((state.gameOver || state.gameWon) && (e.key === "r" || e.key === "R")) {
    resetGame(state);
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

canvas.addEventListener("click", (e) => {
  if (!state.gameOver && !state.gameWon) return;

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const b = state.resetButton;

  if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
    resetGame(state);
  }
});

// ----- Game Loop -----
function loop(timestamp) {
  if (!state.lastTime) state.lastTime = timestamp;
  const dt = (timestamp - state.lastTime) / 1000;
  state.lastTime = timestamp;

  ctx.clearRect(0, 0, state.fieldWidth, state.fieldHeight);

  update(state, dt);
  draw(state);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);