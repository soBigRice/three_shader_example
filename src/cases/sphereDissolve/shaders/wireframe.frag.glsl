/**
 * Wireframe Mesh Fragment Shader — 线框网格消融 / Wireframe mesh dissolve
 *
 * 消融逻辑与主球体一致，在此之上叠加重心坐标边缘检测做线框
 * Dissolve logic identical to main sphere, with barycentric edge detection on top
 */

uniform float uTime;
uniform float uDissolveMode;
uniform float uDissolveProgress;
uniform float uEdgeWidth;
uniform vec3 uEdgeColor;
uniform float uNoiseScale;
uniform float uWireframeWidth;
uniform vec3 uWireframeColor;

varying vec3 vWorldPos;
varying vec3 vBarycentric;

// ---- 3D 噪声（与主 shader 一致） / 3D noise (identical to main shader) ----

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

void main() {
  // ---- 消融 / Dissolve ----
  float dissolve;
  if (uDissolveMode < 0.5) {
    float noiseVal = fbm(vWorldPos * uNoiseScale + uTime * 0.05);
    dissolve = noiseVal - uDissolveProgress;
  } else {
    float yThreshold = 3.0 - uDissolveProgress * 6.0;
    float base = (yThreshold - vWorldPos.y) * 0.35;
    float roughness = fbm(vWorldPos * uNoiseScale * 1.5 + uTime * 0.05);
    dissolve = base + (roughness - 0.5) * 0.5;
  }

  if (dissolve < 0.0) discard;

  float edgeGlow = 1.0 - smoothstep(0.0, uEdgeWidth, dissolve);

  // ---- 重心坐标边缘检测 / Barycentric edge detection ----
  float d = min(vBarycentric.x, min(vBarycentric.y, vBarycentric.z));
  float halfPixel = fwidth(d);
  float lineWidth = halfPixel * (0.8 + uWireframeWidth * 2.5);
  float wire = exp2(-d * d / (lineWidth * lineWidth));

  // 面内部丢弃 / Discard face interiors
  if (wire < 0.03) discard;

  // 线框色为基底，消融边缘叠加辉光 / Wireframe color base, dissolve edge adds glow
  vec3 color = uWireframeColor * (0.95 + wire * 0.05);
  // 边缘辉光叠加（而非替换） / Edge glow added on top (not replacing wireframe color)
  color += uEdgeColor * edgeGlow * 0.8;

  gl_FragColor = vec4(color, 1.0);
}
