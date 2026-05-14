/**
 * grid.ts — 方块网格核心模块（水波涟漪版） / Block grid core module (water ripple)
 *
 * 职责： / Responsibilities:
 *   - 创建 InstancedMesh，铺设 N×N 方块场地 / Create InstancedMesh with N×N block grid
 *   - 管理 ShaderMaterial 的波动方程参数 / Manage wave equation parameters in ShaderMaterial
 *   - 提供波源数据写入接口 / Provide wave source data write interface
 */

import * as THREE from 'three';
import vertexShaderSource from './shaders/vertex.glsl?raw';
import fragmentShaderSource from './shaders/fragment.glsl?raw';

/** 网格配置 / Grid configuration */
export interface GridConfig {
  gridSize: number;          // 网格边长（总方块数 = gridSize²） / Grid side length (total = gridSize²)
  cubeSize: number;          // 单个方块尺寸 / Individual cube size
  gap: number;               // 方块间距 / Gap between cubes
  maxHeight: number;         // 最大抬升高度 / Max elevation height
}

/** 波动参数 / Wave parameters */
export interface WaveParams {
  speed: number;         // 传播速度 / Propagation speed
  decay: number;         // 时间衰减率 / Temporal decay rate
  spatialDecay: number;  // 空间衰减率 / Spatial decay rate
  frequency: number;     // 空间频率 / Spatial frequency
  amplitude: number;     // 波峰幅度 / Peak amplitude
}

const DEFAULT_GRID_CONFIG: GridConfig = {
  gridSize: 30,
  cubeSize: 0.72,
  gap: 0.08,
  maxHeight: 3.3,
};

export const DEFAULT_WAVE_PARAMS: WaveParams = {
  speed: 4.7,
  decay: 0.8,
  spatialDecay: 0.09,
  frequency: 2.0,
  amplitude: 1.41,
};

/** 波源环形缓冲区最大容量（需与 Shader 中数组长度一致） / Max wave origins (must match shader array length) */
export const MAX_WAVE_ORIGINS = 64;

export interface GridState {
  mesh: THREE.InstancedMesh;
  material: THREE.ShaderMaterial;
  config: GridConfig;
}

/**
 * 创建方块网格 / Create block grid
 */
export function createGrid(
  config: GridConfig = DEFAULT_GRID_CONFIG,
  waveParams: WaveParams = DEFAULT_WAVE_PARAMS,
): GridState {
  const { gridSize, cubeSize, gap, maxHeight } = config;
  const totalInstances = gridSize * gridSize;
  const cellSize = cubeSize + gap;

  // ---- 1. 几何体 / Geometry ----
  const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

  // ---- 2. 波源数据缓冲区 / Wave origin data buffer ----
  const waveOrigins = new Float32Array(MAX_WAVE_ORIGINS * 4);

  // ---- 3. ShaderMaterial / 着色器材质 ----
  const material = new THREE.ShaderMaterial({
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
    uniforms: {
      uWaveOrigins:     { value: waveOrigins },
      uWaveCount:       { value: 0 },
      uWaveSpeed:       { value: waveParams.speed },
      uWaveDecay:       { value: waveParams.decay },
      uWaveSpatialDecay:{ value: waveParams.spatialDecay },
      uWaveFrequency:   { value: waveParams.frequency },
      uWaveAmplitude:   { value: waveParams.amplitude },
      uMaxHeight:       { value: maxHeight },
      uCubeSize:        { value: cubeSize },
      uTime:            { value: 0 },
      uLightDir:        { value: new THREE.Vector3(0.4, 0.8, 0.3).normalize() },
      uLightColor:      { value: new THREE.Color('#ccddff') },
      uAmbientColor:    { value: new THREE.Color('#334455') },
      uCameraPos:       { value: new THREE.Vector3(14, 12, 14) },
    },
    depthWrite: true,
    depthTest: true,
  });

  // ---- 4. InstancedMesh / 实例化网格 ----
  const mesh = new THREE.InstancedMesh(geometry, material, totalInstances);

  // ---- 5. 铺设方块 / Place cubes ----
  const dummy = new THREE.Object3D();
  const halfExtent = ((gridSize - 1) * cellSize) / 2;

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const x = col * cellSize - halfExtent;
      const z = row * cellSize - halfExtent;
      dummy.position.set(x, 0, z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(row * gridSize + col, dummy.matrix);
    }
  }
  mesh.instanceMatrix.needsUpdate = true;

  return { mesh, material, config };
}

/**
 * 添加一个波源到缓冲区（智能回收死波源） / Add a wave origin to buffer (smart dead-source recycling)
 *
 * 策略： / Strategy:
 *   1. 未满 → 追加到尾部 / Not full → append
 *   2. 已满 → 扫描已衰减至不可见的「死波源」并复用其槽位 / Full → scan for dead sources and reuse slot
 *   3. 全部活跃 → 覆盖最旧的（环形缓冲） / All active → overwrite oldest (ring buffer)
 *
 * 死波源判定：exp(-elapsed * decay) < 0.005，即衰减到原始幅度的 0.5% 以下
 * Dead source criterion: exp(-elapsed * decay) < 0.005, i.e. below 0.5% of original amplitude
 */
export function addWaveOrigin(
  gridState: GridState,
  originX: number,
  originZ: number,
  startTime: number,
): boolean {
  const { material } = gridState;
  const waveOrigins = material.uniforms.uWaveOrigins.value as Float32Array;
  const waveCount = material.uniforms.uWaveCount.value as number;
  const decay = material.uniforms.uWaveDecay.value as number;
  const DEAD_THRESHOLD = 0.005; // 低于 0.5% 视为已消亡 / Below 0.5% considered dead

  let writeIndex = -1;

  if (waveCount < MAX_WAVE_ORIGINS) {
    // 缓冲区未满 → 追加 / Buffer not full → append
    writeIndex = waveCount;
    material.uniforms.uWaveCount.value = waveCount + 1;
  } else {
    // 缓冲区已满 → 扫描死波源复用 / Buffer full → scan for dead sources
    for (let i = 0; i < MAX_WAVE_ORIGINS; i++) {
      const t = waveOrigins[i * 4 + 2];
      if (t < 0.001) continue;
      const elapsed = startTime - t;
      if (elapsed > 0 && Math.exp(-elapsed * decay) < DEAD_THRESHOLD) {
        writeIndex = i;
        break;
      }
    }
    // 全部活跃 → 环形覆盖最旧的 / All active → ring buffer overwrite oldest
    if (writeIndex < 0) {
      writeIndex = (waveCount + 1) % MAX_WAVE_ORIGINS;
    }
  }

  // 写入波源数据 / Write wave origin data
  waveOrigins[writeIndex * 4 + 0] = originX;
  waveOrigins[writeIndex * 4 + 1] = originZ;
  waveOrigins[writeIndex * 4 + 2] = startTime;
  waveOrigins[writeIndex * 4 + 3] = 0.0;

  // 原地修改 Float32Array 不会触发 Three.js 重新上传到 GPU
  // 必须创建新引用，让 WebGLUniforms 检测到变化
  // In-place Float32Array mutation won't trigger Three.js GPU re-upload.
  // Must create a new reference so WebGLUniforms detects the change.
  material.uniforms.uWaveOrigins.value = new Float32Array(waveOrigins);

  return true;
}
