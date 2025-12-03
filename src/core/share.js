// src/core/share.js
// Helpers for exporting & importing levels/portals as JSON files.

import { loadLevelById, upsertLevel, loadAllLevels } from "./levelStorage.js";
import { loadPortalById, upsertPortal } from "./portalStorage.js";

/**
 * Small helper to trigger a JSON download in the browser.
 */
function downloadJson(filename, dataObject) {
  const json = JSON.stringify(dataObject, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

/* ============================================
   EXPORT: SINGLE LEVEL → portalquest-level.json
   ============================================ */

/**
 * Export a single saved level by id as a JSON download.
 *
 * Shape:
 * {
 *   type: "portalquest-level",
 *   version: 1,
 *   level: { ...full level object... }
 * }
 */
export function exportLevelToFile(levelId) {
  const saved = loadLevelById(levelId);
  if (!saved) {
    console.warn("[share] No level found with id:", levelId);
    return;
  }

  // Some stores wrap as { id, name, data: {...} }, others store raw.
  const levelData = saved.data || saved;

  const bundle = {
    type: "portalquest-level",
    version: 1,
    level: levelData,
  };

  const safeName = (levelData.name || "level").replace(/[^\w\-]+/g, "_");
  const filename = `${safeName}.portalquest-level.json`;

  downloadJson(filename, bundle);
}

/* ============================================
   EXPORT: PORTAL + ITS LEVELS → portalquest-portal.json
   ============================================ */

/**
 * Export a portal (sequence of levels) as a JSON download.
 *
 * Shape:
 * {
 *   type: "portalquest-portal",
 *   version: 1,
 *   portal: { id, name, levelIds: [...] },
 *   levels: [ { ...level1... }, { ...level2... }, ... ]
 * }
 *
 * This lets a friend import the whole portal and
 * all referenced levels in one shot.
 */
export function exportPortalToFile(portalId) {
  const portal = loadPortalById(portalId);
  if (!portal) {
    console.warn("[share] No portal found with id:", portalId);
    return;
  }

  const allLevels = loadAllLevels();
  const levelMap = new Map(allLevels.map((lvl) => [lvl.id, lvl]));

  const levels = [];
  const missing = [];

  (portal.levelIds || []).forEach((id) => {
    const saved = levelMap.get(id);
    if (!saved) {
      missing.push(id);
      return;
    }
    const levelData = saved.data || saved;
    levels.push(levelData);
  });

  if (missing.length > 0) {
    console.warn(
      "[share] Warning: portal references missing level ids:",
      missing
    );
  }

  const bundle = {
    type: "portalquest-portal",
    version: 1,
    portal: {
      id: portal.id,
      name: portal.name,
      levelIds: portal.levelIds || [],
    },
    levels,
  };

  const safeName = (portal.name || "portal").replace(/[^\w\-]+/g, "_");
  const filename = `${safeName}.portalquest-portal.json`;

  downloadJson(filename, bundle);
}

/* ============================================
   IMPORT HELPERS (no UI yet)
   ============================================ */

/**
 * Import a level bundle object (already parsed JSON),
 * save it as a new local level, and return the new id.
 *
 * By default we prefix with "imported-" to avoid id collisions.
 */
export function importLevelBundle(bundle) {
  if (!bundle || bundle.type !== "portalquest-level") {
    console.warn("[share] Not a portalquest-level bundle:", bundle);
    return null;
  }

  const level = bundle.level;
  if (!level) {
    console.warn("[share] Level bundle is missing 'level' field.");
    return null;
  }

  const newId = `imported-level-${Date.now()}-${Math.floor(
    Math.random() * 1e6
  )}`;

  const saved = upsertLevel({
    id: newId,
    name: level.name || "Imported Level",
    data: level,
  });

  return saved?.id || newId;
}

/**
 * Import a portal bundle object (already parsed JSON),
 * save all levels and portal under new ids, and return the new portal id.
 *
 * For now, we store it in the regular portal storage as a "My Portal".
 * Later we can add a separate 'importedPortalStorage' if we want.
 */
export function importPortalBundle(bundle) {
  if (!bundle || bundle.type !== "portalquest-portal") {
    console.warn("[share] Not a portalquest-portal bundle:", bundle);
    return null;
  }

  const portalMeta = bundle.portal;
  const levels = bundle.levels || [];

  if (!portalMeta || !Array.isArray(levels) || levels.length === 0) {
    console.warn("[share] Portal bundle missing portal or levels.");
    return null;
  }

  // 1) Save all levels with new ids
  const idMap = new Map(); // oldId -> newId
  const newLevelIds = [];

  levels.forEach((lvl) => {
    const oldId = lvl.id || `anon-${Math.random()}`;

    const newId = `imported-level-${Date.now()}-${Math.floor(
      Math.random() * 1e6
    )}`;

    idMap.set(oldId, newId);
    newLevelIds.push(newId);

    upsertLevel({
      id: newId,
      name: lvl.name || "Imported Level",
      data: { ...lvl, id: newId },
    });
  });

  // 2) Create a new portal record that points to our new level ids
  const newPortalId = `imported-portal-${Date.now()}-${Math.floor(
    Math.random() * 1e6
  )}`;

  const savedPortal = upsertPortal({
    id: newPortalId,
    name: portalMeta.name || "Imported Portal",
    levelIds: newLevelIds,
  });

  return savedPortal?.id || newPortalId;
}