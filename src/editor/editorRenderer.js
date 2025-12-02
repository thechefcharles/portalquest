// src/editor/editorRenderer.js
import { GRID_SIZE, COLORS, PORTAL_RADIUS } from "../core/config.js";
import { editorState } from "./editorState.js";

export function renderEditor(ctx) {
  const canvas = ctx.canvas;
  const { width, height } = canvas;

  // Background – match Quest mode
  ctx.clearRect(0, 0, width, height);
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, COLORS.backgroundTop || "#1c2541");
  bgGradient.addColorStop(1, COLORS.backgroundBottom || "#020308");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Neon grid – match Quest mode
  ctx.strokeStyle = COLORS.gridLine || "rgba(80,130,200,0.35)";
  ctx.lineWidth = 1;
  for (let y = 0; y < height; y += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  for (let x = 0; x < width; x += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  const level = editorState.currentLevel;
  if (!level) return;

  // Walls
  ctx.fillStyle = COLORS.wallFill || "#1b2535";
  ctx.strokeStyle = COLORS.wallStroke || "#4f6a9a";
  ctx.lineWidth = 2;

  (level.obstacles || []).forEach((o) => {
    ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.strokeRect(o.x, o.y, o.w, o.h);
  });
  
  // Highlight selected obstacle / spawn / portal
  const sel = editorState.selectedEntity;
  if (sel) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#f97316"; // orange highlight

    if (sel.kind === "obstacle") {
      const o = (level.obstacles || [])[sel.index];
      if (o) {
        ctx.strokeRect(o.x - 2, o.y - 2, o.w + 4, o.h + 4);
      }
    } else if (sel.kind === "spawn" && level.start) {
      const sx = level.start.x;
      const sy = level.start.y;
      ctx.strokeRect(sx - 2, sy - 2, GRID_SIZE + 4, GRID_SIZE + 4);
    } else if (sel.kind === "portal" && level.portal) {
      const { x, y, r } = level.portal;
      ctx.beginPath();
      ctx.arc(x, y, (r || PORTAL_RADIUS) + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Draw player spawn (start)
  if (level.start) {
    const sx = level.start.x;
    const sy = level.start.y;
    const size = GRID_SIZE;

    const grad = ctx.createLinearGradient(sx, sy, sx, sy + size);
    grad.addColorStop(0, COLORS.playerFillTop || "#ffdd66");
    grad.addColorStop(1, COLORS.playerFillBottom || "#ff9f3b");

    ctx.fillStyle = grad;
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(sx + size * 0.2, sy + size * 0.1);
    ctx.lineTo(sx + size * 0.8, sy + size * 0.1);
    ctx.lineTo(sx + size * 0.8, sy + size * 0.9);
    ctx.lineTo(sx + size * 0.2, sy + size * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Draw portal
  if (level.portal) {
    const { x, y, r } = level.portal;

    const gradient = ctx.createRadialGradient(x, y, 4, x, y, r || PORTAL_RADIUS);
    gradient.addColorStop(0, COLORS.portalInner || "#6effff");
    gradient.addColorStop(0.5, COLORS.portalMid || "#00b9ff");
    gradient.addColorStop(1, COLORS.portalOuter || "rgba(0,20,40,0.1)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r || PORTAL_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Hover preview (for walls, spawn, portal)
  const hover = editorState.hover;
  if (hover && hover.gridX != null && hover.gridY != null) {
    const x = hover.gridX * GRID_SIZE;
    const y = hover.gridY * GRID_SIZE;
    const colorValid = "rgba(34,197,94,0.45)";  // green
    const colorInvalid = "rgba(239,68,68,0.45)"; // red

    ctx.save();
    ctx.fillStyle = hover.isValid ? colorValid : colorInvalid;

    if (hover.tool === "wall" || hover.tool === "spawn") {
      ctx.fillRect(x, y, GRID_SIZE, GRID_SIZE);
    } else if (hover.tool === "portal") {
      const cx = x + GRID_SIZE / 2;
      const cy = y + GRID_SIZE / 2;
      const r = PORTAL_RADIUS;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
