/**
 * gui.ts — 参数调试面板 / Parameter debug panel
 *
 * 使用 lil-gui 创建实时控制面板，调节波动方程的各项参数
 * 所有改动即时同步到 Shader uniforms
 *
 * Use lil-gui to create a real-time control panel for adjusting wave equation parameters.
 * All changes sync instantly to shader uniforms.
 */

import GUI from 'lil-gui';
import type { GridState, WaveParams } from './grid';
import { DEFAULT_WAVE_PARAMS } from './grid';

export interface GUIControls {
  gui: GUI;
  params: WaveParams & { maxHeight: number };
}

/**
 * 创建 GUI 控制面板 / Create GUI control panel
 *
 * 分层组织： / Organized by category:
 *   - 高度：最大抬升高度 / Height: max elevation
 *   - 波动：传播速度、时间衰减、空间衰减 / Wave: speed, temporal decay, spatial decay
 *   - 波纹：频率、振幅 / Ripple: frequency, amplitude
 */
export function createGUI(gridState: GridState, container: HTMLElement): GUIControls {
  const { material } = gridState;

  const params: WaveParams & { maxHeight: number } = {
    maxHeight: material.uniforms.uMaxHeight.value as number,
    speed: DEFAULT_WAVE_PARAMS.speed,
    decay: DEFAULT_WAVE_PARAMS.decay,
    spatialDecay: DEFAULT_WAVE_PARAMS.spatialDecay,
    frequency: DEFAULT_WAVE_PARAMS.frequency,
    amplitude: DEFAULT_WAVE_PARAMS.amplitude,
  };

  const gui = new GUI({ title: 'JumpBox Controls', width: 280 });
  // 将 GUI 面板插入容器内，固定定位跟随容器 / Mount GUI panel inside container with fixed positioning
  container.appendChild(gui.domElement);
  gui.domElement.style.position = 'absolute';
  gui.domElement.style.top = '8px';
  gui.domElement.style.right = '8px';
  gui.domElement.style.zIndex = '15';

  // ---- 高度 / Height ----
  const folderHeight = gui.addFolder('高度 / Height');
  folderHeight.add(params, 'maxHeight', 0.5, 6.0, 0.1)
    .name('最大高度 / Max Height')
    .onChange((v: number) => {
      material.uniforms.uMaxHeight.value = v;
    });

  // ---- 波动 / Wave ----
  const folderWave = gui.addFolder('波动传播 / Wave Propagation');
  folderWave.add(params, 'speed', 0.5, 10.0, 0.1)
    .name('传播速度 / Speed')
    .onChange((v: number) => {
      material.uniforms.uWaveSpeed.value = v;
    });
  folderWave.add(params, 'decay', 0.1, 5.0, 0.1)
    .name('时间衰减 / Temporal Decay')
    .onChange((v: number) => {
      material.uniforms.uWaveDecay.value = v;
    });
  folderWave.add(params, 'spatialDecay', 0.05, 1.0, 0.01)
    .name('距离衰减 / Spatial Decay')
    .onChange((v: number) => {
      material.uniforms.uWaveSpatialDecay.value = v;
    });

  // ---- 波纹 / Ripple ----
  const folderRipple = gui.addFolder('波纹形态 / Ripple Shape');
  folderRipple.add(params, 'frequency', 0.5, 8.0, 0.1)
    .name('空间频率 / Frequency')
    .onChange((v: number) => {
      material.uniforms.uWaveFrequency.value = v;
    });
  folderRipple.add(params, 'amplitude', 0.1, 2.0, 0.01)
    .name('波峰幅度 / Amplitude')
    .onChange((v: number) => {
      material.uniforms.uWaveAmplitude.value = v;
    });

  // 默认展开所有文件夹 / Expand all folders by default
  folderHeight.open();
  folderWave.open();
  folderRipple.open();

  return { gui, params };
}
