import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import Stats from 'stats.js';
import CaseLayout from '../../components/CaseLayout';
import { useT } from '../../i18n/context';
import {
  createScene,
  createLetterPaper,
  LETTER_PAPER_WIDTH,
  LETTER_PAPER_HEIGHT,
  type PaperState,
} from './scene';
import { createLetterTextureController, type LetterTextureController } from './texture';
import { createParticleSystem, type ParticleSystemState } from './particles';
import type {
  DissolveControls,
  DissolveMode,
  DissolvePlaybackState,
  LetterTemplateFields,
} from './types';

const DISSOLVE_DURATION = 2.8;
const PARTICLE_FADE_DURATION = 1.25;

const DEFAULT_DISSOLVE_CONTROLS: DissolveControls = {
  mode: 'vertical',
  progress: 0,
  edgeSoftness: 0.04,
  noiseStrength: 0.08,
  noiseScale: 26,
  noiseSpeed: 0.16,
  edgeGlow: 1.0,
};

function getPlaybackLabel(t: (key: string) => string, state: DissolvePlaybackState): string {
  if (state === 'running') return t('letterDissolve.status.running');
  if (state === 'finished') return t('letterDissolve.status.finished');
  return t('letterDissolve.status.idle');
}

/** 模式转 uniform 值 / Convert dissolve mode to uniform numeric value */
function getModeUniformValue(mode: DissolveMode): number {
  return mode === 'holes' ? 1 : 0;
}

