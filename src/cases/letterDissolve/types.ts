/**
 * types.ts — 信纸消散案例类型定义 / Letter dissolve case type definitions
 */

/** 信件模板字段 / Letter template fields */
export interface LetterTemplateFields {
  salutation: string;
  body: string;
  closing: string;
  signature: string;
}

/** 消散播放状态 / Dissolve playback state */
export type DissolvePlaybackState = 'idle' | 'running' | 'finished';

/** 消散模式 / Dissolve mode */
export type DissolveMode = 'vertical' | 'holes';

/** 消散控制参数 / Dissolve control params */
export interface DissolveControls {
  mode: DissolveMode;
  progress: number;
  edgeSoftness: number;
  noiseStrength: number;
  noiseScale: number;
  noiseSpeed: number;
  edgeGlow: number;
}

/** 粒子参数 / Particle params */
export interface ParticleParams {
  density: number;
  riseSpeed: number;
  spread: number;
  glow: number;
  pointSize: number;
  fade: number;
}
