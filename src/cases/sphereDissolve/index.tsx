import { useEffect, useRef } from 'react';
import Stats from 'stats.js';
import CaseLayout from '../../components/CaseLayout';
import { useT } from '../../i18n/context';
import { createScene, createSphere, createWireframeOverlay } from './scene';
import { createGUI } from './gui';

export default function SphereDissolve() {
  const { t } = useT();
  const containerRef = useRef<HTMLDivElement>(null);

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

    // ---- 初始化场景 / Init scene ----
    const { scene, camera, renderer, controls } = createScene(
      container.clientWidth,
      container.clientHeight,
    );
    container.appendChild(renderer.domElement);

    // ---- 实体球体 / Solid sphere ----
    const sphereState = createSphere();
    scene.add(sphereState.mesh);

    // ---- 线框覆盖层 / Wireframe overlay ----
    const wireState = createWireframeOverlay();
    scene.add(wireState.mesh);

    // ---- GUI / GUI ----
    const { gui, params } = createGUI(sphereState, wireState, container);

    // ---- 容器尺寸变化 / Resize handler ----
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

      // 同步时间到两个 shader / Sync time to both shaders
      sphereState.material.uniforms.uTime.value = elapsed;
      wireState.material.uniforms.uTime.value = elapsed;

      // 同步相机位置 / Sync camera pos
      sphereState.material.uniforms.uCameraPos.value.copy(camera.position);

      // 自动动画 ping-pong / Auto-animate ping-pong
      if (params.autoAnimate) {
        const raw = Math.sin(elapsed * params.animSpeed * Math.PI) * 0.5 + 0.5;
        params.dissolveProgress = raw;

        // 同步消融进度到两个 material / Sync dissolve progress to both materials
        sphereState.material.uniforms.uDissolveProgress.value = raw;
        wireState.material.uniforms.uDissolveProgress.value = raw;
      }

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
      sphereState.material.dispose();
      sphereState.mesh.geometry.dispose();
      wireState.material.dispose();
      wireState.mesh.geometry.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      if (stats.dom.parentNode) {
        stats.dom.parentNode.removeChild(stats.dom);
      }
    };
  }, []);

  return (
    <CaseLayout title={t('sphereDissolve.pageTitle')} description={t('sphereDissolve.description')}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </CaseLayout>
  );
}
