/**
 * Paper Fragment Shader — 信纸顶部消散 / Top-down dissolve for letter paper
 */

uniform sampler2D uPaperTex;
uniform float uTime;
uniform float uDissolveProgress;
uniform float uDissolveMode;
uniform float uEdgeSoftness;
uniform float uNoiseStrength;
uniform float uNoiseScale;
uniform float uNoiseSpeed;
uniform float uEdgeGlow;
uniform vec3 uEdgeColor;

varying vec2 vUv;
varying vec3 vWorldPos;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise2D(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

/**
 * 分形噪声：比单层噪声更有层次 / Fractal noise with richer layers than single noise
 */
float fbm2D(vec2 p) {
  float value = 0.0;
  float amp = 0.5;

  // 固定次数循环，兼容 WebGL1 / Fixed-iteration loop for WebGL1 compatibility
  for (int i = 0; i < 5; i++) {
    value += amp * noise2D(p);
    p = mat2(1.6, -1.2, 1.2, 1.6) * p + vec2(13.4, 7.9);
    amp *= 0.5;
  }
  return value;
}

/**
 * 纸张消散噪声：低频结构 + 高频细节 + 轻微域扭曲
 * Paper dissolve noise: low-frequency structure + high-frequency detail + gentle domain warp
 */
float layeredBurnNoise(vec2 uv, float timeFlow) {
  vec2 flowA = vec2(timeFlow * 0.26, -timeFlow * 0.18);
  vec2 flowB = vec2(-timeFlow * 0.21, timeFlow * 0.24);

  // 先用低频场做域扭曲，避免“塑料感”块状边缘
  // Domain warp with low-frequency fields to avoid plastic-like chunky edges
  vec2 warp = vec2(
    fbm2D(uv * 0.56 + flowA + vec2(4.3, 1.7)),
    fbm2D(uv * 0.56 + flowB + vec2(-2.6, 6.1))
  );
  vec2 warpedUv = uv + (warp - 0.5) * 1.35;

  float coarse = fbm2D(warpedUv);
  float fine = fbm2D(warpedUv * 2.35 + vec2(5.1, -3.4));
  float micro = noise2D(warpedUv * 6.4 + vec2(-1.8, 2.9));

  return clamp(coarse * 0.62 + fine * 0.28 + micro * 0.10, 0.0, 1.0);
}

void main() {
  vec4 tex = texture2D(uPaperTex, vUv);

  float progress = clamp(uDissolveProgress, 0.0, 1.0);
  // 进度为 0 时直接完整显示纸张，避免顶部出现默认消散边缘
  // When progress is 0, render full paper to avoid default top dissolve edge
  if (progress <= 0.0001) {
    gl_FragColor = tex;
    return;
  }
  if (progress >= 0.999) discard;

  float baseScale = max(uNoiseScale, 0.001);
  float timeFlow = uTime * uNoiseSpeed;
  float noise = layeredBurnNoise(vUv * baseScale + vec2(vWorldPos.x * 0.22, 0.0), timeFlow);
  float remain = 1.0;
  float edge = 0.0;
  float noiseStrength = uNoiseStrength * (0.92 - progress * 0.22);

  if (uDissolveMode < 0.5) {
    // ---- 模式 0：竖向消散 / Mode 0: Vertical dissolve ----
    float threshold = 1.0 - progress;
    float dissolveLine = threshold + (noise - 0.5) * noiseStrength * 0.85;
    remain = 1.0 - smoothstep(
      dissolveLine - uEdgeSoftness,
      dissolveLine + uEdgeSoftness,
      vUv.y
    );
    edge = 1.0 - abs(vUv.y - dissolveLine) / max(uEdgeSoftness, 0.0001);
  } else {
    // ---- 模式 1：整体破洞消散 / Mode 1: Whole-surface holes dissolve ----
    // progress 越大，阈值越低，保留区域越少（真正“消散”）
    // As progress increases, threshold drops and remaining area shrinks (true dissolve)
    float threshold = 1.0 - progress;
    float holeField = clamp(noise + (noise - 0.5) * noiseStrength * 1.1, 0.0, 1.0);
    remain = 1.0 - smoothstep(
      threshold - uEdgeSoftness,
      threshold + uEdgeSoftness,
      holeField
    );
    edge = 1.0 - abs(holeField - threshold) / max(uEdgeSoftness, 0.0001);
  }

  if (remain <= 0.001 || tex.a <= 0.001) discard;

  edge = clamp(edge, 0.0, 1.0);
  edge = smoothstep(0.0, 1.0, edge);

  vec3 color = tex.rgb + uEdgeColor * edge * uEdgeGlow * 0.7;
  float alpha = tex.a * remain;

  gl_FragColor = vec4(color, alpha);
}
