/**
 * scene.ts — 场景基础搭建
 *
 * 职责：
 *   - 创建 Three.js 核心对象（Scene, Camera, Renderer）
 *   - 配置光照（环境光 + 平行光）
 *   - 将 Renderer 挂载到 DOM
 *   - 处理窗口 resize
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface SceneSetup {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
}

/**
 * 初始化场景、相机、渲染器
 *
 * @param width  - 容器宽度（像素）
 * @param height - 容器高度（像素）
 */
export function createScene(width: number, height: number): SceneSetup {
  // ---- Renderer ----
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);

  // ---- Scene：纯黑背景 ----
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#000000');

  // ---- Camera ----
  const camera = new THREE.PerspectiveCamera(50, width / Math.max(height, 1), 0.1, 100);
  camera.position.set(14, 12, 14);
  camera.lookAt(0, 0, 0);

  // ---- OrbitControls ----
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 5;
  controls.maxDistance = 30;
  controls.maxPolarAngle = Math.PI / 2.1;
  controls.update();

  // ---- Lights（无阴影） ----
  const ambientLight = new THREE.AmbientLight('#ffffff', 0.6);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight('#ffffff', 0.8);
  keyLight.position.set(8, 16, 6);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight('#8888cc', 0.3);
  fillLight.position.set(-6, 4, -8);
  scene.add(fillLight);

  // ---- 网格地面 ----
  const grid = new THREE.GridHelper(30, 30, '#222233', '#111118');
  grid.position.y = -0.38;
  scene.add(grid);

  return { scene, camera, renderer, controls };
}