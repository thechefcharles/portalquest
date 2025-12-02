// src/core/levelStorage.js

// NEW: All saved levels live under this key
const STORAGE_KEY = "portalquest_levels_v1";

// NEW: Read all saved levels (returns [] if none)
export function loadAllLevels() {
  // Guard for SSR / safety
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.error("[LevelStorage] Failed to parse levels", err);
    return [];
  }
}

// NEW: Write the full list back
function saveAllLevels(levels) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
  } catch (err) {
    console.error("[LevelStorage] Failed to save levels", err);
  }
}

// NEW: Create a new level object
export function createLevel({ name, data }) {
  const now = Date.now();
  return {
    id: `lvl-${now}-${Math.random().toString(36).slice(2, 8)}`,
    name: name?.trim() || "Untitled Level",
    createdAt: now,
    updatedAt: now,
    data
  };
}

// NEW: Insert or update a level (by id)
export function upsertLevel({ id, name, data }) {
  const levels = loadAllLevels();
  const now = Date.now();

  if (!id) {
    // No id = create new
    const newLevel = createLevel({ name, data });
    levels.push(newLevel);
    saveAllLevels(levels);
    return newLevel;
  }

  const idx = levels.findIndex((lvl) => lvl.id === id);
  if (idx === -1) {
    const newLevel = {
      id,
      name: name?.trim() || "Untitled Level",
      createdAt: now,
      updatedAt: now,
      data
    };
    levels.push(newLevel);
    saveAllLevels(levels);
    return newLevel;
  }

  // Update existing
  const existing = levels[idx];
  const updated = {
    ...existing,
    name: name?.trim() || existing.name,
    updatedAt: now,
    data
  };
  levels[idx] = updated;
  saveAllLevels(levels);
  return updated;
}

// NEW: Find a single level by id
export function loadLevelById(id) {
  const levels = loadAllLevels();
  return levels.find((lvl) => lvl.id === id) || null;
}

// NEW: Delete a level by id
export function deleteLevelById(id) {
  const levels = loadAllLevels();
  const filtered = levels.filter((lvl) => lvl.id !== id);
  saveAllLevels(filtered);
  return filtered;
}