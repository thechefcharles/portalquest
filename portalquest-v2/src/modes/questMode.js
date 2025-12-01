// src/modes/questMode.js
// Quest Mode logic: starting, restarting, advancing levels, handling death

import { QUEST_LEVELS } from "../data/questLevels.js";
import { loadLevelIntoState } from "../core/state.js";

export function startQuest(state) {
  state.mode = "quest";
  state.score = 0;
  state.lives = 3;
  loadLevelIntoState(state, 0);
}

export function restartQuest(state) {
  state.score = 0;
  state.lives = 3;
  loadLevelIntoState(state, 0);
}

export function restartCurrentLevel(state) {
  const index = state.currentLevelIndex ?? 0;
  loadLevelIntoState(state, index);
}

/**
 * Start quest at a specific level index (used by Level Select)
 */
export function startQuestAtLevel(state, levelIndex) {
  const idx = Math.max(0, Math.min(levelIndex, QUEST_LEVELS.length - 1));
  state.mode = "quest";
  state.score = 0;
  state.lives = 3;
  loadLevelIntoState(state, idx);
}

/**
 * Called when the player reaches the portal in quest mode.
 */
export function advanceQuestLevel(state) {
  const nextIndex = state.currentLevelIndex + 1;

  if (nextIndex >= QUEST_LEVELS.length) {
    state.gameWon = true;
    return;
  }

  loadLevelIntoState(state, nextIndex);
}

/**
 * Called when the player health reaches 0.
 */
export function handlePlayerDeath(state) {
  if (state.mode !== "quest") {
    state.gameOver = true;
    return;
  }

  if (state.lives == null) state.lives = 3;
  state.lives -= 1;
  if (state.lives < 0) state.lives = 0;

  if (state.lives <= 0) {
    state.gameOver = true;
    return;
  }

  const index = state.currentLevelIndex ?? 0;

  if (state.score != null) {
    state.score = Math.max(0, state.score - 50);
  }

  loadLevelIntoState(state, index);
}
