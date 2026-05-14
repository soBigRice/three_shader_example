/**
 * particles.ts — 消散粒子系统 / Dissolve particle system
 */

import * as THREE from 'three';
import particleVertexSrc from './shaders/particle.vert.glsl?raw';
import particleFragmentSrc from './shaders/particle.frag.glsl?raw';
import type { ParticleParams } from './types';

export interface ParticleSystemState {
  points: THREE.Points;
  material: THREE.ShaderMaterial;
  update: (
    progress: number,
    time: number,
    active: boolean,
    fade: number,
    mode: number,
    noiseScale: number,
    noiseSpeed: number,
  ) => void;
  reset: () => void;
}

const DEFAULT_PARAMS: ParticleParams = {
  density: 4600,
  riseSpeed: 1.15,
  spread: 1.2,
  glow: 1.0,
  pointSize: 6.0,
  fade: 1.0,
};

/**
 * 创建粒子系统，粒子点与信纸 UV 对应 / Create particle system with UV-aligned sampling points
 */
export function createParticleSystem(
  paperWidth: number,
  paperHeight: number,
  partial?: Partial<ParticleParams>,
): ParticleSystemState {
  const params = { ...DEFAULT_PARAMS, ...partial };
  const count = Math.max(600, Math.floor(params.density));

  const positions = new Float32Array(count * 3);
  const uvs = new Float32Array(count * 2);
  const seeds = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const u = Math.random();
    const v = Math.random();

    const x = (u - 0.5) * paperWidth;
    const y = (v - 0.5) * paperHeight;
    const z = (Math.random() - 0.5) * 0.04;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    uvs[i * 2] = u;
    uvs[i * 2 + 1] = v;

    seeds[i] = Math.random() * 1000;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aUv', new THREE.BufferAttribute(uvs, 2));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: particleVertexSrc,
    fragmentShader: particleFragmentSrc,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uMode: { value: 0 },
      uPointSize: { value: params.pointSize },
      uRiseSpeed: { value: params.riseSpeed },
      uSpread: { value: params.spread },
      uActive: { value: 0 },
      uFade: { value: params.fade },
      uGlow: { value: params.glow },
      uNoiseScale: { value: 26.0 },
      uNoiseSpeed: { value: 0.16 },
    },
  });

  const points = new THREE.Points(geometry, material);
  points.position.set(0, 0.12, 0.02);
  points.renderOrder = 2;

  return {
    points,
    material,
    update: (
      progress: number,
      time: number,
      active: boolean,
      fade: number,
      mode: number,
      noiseScale: number,
      noiseSpeed: number,
    ) => {
      material.uniforms.uProgress.value = progress;
      material.uniforms.uTime.value = time;
      material.uniforms.uActive.value = active ? 1 : 0;
      material.uniforms.uFade.value = fade;
      material.uniforms.uMode.value = mode;
      material.uniforms.uNoiseScale.value = noiseScale;
      material.uniforms.uNoiseSpeed.value = noiseSpeed;
    },
    reset: () => {
      material.uniforms.uProgress.value = 0;
      material.uniforms.uActive.value = 0;
      material.uniforms.uFade.value = 1;
    },
  };
}
