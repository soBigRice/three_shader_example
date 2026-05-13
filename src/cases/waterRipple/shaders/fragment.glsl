/**
 * JumpBox Fragment Shader — 水波涟漪效果
 *
 * 颜色逻辑：根据高度做多段渐变
 *   高度 0.0（无波） → 深蓝 #3a3a5c
 *   高度 0.25        → 亮蓝 #4a7fb5
 *   高度 0.55        → 青绿 #1ec9a4
 *   高度 0.8         → 暖金 #ffb347
 *   高度 1.0（波峰） → 亮白 #ffe8c0
 */

uniform float uTime;

varying float vHeight;

void main() {
  // ---- 多段颜色渐变：根据高度依次过渡 ----
  // 深蓝 → 亮蓝
  vec3 blue0 = vec3(0.227, 0.227, 0.361);   // #3a3a5c
  vec3 blue1 = vec3(0.290, 0.498, 0.710);   // #4a7fb5
  float t1 = smoothstep(0.0, 0.25, vHeight);
  vec3 color = mix(blue0, blue1, t1);

  // 亮蓝 → 青绿
  vec3 teal = vec3(0.118, 0.788, 0.643);    // #1ec9a4
  float t2 = smoothstep(0.25, 0.55, vHeight);
  color = mix(color, teal, t2);

  // 青绿 → 暖金
  vec3 amber = vec3(1.0, 0.702, 0.278);     // #ffb347
  float t3 = smoothstep(0.55, 0.8, vHeight);
  color = mix(color, amber, t3);

  // 暖金 → 亮白
  vec3 white = vec3(1.0, 0.91, 0.753);      // #ffe8c0
  float t4 = smoothstep(0.8, 1.0, vHeight);
  color = mix(color, white, t4);

  // ---- 波峰微弱的呼吸闪烁 ----
  float pulse = sin(uTime * 5.0 + vHeight * 8.0) * 0.04 + 1.0;
  color *= mix(1.0, pulse, smoothstep(0.1, 0.4, vHeight));

  gl_FragColor = vec4(color, 1.0);
}
