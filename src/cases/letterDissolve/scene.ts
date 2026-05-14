/**
 * scene.ts — 信纸消散场景搭建 / Letter dissolve scene setup
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import paperVertexSrc from './shaders/paper.vert.glsl?raw';
import paperFragmentSrc from './shaders/paper.frag.glsl?raw';

export const LETTER_PAPER_WIDTH = 4.4;
export const LETTER_PAPER_HEIGHT = 6.2;

export interface SceneSetup {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
}

export interface PaperState {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
}

/**
 * 初始化场景、相机、渲染器 / Initialize scene, camera, renderer
 */
export function createScene(width: number, height: number): SceneSetup {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#06060b');
  scene.fog = new THREE.Fog('#06060b', 9, 15);

  const camera = new THREE.PerspectiveCamera(46, width / Math.max(height, 1), 0.1, 100);
  camera.position.set(0.15, 0.5, 7.4);
  camera.lookAt(0, 0.25, 0);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.25, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 5.2;
  controls.maxDistance = 11;
  controls.minPolarAngle = Math.PI * 0.32;
  controls.maxPolarAngle = Math.PI * 0.68;
  controls.autoRotate = false;
  controls.update();

  // ---- 背景地板，增强空间层次 / Background floor for depth layering ----
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshBasicMaterial({ color: '#090813' }),
  );
  floor.rotation.x = -Math.PI * 0.5;
  floor.position.y = -3.55;
  scene.add(floor);

  const ambient = new THREE.AmbientLight('#88aaff', 0.36);
  scene.add(ambient);

  const key = new THREE.DirectionalLight('#f4f1dd', 0.45);
  key.position.set(3, 5, 4);
  scene.add(key);

  return { scene, camera, renderer, controls };
}

/**
 * 创建信纸网格与消散 shader / Create letter mesh with dissolve shader
 */
export function createLetterPaper(texture: THREE.Texture): PaperState {
  const geometry = new THREE.PlaneGeometry(LETTER_PAPER_WIDTH, LETTER_PAPER_HEIGHT, 1, 1);

  const material = new THREE.ShaderMaterial({
    vertexShader: paperVertexSrc,
    fragmentShader: paperFragmentSrc,
    transparent: true,
    depthWrite: true,
    depthTest: true,
    side: THREE.DoubleSide,
    uniforms: {
      uPaperTex: { value: texture },
      uTime: { value: 0 },
      uDissolveProgress: { value: 0 },
      uDissolveMode: { value: 0 },
      uEdgeSoftness: { value: 0.04 },
      uNoiseStrength: { value: 0.08 },
      uNoiseScale: { value: 26.0 },
      uNoiseSpeed: { value: 0.16 },
      uEdgeGlow: { value: 1.0 },
      uEdgeColor: { value: new THREE.Color('#ffd18f') },
    },
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 0.12, 0);
  mesh.rotation.x = -0.03;
  mesh.renderOrder = 1;

  return { mesh, material };
}
