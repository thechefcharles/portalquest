// src/ui/creatorDom.js
// NEW: DOM + UI wiring for the Level Creator (name input + save button)

import {
  editorState,
  startNewLevel,
  setLevelName,
  buildLevelPayloadForSave,
  resetEditorUiState,
  loadLevelFromSave,
} from "../editor/editorState.js";

import {
  upsertLevel,
} from "../core/levelStorage.js";

import {
  validateLevel,
} from "../editor/editorPlacementValidator.js";

// Cache DOM refs
let nameInputEl = null;
let saveBtnEl = null;
let statusEl = null;

/**
 * Call this once on startup (e.g. from main.js or menuDom.js)
 * after the DOM is loaded.
 */
export function initCreatorDom() {
  // Grab elements (IDs defined in index.html snippet below)
  nameInputEl = document.getElementById("level-name-input");
  saveBtnEl = document.getElementById("save-level-btn");
  statusEl = document.getElementById("creator-save-status");

  if (nameInputEl) {
    nameInputEl.addEventListener("input", (e) => {
      setLevelName(e.target.value);
    });
  }

  if (saveBtnEl) {
    saveBtnEl.addEventListener("click", onSaveButtonClick);
  }
}

/**
 * Call this whenever you ENTER the creator screen
 * (from main menu or from "My Levels").
 * It syncs the text input with the current level.
 */
export function syncCreatorUiFromState() {
  if (!nameInputEl) return;
  const lvl = editorState.currentLevel;
  nameInputEl.value = lvl?.name || "";
}

/**
 * Create a brand-new level and open the Creator.
 * Use this when the user clicks "Level Creator" / "New Level".
 */
export function openNewLevelInCreator() {
  startNewLevel();
  resetEditorUiState();
  syncCreatorUiFromState();
  // Any other "show creator screen" logic can happen outside this function.
}

/**
 * Load an existing saved level and open the Creator.
 * Use this from the "My Levels" screen.
 */
export function openSavedLevelInCreator(savedLevel) {
  loadLevelFromSave(savedLevel);
  resetEditorUiState();
  syncCreatorUiFromState();
}

/* ---------- Internal helpers ---------- */

function onSaveButtonClick() {
  if (!editorState.currentLevel) {
    showStatus("No level loaded to save.", true);
    return;
  }

  // Run your validator so we don't save broken levels
  const result = validateLevel(editorState.currentLevel);
  if (!result.isValid) {
    const issueCount = result.issues?.length ?? 0;
    showStatus(`Fix ${issueCount} issue(s) before saving.`, true);
    return;
  }

  const payload = buildLevelPayloadForSave();
  if (!payload) {
    showStatus("Unable to build level payload.", true);
    return;
  }

  const saved = upsertLevel(payload);

  // Sync editor state with whatever storage returned
  if (saved) {
    if (editorState.currentLevel) {
      editorState.currentLevel.id = saved.id;
      editorState.currentLevel.name = saved.name;
    }
    if (nameInputEl) {
      nameInputEl.value = saved.name;
    }
    showStatus("Level saved ✔", false);
  } else {
    showStatus("Save failed.", true);
  }
}

function showStatus(message, isError = false) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#ff5555" : "#4caf50";

  clearTimeout(statusEl._timeoutId);
  statusEl._timeoutId = setTimeout(() => {
    statusEl.textContent = "";
  }, 2500);
}