// src/ui/hudDom.js
// Update HUD DOM elements based on GameState

const hudLevel  = document.getElementById("hudLevel");
const hudLives  = document.getElementById("hudLives");
const hudHealth = document.getElementById("hudHealth");
const hudScore  = document.getElementById("hudScore");
const hudDash   = document.getElementById("hudDash");
const hudKey    = document.getElementById("hudKey");
const hudStatus = document.getElementById("hudStatus");

export function updateHUDDom(state) {
  if (!state || !state.player) return;

  // If we’re on a screen without a HUD, just skip updating.
  if (
    !hudLevel ||
    !hudLives ||
    !hudHealth ||
    !hudScore ||
    !hudDash ||
    !hudKey ||
    !hudStatus
  ) {
    return;
  }

  const { player } = state;

  // Level: prefer quest.currentLevelIndex, fall back to state.currentLevelIndex
  const idx =
    (state.quest && typeof state.quest.currentLevelIndex === "number")
      ? state.quest.currentLevelIndex
      : (typeof state.currentLevelIndex === "number" ? state.currentLevelIndex : null);

  if (idx != null && idx >= 0) {
    hudLevel.textContent = String(idx + 1);
  } else {
    hudLevel.textContent = "-";
  }

  // Lives: always use quest.lives (default 3)
  const lives =
    state.quest && typeof state.quest.lives === "number"
      ? state.quest.lives
      : 3;
  hudLives.textContent = String(lives);

  hudHealth.textContent = String(Math.round(player.health));
  hudScore.textContent  = String(state.score ?? 0);
  hudDash.textContent   = String(player.dashCharges ?? 0);

  // Key indicator: “YES” if we have ANY keys in inventory
  const hasAnyKey =
    (state.keyCounts && Object.keys(state.keyCounts).length > 0) ||
    state.hasKey;
  hudKey.textContent = hasAnyKey ? "YES" : "NO";

  // Status line
  const statusPieces = [];

  if (player.speedBoostTimer > 0) statusPieces.push("SPEED");
  if (player.shieldTimer > 0)     statusPieces.push("SHIELD");
  if (player.slowFactor && player.slowFactor < 1) statusPieces.push("GLUE");
  if (player.onFire)              statusPieces.push("FIRE");
  if (player.poisonTimer && player.poisonTimer > 0) statusPieces.push("POISON");
  if (state.gameOver)            statusPieces.push("DEAD");
  if (state.gameWon)             statusPieces.push("LEVEL COMPLETE");

  let statusText = "Status: normal";
  if (statusPieces.length > 0) {
    statusText = "Status: " + statusPieces.join(" + ");
  }

  hudStatus.textContent = statusText;
}