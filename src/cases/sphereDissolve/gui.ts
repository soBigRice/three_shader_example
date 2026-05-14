/**
 * gui.ts — 消融球体参数调试面板 / Dissolve sphere parameter debug panel
 *
 * 使用 lil-gui 创建实时控制面板，调节消融、外观和光照参数
 * 所有改动即时同步到实体球体 + 线框网格的 Shader uniforms
 *
 * Use lil-gui to create a real-time control panel for dissolve, appearance & lighting.
 * All changes sync instantly to both solid sphere and wireframe mesh shader uniforms.
 */

import GUI from 'lil-gui';
import * as THREE from 'three';
import type { DissolveState, WireframeState } from './scene';

export interface GUIControls {
  gui: GUI;
  params: {
    dissolveMode: 'noise' | 'horizontal';
    dissolveProgress: number;
    edgeWidth: number;
    noiseScale: number;
    edgeColor: string;
    wireframe: boolean;
    wireframeWidth: number;
    wireframeColor: string;
    baseColor: string;
    ambient: number;
    diffuse: number;
    specular: number;
    shininess: number;
    autoAnimate: boolean;
    animSpeed: number;
  };
}

/** 将颜色同步到 uniform，统一用 THREE.Color.set() 解析 / Sync color to uniform via THREE.Color.set() */
function setColor(uniform: { value: THREE.Color }, hex: string): void {
  uniform.value.set(hex);
}

export function createGUI(
  sphereState: DissolveState,
  wireState: WireframeState,
  container: HTMLElement,
): GUIControls {
  const sm = sphereState.material.uniforms;
  const wm = wireState.material.uniforms;

  const params = {
    dissolveMode: 'noise' as 'noise' | 'horizontal',
    dissolveProgress: 0.15,
    edgeWidth: 0.06,
    noiseScale: 1.2,
    edgeColor: '#ff6622',
    wireframe: false,
    wireframeWidth: 1.5,
    wireframeColor: '#00ddff',
    baseColor: '#3366cc',
    ambient: 0.22,
    diffuse: 0.55,
    specular: 0.50,
    shininess: 48.0,
    autoAnimate: false,
    animSpeed: 0.3,
  };

  const gui = new GUI({ title: 'Dissolve Controls', width: 280 });
  container.appendChild(gui.domElement);
  gui.domElement.style.position = 'absolute';
  gui.domElement.style.top = '8px';
  gui.domElement.style.right = '8px';
  gui.domElement.style.zIndex = '15';

  // ---- 消融 / Dissolve ----
  const folderDissolve = gui.addFolder('消融 / Dissolve');
  folderDissolve.add(params, 'dissolveMode', ['noise', 'horizontal'])
    .name('模式 / Mode')
    .onChange((v: string) => {
      const val = v === 'horizontal' ? 1.0 : 0.0;
      sm.uDissolveMode.value = val;
      wm.uDissolveMode.value = val;
    });
  folderDissolve.add(params, 'dissolveProgress', 0.0, 1.0, 0.01)
    .name('进度 / Progress')
    .onChange((v: number) => {
      sm.uDissolveProgress.value = v;
      wm.uDissolveProgress.value = v;
    });
  folderDissolve.add(params, 'edgeWidth', 0.01, 0.5, 0.01)
    .name('边缘宽度 / Edge Width')
    .onChange((v: number) => {
      sm.uEdgeWidth.value = v;
      wm.uEdgeWidth.value = v;
    });
  folderDissolve.add(params, 'noiseScale', 0.3, 4.0, 0.1)
    .name('噪声缩放 / Noise Scale')
    .onChange((v: number) => {
      sm.uNoiseScale.value = v;
      wm.uNoiseScale.value = v;
    });
  folderDissolve.addColor(params, 'edgeColor')
    .name('边缘颜色 / Edge Color')
    .onChange((v: string) => {
      setColor(sm.uEdgeColor, v);
      setColor(wm.uEdgeColor, v);
    });
  folderDissolve.add(params, 'autoAnimate')
    .name('自动动画 / Auto Animate');
  folderDissolve.add(params, 'animSpeed', 0.05, 1.0, 0.01)
    .name('动画速度 / Anim Speed');

  // ---- 外观 / Appearance ----
  const folderAppearance = gui.addFolder('外观 / Appearance');
  folderAppearance.addColor(params, 'baseColor')
    .name('基色 / Base Color')
    .onChange((v: string) => {
      setColor(sm.uBaseColor, v);
    });
  folderAppearance.add(params, 'wireframe')
    .name('线框模式 / Wireframe')
    .onChange((v: boolean) => {
      sphereState.mesh.visible = !v;
      wireState.mesh.visible = v;
    });
  folderAppearance.add(params, 'wireframeWidth', 0.5, 4.0, 0.1)
    .name('线宽 / Line Width')
    .onChange((v: number) => {
      wm.uWireframeWidth.value = v;
    });
  folderAppearance.addColor(params, 'wireframeColor')
    .name('线框颜色 / Wire Color')
    .onChange((v: string) => {
      setColor(wm.uWireframeColor, v);
    });

  // ---- 光照 / Lighting ----
  const folderLight = gui.addFolder('光照 / Lighting');
  folderLight.add(params, 'ambient', 0.0, 0.6, 0.01)
    .name('环境光 / Ambient')
    .onChange((v: number) => {
      sm.uAmbient.value = v;
    });
  folderLight.add(params, 'diffuse', 0.0, 1.0, 0.01)
    .name('漫反射 / Diffuse')
    .onChange((v: number) => {
      sm.uDiffuse.value = v;
    });
  folderLight.add(params, 'specular', 0.0, 1.5, 0.01)
    .name('高光强度 / Specular')
    .onChange((v: number) => {
      sm.uSpecular.value = v;
    });
  folderLight.add(params, 'shininess', 4.0, 256.0, 1.0)
    .name('光泽度 / Shininess')
    .onChange((v: number) => {
      sm.uShininess.value = v;
    });

  folderDissolve.open();
  folderAppearance.open();
  folderLight.open();

  return { gui, params };
}
