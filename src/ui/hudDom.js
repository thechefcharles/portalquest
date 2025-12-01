// src/ui/hudDom.js
// Update HUD DOM elements based on GameState

const hudLevel = document.getElementById("hudLevel");
const hudLives = document.getElementById("hudLives");
const hudHealth = document.getElementById("hudHealth");
const hudScore = document.getElementById("hudScore");
const hudDash = document.getElementById("hudDash");
const hudKey = document.getElementById("hudKey");
const hudStatus = document.getElementById("hudStatus");

export function updateHUDDom(state) {
  const { player } = state;

  // Level: show 1-based index
  if (state.currentLevelIndex != null) {
    hudLevel.textContent = String(state.currentLevelIndex + 1);
  } else {
    hudLevel.textContent = "-";
  }

  hudLives.textContent = String(state.lives ?? 3);
  hudHealth.textContent = String(Math.round(player.health));
  hudScore.textContent = String(state.score ?? 0);
  hudDash.textContent = String(player.dashCharges ?? 0);
  hudKey.textContent = state.hasKey ? "YES" : "NO";

  const statusPieces = [];

  if (player.speedBoostTimer > 0) statusPieces.push("SPEED");
  if (player.shieldTimer > 0) statusPieces.push("SHIELD");
  if (player.slowFactor && player.slowFactor < 1) statusPieces.push("GLUE");
  if (player.onFire) statusPieces.push("FIRE");
  if (player.poisonTimer && player.poisonTimer > 0) statusPieces.push("POISON");
  if (state.gameOver) statusPieces.push("DEAD");
  if (state.gameWon) statusPieces.push("LEVEL COMPLETE");

  let statusText = "Status: normal";
  if (statusPieces.length > 0) {
    statusText = "Status: " + statusPieces.join(" + ");
  }

  hudStatus.textContent = statusText;
}