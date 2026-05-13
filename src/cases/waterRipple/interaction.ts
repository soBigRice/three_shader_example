/**
 * interaction.ts — 鼠标交互模块（水波涟漪版）
 *
 * 使用 capture 阶段监听 pointerdown/pointerup，确保在 OrbitControls 之前处理
 * 每次点击独立产生一个波源，Shader 中累加所有活跃波源
 */

import * as THREE from 'three';
import type { GridState } from './grid';
import { addWaveOrigin } from './grid';

export function setupInteraction(
  gridState: GridState,
  camera: THREE.PerspectiveCamera,
  domElement: HTMLElement,
): void {
  const { mesh } = gridState;
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // 每次 pointerdown→pointerup 周期独立记录状态
  let startX = 0;
  let startY = 0;
  let moved = false;
  const DRAG_THRESHOLD = 4;

  // capture 阶段处理，比 OrbitControls 先拿到事件
  domElement.addEventListener('pointerdown', (event: PointerEvent) => {
    startX = event.clientX;
    startY = event.clientY;
    moved = false;
  }, { capture: true });

  domElement.addEventListener('pointermove', (event: PointerEvent) => {
    if (Math.abs(event.clientX - startX) > DRAG_THRESHOLD
      || Math.abs(event.clientY - startY) > DRAG_THRESHOLD) {
      moved = true;
    }
  }, { capture: true });

  domElement.addEventListener('pointerup', (event: PointerEvent) => {
    if (moved) return;

    // ---- 1. NDC 坐标 ----
    mouse.x = (event.clientX / domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / domElement.clientHeight) * 2 + 1;

    // ---- 2. Raycaster ----
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(mesh);

    if (intersects.length === 0) return;

    const instanceIndex = intersects[0].instanceId;
    if (instanceIndex === undefined) return;

    // ---- 3. 获取方块实例的世界位置 ----
    const matrix = new THREE.Matrix4();
    mesh.getMatrixAt(instanceIndex, matrix);
    const originX = matrix.elements[12];
    const originZ = matrix.elements[14];

    // ---- 4. 添加波源 ----
    const now = performance.now() / 1000;
    addWaveOrigin(gridState, originX, originZ, now);
  }, { capture: true });
}
