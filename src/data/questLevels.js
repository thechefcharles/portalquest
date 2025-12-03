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
  name: "Portal 1: 1 – Corridor Intro",
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
  name: "Portal 1: 2 – Dangerous Corridor",
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
      keyId: "1",
    },
  ],

  doors: [
    {
      type: "key",
      keyDoorId: "1",
      x: CANVAS_WIDTH / 2 + 100,
      y: 220,
      w: 20,
      h: 60,
    },
    {
      type: "switch",
      switchDoorId: "A",
      x: CANVAS_WIDTH - 220,
      y: 180,
      w: 20,
      h: 80,
      isOpen: false,
    },
  ],

  switches: [
    {
      switchId: "A",
      x: CANVAS_WIDTH - 150,
      y: 300,          // 300–314, above bottom rail at 320–340
      w: 30,
      h: 14,
      isPressed: false,
    },
  ],
};

/* ==========================================
   LEVEL 3 – First real key door puzzle
   ========================================== */
const LEVEL_3 = {
  id: "quest-03",
  name: "Portal 1: 3 – First Lock",
  mode: "quest",
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,

  start: { x: 80, y: CANVAS_HEIGHT - 120 },
  portal: { x: CANVAS_WIDTH - 80, y: 100, r: PORTAL_RADIUS },

  obstacles: [
    // Simple zig-zag corridor
    { type: "solid", x: 60, y: 360, w: CANVAS_WIDTH - 120, h: 20 },
    { type: "solid", x: 60, y: 220, w: 220, h: 20 },
    { type: "solid", x: CANVAS_WIDTH - 280, y: 220, w: 220, h: 20 },
    { type: "solid", x: (CANVAS_WIDTH / 2) - 10, y: 240, w: 20, h: 140 },
  ],

  enemies: [
    {
      type: "patrol",
      x: CANVAS_WIDTH / 2 - 60,
      y: 340,
      w: 20,
      h: 20,
      vx: 1.2,
      axis: "horizontal",
    },
  ],

  powerups: [
    {
      type: "speed",
      x: 120,
      y: 340,
      r: 10,
    },
  ],

  traps: [
    {
      type: "glue",
      x: CANVAS_WIDTH / 2 + 40,
      y: 340,
      w: 80,
      h: 20,
    },
  ],

  keys: [
    {
      x: CANVAS_WIDTH - 140,
      y: 340,
      r: 10,
      keyId: "red",
    },
  ],

  doors: [
    {
      type: "key",
      keyDoorId: "red",
      x: CANVAS_WIDTH / 2 - 10,
      y: 200,
      w: 20,
      h: 40,
    },
  ],

  switches: [],
};

/* ==========================================
   LEVEL 4 – Two keys, one gate
   ========================================== */
const LEVEL_4 = {
  id: "quest-04",
  name: "Portal 1: 4 – Double Key Run",
  mode: "quest",
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,

  start: { x: 80, y: CANVAS_HEIGHT - 120 },
  portal: { x: CANVAS_WIDTH - 80, y: 100, r: PORTAL_RADIUS },

  obstacles: [
    // Left chamber
    { type: "solid", x: 40, y: 380, w: 260, h: 20 },
    { type: "solid", x: 40, y: 220, w: 20,  h: 160 },
    { type: "solid", x: 280, y: 220, w: 20,  h: 160 },

    // Right chamber
    { type: "solid", x: CANVAS_WIDTH - 300, y: 380, w: 260, h: 20 },
    { type: "solid", x: CANVAS_WIDTH - 300, y: 220, w: 20,  h: 160 },
    { type: "solid", x: CANVAS_WIDTH - 60,  y: 220, w: 20,  h: 160 },

    // Center corridor
    { type: "solid", x: CANVAS_WIDTH / 2 - 20, y: 260, w: 40, h: 140 },
  ],

  enemies: [
    {
      type: "patrol",
      x: 80,
      y: 360,
      w: 20,
      h: 20,
      vx: 1.5,
      axis: "horizontal",
    },
    {
      type: "patrol",
      x: CANVAS_WIDTH - 140,
      y: 360,
      w: 20,
      h: 20,
      vx: -1.5,
      axis: "horizontal",
    },
  ],

  powerups: [
    {
      type: "shield",
      x: CANVAS_WIDTH / 2,
      y: 340,
      r: 10,
    },
  ],

  traps: [
    {
      type: "spike",
      x: CANVAS_WIDTH / 2 - 40,
      y: 340,
      w: 80,
      h: 20,
    },
  ],

  keys: [
    {
      x: 140,
      y: 340,
      r: 10,
      keyId: "A",
    },
    {
      x: CANVAS_WIDTH - 180,
      y: 340,
      r: 10,
      keyId: "B",
    },
  ],

  doors: [
    // Both keys share the same gate
    {
      type: "key",
      keyDoorId: "A", // Either A or B works; your engine just counts
      x: CANVAS_WIDTH / 2 - 10,
      y: 220,
      w: 20,
      h: 40,
    },
  ],

  switches: [],
};

