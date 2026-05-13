/**
 * JumpBox Fragment Shader — 水波涟漪效果
 *
 * 颜色逻辑：多段渐变，黑底霓虹风格
 *   高度 0.0（无波） → 暗蓝黑 #0a0a24
 *   高度 0.2         → 电光蓝 #3344ff
 *   高度 0.5         → 青     #00e5ff
 *   高度 0.8         → 品红   #ff3388
 *   高度 1.0（波峰） → 亮白   #ffffff
 */

uniform float uTime;

varying float vHeight;

void main() {
  // 暗蓝黑 → 电光蓝
  vec3 idle   = vec3(0.039, 0.039, 0.141);   // #0a0a24
  vec3 blue   = vec3(0.200, 0.267, 1.000);   // #3344ff
  float t1 = smoothstep(0.0, 0.2, vHeight);
  vec3 color = mix(idle, blue, t1);

  // 电光蓝 → 青
  vec3 cyan = vec3(0.0, 0.898, 1.0);         // #00e5ff
  float t2 = smoothstep(0.2, 0.5, vHeight);
  color = mix(color, cyan, t2);

  // 青 → 品红
  vec3 magenta = vec3(1.0, 0.2, 0.533);       // #ff3388
  float t3 = smoothstep(0.5, 0.8, vHeight);
  color = mix(color, magenta, t3);

  // 品红 → 亮白
  vec3 white = vec3(1.0, 1.0, 1.0);           // #ffffff
  float t4 = smoothstep(0.8, 1.0, vHeight);
  color = mix(color, white, t4);

  // 波峰微弱的呼吸闪烁
  float pulse = sin(uTime * 5.0 + vHeight * 8.0) * 0.04 + 1.0;
  color *= mix(1.0, pulse, smoothstep(0.1, 0.4, vHeight));

  gl_FragColor = vec4(color, 1.0);
}
