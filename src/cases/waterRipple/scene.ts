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
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // ---- Scene ----
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#1a1a2e');
  scene.fog = new THREE.Fog('#1a1a2e', 8, 35);

  // ---- Camera ----
  const camera = new THREE.PerspectiveCamera(
    50,              // FOV
    width / Math.max(height, 1), // Aspect
    0.1,             // Near
    100,             // Far
  );
  // 摄像机位置：从右上方俯视场地中心
  camera.position.set(14, 12, 14);
  camera.lookAt(0, 0, 0);

  // ---- OrbitControls：鼠标拖拽旋转/平移/缩放 ----
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;      // 启用惯性阻尼
  controls.dampingFactor = 0.08;
  controls.minDistance = 5;          // 最近缩放距离
  controls.maxDistance = 30;         // 最远缩放距离
  controls.maxPolarAngle = Math.PI / 2.1; // 限制到略低于水平面，防止钻地
  controls.update();

  // ---- Lights ----
  // 环境光：提供基础亮度，避免暗面全黑
  const ambientLight = new THREE.AmbientLight('#8899bb', 0.8);
  scene.add(ambientLight);

  // 主方向光：产生明暗面和阴影
  const sunLight = new THREE.DirectionalLight('#ffffff', 1.2);
  sunLight.position.set(10, 18, 5);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 60;
  sunLight.shadow.camera.left = -15;
  sunLight.shadow.camera.right = 15;
  sunLight.shadow.camera.top = 15;
  sunLight.shadow.camera.bottom = -15;
  scene.add(sunLight);

  // 补光：从侧面打一点蓝色冷光，增加立体感
  const fillLight = new THREE.DirectionalLight('#4466aa', 0.5);
  fillLight.position.set(-4, 2, -6);
  scene.add(fillLight);

  // ---- 地面参考平面 ----
  const groundGeo = new THREE.PlaneGeometry(40, 40);
  const groundMat = new THREE.MeshStandardMaterial({
    color: '#252540',
    roughness: 0.9,
    metalness: 0.1,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.55;
  ground.receiveShadow = true;
  scene.add(ground);

  return { scene, camera, renderer, controls };
}