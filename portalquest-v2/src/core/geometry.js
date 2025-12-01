// src/core/geometry.js
// Basic geometry helpers for overlap checks

export function rectOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export function circleOverlap(a, b) {
  const dx = a.cx - b.cx;
  const dy = a.cy - b.cy;
  const r = a.r + b.r;
  return dx * dx + dy * dy < r * r;
}

export function rectCircleOverlap(rect, circ) {
  const closestX = Math.max(rect.x, Math.min(circ.cx, rect.x + rect.w));
  const closestY = Math.max(rect.y, Math.min(circ.cy, rect.y + rect.h));
  const dx = circ.cx - closestX;
  const dy = circ.cy - closestY;
  return dx * dx + dy * dy < circ.r * circ.r;
}
