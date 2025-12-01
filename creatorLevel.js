// creatorLevel.js
// Logic related to the custom level used by the Level Creator (editor mode).

const GRID_SIZE = 20;

// Create a blank custom level
export function createBlankLevel(canvasWidth, canvasHeight) {
  return {
    start: { x: 80, y: canvasHeight - 70 },
    portal: { x: canvasWidth - 80, y: 80, r: 18 },
    enemies: [],
    obstacles: [],
    keys: [],
    doors: [],
    switches: [],
    powerups: [],
    traps: []
  };
}

/**
 * Apply an editor tool to the custom level.
 *
 * @param {object} customLevel - The level object being edited.
 * @param {string} tool - tool name (wall, erase, player, portal, enemy_*, power_*, trap_*, key)
 * @param {number} gx - snapped grid x (top-left of cell)
 * @param {number} gy - snapped grid y (top-left of cell)
 * @param {object} state - the global game state (used to update player position if needed)
 */
export function applyEditorTool(customLevel, tool, gx, gy, state) {
  switch (tool) {
    // ---------------- LAYOUT ----------------
    case "wall": {
      customLevel.obstacles = customLevel.obstacles || [];
      const exists = customLevel.obstacles.some(
        (o) => o.x === gx && o.y === gy && o.w === GRID_SIZE && o.h === GRID_SIZE
      );
      if (!exists) {
        customLevel.obstacles.push({ x: gx, y: gy, w: GRID_SIZE, h: GRID_SIZE });
      }
      break;
    }

    case "erase": {
      if (customLevel.obstacles && customLevel.obstacles.length > 0) {
        customLevel.obstacles = customLevel.obstacles.filter(
          (o) =>
            !(
              gx >= o.x &&
              gx < o.x + o.w &&
              gy >= o.y &&
              gy < o.y + o.h
            )
        );
      }
      // Later we can extend erase to also remove enemies/traps/powerups in that cell.
      break;
    }

    case "player": {
      customLevel.start = { x: gx, y: gy };
      if (state && state.player) {
        state.player.x = gx;
        state.player.y = gy;
      }
      break;
    }

    case "portal": {
      if (!customLevel.portal) {
        customLevel.portal = { x: gx + GRID_SIZE / 2, y: gy + GRID_SIZE / 2, r: 18 };
      } else {
        customLevel.portal.x = gx + GRID_SIZE / 2;
        customLevel.portal.y = gy + GRID_SIZE / 2;
      }
      break;
    }

    // ---------------- ENEMIES ----------------
case "enemy_patrol": {
  customLevel.enemies = customLevel.enemies || [];
  customLevel.enemies.push({
    type: "patrol",
    x: gx,
    y: gy,
    w: GRID_SIZE,
    h: GRID_SIZE,
    vx: 2,
    axis: "horizontal" // NEW: default movement axis
  });
  break;
}

    case "enemy_chaser": {
      customLevel.enemies = customLevel.enemies || [];
      customLevel.enemies.push({
        type: "chaser",
        x: gx,
        y: gy,
        w: GRID_SIZE,
        h: GRID_SIZE,
        speed: 1.5
      });
      break;
    }

    case "enemy_spinner": {
      customLevel.enemies = customLevel.enemies || [];
      customLevel.enemies.push({
        type: "spinner",
        cx: gx + GRID_SIZE / 2,
        cy: gy + GRID_SIZE / 2,
        radius: 60,
        angle: 0,
        angularSpeed: 1.5,
        w: GRID_SIZE,
        h: GRID_SIZE
      });
      break;
    }

    // ---------------- POWERUPS ----------------
    case "power_speed": {
      customLevel.powerups = customLevel.powerups || [];
      customLevel.powerups.push({
        type: "speed",
        x: gx + GRID_SIZE / 2,
        y: gy + GRID_SIZE / 2,
        r: 10
      });
      break;
    }

    case "power_shield": {
      customLevel.powerups = customLevel.powerups || [];
      customLevel.powerups.push({
        type: "shield",
        x: gx + GRID_SIZE / 2,
        y: gy + GRID_SIZE / 2,
        r: 10
      });
      break;
    }

    case "power_dash": {
      customLevel.powerups = customLevel.powerups || [];
      customLevel.powerups.push({
        type: "dash",
        x: gx + GRID_SIZE / 2,
        y: gy + GRID_SIZE / 2,
        r: 10
      });
      break;
    }

    // ---------------- TRAPS ----------------
    case "trap_glue": {
      customLevel.traps = customLevel.traps || [];
      customLevel.traps.push({
        type: "glue",
        x: gx,
        y: gy,
        w: GRID_SIZE,
        h: GRID_SIZE
      });
      break;
    }

    case "trap_fire": {
      customLevel.traps = customLevel.traps || [];
      customLevel.traps.push({
        type: "fire",
        x: gx,
        y: gy,
        w: GRID_SIZE,
        h: GRID_SIZE / 2
      });
      break;
    }

    case "trap_poison": {
      customLevel.traps = customLevel.traps || [];
      customLevel.traps.push({
        type: "poison",
        x: gx,
        y: gy,
        w: GRID_SIZE,
        h: GRID_SIZE
      });
      break;
    }

    case "trap_spike": {
      customLevel.traps = customLevel.traps || [];
      customLevel.traps.push({
        type: "spike",
        x: gx,
        y: gy,
        w: GRID_SIZE,
        h: GRID_SIZE
      });
      break;
    }

    // ---------------- KEY ----------------
    case "key": {
      customLevel.keys = customLevel.keys || [];
      customLevel.keys.push({
        x: gx + GRID_SIZE / 2,
        y: gy + GRID_SIZE / 2,
        r: 10
      });
      break;
    }
        // ---------------- KEY DOOR (vertical) ----------------
    case "door_key": {
      customLevel.doors = customLevel.doors || [];
      customLevel.doors.push({
        type: "key",
        x: gx,
        y: gy,
        w: GRID_SIZE,
        h: GRID_SIZE * 2 // taller than 1 tile so it feels like a door
      });
      break;
    }

    // ---------------- SWITCH DOOR (vertical) ----------------
    case "door_switch": {
      customLevel.doors = customLevel.doors || [];
      customLevel.doors.push({
        type: "switch",
        x: gx,
        y: gy,
        w: GRID_SIZE,
        h: GRID_SIZE * 2
      });
      break;
    }

    // ---------------- SWITCH (floor plate) ----------------
    case "switch": {
      customLevel.switches = customLevel.switches || [];
      customLevel.switches.push({
        x: gx,
        y: gy,
        w: GRID_SIZE,
        h: GRID_SIZE / 2,
        activated: false
        // no doorIds => will open all switch doors by default
      });
      break;
    }

    default:
      // future: keyDoor, switch, switchDoor, etc. (needs linking UI)
      break;
  }
}