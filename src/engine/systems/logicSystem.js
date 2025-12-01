// src/engine/systems/logicSystem.js
// Handles keys, doors, and switches logic

function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function updateLogic(state, dt) {
  updateKeys(state);
  updateSwitches(state);
}

// --- Keys ---

function updateKeys(state) {
  const { player, keys } = state;
  if (!keys || keys.length === 0) return;

  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;

  for (let i = keys.length - 1; i >= 0; i--) {
    const k = keys[i];
    const d = distance(px, py, k.x, k.y);
    const r = k.r || 10;

    if (d < r + Math.min(player.w, player.h) / 2) {
      state.hasKey = true;
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