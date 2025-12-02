// src/editor/editorRenderer.js
import { GRID_SIZE, COLORS } from "../core/config.js";
import { editorState } from "./editorState.js";

/**
 * Render the level editor grid + entities.
 * ctx: 2D canvas context for the editorCanvas
 */
export function renderEditor(ctx) {
  const canvas = ctx.canvas;
  const { width, height } = canvas;

  // Background
  ctx.clearRect(0, 0, width, height);
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, "#020617");
  bgGradient.addColorStop(1, "#000000");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Neon grid
  ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
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

  // Draw walls (obstacles)
  ctx.fillStyle = COLORS.wallFill || "#1f2937";
  ctx.strokeStyle = COLORS.wallStroke || "#38bdf8";
  ctx.lineWidth = 2;

  (level.obstacles || []).forEach((o) => {
    ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.strokeRect(o.x, o.y, o.w, o.h);
  });

  // Highlight selected obstacle
  const sel = editorState.selectedEntity;
  if (sel && sel.kind === "obstacle") {
    const o = (level.obstacles || [])[sel.index];
    if (o) {
      ctx.strokeStyle = "#f97316"; // orange highlight
      ctx.lineWidth = 3;
      ctx.strokeRect(o.x - 2, o.y - 2, o.w + 4, o.h + 4);
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

    const gradient = ctx.createRadialGradient(x, y, 4, x, y, r);
    gradient.addColorStop(0, COLORS.portalInner || "#6effff");
    gradient.addColorStop(0.5, COLORS.portalMid || "#00b9ff");
    gradient.addColorStop(1, COLORS.portalOuter || "rgba(0,20,40,0.1)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
