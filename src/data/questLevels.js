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

// LEVEL 2 – Dangerous corridor, rebuilt to avoid overlaps
const LEVEL_2 = {
  id: "quest-02",
  name: "Dangerous Corridor",
  mode: "quest",
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,

  start: { x: 100, y: CANVAS_HEIGHT - 120 },

  portal: { x: CANVAS_WIDTH - 80, y: 80, r: PORTAL_RADIUS },

  obstacles: [
    // Top and bottom rails
    { type: "solid", x: 60,  y: 140, w: 440, h: 20 },  // top rail (y 140–160)
    { type: "solid", x: 60,  y: 320, w: 440, h: 20 },  // bottom rail (y 320–340)

    // Center pillar (shorter so doors/traps don't intersect)
    { type: "solid", x: CANVAS_WIDTH / 2 - 10, y: 180, w: 20, h: 80 }, // 180–260
  ],

  enemies: [
    // Patrol on lower lane between rails
    {
      type: "patrol",
      x: 140,
      y: 260,
      w: 20,
      h: 20,
      vx: 1.5,
      axis: "horizontal",
    },
    // Chaser in mid corridor, right side
    {
      type: "chaser",
      x: CANVAS_WIDTH / 2 + 80,
      y: 220,
      w: 20,
      h: 20,
      speed: 1.2,
    },
    // Spinner on left side, clearly away from pillar/walls
    {
      type: "spinner",
      cx: 160,
      cy: 220,
      radius: 24,       // bounding box: x 136–184, y 196–244
      angle: 0,
      angularSpeed: 1.8,
      w: 20,
      h: 20,
    },
  ],

  powerups: [
    // Speed in lower-middle corridor
    {
      type: "speed",
      x: 120,
      y: 260,
      r: 10,
    },
    // Shield mid-right, clear of pillar and traps
    {
      type: "shield",
      x: CANVAS_WIDTH / 2 + 60,
      y: 200,
      r: 10,
    },
    // Dash near upper-right but away from doors/walls
    {
      type: "dash",
      x: CANVAS_WIDTH - 140,
      y: 240,
      r: 10,
    },
  ],

  traps: [
    // Glue in lower-middle, not touching rails or doors
    {
      type: "glue",
      x: 220,
      y: 260,          // 260–284, below pillar (180–260) and above bottom rail (320–340)
      w: 60,
      h: 24,
    },
    // Fire mid-right, not intersecting doors
    {
      type: "fire",
      x: CANVAS_WIDTH - 220,
      y: 260,
      w: 60,
      h: 20,
    },
    // Poison mid-left corridor, away from spinner orbit now
    {
      type: "poison",
      x: 80,
      y: 200,          // 200–224, spinner bbox is 196–244 but x 136–184, so separated
      w: 40,
      h: 24,
    },
    // Spikes near the center-right corridor, not touching pillar
    {
      type: "spike",
      x: CANVAS_WIDTH / 2 + 40,
      y: 260,
      w: 40,
      h: 20,
    },
  ],

  keys: [
    // Key low-left, away from speed powerup
    {
      x: 120,
      y: 300,          // between rails, not overlapping speed at (120,260)
      r: 10,
    },
  ],

doors: [
  {
    type: "key",
    keyId: "1",       // still ok, engine supports this
    keyDoorId: "1",   // NEW – explicit key door id
    x: CANVAS_WIDTH / 2 + 100,
    y: 220,
    w: 20,
    h: 60,
  },
  {
    type: "switch",
    switchDoorId: "A",  // for later when we wire switches
    x: CANVAS_WIDTH - 180,
    y: 180,
    w: 20,
    h: 80,
    isOpen: false,
  },
],

  switches: [
    // Switch down near bottom rail on the far right
    {
      switchId: "S1",
      doorIds: ["D2"],
      x: CANVAS_WIDTH - 150,
      y: 300,          // 300–314, above bottom rail at 320–340
      w: 30,
      h: 14,
      activated: false,
    },
  ],
};

export const QUEST_LEVELS = [LEVEL_1, LEVEL_2];
