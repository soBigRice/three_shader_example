import { useEffect, useRef } from 'react';
import CaseLayout from '../../components/CaseLayout';
import { createScene, handleResize } from './scene';
import { createGrid } from './grid';
import { setupInteraction } from './interaction';
import { createGUI } from './gui';

export default function WaterRipple() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ---- 初始化 Three.js 场景 ----
    const { scene, camera, renderer, controls } = createScene();
    container.appendChild(renderer.domElement);

    // ---- 创建方块网格 ----
    const gridState = createGrid();
    scene.add(gridState.mesh);

    // ---- 鼠标交互 ----
    setupInteraction(gridState, camera, renderer.domElement);

    // ---- GUI 面板 ----
    const { gui } = createGUI(gridState);

    // ---- 窗口缩放 ----
    const onResize = () => handleResize(camera, renderer);
    window.addEventListener('resize', onResize);

    // ---- 渲染循环 ----
    let animId: number;
    function animate() {
      animId = requestAnimationFrame(animate);
      const elapsed = performance.now() / 1000;
      gridState.material.uniforms.uTime.value = elapsed;
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // ---- 清理 ----
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      gui.destroy();
      controls.dispose();
      renderer.dispose();
      gridState.material.dispose();
      gridState.mesh.geometry.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <CaseLayout title="水波涟漪 · Morlet Wavelet Ripple">
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </CaseLayout>
  );
}
