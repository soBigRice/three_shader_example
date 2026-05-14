/**
 * Particle Fragment Shader — 发光粒子片元 / Glowing particle fragment shader
 */

uniform float uGlow;

varying float vAlpha;
varying float vHeat;

void main() {
  vec2 centered = gl_PointCoord - vec2(0.5);
  float dist = length(centered) * 2.0;

  float core = smoothstep(1.0, 0.0, dist);
  float halo = smoothstep(1.2, 0.0, dist);

  float alpha = (core + halo * uGlow * 0.65) * vAlpha;
  if (alpha < 0.02) discard;

  vec3 warm = vec3(1.0, 0.86, 0.58);
  vec3 cool = vec3(0.62, 0.9, 1.0);
  vec3 color = mix(warm, cool, vHeat);

  gl_FragColor = vec4(color * (1.0 + uGlow * 0.35), alpha);
}
