// src/core/portalStorage.js

const PORTAL_STORAGE_KEY = "portalquest_portals_v1";

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function loadAllPortals() {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(PORTAL_STORAGE_KEY);
  if (!raw) return [];
  const parsed = safeParse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

function saveAllPortals(portals) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PORTAL_STORAGE_KEY, JSON.stringify(portals));
  } catch (err) {
    console.error("[PortalStorage] Failed to save portals", err);
  }
}

export function createPortal({ name, levelIds }) {
  const now = Date.now();
  return {
    id: `portal-${now}-${Math.random().toString(36).slice(2, 8)}`,
    name: typeof name === "string" ? name : "Untitled Portal",
    levelIds: Array.isArray(levelIds) ? levelIds : [],
    createdAt: now,
    updatedAt: now,
  };
}

export function upsertPortal({ id, name, levelIds }) {
  const portals = loadAllPortals();
  const now = Date.now();

  const safeName =
    typeof name === "string" ? name : "Untitled Portal";
  const safeLevelIds = Array.isArray(levelIds) ? levelIds : [];

  if (!id) {
    const portal = createPortal({ name: safeName, levelIds: safeLevelIds });
    portals.push(portal);
    saveAllPortals(portals);
    return portal;
  }

  const idx = portals.findIndex((p) => p.id === id);
  if (idx === -1) {
    const portal = {
      id,
      name: safeName,
      levelIds: safeLevelIds,
      createdAt: now,
      updatedAt: now,
    };
    portals.push(portal);
    saveAllPortals(portals);
    return portal;
  }

  const existing = portals[idx];
  const updated = {
    ...existing,
    name: safeName,
    levelIds: safeLevelIds,
    updatedAt: now,
  };

  portals[idx] = updated;
  saveAllPortals(portals);
  return updated;
}

export function loadPortalById(id) {
  const portals = loadAllPortals();
  return portals.find((p) => p.id === id) || null;
}

export function deletePortalById(id) {
  const portals = loadAllPortals();
  const filtered = portals.filter((p) => p.id !== id);
  saveAllPortals(filtered);
  return filtered;
}