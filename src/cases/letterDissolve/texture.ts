/**
 * texture.ts — 信纸贴图生成与文字合成 / Letter texture generation & text compositing
 */

import * as THREE from 'three';
import type { LetterTemplateFields } from './types';

const PAPER_WIDTH = 1024;
const PAPER_HEIGHT = 1448;

export interface LetterTextureController {
  texture: THREE.CanvasTexture;
  updateFields: (fields: LetterTemplateFields) => void;
  dispose: () => void;
}

/**
 * 统一换行符：兼容真实换行和输入的 \\n / Normalize line breaks from real newline and literal \\n
 */
function normalizeLineBreaks(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\\n/g, '\n');
}

/**
 * 绘制低透明暖色晕染 / Paint subtle warm watercolor stains
 */
function drawWarmStains(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  for (let i = 0; i < 18; i += 1) {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const radius = 90 + Math.random() * 220;
    const g = ctx.createRadialGradient(cx, cy, radius * 0.08, cx, cy, radius);

    g.addColorStop(0, `rgba(198, 152, 94, ${0.012 + Math.random() * 0.02})`);
    g.addColorStop(0.65, `rgba(178, 132, 74, ${0.008 + Math.random() * 0.016})`);
    g.addColorStop(1, 'rgba(156, 109, 56, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  }
}

/**
 * 绘制细节边框（双层线条） / Draw decorative double-line border
 */
function drawDecorativeBorder(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const insetOuter = Math.round(width * 0.052);
  const insetInner = Math.round(width * 0.065);

  ctx.save();
  ctx.strokeStyle = 'rgba(117, 84, 48, 0.26)';
  ctx.lineWidth = 2.2;
  ctx.strokeRect(insetOuter, insetOuter, width - insetOuter * 2, height - insetOuter * 2);

  ctx.strokeStyle = 'rgba(166, 128, 84, 0.2)';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(insetInner, insetInner, width - insetInner * 2, height - insetInner * 2);

  // 角落短线装饰，增强“信纸边框”辨识度 / Corner ticks for letter-paper identity
  const cornerLen = Math.round(width * 0.03);
  const corners = [
    [insetOuter, insetOuter],
    [width - insetOuter, insetOuter],
    [insetOuter, height - insetOuter],
    [width - insetOuter, height - insetOuter],
  ];
  ctx.strokeStyle = 'rgba(123, 88, 50, 0.3)';
  ctx.lineWidth = 1.4;
  for (let i = 0; i < corners.length; i += 1) {
    const [x, y] = corners[i];
    const sx = x < width * 0.5 ? 1 : -1;
    const sy = y < height * 0.5 ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + cornerLen * sx, y);
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + cornerLen * sy);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * 绘制正文引导线 / Draw writing guide lines for body text
 */
function drawWritingGuides(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const left = width * 0.12;
  const right = width * 0.88;
  const top = height * 0.245;
  const bottom = height * 0.8;
  const lineGap = 56;

  ctx.save();
  ctx.strokeStyle = 'rgba(108, 84, 56, 0.1)';
  ctx.lineWidth = 1;
  for (let y = top; y <= bottom; y += lineGap) {
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * 绘制中间水印印章 / Draw center watermark seal
 */
function drawWatermarkSeal(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const cx = width * 0.5;
  const cy = height * 0.53;
  const r = width * 0.11;

  ctx.save();
  ctx.strokeStyle = 'rgba(124, 83, 48, 0.08)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.76, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(124, 83, 48, 0.06)';
  ctx.font = `${Math.round(width * 0.04)}px 'Kaiti SC', 'STKaiti', serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('信', cx, cy - r * 0.05);
  ctx.restore();
}

/**
 * 绘制纸张底图（复古纤维纸质感） / Draw paper base texture (vintage fiber paper style)
 */
function createPaperBaseCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to create 2D context for paper base texture');

  // ---- 底色渐变 / Base gradient ----
  const baseGradient = ctx.createLinearGradient(0, 0, width * 0.2, height);
  baseGradient.addColorStop(0, '#f9f1df');
  baseGradient.addColorStop(0.42, '#f2e3c8');
  baseGradient.addColorStop(0.76, '#ecd9b8');
  baseGradient.addColorStop(1, '#e5cfaa');
  ctx.fillStyle = baseGradient;
  ctx.fillRect(0, 0, width, height);

  // ---- 水彩晕染底层 / Warm watercolor base stains ----
  drawWarmStains(ctx, width, height);

  // ---- 纤维线条 / Fiber lines ----
  for (let i = 0; i < 2600; i += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const len = 6 + Math.random() * 26;
    const angle = (Math.random() - 0.5) * Math.PI * 0.85;

    ctx.strokeStyle = `rgba(130, 100, 66, ${0.016 + Math.random() * 0.04})`;
    ctx.lineWidth = 0.35 + Math.random() * 0.65;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }

  // ---- 细小颗粒 / Small grain speckles ----
  for (let i = 0; i < 6200; i += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = Math.random() * 1.15;

    ctx.fillStyle = `rgba(122, 93, 60, ${0.008 + Math.random() * 0.045})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---- 左侧装订暗痕 / Left binding trace ----
  const bindX = width * 0.093;
  const bindGrad = ctx.createLinearGradient(bindX - 22, 0, bindX + 22, 0);
  bindGrad.addColorStop(0, 'rgba(132, 97, 59, 0)');
  bindGrad.addColorStop(0.5, 'rgba(132, 97, 59, 0.12)');
  bindGrad.addColorStop(1, 'rgba(132, 97, 59, 0)');
  ctx.fillStyle = bindGrad;
  ctx.fillRect(bindX - 22, height * 0.08, 44, height * 0.84);

  // ---- 折痕与岁月感 / Fold lines and aging marks ----
  ctx.fillStyle = 'rgba(108, 83, 55, 0.065)';
  ctx.fillRect(width * 0.08, height * 0.34, width * 0.84, 2);
  ctx.fillRect(width * 0.08, height * 0.68, width * 0.84, 2);

  // ---- 正文引导线 / Body writing guide lines ----
  drawWritingGuides(ctx, width, height);

  // ---- 装饰边框 + 水印 / Border decoration + watermark ----
  drawDecorativeBorder(ctx, width, height);
  drawWatermarkSeal(ctx, width, height);

  // ---- 边缘暗角 / Edge vignette ----
  const vignette = ctx.createRadialGradient(
    width * 0.5,
    height * 0.5,
    width * 0.2,
    width * 0.5,
    height * 0.5,
    width * 0.86,
  );
  vignette.addColorStop(0, 'rgba(255, 255, 255, 0)');
  vignette.addColorStop(1, 'rgba(84, 56, 25, 0.2)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  // ---- 顶部柔和高光，提升纸面层次 / Soft top highlight for paper depth ----
  const topGlow = ctx.createLinearGradient(0, 0, 0, height * 0.3);
  topGlow.addColorStop(0, 'rgba(255, 248, 232, 0.18)');
  topGlow.addColorStop(1, 'rgba(255, 248, 232, 0)');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, width, height * 0.3);

  return canvas;
}

/**
 * 按给定宽度自动换行并绘制 / Wrap and draw text with max width
 */
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
): number {
  let y = startY;
  const paragraphs = normalizeLineBreaks(text).split('\n');

  for (let p = 0; p < paragraphs.length; p += 1) {
    const paragraph = paragraphs[p];

    if (!paragraph.trim()) {
      y += lineHeight;
      continue;
    }

    let line = '';
    for (let i = 0; i < paragraph.length; i += 1) {
      const char = paragraph[i];
      const next = line + char;

      if (ctx.measureText(next).width > maxWidth && line.length > 0) {
        ctx.fillText(line, x, y);
        y += lineHeight;
        line = char;
      } else {
        line = next;
      }
    }

    if (line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
    }

    // 段间距略大，保证信件可读性 / Slightly larger paragraph spacing for readability
    if (p < paragraphs.length - 1) y += lineHeight * 0.2;
  }

  return y;
}

/**
 * 绘制信件文字层 / Draw letter text layer
 */
function drawLetterText(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  fields: LetterTemplateFields,
): void {
  const normalizedSalutation = normalizeLineBreaks(fields.salutation || '亲爱的朋友：');
  const normalizedBody = normalizeLineBreaks(
    fields.body || '愿你在每一个平凡的日子里，都能遇见细小但确定的幸福。',
  );
  const normalizedClosing = normalizeLineBreaks(fields.closing || '此致 敬礼');
  const normalizedSignature = normalizeLineBreaks(fields.signature || '你的朋友');

  const marginX = width * 0.12;
  const maxWidth = width - marginX * 2;
  let y = height * 0.17;

  ctx.fillStyle = '#3b2d22';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // ---- 称呼 / Salutation ----
  ctx.font = "600 46px 'Kaiti SC', 'STKaiti', 'Songti SC', serif";
  y = drawWrappedText(ctx, normalizedSalutation, marginX, y, maxWidth, 62);
  y += 20;

  // ---- 正文 / Body ----
  ctx.font = "500 36px 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif";
  y = drawWrappedText(ctx, normalizedBody, marginX, y, maxWidth, 56);

  y += 32;

  // ---- 结尾 / Closing ----
  ctx.font = "500 36px 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif";
  y = drawWrappedText(ctx, normalizedClosing, marginX, y, maxWidth, 52);
  y += 18;

  // ---- 署名右对齐 / Right-aligned signature ----
  ctx.textAlign = 'right';
  ctx.font = "600 40px 'Kaiti SC', 'STKaiti', 'Songti SC', serif";
  const signatureLines = normalizedSignature.split('\n').filter((line) => line.trim().length > 0);
  const signatureTop = Math.min(y, height * 0.86);
  for (let i = 0; i < signatureLines.length; i += 1) {
    ctx.fillText(signatureLines[i], width - marginX, signatureTop + i * 52);
  }
}

/**
 * 创建信纸纹理控制器 / Create letter texture controller
 */
export function createLetterTextureController(
  initialFields: LetterTemplateFields,
): LetterTextureController {
  const baseCanvas = createPaperBaseCanvas(PAPER_WIDTH, PAPER_HEIGHT);

  const composeCanvas = document.createElement('canvas');
  composeCanvas.width = PAPER_WIDTH;
  composeCanvas.height = PAPER_HEIGHT;

  const ctx = composeCanvas.getContext('2d');
  if (!ctx) throw new Error('Failed to create 2D context for letter compose texture');

  const texture = new THREE.CanvasTexture(composeCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  const render = (fields: LetterTemplateFields) => {
    // 先贴底图再绘制文字，确保每次输入更新一致 / Draw base first, then text for consistent updates
    ctx.clearRect(0, 0, PAPER_WIDTH, PAPER_HEIGHT);
    ctx.drawImage(baseCanvas, 0, 0);
    drawLetterText(ctx, PAPER_WIDTH, PAPER_HEIGHT, fields);
    texture.needsUpdate = true;
  };

  render(initialFields);

  return {
    texture,
    updateFields: render,
    dispose: () => {
      texture.dispose();
    },
  };
}
