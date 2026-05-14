/**
 * scene.ts — 场景搭建 + 消融球体 + 线框网格 / Scene setup + dissolve sphere + wireframe mesh
 *
 * 职责： / Responsibilities:
 *   - 创建 Three.js 场景、相机、渲染器、轨道控制器 / Create scene, camera, renderer, OrbitControls
 *   - 创建实体球体（SphereGeometry + Blinn-Phong 消融 shader） / Create solid sphere (SphereGeometry + Blinn-Phong dissolve shader)
 *   - 创建线框网格（IcosahedronGeometry + 重心坐标边缘消融 shader） / Create wireframe mesh (IcosahedronGeometry + barycentric edge dissolve shader)
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import vertexSrc from './shaders/vertex.glsl?raw';
import fragmentSrc from './shaders/fragment.glsl?raw';
import wireVertexSrc from './shaders/wireframe.vert.glsl?raw';
import wireFragmentSrc from './shaders/wireframe.frag.glsl?raw';

const SPHERE_RADIUS = 1.8;

export interface SceneSetup {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
}

export interface DissolveState {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
}

export interface WireframeState {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
}

/**
 * 为无索引几何体注入重心坐标属性 / Inject barycentric attribute for non-indexed geometry
 */
function injectBarycentric(geom: THREE.BufferGeometry): void {
  const nonIndexed = geom.index ? geom.toNonIndexed() : geom;
  if (geom.index) {
    geom.copy(nonIndexed);
    nonIndexed.dispose();
  }

  const posCount = geom.attributes.position.count;
  const bary = new Float32Array(posCount * 3);
  for (let i = 0; i < posCount; i += 3) {
    bary[i * 3] = 1;                     // Vertex i:   (1, 0, 0)
    bary[(i + 1) * 3 + 1] = 1;           // Vertex i+1: (0, 1, 0)
    bary[(i + 2) * 3 + 2] = 1;           // Vertex i+2: (0, 0, 1)
  }
  geom.setAttribute('aBarycentric', new THREE.BufferAttribute(bary, 3));
}

/**
 * 初始化场景、相机、渲染器 / Initialize scene, camera, renderer
 */
export function createScene(width: number, height: number): SceneSetup {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#02030a');
  scene.fog = new THREE.Fog('#02030a', 8, 18);

  const camera = new THREE.PerspectiveCamera(45, width / Math.max(height, 1), 0.1, 100);
  camera.position.set(5, 3, 7);
  camera.lookAt(0, 0, 0);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 3.5;
  controls.maxDistance = 15;
  controls.maxPolarAngle = Math.PI;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.62;
  controls.update();

  // 参考网格地面 / Reference grid floor
  const grid = new THREE.GridHelper(16, 32, '#3be9ff', '#153a6a');
  grid.position.y = -1.9;
  scene.add(grid);

  return { scene, camera, renderer, controls };
}

/**
 * 创建消融球体（实体渲染 - 光滑曲面） / Create dissolve sphere (solid rendering - smooth surface)
 */
export function createSphere(): DissolveState {
  const geom = new THREE.SphereGeometry(SPHERE_RADIUS, 64, 40);

  const material = new THREE.ShaderMaterial({
    vertexShader: vertexSrc,
    fragmentShader: fragmentSrc,
    uniforms: {
      uTime: { value: 0 },
      uDissolveMode: { value: 0.0 },
      uDissolveProgress: { value: 0.10 },
      uEdgeWidth: { value: 0.085 },
      uEdgeColor: { value: new THREE.Color('#6ef5ff') },
      uNoiseScale: { value: 1.65 },
      uBaseColor: { value: new THREE.Color('#4c63ff') },
      uLightDir: { value: new THREE.Vector3(4, 9, 7).normalize() },
      uCameraPos: { value: new THREE.Vector3() },
      uAmbient: { value: 0.16 },
      uDiffuse: { value: 0.68 },
      uSpecular: { value: 0.95 },
      uShininess: { value: 92.0 },
    },
  });

  const mesh = new THREE.Mesh(geom, material);

  return { mesh, material };
}

/**
 * 创建线框网格（正二十面体 + 重心坐标边缘检测） / Create wireframe mesh (icosahedron + barycentric edge detection)
 *
 * Icosahedron 三角面均匀分布，线框比经纬球干净得多
 * Icosahedron has uniform triangle distribution → much cleaner wireframe than UV sphere
 */
export function createWireframeOverlay(): WireframeState {
  const geom = new THREE.IcosahedronGeometry(SPHERE_RADIUS, 4);
  injectBarycentric(geom);

  const material = new THREE.ShaderMaterial({
    vertexShader: wireVertexSrc,
    fragmentShader: wireFragmentSrc,
    uniforms: {
      uTime: { value: 0 },
      uDissolveMode: { value: 0.0 },
      uDissolveProgress: { value: 0.10 },
      uEdgeWidth: { value: 0.085 },
      uEdgeColor: { value: new THREE.Color('#6ef5ff') },
      uNoiseScale: { value: 1.65 },
      uWireframeWidth: { value: 1.7 },
      uWireframeColor: { value: new THREE.Color('#3ef1ff') },
    },
    depthTest: true,
    depthWrite: true,
  });

  const mesh = new THREE.Mesh(geom, material);
  mesh.visible = false;

  return { mesh, material };
}
