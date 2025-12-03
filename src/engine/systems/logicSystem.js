// src/engine/systems/logicSystem.js

function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function updateLogic(state, dt) {
  updateKeys(state);
  updateSwitches(state);
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
// --- Switches → toggle switch doors ---
function updateSwitches(state) {
  const { player, switches, doors } = state;
  if (!switches || switches.length === 0) return;
  if (!doors || doors.length === 0) return;

  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;

  switches.forEach((sw) => {
    const inside =
      px >= sw.x &&
      px <= sw.x + sw.w &&
      py >= sw.y &&
      py <= sw.y + sw.h;

    // Not standing on the switch → allow it to be pressed again later
    if (!inside) {
      sw.isPressed = false;
      return;
    }

    // Already processed this press while we're standing here
    if (sw.isPressed) return;

    // Fresh press this frame
    sw.isPressed = true;

    if (!sw.switchId) {
      console.warn("[Logic] Switch has no switchId; it won't affect any doors:", sw);
      return;
    }

    doors.forEach((d) => {
      if (d.type !== "switch") return;

      // Support both new field (switchDoorId) and legacy (switchId) on the door
      const doorSwitchId = d.switchDoorId ?? d.switchId;
      if (!doorSwitchId) return;
      if (doorSwitchId !== sw.switchId) return;

      // Toggle this switch door open/closed
      d.isOpen = !d.isOpen;
      console.log(`[Logic] Toggled switch door "${doorSwitchId}" → isOpen=${d.isOpen}`);
    });
  });
}