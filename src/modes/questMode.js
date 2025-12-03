// src/modes/questMode.js
import { QUEST_LEVELS } from '../data/questLevels.js';
import { loadLevelIntoState } from '../core/state.js';
import { loadLevelById } from '../core/levelStorage.js';
import { loadLevelDataIntoState } from '../core/state.js';

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
  // 🚫 Never restart the real quest while in Creator Test
  if (state.mode === 'creator' && state.customTest) return;

  state.quest.currentLevelIndex = 0;
  state.quest.lives = 3;
  state.quest.status = 'playing';
  state.isPaused = false;

  loadLevelIntoState(state, state.quest.currentLevelIndex);
}

export function restartCurrentLevel(state) {
  // Creator Test handled in main.js
  if (state.mode === 'creator' && state.customTest) return;

  state.quest.status = 'playing';
  state.isPaused = false;

  // If we're running a custom portal
  if (state.portalRun && state.portalRun.type === "custom") {
    const idx = state.portalRun.indexInPortal ?? 0;
    const levelId = state.portalRun.levelIds[idx];
    const saved = loadLevelById(levelId);

    if (saved?.data) {
      loadLevelDataIntoState(state, saved.data);
      return;
    }
  }

  // Fallback: official quest level
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
  const inCreatorTest = state.mode === 'creator' && state.customTest;

  if (inCreatorTest) {
    state.quest.status = 'gameOver';
    return;
  }

  state.quest.lives -= 1;

  if (state.quest.lives <= 0) {
    state.quest.lives = 0;
    state.quest.status = "gameOver";
    state.isPaused = true;
    return;
  }

  // ⭐ ALWAYS restart properly
  restartCurrentLevel(state);
}