export default function LetterDissolve() {
  const { t } = useT();
  const containerRef = useRef<HTMLDivElement>(null);

  const [fields, setFields] = useState<LetterTemplateFields>({
    salutation: t('letterDissolve.default.salutation'),
    body: t('letterDissolve.default.body'),
    closing: t('letterDissolve.default.closing'),
    signature: t('letterDissolve.default.signature'),
  });
  const [playbackState, setPlaybackState] = useState<DissolvePlaybackState>('idle');
  const [isPanelCollapsed, setPanelCollapsed] = useState(false);
  const [dissolveControls, setDissolveControls] = useState<DissolveControls>(DEFAULT_DISSOLVE_CONTROLS);

  const playbackStateRef = useRef<DissolvePlaybackState>('idle');
  const dissolveStartRef = useRef<number>(0);
  const dissolveStartProgressRef = useRef<number>(0);
  const finishedAtRef = useRef<number>(0);
  const dissolveProgressRef = useRef<number>(DEFAULT_DISSOLVE_CONTROLS.progress);
  const dissolveControlsRef = useRef<DissolveControls>(DEFAULT_DISSOLVE_CONTROLS);

  const textureControllerRef = useRef<LetterTextureController | null>(null);
  const paperStateRef = useRef<PaperState | null>(null);
  const particleStateRef = useRef<ParticleSystemState | null>(null);
  const textureUpdateTimerRef = useRef<number | null>(null);

  /** 将当前消散参数同步到纸张 shader / Sync current dissolve controls to paper shader */
  const syncPaperUniforms = useCallback((controls: DissolveControls) => {
    const paperState = paperStateRef.current;
    if (!paperState) return;

    paperState.material.uniforms.uDissolveMode.value = getModeUniformValue(controls.mode);
    paperState.material.uniforms.uEdgeSoftness.value = controls.edgeSoftness;
    paperState.material.uniforms.uNoiseStrength.value = controls.noiseStrength;
    paperState.material.uniforms.uNoiseScale.value = controls.noiseScale;
    paperState.material.uniforms.uNoiseSpeed.value = controls.noiseSpeed;
    paperState.material.uniforms.uEdgeGlow.value = controls.edgeGlow;

    if (playbackStateRef.current !== 'running') {
      paperState.material.uniforms.uDissolveProgress.value = controls.progress;
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ---- Stats 性能面板 / Stats performance panel ----
    const stats = new Stats();
    stats.dom.style.position = 'absolute';
    stats.dom.style.top = '8px';
    stats.dom.style.left = '8px';
    stats.dom.style.zIndex = '18';
    container.appendChild(stats.dom);

    // ---- 初始化场景 / Init scene ----
    const { scene, camera, renderer, controls } = createScene(
      container.clientWidth,
      container.clientHeight,
    );
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.zIndex = '1';
    container.appendChild(renderer.domElement);

    // ---- 纸张纹理与网格 / Paper texture and mesh ----
    const textureController = createLetterTextureController(fields);
    textureControllerRef.current = textureController;

    const paperState = createLetterPaper(textureController.texture);
    paperStateRef.current = paperState;
    syncPaperUniforms(dissolveControlsRef.current);
    scene.add(paperState.mesh);

    // ---- 粒子系统 / Particle system ----
    const particleState = createParticleSystem(LETTER_PAPER_WIDTH, LETTER_PAPER_HEIGHT);
    particleStateRef.current = particleState;
    scene.add(particleState.points);

    // ---- 自适应容器尺寸 / Resize observer ----
    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(container);

    // ---- 渲染循环 / Render loop ----
    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      stats.begin();

      const now = performance.now() / 1000;
      const currentPaper = paperStateRef.current;
      const currentParticles = particleStateRef.current;
      const currentControls = dissolveControlsRef.current;

      if (currentPaper) {
        currentPaper.material.uniforms.uTime.value = now;
        currentPaper.material.uniforms.uDissolveMode.value = getModeUniformValue(currentControls.mode);
        currentPaper.material.uniforms.uEdgeSoftness.value = currentControls.edgeSoftness;
        currentPaper.material.uniforms.uNoiseStrength.value = currentControls.noiseStrength;
        currentPaper.material.uniforms.uNoiseScale.value = currentControls.noiseScale;
        currentPaper.material.uniforms.uNoiseSpeed.value = currentControls.noiseSpeed;
        currentPaper.material.uniforms.uEdgeGlow.value = currentControls.edgeGlow;

        if (playbackStateRef.current === 'running') {
          const elapsed = now - dissolveStartRef.current;
          const normalized = Math.min(elapsed / DISSOLVE_DURATION, 1);
          const start = dissolveStartProgressRef.current;
          const progress = Math.min(start + (1 - start) * normalized, 1);

          dissolveProgressRef.current = progress;
          currentPaper.material.uniforms.uDissolveProgress.value = progress;

          if (progress >= 1) {
            playbackStateRef.current = 'finished';
            finishedAtRef.current = now;
            setPlaybackState('finished');
            setDissolveControls((prev) => ({ ...prev, progress: 1 }));
          }
        } else {
          currentPaper.material.uniforms.uDissolveProgress.value = dissolveProgressRef.current;
        }
      }

      if (currentParticles) {
        const isAutoFinished = playbackStateRef.current === 'finished' && finishedAtRef.current > 0;
        const autoFinishedAge = isAutoFinished ? (now - finishedAtRef.current) : 0;
        const autoFadeEnded = isAutoFinished && autoFinishedAge >= PARTICLE_FADE_DURATION;
        const hasManualPreviewProgress = finishedAtRef.current <= 0 && dissolveProgressRef.current > 0.001;
        const particleActive = playbackStateRef.current === 'running'
          || (isAutoFinished && !autoFadeEnded)
          || hasManualPreviewProgress;

        let fade = 1;
        if (isAutoFinished) {
          fade = Math.max(1 - autoFinishedAge / PARTICLE_FADE_DURATION, 0);
        }

        currentParticles.update(
          dissolveProgressRef.current,
          now,
          particleActive,
          fade,
          getModeUniformValue(currentControls.mode),
          currentControls.noiseScale,
          currentControls.noiseSpeed,
        );
      }

      controls.update();
      renderer.render(scene, camera);
      stats.end();
    };

    animate();

    // ---- 清理 / Cleanup ----
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();

      if (textureUpdateTimerRef.current !== null) {
        window.clearTimeout(textureUpdateTimerRef.current);
      }

      controls.dispose();
      renderer.dispose();

      if (paperStateRef.current) {
        paperStateRef.current.material.dispose();
        (paperStateRef.current.mesh.geometry as THREE.BufferGeometry).dispose();
      }

      if (particleStateRef.current) {
        particleStateRef.current.material.dispose();
        (particleStateRef.current.points.geometry as THREE.BufferGeometry).dispose();
      }

      textureControllerRef.current?.dispose();

      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      if (stats.dom.parentNode) {
        stats.dom.parentNode.removeChild(stats.dom);
      }
    };
  }, [syncPaperUniforms]);

  // ---- 输入内容实时转贴图（节流） / Real-time text-to-texture update with throttle ----
  useEffect(() => {
    const controller = textureControllerRef.current;
    if (!controller) return;

    if (textureUpdateTimerRef.current !== null) {
      window.clearTimeout(textureUpdateTimerRef.current);
    }

    textureUpdateTimerRef.current = window.setTimeout(() => {
      controller.updateFields(fields);
    }, 80);
  }, [fields]);

  // ---- 消散控件变更时同步到渲染状态 / Sync dissolve controls into render states ----
  useEffect(() => {
    dissolveControlsRef.current = dissolveControls;
    syncPaperUniforms(dissolveControls);

    if (playbackStateRef.current !== 'running') {
      dissolveProgressRef.current = dissolveControls.progress;

      if (dissolveControls.progress >= 0.999) {
        playbackStateRef.current = 'finished';
        // 自动播放完成后如果已存在淡出计时，不要被状态同步覆盖
        // Keep auto-fade timer after auto completion; only clear for manual preview
        if (finishedAtRef.current <= 0) {
          // 手动拖动到 1.0 属于预览态，不做自动衰减计时
          // Manual slider to 1.0 is preview state; do not start auto fade timer
          finishedAtRef.current = 0;
        }
        setPlaybackState('finished');
      } else {
        playbackStateRef.current = 'idle';
        finishedAtRef.current = 0;
        setPlaybackState('idle');
      }
    }
  }, [dissolveControls, syncPaperUniforms]);

  const updateField = useCallback((key: keyof LetterTemplateFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  }, []);

  /**
   * 更新消散控件（进度手动调节时会退出自动播放）
   * Update dissolve controls (manual progress adjustment exits auto playback)
   */
  const updateDissolveControl = useCallback(
    <K extends keyof DissolveControls>(
      key: K,
      value: DissolveControls[K],
      opts?: { stopRunning?: boolean },
    ) => {
      if (opts?.stopRunning && playbackStateRef.current === 'running') {
        playbackStateRef.current = 'idle';
        setPlaybackState('idle');
      }

      setDissolveControls((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleStartDissolve = useCallback(() => {
    if (playbackStateRef.current === 'running') return;

    const startProgress = dissolveControlsRef.current.progress;
    if (startProgress >= 0.999) return;

    playbackStateRef.current = 'running';
    setPlaybackState('running');

    dissolveStartRef.current = performance.now() / 1000;
    dissolveStartProgressRef.current = startProgress;
    finishedAtRef.current = 0;
    dissolveProgressRef.current = startProgress;

    if (paperStateRef.current) {
      paperStateRef.current.material.uniforms.uDissolveProgress.value = startProgress;
    }
  }, []);

  const handleReset = useCallback(() => {
    playbackStateRef.current = 'idle';
    setPlaybackState('idle');

    dissolveStartRef.current = 0;
    dissolveStartProgressRef.current = 0;
    finishedAtRef.current = 0;
    dissolveProgressRef.current = 0;

    setDissolveControls((prev) => ({ ...prev, progress: 0 }));

    if (paperStateRef.current) {
      paperStateRef.current.material.uniforms.uDissolveProgress.value = 0;
    }

    particleStateRef.current?.reset();
  }, []);

  const isRunning = playbackState === 'running';
  const canStart = dissolveControls.progress < 0.999 && !isRunning;

  return (
    <CaseLayout title={t('letterDissolve.pageTitle')} description={t('letterDissolve.description')}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
        {/* ---- 输入与控制面板 / Input and control panel ---- */}
        <section style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 24,
          width: isPanelCollapsed ? 220 : 340,
          maxHeight: isPanelCollapsed ? 'auto' : 'calc(100% - 78px)',
          overflowY: isPanelCollapsed ? 'visible' : 'auto',
          padding: isPanelCollapsed ? '10px 12px' : 14,
          borderRadius: 10,
          background: 'rgba(7, 10, 20, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          boxShadow: '0 16px 44px rgba(0, 0, 0, 0.35)',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            marginBottom: isPanelCollapsed ? 0 : 10,
          }}>
            <h4 style={{
              color: '#f4edd7',
              fontSize: 14,
              fontWeight: 600,
              margin: 0,
            }}>
              {t('letterDissolve.form.title')}
            </h4>
            <button
              className="btn btn-ghost"
              onClick={() => setPanelCollapsed((prev) => !prev)}
              style={{
                padding: '4px 8px',
                fontSize: 12,
                color: '#e8e4d8',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              {isPanelCollapsed ? '展开' : '收起'}
            </button>
          </div>

          {!isPanelCollapsed && (
            <>
              <div style={{
                color: '#9ea9c6',
                fontSize: 12,
                marginBottom: 8,
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                paddingBottom: 6,
              }}>
                信件内容 / Letter Content
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ color: '#d8d6ce', fontSize: 12 }}>{t('letterDissolve.field.salutation')}</span>
                  <input
                    value={fields.salutation}
                    onChange={(e) => updateField('salutation', e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#f7f4e9',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      borderRadius: 6,
                      padding: '6px 8px',
                    }}
                  />
                </label>

                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ color: '#d8d6ce', fontSize: 12 }}>{t('letterDissolve.field.body')}</span>
                  <textarea
                    value={fields.body}
                    onChange={(e) => updateField('body', e.target.value)}
                    rows={6}
                    style={{
                      width: '100%',
                      resize: 'vertical',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#f7f4e9',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      borderRadius: 6,
                      padding: '8px',
                      lineHeight: 1.45,
                    }}
                  />
                </label>

                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ color: '#d8d6ce', fontSize: 12 }}>{t('letterDissolve.field.closing')}</span>
                  <input
                    value={fields.closing}
                    onChange={(e) => updateField('closing', e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#f7f4e9',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      borderRadius: 6,
                      padding: '6px 8px',
                    }}
                  />
                </label>

                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ color: '#d8d6ce', fontSize: 12 }}>{t('letterDissolve.field.signature')}</span>
                  <input
                    value={fields.signature}
                    onChange={(e) => updateField('signature', e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#f7f4e9',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      borderRadius: 6,
                      padding: '6px 8px',
                    }}
                  />
                </label>
              </div>

              <div style={{
                color: '#9ea9c6',
                fontSize: 12,
                marginTop: 12,
                marginBottom: 8,
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                paddingBottom: 6,
              }}>
                消散控制 / Dissolve Controls
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ color: '#d8d6ce', fontSize: 12 }}>模式 / Mode</span>
                  <select
                    value={dissolveControls.mode}
                    onChange={(e) => updateDissolveControl('mode', e.target.value as DissolveMode)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#f7f4e9',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      borderRadius: 6,
                      padding: '6px 8px',
                    }}
                  >
                    <option value="vertical">竖向消散 / Vertical</option>
                    <option value="holes">整体破洞 / Holes</option>
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ color: '#d8d6ce', fontSize: 12 }}>
                    进度 / Progress: {dissolveControls.progress.toFixed(2)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={dissolveControls.progress}
                    onChange={(e) => updateDissolveControl('progress', Number(e.target.value), { stopRunning: true })}
                  />
                </label>

                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ color: '#d8d6ce', fontSize: 12 }}>
                    噪声强度 / Noise Strength: {dissolveControls.noiseStrength.toFixed(2)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={0.35}
                    step={0.01}
                    value={dissolveControls.noiseStrength}
                    onChange={(e) => updateDissolveControl('noiseStrength', Number(e.target.value))}
                  />
                </label>

                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ color: '#d8d6ce', fontSize: 12 }}>
                    噪声尺度 / Noise Scale: {dissolveControls.noiseScale.toFixed(1)}
                  </span>
                  <input
                    type="range"
                    min={6}
                    max={60}
                    step={1}
                    value={dissolveControls.noiseScale}
                    onChange={(e) => updateDissolveControl('noiseScale', Number(e.target.value))}
                  />
                </label>

                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ color: '#d8d6ce', fontSize: 12 }}>
                    噪声速度 / Noise Speed: {dissolveControls.noiseSpeed.toFixed(2)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={dissolveControls.noiseSpeed}
                    onChange={(e) => updateDissolveControl('noiseSpeed', Number(e.target.value))}
                  />
                </label>

                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ color: '#d8d6ce', fontSize: 12 }}>
                    边缘宽度 / Edge Softness: {dissolveControls.edgeSoftness.toFixed(3)}
                  </span>
                  <input
                    type="range"
                    min={0.005}
                    max={0.12}
                    step={0.001}
                    value={dissolveControls.edgeSoftness}
                    onChange={(e) => updateDissolveControl('edgeSoftness', Number(e.target.value))}
                  />
                </label>

                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ color: '#d8d6ce', fontSize: 12 }}>
                    边缘辉光 / Edge Glow: {dissolveControls.edgeGlow.toFixed(2)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={2}
                    step={0.01}
                    value={dissolveControls.edgeGlow}
                    onChange={(e) => updateDissolveControl('edgeGlow', Number(e.target.value))}
                  />
                </label>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                marginTop: 12,
              }}>
                <button
                  className="btn"
                  onClick={handleStartDissolve}
                  disabled={!canStart}
                  style={{
                    justifyContent: 'center',
                    opacity: canStart ? 1 : 0.45,
                    cursor: canStart ? 'pointer' : 'not-allowed',
                  }}
                >
                  {t('letterDissolve.action.start')}
                </button>
                <button
                  className="btn"
                  onClick={handleReset}
                  disabled={isRunning}
                  style={{
                    justifyContent: 'center',
                    opacity: isRunning ? 0.45 : 1,
                    cursor: isRunning ? 'not-allowed' : 'pointer',
                  }}
                >
                  {t('letterDissolve.action.reset')}
                </button>
              </div>

              <p style={{
                marginTop: 10,
                fontSize: 12,
                color: '#bfc4d4',
              }}>
                {t('letterDissolve.status.label')}: {getPlaybackLabel(t, playbackState)}
              </p>
            </>
          )}
        </section>
      </div>
    </CaseLayout>
  );
}
