/**
 * Particle Vertex Shader — 消散粒子顶点 / Dissolve particle vertex shader
 */

attribute vec2 aUv;
attribute float aSeed;

uniform float uTime;
uniform float uProgress;
uniform float uMode;
uniform float uPointSize;
uniform float uRiseSpeed;
uniform float uSpread;
uniform float uActive;
uniform float uFade;
uniform float uNoiseScale;
uniform float uNoiseSpeed;

varying float vAlpha;
varying float vHeat;

float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise2D(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float a = hash2(i);
  float b = hash2(i + vec2(1.0, 0.0));
  float c = hash2(i + vec2(0.0, 1.0));
  float d = hash2(i + vec2(1.0, 1.0));

  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
  float progress = clamp(uProgress, 0.0, 1.0);

  float trigger = 0.0;
  if (uMode < 0.5) {
    // ---- 模式 0：竖向消散触发 / Mode 0: vertical dissolve trigger ----
    trigger = progress - (1.0 - aUv.y) + 0.02;
  } else {
    // ---- 模式 1：破洞消散触发 / Mode 1: holes dissolve trigger ----
    float noiseVal = noise2D(aUv * uNoiseScale + vec2(0.0, uTime * uNoiseSpeed));
    // 与破洞主体逻辑一致：progress 越大，越多高噪声区域被消散并触发粒子
    // Match holes dissolve logic: more high-noise regions dissolve and trigger as progress grows
    trigger = progress - (1.0 - noiseVal) + 0.02;
  }

  float activation = clamp(trigger * 6.5, 0.0, 1.0) * step(0.5, uActive);
  float age = clamp(trigger * 2.2, 0.0, 1.0);

  float phase = hash(aSeed * 37.31 + 2.17);
  float flutter = sin(uTime * (2.2 + phase * 3.4) + phase * 31.0);
  float drift = cos(uTime * (2.8 + phase * 2.7) + phase * 23.0);

  vec3 pos = position;
  pos.y += activation * (0.22 + phase * 0.24) + age * uRiseSpeed * (0.55 + phase * 0.75);
  pos.x += flutter * (0.07 + phase * 0.05) * uSpread * activation;
  pos.z += drift * (0.09 + phase * 0.04) * uSpread * activation;

  float lifetime = clamp(1.0 - age, 0.0, 1.0);
  vAlpha = activation * lifetime * uFade;
  vHeat = 0.35 + phase * 0.65;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float size = uPointSize * (0.65 + phase * 0.9);
  size *= (1.0 + activation * 0.9);
  size *= (0.65 + lifetime * 0.45);
  gl_PointSize = size / max(1.0, -mvPosition.z * 0.24);
}
