// levels.js
// All level data + global constants

export const CANVAS_WIDTH = 568;
export const CANVAS_HEIGHT = 390;
export const MAX_LIVES = 3;

export const levels = [
  {
    // Level 0 - corridor, patrol enemy, speed boost, glue patch, spike
    start: { x: 40, y: CANVAS_HEIGHT - 60 },
    portal: { x: CANVAS_WIDTH - 60, y: 60, r: 18 },
    enemies: [
      { type: "patrol", x: 250, y: 260, w: 20, h: 20, vx: 2 }
    ],
    obstacles: [
      // horizontal walls (bottom split to create doorway)
      { x: 80,  y: 320, w: 160, h: 20 },
      { x: 340, y: 320, w: 160, h: 20 },
      { x: 80,  y: 220, w: 180, h: 20 },
      { x: 320, y: 220, w: 180, h: 20 },
      { x: 80,  y: 140, w: 420, h: 20 },

      // vertical blockers
      { x: 80,  y: 160, w: 20,  h: 160 },
      { x: 480, y: 160, w: 20,  h: 160 }
    ],
    powerups: [
      // bottom lane, reachable
      { type: "speed", x: 220, y: CANVAS_HEIGHT - 70, r: 10 }
    ],
    traps: [
      // glue patch in inner corridor
      { type: "glue",  x: 260, y: 240, w: 60, h: 40 },
      // spike near portal path
      { type: "spike", x: CANVAS_WIDTH - 130, y: 260, w: 20, h: 20 }
    ]
  },
  {
    // Level 1 - maze, patrol + chaser, shield, fire & poison
    start: { x: CANVAS_WIDTH - 80, y: CANVAS_HEIGHT - 60 },
    portal: { x: 80, y: 60, r: 18 },
    enemies: [
      { type: "patrol", x: 220, y: 260, w: 20, h: 20, vx: 2.5 },
      { type: "chaser", x: 260, y: 210, w: 20, h: 20, speed: 1.5 }
    ],
    obstacles: [
      // outer frame-ish (bottom split for doorway)
      { x: 60,  y: 100, w: 440, h: 20 },
      { x: 60,  y: 300, w: 160, h: 20 },
      { x: 340, y: 300, w: 160, h: 20 },
      { x: 60,  y: 100, w: 20,  h: 220 },
      { x: 480, y: 120, w: 20,  h: 200 },

      // inner maze bits
      { x: 160, y: 180, w: 220, h: 20 },
      { x: 160, y: 220, w: 20,  h: 80 },
      { x: 360, y: 180, w: 20,  h: 80 }
    ],
    powerups: [
      { type: "shield", x: 330, y: 260, r: 10 }
    ],
    traps: [
      // fire strip near center
      { type: "fire",   x: 260, y: 200, w: 40, h: 20 },
      // poison pool on the way to portal
      { type: "poison", x: 140, y: 260, w: 40, h: 30 }
    ]
  },
  {
    // Level 2 - spinner enemy + dash powerup
    start: { x: 80, y: CANVAS_HEIGHT - 70 },
    portal: { x: CANVAS_WIDTH - 80, y: 70, r: 18 },
    enemies: [
      {
        type: "spinner",
        cx: CANVAS_WIDTH / 2,
        cy: CANVAS_HEIGHT / 2,
        radius: 80,
        angle: 0,
        angularSpeed: 1.5,
        w: 20,
        h: 20
      }
    ],
    obstacles: [
      // simple frame with gap at bottom
      { x: 60,  y: 100, w: 440, h: 20 },
      { x: 60,  y: 300, w: 160, h: 20 },
      { x: 340, y: 300, w: 160, h: 20 },
      { x: 60,  y: 100, w: 20,  h: 220 },
      { x: 480, y: 100, w: 20,  h: 220 }
    ],
    powerups: [
      { type: "speed", x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 80, r: 10 },
      { type: "dash",  x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 + 80, r: 10 }
    ],
    traps: [
      { type: "glue", x: CANVAS_WIDTH / 2 - 40, y: CANVAS_HEIGHT / 2 - 15, w: 80, h: 30 }
    ]
  },
  {
    // Level 3 - Key & Locked Door Tutorial (fixed layout)
    // Start in the bottom corridor, grab the key, unlock the center door, reach portal.
    start: { x: CANVAS_WIDTH / 2 - 20, y: CANVAS_HEIGHT - 70 },
    portal: { x: CANVAS_WIDTH - 120, y: 160, r: 18 },
    enemies: [
      { type: "patrol", x: CANVAS_WIDTH / 2 + 40, y: 260, w: 20, h: 20, vx: 2 }
    ],
    obstacles: [
      // top wall
      { x: 60,  y: 100, w: 440, h: 20 },

      // bottom wall split into two, with a gap in the middle so you can enter the arena
      { x: 60,  y: 300, w: 160, h: 20 },   // bottom-left segment
      { x: 340, y: 300, w: 160, h: 20 },   // bottom-right segment

      // left + right vertical walls that stop slightly above the bottom,
      // so the bottom corridor is open
      { x: 60,  y: 100, w: 20,  h: 180 },  // left wall (100 → 280)
      { x: 480, y: 100, w: 20,  h: 180 },  // right wall (100 → 280)

      // inner horizontal ledge across the middle
      { x: 140, y: 200, w: 320, h: 20 }
    ],
    // 🔑 key is in the lower-left part of the arena, easy to reach
    keys: [
      { x: 140, y: 260, r: 10 }
    ],
    // 🚪 door blocks the path up to the portal; must use key to remove
doors: [
  { id: "KEY1", type: "key", x: CANVAS_WIDTH / 2 - 10, y: 200, w: 20, h: 100 }
],
    powerups: [
      // a shield near the upper-left, after you unlock the door
      { type: "shield", x: 200, y: 140, r: 10 }
    ],
    traps: [
      // a glue puddle on the right side to show danger near the patrol enemy
      { type: "glue", x: CANVAS_WIDTH / 2 + 40, y: 260, w: 60, h: 30 }
    ]
  },

{
  // Level 4 - Floor Switch opens Door (switch tutorial)
  // Start at bottom, step on switch to open central door, then reach portal.
  start: { x: CANVAS_WIDTH / 2 - 100, y: CANVAS_HEIGHT - 70 }, // shifted left
  portal: { x: CANVAS_WIDTH - 120, y: 160, r: 18 },
  enemies: [
    { type: "patrol", x: CANVAS_WIDTH / 2 + 40, y: 260, w: 20, h: 20, vx: 2 }
  ],
  obstacles: [
    // top wall
    { x: 60,  y: 100, w: 440, h: 20 },

    // bottom wall split to create an entrance gap
    { x: 60,  y: 300, w: 160, h: 20 },
    { x: 340, y: 300, w: 160, h: 20 },

    // left/right walls (stop above the floor so bottom is open)
    { x: 60,  y: 100, w: 20,  h: 180 },
    { x: 480, y: 100, w: 20,  h: 180 },

    // inner ledge across middle
    { x: 140, y: 200, w: 320, h: 20 }
  ],
  // door that blocks the way from bottom area to portal
doors: [
  { id: "S1", type: "switch", x: CANVAS_WIDTH / 2 - 10, y: 200, w: 20, h: 100 }
],
  // floor switch that opens door S1
  switches: [
    {
      id: "SW1",
      doorIds: ["S1"],
      // keep switch near center bottom, but not under spawn
      x: CANVAS_WIDTH / 2 - 12,
      y: CANVAS_HEIGHT - 50, // a bit higher so you walk onto it intentionally
      w: 24,
      h: 12
    }
  ],
  keys: [],
  powerups: [
    { type: "shield", x: 200, y: 140, r: 10 }
  ],
  traps: [
    { type: "glue", x: CANVAS_WIDTH / 2 + 40, y: 260, w: 60, h: 30 }
  ]
}

];