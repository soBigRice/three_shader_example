import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n/context';

interface CaseLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function CaseLayout({ title, description, children }: CaseLayoutProps) {
  const { t } = useT();
  const navigate = useNavigate();
  const [isFullscreen, setFullscreen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
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
    <div className="animate-in" style={{
      minHeight: isFullscreen ? 'auto' : '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* ---- 顶部导航（全屏时隐藏） / Top nav (hidden in fullscreen) ---- */}
      {!isFullscreen && (
        <nav style={{
          width: '100%',
          maxWidth: 1000,
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexShrink: 0,
        }}>
          <button
            className="btn btn-ghost"
            onClick={() => navigate('/')}
            style={{ padding: '5px 14px', fontSize: 13 }}
          >
            {t('layout.back')}
          </button>
          <span style={{
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--text-secondary)',
          }}>
            {title}
          </span>
        </nav>
      )}

      {/* ---- 预览区 / Preview area ---- */}
      <div
        ref={previewRef}
        className={isFullscreen ? 'preview-box fullscreen' : 'preview-box normal'}
      >
        {children}

        <button
          className="fs-btn"
          onClick={toggleFullscreen}
          title={isFullscreen ? t('layout.exitFullscreen') : t('layout.fullscreen')}
        >
          {isFullscreen ? '✕' : '⛶'}
        </button>
      </div>

      {/* ---- 简介（全屏时隐藏） / Overview (hidden in fullscreen) ---- */}
      {!isFullscreen && (
        <section style={{
          width: '100%',
          maxWidth: 1000,
          padding: '22px 24px',
          flexShrink: 0,
        }}>
          <h3 style={{
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 8,
          }}>
            {t('layout.intro')}
          </h3>
          <p style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            maxWidth: 640,
          }}>
            {description}
          </p>
        </section>
      )}
    </div>
  );
}
