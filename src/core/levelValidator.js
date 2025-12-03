// src/core/levelValidator.js
import { rectOverlap, circleOverlap, rectCircleOverlap } from "./geometry.js";

/**
 * Returns an array of human-readable issues for a LevelData:
 *  - missing spawn / portal
 *  - overlaps between entities
 */
export function validateLevel(level) {
  const issues = [];

  if (!level) {
    issues.push("No level data provided");
    return issues;
  }

  // ----- Basic presence checks -----
  if (!level.start) {
    issues.push("Missing player spawn (level.start)");
  }

  if (!level.portal) {
    issues.push("Missing portal (level.portal)");
  }

  const rects = [];
  const circles = [];

  // Walls / obstacles
  (level.obstacles || []).forEach((o, i) => {
    rects.push({ kind: "obstacle", index: i, x: o.x, y: o.y, w: o.w, h: o.h });
  });

  // Doors
  (level.doors || []).forEach((d, i) => {
    rects.push({ kind: "door", index: i, x: d.x, y: d.y, w: d.w, h: d.h });
  });

  // Switches
  (level.switches || []).forEach((s, i) => {
    rects.push({ kind: "switch", index: i, x: s.x, y: s.y, w: s.w, h: s.h });
  });

  // Traps
  (level.traps || []).forEach((t, i) => {
    rects.push({ kind: "trap", index: i, x: t.x, y: t.y, w: t.w, h: t.h });
  });

  // Enemies
  (level.enemies || []).forEach((e, i) => {
    if (e.type === "spinner") {
      const w = e.radius * 2;
      const h = e.radius * 2;
      rects.push({
        kind: "enemy_spinner",
        index: i,
        x: e.cx - w / 2,
        y: e.cy - h / 2,
        w,
        h,
      });
    } else {
      rects.push({ kind: "enemy", index: i, x: e.x, y: e.y, w: e.w, h: e.h });
    }
  });

  // Portal
  if (level.portal) {
    circles.push({
      kind: "portal",
      index: 0,
      cx: level.portal.x,
      cy: level.portal.y,
      r: level.portal.r,
    });
  }

  // Keys
  (level.keys || []).forEach((k, i) => {
    circles.push({
      kind: "key",
      index: i,
      cx: k.x,
      cy: k.y,
      r: k.r || 10,
    });
  });

  // Powerups
  (level.powerups || []).forEach((p, i) => {
    circles.push({
      kind: "powerup",
      index: i,
      cx: p.x,
      cy: p.y,
      r: p.r || 10,
    });
  });

  // ---- Rect vs Rect ----
  for (let i = 0; i < rects.length; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      if (rectOverlap(rects[i], rects[j])) {
        issues.push(
          `Rect overlap: ${rects[i].kind}[${rects[i].index}] and ${rects[j].kind}[${rects[j].index}]`
        );
      }
    }
  }

  // ---- Circle vs Circle ----
  for (let i = 0; i < circles.length; i++) {
    for (let j = i + 1; j < circles.length; j++) {
      if (circleOverlap(circles[i], circles[j])) {
        issues.push(
          `Circle overlap: ${circles[i].kind}[${circles[i].index}] and ${circles[j].kind}[${circles[j].index}]`
        );
      }
    }
  }

  // ---- Rect vs Circle ----
  for (const r of rects) {
    for (const c of circles) {
      if (rectCircleOverlap(r, c)) {
        issues.push(
          `Rect/Circle overlap: ${r.kind}[${r.index}] overlaps ${c.kind}[${c.index}]`
        );
      }
    }
  }

  return issues;
}

/**
 * Dev helper: throw or log loudly if level is invalid.
 * Used for built-in quest levels.
 */
export function assertLevelValid(level, label = "Level") {
  const issues = validateLevel(level);
  if (issues.length === 0) return;

  console.error(`${label} has ${issues.length} issue(s):`);
  issues.forEach((msg) => console.error("  -", msg));

  // If you want to *hard stop* during dev, uncomment:
  // throw new Error(`${label} has invalid issues`);
}
