import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface CaseLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function CaseLayout({ title, description, children }: CaseLayoutProps) {
  const navigate = useNavigate();
  const [isFullscreen, setFullscreen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // 监听浏览器全屏变化（Esc 退出、F11 等）
  useEffect(() => {
    const onChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      previewRef.current?.requestFullscreen();
    }
  }, []);

  return (
    <div style={{
      minHeight: isFullscreen ? 'auto' : '100vh',
      background: '#0f0f1a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* ---- 顶部导航（全屏时隐藏） ---- */}
      {!isFullscreen && (
        <header style={{
          width: '100%',
          maxWidth: 1000,
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexShrink: 0,
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#ccd',
              padding: '6px 16px',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            ← 案例列表
          </button>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#e0e0e0', margin: 0 }}>{title}</h2>
        </header>
      )}

      {/* ---- 预览区域 ---- */}
      <div
        ref={previewRef}
        style={{
          position: 'relative',
          width: isFullscreen ? '100vw' : '100%',
          maxWidth: isFullscreen ? undefined : 1000,
          height: isFullscreen ? '100vh' : 520,
          background: '#1a1a2e',
          borderRadius: isFullscreen ? 0 : 12,
          overflow: 'hidden',
          border: isFullscreen ? 'none' : '1px solid rgba(255,255,255,0.1)',
          flexShrink: 0,
        }}
      >
        {children}

        {/* ---- 全屏切换按钮 ---- */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? '退出全屏 (Esc)' : '全屏预览'}
          style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            zIndex: 20,
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#ccd',
            width: 36,
            height: 36,
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(6px)',
          }}
        >
          {isFullscreen ? '✕' : '⛶'}
        </button>
      </div>

      {/* ---- 简介（全屏时隐藏） ---- */}
      {!isFullscreen && (
        <section style={{
          width: '100%',
          maxWidth: 1000,
          padding: '24px',
          color: '#8899bb',
          fontSize: 15,
          lineHeight: 1.8,
          flexShrink: 0,
        }}>
          <h3 style={{ color: '#ccd', fontSize: 17, marginBottom: 10 }}>简介</h3>
          <p style={{ margin: 0 }}>{description}</p>
        </section>
      )}
    </div>
  );
}
