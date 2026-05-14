/**
 * JumpBox Fragment Shader — 水波涟漪效果 / Water ripple effect
 *
 * 光照：Blinn-Phong（环境光 + 漫反射 + 高光） / Lighting: Blinn-Phong (ambient + diffuse + specular)
 * 颜色：基于高度的多段渐变，叠加光照 / Color: height-based multi-stop gradient with lighting
 */

uniform vec3 uLightDir;       // 主光源方向（世界空间，已归一化） / Key light direction (world space, normalized)
uniform vec3 uLightColor;     // 主光源颜色 / Key light color
uniform vec3 uAmbientColor;   // 环境光颜色 / Ambient light color
uniform vec3 uCameraPos;      // 相机位置（世界空间） / Camera position (world space)
uniform float uTime;

varying float vHeight;
varying vec3 vWorldNormal;
varying vec3 vWorldPos;

void main() {
  vec3 N = normalize(vWorldNormal);
  vec3 L = normalize(uLightDir);
  vec3 V = normalize(uCameraPos - vWorldPos);
  vec3 H = normalize(L + V);  // Blinn-Phong 半角向量 / Blinn-Phong half-angle vector

  // ---- 基于高度的基础色：霓虹渐变 / Height-based base color: neon gradient ----
  vec3 idle    = vec3(0.10, 0.12, 0.22);       // 暗蓝黑 / Dark blue-black
  vec3 blue    = vec3(0.25, 0.35, 1.00);       // 电光蓝 / Electric blue #4059ff
  vec3 cyan    = vec3(0.00, 0.95, 1.00);       // 青 / Cyan #00f2ff
  vec3 magenta = vec3(1.00, 0.15, 0.55);       // 品红 / Magenta #ff268c
  vec3 peak    = vec3(1.00, 0.84, 0.25);       // 金橙 / Gold-orange #ffd640

  float t1 = smoothstep(0.0, 0.2, vHeight);
  vec3 baseColor = mix(idle, blue, t1);
  float t2 = smoothstep(0.2, 0.5, vHeight);
  baseColor = mix(baseColor, cyan, t2);
  float t3 = smoothstep(0.5, 0.8, vHeight);
  baseColor = mix(baseColor, magenta, t3);
  float t4 = smoothstep(0.8, 1.0, vHeight);
  baseColor = mix(baseColor, peak, t4);

  // ---- Blinn-Phong 光照 / Blinn-Phong lighting ----
  float NdotL = max(dot(N, L), 0.0);
  float NdotH = max(dot(N, H), 0.0);

  vec3 ambient = baseColor * uAmbientColor;
  vec3 diffuse = baseColor * uLightColor * NdotL;

  // 镜面高光 / Specular highlight
  float specular = pow(NdotH, 48.0);
  float specMask = smoothstep(0.1, 0.4, vHeight);
  vec3 spec = uLightColor * specular * specMask * 0.4;

  // 涟漪自发光：高度越高越艳丽 / Ripple emissive: higher = more vibrant
  vec3 emissive = baseColor * vHeight * 1.6;

  vec3 color = ambient + diffuse + spec + emissive;

  // 微弱的呼吸闪烁 / Subtle breathing pulse
  float pulse = sin(uTime * 4.0 + vHeight * 7.0) * 0.03 + 1.0;
  color *= mix(1.0, pulse, smoothstep(0.1, 0.4, vHeight));

  gl_FragColor = vec4(color, 1.0);
}
