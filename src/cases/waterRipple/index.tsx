import { useEffect, useRef } from 'react';
import Stats from 'stats.js';
import CaseLayout from '../../components/CaseLayout';
import { createScene } from './scene';
import { createGrid } from './grid';
import { setupInteraction } from './interaction';
import { createGUI } from './gui';

const DESCRIPTION = `
水波涟漪效果 —— 点击方块产生基于 Morlet 小波的涟漪扩散。GPU Vertex Shader 中计算阻尼波动方程，
每个方块根据到波源的距离实时计算高度。支持多点同时交互（最多 64 个活跃波源），
死波源自动回收。右侧 lil-gui 面板可实时调节传播速度、衰减系数、频率、振幅等参数。
`.trim();

export default function WaterRipple() {
  const containerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<Stats | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ---- Stats 性能面板 ----
    const stats = new Stats();
    stats.dom.style.position = 'absolute';
    stats.dom.style.top = '8px';
    stats.dom.style.left = '8px';
    stats.dom.style.zIndex = '15';
    container.appendChild(stats.dom);
    statsRef.current = stats;

    // ---- 初始化场景（renderer 初始设为容器尺寸） ----
    const { scene, camera, renderer, controls } = createScene(
      container.clientWidth,
      container.clientHeight,
    );
    container.appendChild(renderer.domElement);

    // ---- 方块网格 ----
    const gridState = createGrid();
    scene.add(gridState.mesh);

    // ---- 交互 ----
    setupInteraction(gridState, camera, renderer.domElement);

    // ---- GUI ----
    const { gui } = createGUI(gridState);

    // ---- 容器尺寸变化时更新 renderer 和相机 ----
    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(container);

    // ---- 渲染循环 ----
    let animId: number;
    function animate() {
      animId = requestAnimationFrame(animate);
      stats.begin();
      const elapsed = performance.now() / 1000;
      gridState.material.uniforms.uTime.value = elapsed;
      controls.update();
      renderer.render(scene, camera);
      stats.end();
    }
    animate();

    // ---- 清理 ----
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      gui.destroy();
      controls.dispose();
      renderer.dispose();
      gridState.material.dispose();
      gridState.mesh.geometry.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      if (stats.dom.parentNode) {
        stats.dom.parentNode.removeChild(stats.dom);
      }
    };
  }, []);

  return (
    <CaseLayout title="水波涟漪 · Morlet Wavelet Ripple" description={DESCRIPTION}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </CaseLayout>
  );
}
