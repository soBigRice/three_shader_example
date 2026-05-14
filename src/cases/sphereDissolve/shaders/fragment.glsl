/**
 * Sphere Dissolve Fragment Shader — 球体消融效果（实体模式） / Sphere dissolve effect (solid mode)
 *
 * 核心逻辑： / Core logic:
 *   - 两种消融模式：3D FBM 噪声 / 横向平面扫描 / Two dissolve modes: 3D FBM noise / horizontal planar
 *   - 低于阈值的片段被丢弃 / Discard fragments below threshold
 *   - 消融边缘产生霓虹辉光 / Neon glow on dissolve edge
 *   - Blinn-Phong 光照 / Blinn-Phong lighting
 *   - 线框模式由独立 LineSegments 覆盖层实现 / Wireframe mode via separate LineSegments overlay
 */

uniform float uTime;
uniform float uDissolveProgress;
uniform float uDissolveMode;  // 0 = 噪声 / noise, 1 = 横向 / horizontal
uniform float uEdgeWidth;
uniform vec3 uEdgeColor;
uniform float uNoiseScale;
uniform vec3 uBaseColor;
uniform vec3 uLightDir;
uniform vec3 uCameraPos;
uniform float uAmbient;
uniform float uDiffuse;
uniform float uSpecular;
uniform float uShininess;

varying vec3 vWorldPosition;
varying vec3 vWorldNormal;

// ---- 3D 噪声函数 / 3D noise functions ----

float hash(vec3 p) {
  float h = dot(p, vec3(127.1, 311.7, 74.7));
  return fract(sin(h) * 43758.5453);
}

float noise3D(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(mix(hash(i), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z
  );
}

float fbm(vec3 p) {
  float value = 0.0;
  float amp = 1.0;
  float freq = 1.0;
  float total = 0.0;
  for (int i = 0; i < 5; i++) {
    value += amp * noise3D(p * freq);
    total += amp;
    freq *= 2.0;
    amp *= 0.5;
  }
  return value / total;
}

// ---- Blinn-Phong 光照 / Blinn-Phong lighting ----

vec3 applyLighting(vec3 baseColor, vec3 N, vec3 L, vec3 V) {
  vec3 H = normalize(L + V);
  float NdotL = max(dot(N, L), 0.0);
  float NdotH = max(dot(N, H), 0.0);

  float ambient = uAmbient;
  float diffuse = NdotL * uDiffuse;
  float specular = pow(NdotH, uShininess) * uSpecular;

  vec3 lit = baseColor * (ambient + diffuse) + specular * vec3(0.3, 0.4, 0.6);
  return lit;
}

void main() {
  // ---- 消融计算 / Dissolve calculation ----
  float dissolve;
  if (uDissolveMode < 0.5) {
    // 模式 0：3D 噪声消融 / Mode 0: 3D noise dissolve
    float noiseVal = fbm(vWorldPosition * uNoiseScale + uTime * 0.05);
    dissolve = noiseVal - uDissolveProgress;
  } else {
    // 模式 1：横向消融 + 噪声粗糙边缘 / Mode 1: horizontal dissolve + noise-roughened edge
    float yThreshold = 3.0 - uDissolveProgress * 6.0;
    float base = (yThreshold - vWorldPosition.y) * 0.35;
    float roughness = fbm(vWorldPosition * uNoiseScale * 1.5 + uTime * 0.05);
    dissolve = base + (roughness - 0.5) * 0.5;
  }

  if (dissolve < 0.0) discard;

  // 边缘辉光 / Edge glow
  float edgeGlow = 1.0 - smoothstep(0.0, uEdgeWidth, dissolve);

  vec3 N = normalize(vWorldNormal);
  vec3 L = normalize(uLightDir);
  vec3 V = normalize(uCameraPos - vWorldPosition);

  // 实体模式 Blinn-Phong 光照 / Solid mode Blinn-Phong lighting
  vec3 lit = applyLighting(uBaseColor, N, L, V);

  // 消融边缘混入辉光颜色 / Blend edge glow into dissolve boundary
  vec3 color = mix(lit, uEdgeColor, edgeGlow);

  // 接近消融边界的微光 / Subtle emission near dissolve edge
  float emission = edgeGlow * 0.6;
  color += uEdgeColor * emission;

  gl_FragColor = vec4(color, 1.0);
}
