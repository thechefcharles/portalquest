// src/core/config.js
// Core configuration constants for PortalQuest v2

export const GRID_SIZE = 20;

export const CANVAS_WIDTH = 568;
export const CANVAS_HEIGHT = 390;

// Player dimensions & speed
export const PLAYER_WIDTH = 20;
export const PLAYER_HEIGHT = 20;
export const PLAYER_BASE_SPEED = 3; // tuned around 60 FPS loop

// Portal radius
export const PORTAL_RADIUS = 18;

// Colors for neon aesthetic
export const COLORS = {
  backgroundTop: "#1c2541",
  backgroundBottom: "#020308",
  gridLine: "rgba(80, 130, 200, 0.35)",

  wallFill: "#1b2535",
  wallStroke: "#4f6a9a",

  playerFillTop: "#ffdd66",
  playerFillBottom: "#ff9f3b",

  portalInner: "#6effff",
  portalMid: "#00b9ff",
  portalOuter: "rgba(0, 20, 40, 0.1)",
};