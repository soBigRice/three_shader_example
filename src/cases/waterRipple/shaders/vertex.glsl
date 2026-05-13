/**
 * JumpBox Vertex Shader — 水波涟漪效果
 *
 * 核心逻辑：Morlet 小波 = cos 振荡 × Gaussian 包络
 *   - cos 产生多个同心波环（约 3 环可见）
 *   - Gaussian 包络让外围波环逐渐衰减消失
 *   - 波前 causality 保证波未到达时高度为零
 */

// attribute mat4 instanceMatrix;

// ---- 波源数据 ----
// 64 个波源，展平为 float[256]：每组 4 个 float 分别存 (originX, originZ, startTime, reserved)
uniform float uWaveOrigins[256];
uniform int uWaveCount;           // 当前活跃波源数量（0~64）
uniform float uWaveSpeed;         // 波纹传播速度
uniform float uWaveDecay;         // 时间衰减系数（越大衰减越快）
uniform float uWaveSpatialDecay;  // 空间衰减系数（越大传得越近）
uniform float uWaveFrequency;     // 波环密度（越大环越密）
uniform float uWaveAmplitude;     // 波峰幅度
uniform float uMaxHeight;         // 最大长高高度（世界单位）
uniform float uCubeSize;          // 方块原始尺寸
uniform float uTime;              // 全局时间

varying float vHeight;            // 归一化高度（0~1）
varying vec3 vWorldNormal;        // 世界空间法线（传给 fragment 做光照）
varying vec3 vWorldPos;           // 世界空间位置（传给 fragment 做光照）

float computeWaveHeight(vec3 instanceCenter) {
  float total = 0.0;

  for (int i = 0; i < 64; i++) {
    if (i >= uWaveCount) break;

    float ox = uWaveOrigins[i * 4 + 0];
    float oz = uWaveOrigins[i * 4 + 1];
    float startTime = uWaveOrigins[i * 4 + 2];

    if (startTime < 0.001) continue;

    float dist = length(instanceCenter.xz - vec2(ox, oz));
    float elapsed = uTime - startTime;

    // 波前：波已传播至此的距离
    float waveFront = elapsed * uWaveSpeed - dist;

    // 因果性：波未到 → 0，过渡区平滑打开
    float causality = smoothstep(-0.5, 0.1, waveFront);

    // ---- Morlet 小波：cos 振荡 × Gaussian 包络 ----
    // 半周期需覆盖 ≥2 个方块（≈1.6 单位），确保相邻方块高度差小
    float oscillation = cos(waveFront * uWaveFrequency * 0.9);
    // cos 输出 [-1,1] → 映射到 [0,1]，无硬截断
    float oscPositive = oscillation * 0.5 + 0.5;

    // 包络：较宽以容纳 2 个完整波环
    float envelopeSigma = 4.5 / (uWaveFrequency + 0.01);
    float envelope = exp(-waveFront * waveFront / (2.0 * envelopeSigma * envelopeSigma));

    float wavelet = oscPositive * envelope;

    // 时间衰减：点击后随时间逐渐消失
    float temporalDecay = exp(-elapsed * uWaveDecay);

    // 空间衰减：远处自然减弱
    float spatialDecay = 1.0 / (1.0 + dist * dist * uWaveSpatialDecay * uWaveSpatialDecay * 4.0);

    total += wavelet * temporalDecay * spatialDecay * causality;
  }

  return total;
}

void main() {
  // 方块实例的中心位置（取自实例矩阵的平移分量）
  vec3 instanceCenter = instanceMatrix[3].xyz;

  // 计算该方块受到的所有波源影响
  float rawWave = computeWaveHeight(instanceCenter);

  // 小波已映射到 [0,1]，无需截断，过渡连续自然
  float normalizedHeight = rawWave * uWaveAmplitude;
  normalizedHeight = clamp(normalizedHeight, 0.0, 1.0);

  vHeight = normalizedHeight;

  // 沿 Y 轴拉伸方块（底部固定在地面，顶部向上长高）
  float halfCube = uCubeSize * 0.5;
  float growHeight = normalizedHeight * uMaxHeight;
  float scaleY = 1.0 + growHeight / uCubeSize;
  vec3 pos = position;
  pos.y = (pos.y + halfCube) * scaleY - halfCube;

  // 世界空间位置和法线（传给 fragment 做光照）
  vec4 worldPos = instanceMatrix * vec4(pos, 1.0);
  vWorldPos = worldPos.xyz;
  vWorldNormal = normalize(mat3(instanceMatrix) * normal);

  gl_Position = projectionMatrix * modelViewMatrix * worldPos;
}