/* ==========================================
   LEVEL 5 – First switch gate (visual only)
   ========================================== */
const LEVEL_5 = {
  id: "quest-05",
  name: "Portal 1: 5 – Switch Study",
  mode: "quest",
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,

  start: { x: 100, y: CANVAS_HEIGHT - 120 },
  portal: { x: CANVAS_WIDTH - 100, y: 120, r: PORTAL_RADIUS },

  obstacles: [
    { type: "solid", x: 60, y: 360, w: CANVAS_WIDTH - 120, h: 20 },
    { type: "solid", x: 60, y: 200, w: CANVAS_WIDTH - 320, h: 20 },
    { type: "solid", x: CANVAS_WIDTH - 260, y: 200, w: 20, h: 160 },
  ],

  enemies: [
    {
      type: "chaser",
      x: CANVAS_WIDTH / 2,
      y: 320,
      w: 20,
      h: 20,
      speed: 1.1,
    },
  ],

  powerups: [
    {
      type: "dash",
      x: CANVAS_WIDTH / 2 - 80,
      y: 340,
      r: 10,
    },
  ],

  traps: [
    {
      type: "fire",
      x: CANVAS_WIDTH / 2 + 40,
      y: 340,
      w: 80,
      h: 20,
    },
  ],

  keys: [],

  doors: [
    {
      type: "switch",
      switchDoorId: "S5",
      x: CANVAS_WIDTH - 260,
      y: 160,
      w: 20,
      h: 40,
      isOpen: false,
    },
  ],

  switches: [
    {
      switchId: "S5",
      x: 140,
      y: 340,
      w: 30,
      h: 14,
      isPressed: false,
    },
  ],
};

/* ==========================================
   LEVEL 6 – Mixed keys, traps, and a spinner
   ========================================== */
const LEVEL_6 = {
  id: "quest-06",
  name: "Portal 1: 6 – Spinning Danger",
  mode: "quest",
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,

  start: { x: 80, y: CANVAS_HEIGHT - 140 },
  portal: { x: CANVAS_WIDTH - 80, y: 120, r: PORTAL_RADIUS },

  obstacles: [
    { type: "solid", x: 40, y: 380, w: CANVAS_WIDTH - 80, h: 20 },
    { type: "solid", x: 40, y: 220, w: 260, h: 20 },
    { type: "solid", x: CANVAS_WIDTH - 300, y: 220, w: 260, h: 20 },
  ],

  enemies: [
    {
      type: "spinner",
      cx: CANVAS_WIDTH / 2,
      cy: 300,
      radius: 40,
      angle: 0,
      angularSpeed: 1.6,
      w: 24,
      h: 24,
    },
    {
      type: "patrol",
      x: 80,
      y: 360,
      w: 20,
      h: 20,
      vx: 1.5,
      axis: "horizontal",
    },
  ],

  powerups: [
    {
      type: "shield",
      x: CANVAS_WIDTH / 2,
      y: 260,
      r: 10,
    },
  ],

  traps: [
    {
      type: "poison",
      x: CANVAS_WIDTH / 2 - 60,
      y: 340,
      w: 120,
      h: 20,
    },
  ],

  keys: [
    {
      x: 120,
      y: 200,
      r: 10,
      keyId: "blue",
    },
  ],

  doors: [
    {
      type: "key",
      keyDoorId: "blue",
      x: CANVAS_WIDTH / 2 - 10,
      y: 200,
      w: 20,
      h: 40,
    },
  ],

  switches: [],
};

/* ==========================================
   LEVEL 7 – Small maze with key + switch
   ========================================== */
