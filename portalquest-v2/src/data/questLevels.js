// src/data/questLevels.js
// Built-in quest levels for PortalQuest

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PORTAL_RADIUS,
} from "../core/config.js";

// LEVEL 1 – simple intro: just walls + portal
const LEVEL_1 = {
  id: "quest-01",
  name: "Corridor Intro",
  mode: "quest",
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,

  start: { x: 100, y: CANVAS_HEIGHT - 120 },
  portal: { x: CANVAS_WIDTH - 80, y: 80, r: PORTAL_RADIUS },

  obstacles: [
    { type: "solid", x: 60,  y: 320, w: 440, h: 20 },
    { type: "solid", x: 60,  y: 160, w: 20,  h: 160 },
    { type: "solid", x: 480, y: 160, w: 20,  h: 160 },
  ],

  enemies: [],
  powerups: [],
  traps: [],
  keys: [],
  doors: [],
  switches: [],
};

// LEVEL 2 – your full test level from Phase 4 (enemies + powerups + traps + logic)
const LEVEL_2 = {
  id: "quest-02",
  name: "Dangerous Corridor",
  mode: "quest",
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,

  start: { x: 100, y: CANVAS_HEIGHT - 120 },

  portal: { x: CANVAS_WIDTH - 80, y: 80, r: PORTAL_RADIUS },

  obstacles: [
    { type: "solid", x: 60,  y: 140, w: 440, h: 20 },
    { type: "solid", x: 60,  y: 320, w: 440, h: 20 },
    { type: "solid", x: CANVAS_WIDTH / 2 - 10, y: 180, w: 20, h: 120 },
  ],

  enemies: [
    {
      type: "patrol",
      x: 160,
      y: CANVAS_HEIGHT - 140,
      w: 20,
      h: 20,
      vx: 1.5,
      axis: "horizontal",
    },
    {
      type: "chaser",
      x: CANVAS_WIDTH / 2 - 10,
      y: 220,
      w: 20,
      h: 20,
      speed: 1.2,
    },
    {
      type: "spinner",
      cx: CANVAS_WIDTH / 2,
      cy: 160,
      radius: 40,
      angle: 0,
      angularSpeed: 1.8,
      w: 20,
      h: 20,
    },
  ],

  powerups: [
    {
      type: "speed",
      x: 140,
      y: CANVAS_HEIGHT - 160,
      r: 10,
    },
    {
      type: "shield",
      x: CANVAS_WIDTH / 2,
      y: 260,
      r: 10,
    },
    {
      type: "dash",
      x: 120,
      y: 170,
      r: 10,
    },
  ],

  traps: [
    { type: "glue",   x: 180, y: CANVAS_HEIGHT - 150, w: 60, h: 30 },
    { type: "fire",   x: CANVAS_WIDTH - 140, y: 260, w: 60, h: 20 },
    { type: "poison", x: 100, y: 150, w: 40, h: 30 },
    { type: "spike",  x: CANVAS_WIDTH / 2 + 60, y: 120, w: 40, h: 20 },
  ],

  keys: [
    {
      x: 120,
      y: CANVAS_HEIGHT - 180,
      r: 10,
    },
  ],

  doors: [
    {
      type: "key",
      doorId: "D1",
      x: CANVAS_WIDTH / 2 - 10,
      y: 260,
      w: 20,
      h: 60,
    },
    {
      type: "switch",
      doorId: "D2",
      x: CANVAS_WIDTH - 160,
      y: 120,
      w: 20,
      h: 80,
    },
  ],

  switches: [
    {
      switchId: "S1",
      doorIds: ["D2"],
      x: CANVAS_WIDTH - 150,
      y: CANVAS_HEIGHT - 140,
      w: 30,
      h: 14,
      activated: false,
    },
  ],
};

export const QUEST_LEVELS = [LEVEL_1, LEVEL_2];