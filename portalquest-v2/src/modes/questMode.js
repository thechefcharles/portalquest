// src/modes/questMode.js
import { QUEST_LEVELS } from '../data/questLevels.js';
import { loadLevelIntoState } from '../core/state.js';

export function startQuest(state) {
  return startQuestAtLevel(state, 0);
}

export function startQuestAtLevel(state, levelIndex) {
  state.mode = 'quest';
  state.quest.currentLevelIndex = levelIndex;
  state.quest.lives = 3;
  state.quest.status = 'playing';
  state.isPaused = false;

  loadLevelIntoState(state, state.quest.currentLevelIndex);
}

export function restartQuest(state) {
  state.quest.currentLevelIndex = 0;
  state.quest.lives = 3;
  state.quest.status = 'playing';
  state.isPaused = false;

  loadLevelIntoState(state, state.quest.currentLevelIndex);
}

export function restartCurrentLevel(state) {
  state.quest.status = 'playing';
  state.isPaused = false;

  loadLevelIntoState(state, state.quest.currentLevelIndex);
}

export function advanceQuestLevel(state) {
  const lastIndex = QUEST_LEVELS.length - 1;

  if (state.quest.currentLevelIndex >= lastIndex) {
    state.quest.status = 'questComplete';
    state.isPaused = true;
    return;
  }

  state.quest.currentLevelIndex++;
  state.quest.status = 'playing';
  state.isPaused = false;

  loadLevelIntoState(state, state.quest.currentLevelIndex);
}

export function handlePlayerDeath(state) {
  state.quest.lives -= 1;

  if (state.quest.lives <= 0) {
    state.quest.lives = 0;
    state.quest.status = 'gameOver';
    state.isPaused = true;
    return;
  }

  state.quest.status = 'playing';
  state.isPaused = false;

  loadLevelIntoState(state, state.quest.currentLevelIndex);
}