const LEVEL_7 = {
  id: "quest-07",
  name: "Portal 1: 7 – Mini Maze",
  mode: "quest",
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,

  start: { x: 40, y: CANVAS_HEIGHT - 100 },
  portal: { x: CANVAS_WIDTH - 80, y: 120, r: PORTAL_RADIUS },

  obstacles: [
    { type: "solid", x: 40, y: 380, w: CANVAS_WIDTH - 80, h: 20 },
    { type: "solid", x: 40, y: 260, w: CANVAS_WIDTH - 320, h: 20 },
    { type: "solid", x: CANVAS_WIDTH - 340, y: 260, w: 20,  h: 120 },
    { type: "solid", x: 40, y: 140, w: CANVAS_WIDTH - 320, h: 20 },
    { type: "solid", x: CANVAS_WIDTH - 340, y: 140, w: 20,  h: 120 },
  ],

  enemies: [
    {
      type: "patrol",
      x: CANVAS_WIDTH / 2,
      y: 360,
      w: 20,
      h: 20,
      vx: 1.5,
      axis: "horizontal",
    },
    {
      type: "chaser",
      x: CANVAS_WIDTH / 2 - 100,
      y: 220,
      w: 20,
      h: 20,
      speed: 1.0,
    },
  ],

  powerups: [
    {
      type: "speed",
      x: 120,
      y: 240,
      r: 10,
    },
  ],

  traps: [
    {
      type: "glue",
      x: CANVAS_WIDTH / 2 - 80,
      y: 360,
      w: 60,
      h: 20,
    },
    {
      type: "spike",
      x: CANVAS_WIDTH / 2 + 40,
      y: 360,
      w: 60,
      h: 20,
    },
  ],

  keys: [
    {
      x: CANVAS_WIDTH - 200,
      y: 240,
      r: 10,
      keyId: "maze",
    },
  ],

  doors: [
    {
      type: "key",
      keyDoorId: "maze",
      x: CANVAS_WIDTH - 340,
      y: 220,
      w: 20,
      h: 40,
    },
    {
      type: "switch",
      switchDoorId: "M1",
      x: CANVAS_WIDTH - 260,
      y: 120,
      w: 20,
      h: 60,
      isOpen: false,
    },
  ],

  switches: [
    {
      switchId: "M1",
      x: CANVAS_WIDTH / 2,
      y: 340,
      w: 30,
      h: 14,
      isPressed: false,
    },
  ],
};

/* ==========================================
   LEVEL 8 – High-pressure corridor
   ========================================== */
const LEVEL_8 = {
  id: "quest-08",
  name: "Portal 1: 8 – Gauntlet",
  mode: "quest",
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,

  start: { x: 80, y: CANVAS_HEIGHT - 120 },
  portal: { x: CANVAS_WIDTH - 80, y: 80, r: PORTAL_RADIUS },

  obstacles: [
    { type: "solid", x: 40, y: 360, w: CANVAS_WIDTH - 80, h: 20 },
    { type: "solid", x: 40, y: 220, w: CANVAS_WIDTH - 80, h: 20 },
  ],

  enemies: [
    {
      type: "patrol",
      x: 120,
      y: 340,
      w: 20,
      h: 20,
      vx: 2.0,
      axis: "horizontal",
    },
    {
      type: "patrol",
      x: CANVAS_WIDTH - 180,
      y: 200,
      w: 20,
      h: 20,
      vx: -2.0,
      axis: "horizontal",
    },
    {
      type: "spinner",
      cx: CANVAS_WIDTH / 2,
      cy: 290,
      radius: 36,
      angle: 0,
      angularSpeed: 2.0,
      w: 20,
      h: 20,
    },
  ],

  powerups: [
    {
      type: "dash",
      x: 140,
      y: 200,
      r: 10,
    },
    {
      type: "shield",
      x: CANVAS_WIDTH - 200,
      y: 340,
      r: 10,
    },
  ],

  traps: [
    {
      type: "fire",
      x: CANVAS_WIDTH / 2 - 60,
      y: 340,
      w: 120,
      h: 20,
    },
    {
      type: "poison",
      x: CANVAS_WIDTH / 2 - 60,
      y: 200,
      w: 120,
      h: 20,
    },
  ],

  keys: [],
  doors: [],
  switches: [],
};

/* ==========================================
   LEVEL 9 – Key + Switch Combo
   ========================================== */
