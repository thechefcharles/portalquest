// src/ui/menuDom.js
// DOM helpers for showing/hiding main menu, quest screen, level select

const homeScreen = document.getElementById("homeScreen");
const questScreen = document.getElementById("questScreen");
const levelSelectScreen = document.getElementById("levelSelectScreen");

export function showMainMenu() {
  homeScreen.style.display = "flex";
  questScreen.style.display = "none";
  levelSelectScreen.style.display = "none";
}

export function showQuestScreen() {
  homeScreen.style.display = "none";
  questScreen.style.display = "grid";
  levelSelectScreen.style.display = "none";
}

export function showLevelSelectScreen() {
  homeScreen.style.display = "none";
  questScreen.style.display = "none";
  levelSelectScreen.style.display = "flex";
}
