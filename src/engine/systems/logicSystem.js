// src/engine/systems/logicSystem.js

function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function updateLogic(state, dt) {
  updateKeys(state);
  // We'll add updateSwitches(state) later
}

/* ===========================
   KEYS → KEY COUNTS (by keyId)
   =========================== */
function updateKeys(state) {
  const { player, keys } = state;
  if (!keys || keys.length === 0) return;

  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;

  if (!state.keyCounts) state.keyCounts = {};

  for (let i = keys.length - 1; i >= 0; i--) {
    const k = keys[i];
    const r = k.r || 10;
    const d = distance(px, py, k.x, k.y);

    if (d < r + Math.min(player.w, player.h) / 2) {
      // Pick up key
      if (k.keyId) {
        state.keyCounts[k.keyId] = (state.keyCounts[k.keyId] || 0) + 1;
        console.log(
          `[Logic] Picked up keyId="${k.keyId}", now have:`,
          state.keyCounts
        );
      } else {
        console.warn('[Logic] Picked up a key without keyId:', k);
      }

      keys.splice(i, 1);
      state.score += 50;
    }
  }
}

// --- Switches ---

function updateSwitches(state) {
  const { player, switches, doors } = state;
  if (!switches || switches.length === 0) return;
  if (!doors || doors.length === 0) return;

  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;

  switches.forEach((sw) => {
    if (sw.activated) return;

    const inside =
      px >= sw.x &&
      px <= sw.x + sw.w &&
      py >= sw.y &&
      py <= sw.y + sw.h;

    if (!inside) return;

    // Activate the switch
    sw.activated = true;

    if (sw.doorIds && sw.doorIds.length > 0) {
      // Open specific doors by id
      for (let i = doors.length - 1; i >= 0; i--) {
        const d = doors[i];
        if (d.doorId && sw.doorIds.includes(d.doorId)) {
          doors.splice(i, 1);
        }
      }
    } else {
      // No explicit doorIds: open ALL switch doors
      for (let i = doors.length - 1; i >= 0; i--) {
        const d = doors[i];
        if (d.type === "switch") {
          doors.splice(i, 1);
        }
      }
    }
  });
}