const LEVEL_9 = {
  id: "quest-09",
  name: "Portal 1: 9 – Combo Lock",
  mode: "quest",
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,

  start: { x: 80, y: CANVAS_HEIGHT - 190 },
  portal: { x: CANVAS_WIDTH - 80, y: 120, r: PORTAL_RADIUS },

  obstacles: [
    { type: "solid", x: 40, y: 380, w: CANVAS_WIDTH - 80, h: 20 },
    { type: "solid", x: 40, y: 260, w: CANVAS_WIDTH - 200, h: 20 },
    { type: "solid", x: CANVAS_WIDTH - 260, y: 200, w: 20, h: 80 },
  ],

  enemies: [
    {
      type: "chaser",
      x: CANVAS_WIDTH / 2,
      y: 320,
      w: 20,
      h: 20,
      speed: 1.2,
    },
  ],

  powerups: [
    {
      type: "speed",
      x: 140,
      y: 340,
      r: 10,
    },
  ],

  traps: [
    {
      type: "spike",
      x: CANVAS_WIDTH / 2 - 40,
      y: 340,
      w: 80,
      h: 20,
    },
  ],

  keys: [
    {
      x: CANVAS_WIDTH / 2 - 120,
      y: 340,
      r: 10,
      keyId: "combo",
    },
  ],

  doors: [
    {
      type: "key",
      keyDoorId: "combo",
      x: CANVAS_WIDTH - 260,
      y: 260,
      w: 20,
      h: 40,
    },
    {
      type: "switch",
      switchDoorId: "C1",
      x: CANVAS_WIDTH - 160,
      y: 180,
      w: 20,
      h: 60,
      isOpen: false,
    },
  ],

  switches: [
    {
      switchId: "C1",
      x: CANVAS_WIDTH / 2 + 60,
      y: 340,
      w: 30,
      h: 14,
      isPressed: false,
    },
  ],
};

/* ==========================================
   LEVEL 10 – Final Portal 1 Challenge
   ========================================== */
const LEVEL_10 = {
  id: "quest-10",
  name: "Portal 1: 10 – Final Trial",
  mode: "quest",
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,

  start: { x: 80, y: CANVAS_HEIGHT - 160 },
  portal: { x: CANVAS_WIDTH - 80, y: 100, r: PORTAL_RADIUS },

  obstacles: [
    { type: "solid", x: 40, y: 380, w: CANVAS_WIDTH - 80, h: 20 },
    { type: "solid", x: 40, y: 260, w: CANVAS_WIDTH - 80, h: 20 },
    { type: "solid", x: CANVAS_WIDTH / 2 - 20, y: 140, w: 40, h: 120 },
  ],

  enemies: [
    {
      type: "patrol",
      x: 100,
      y: 360,
      w: 20,
      h: 20,
      vx: 2.0,
      axis: "horizontal",
    },
    {
      type: "patrol",
      x: CANVAS_WIDTH - 160,
      y: 240,
      w: 20,
      h: 20,
      vx: -2.0,
      axis: "horizontal",
    },
    {
      type: "spinner",
      cx: CANVAS_WIDTH / 2,
      cy: 320,
      radius: 40,
      angle: 0,
      angularSpeed: 2.0,
      w: 24,
      h: 24,
    },
    {
      type: "chaser",
      x: CANVAS_WIDTH / 2 - 80,
      y: 220,
      w: 20,
      h: 20,
      speed: 1.3,
    },
  ],

  powerups: [
    {
      type: "shield",
      x: 140,
      y: 240,
      r: 10,
    },
    {
      type: "dash",
      x: CANVAS_WIDTH - 180,
      y: 340,
      r: 10,
    },
  ],

  traps: [
    {
      type: "fire",
      x: CANVAS_WIDTH / 2 - 80,
      y: 340,
      w: 160,
      h: 20,
    },
    {
      type: "poison",
      x: CANVAS_WIDTH / 2 - 40,
      y: 220,
      w: 80,
      h: 20,
    },
  ],

  keys: [
    {
      x: 120,
      y: 340,
      r: 10,
      keyId: "final",
    },
  ],

  doors: [
    {
      type: "key",
      keyDoorId: "final",
      x: CANVAS_WIDTH / 2 - 10,
      y: 260,
      w: 20,
      h: 40,
    },
    {
      type: "switch",
      switchDoorId: "F1",
      x: CANVAS_WIDTH - 260,
      y: 200,
      w: 20,
      h: 80,
      isOpen: false,
    },
  ],

  switches: [
    {
      switchId: "F1",
      x: CANVAS_WIDTH / 2,
      y: 340,
      w: 30,
      h: 14,
      isPressed: false,
    },
  ],
};

export const QUEST_LEVELS = [
  LEVEL_1,
  LEVEL_2,
  LEVEL_3,
  LEVEL_4,
  LEVEL_5,
  LEVEL_6,
  LEVEL_7,
  LEVEL_8,
  LEVEL_9,
  LEVEL_10,
];