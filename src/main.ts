/**
 * main.ts — 应用入口（水波涟漪版）
 *
 * 串联所有模块：
 *   场景初始化 → 创建方块网格 → 绑定交互 → GUI面板 → 渲染循环
 */

import './style.css';
import { createScene, handleResize } from './scene';
import { createGrid } from './grid';
import { setupInteraction } from './interaction';
import { createGUI } from './gui';

// ---- 1. 初始化场景 ----
const { scene, camera, renderer, controls } = createScene();
document.querySelector<HTMLDivElement>('#app')!.appendChild(renderer.domElement);

// ---- 2. 创建方块网格 ----
const gridState = createGrid();
scene.add(gridState.mesh);

// ---- 3. 绑定鼠标交互 ----
setupInteraction(gridState, camera, renderer.domElement);

// ---- 4. GUI 调试面板 ----
createGUI(gridState);

// ---- 5. 窗口缩放适配 ----
window.addEventListener('resize', () => {
  handleResize(camera, renderer);
});

// ---- 6. 渲染循环 ----
function animate(): void {
  requestAnimationFrame(animate);

  // 使用 performance.now 作为全局时间源（秒），与 interaction 中波源时间戳一致
  const elapsed = performance.now() / 1000;
  gridState.material.uniforms.uTime.value = elapsed;

  controls.update();
  renderer.render(scene, camera);
}

animate();
