import { useEffect, useRef } from 'react';
import Stats from 'stats.js';
import CaseLayout from '../../components/CaseLayout';
import { useT } from '../../i18n/context';
import { createScene } from './scene';
import { createGrid } from './grid';
import { setupInteraction } from './interaction';
import { createGUI } from './gui';

export default function WaterRipple() {
  const { t } = useT();
  const containerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<Stats | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ---- Stats 性能面板 / Stats performance panel ----
    const stats = new Stats();
    stats.dom.style.position = 'absolute';
    stats.dom.style.top = '8px';
    stats.dom.style.left = '8px';
    stats.dom.style.zIndex = '15';
    container.appendChild(stats.dom);
    statsRef.current = stats;

    // ---- 初始化场景（renderer 初始设为容器尺寸） / Init scene (renderer sized to container) ----
    const { scene, camera, renderer, controls } = createScene(
      container.clientWidth,
      container.clientHeight,
    );
    container.appendChild(renderer.domElement);

    // ---- 方块网格 / Block grid ----
    const gridState = createGrid();
    scene.add(gridState.mesh);

    // ---- 交互 / Interaction ----
    setupInteraction(gridState, camera, renderer.domElement);

    // ---- GUI（挂载到容器内，不随全屏切换跑偏） / GUI (mounted in container, stable on fullscreen toggle) ----
    const { gui } = createGUI(gridState, container);

    // ---- 容器尺寸变化时更新 renderer 和相机 / Resize handler: update renderer & camera ----
    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(container);

    // ---- 渲染循环 / Render loop ----
    let animId: number;
    function animate() {
      animId = requestAnimationFrame(animate);
      stats.begin();
      const elapsed = performance.now() / 1000;
      gridState.material.uniforms.uTime.value = elapsed;
      // 同步相机位置给 Shader（Blinn-Phong 高光需要） / Sync camera pos to shader (needed for Blinn-Phong specular)
      gridState.material.uniforms.uCameraPos.value.copy(camera.position);
      controls.update();
      renderer.render(scene, camera);
      stats.end();
    }
    animate();

    // ---- 清理 / Cleanup ----
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
    <CaseLayout title={t('waterRipple.pageTitle')} description={t('waterRipple.description')}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </CaseLayout>
  );
}
