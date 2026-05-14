import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n/context';

interface CaseItem {
  id: string;
  titleKey: string;
  descKey: string;
  tagKeys: string[];
  path: string;
  gradient: string;
  icon: string;
}

const cases: CaseItem[] = [
  {
    id: 'water-ripple',
    titleKey: 'case.waterRipple.title',
    descKey: 'case.waterRipple.desc',
    tagKeys: [
      'case.waterRipple.tag.0',
      'case.waterRipple.tag.1',
      'case.waterRipple.tag.2',
      'case.waterRipple.tag.3',
    ],
    path: '/water-ripple',
    gradient: 'linear-gradient(135deg, #1a1040 0%, #0d3b5c 50%, #0a2a3a 100%)',
    icon: '🌊',
  },
  {
    id: 'sphere-dissolve',
    titleKey: 'case.sphereDissolve.title',
    descKey: 'case.sphereDissolve.desc',
    tagKeys: [
      'case.sphereDissolve.tag.0',
      'case.sphereDissolve.tag.1',
      'case.sphereDissolve.tag.2',
      'case.sphereDissolve.tag.3',
    ],
    path: '/sphere-dissolve',
    gradient: 'linear-gradient(135deg, #0d0d2b 0%, #1a0a2e 40%, #003333 100%)',
    icon: '🔮',
  },
  {
    id: 'letter-dissolve',
    titleKey: 'case.letterDissolve.title',
    descKey: 'case.letterDissolve.desc',
    tagKeys: [
      'case.letterDissolve.tag.0',
      'case.letterDissolve.tag.1',
      'case.letterDissolve.tag.2',
      'case.letterDissolve.tag.3',
    ],
    path: '/letter-dissolve',
    gradient: 'linear-gradient(135deg, #2f1f10 0%, #50351a 42%, #23180d 100%)',
    icon: '✉️',
  },
];

export default function Home() {
  const { lang, setLang, t } = useT();
  const navigate = useNavigate();

  const toggleLang = () => setLang(lang === 'zh' ? 'en' : 'zh');

  return (
    <div className="home-bg animate-in">
      {/* ---- 语言切换 / Language switcher ---- */}
      <div style={{
        position: 'absolute',
        top: 16,
        right: 24,
        zIndex: 10,
      }}>
        <button
          className="btn btn-ghost"
          onClick={toggleLang}
          style={{ padding: '5px 14px', fontSize: 13, gap: 4 }}
        >
          <span style={{ opacity: 0.5 }}>{lang === 'zh' ? '中' : 'EN'}</span>
          <span style={{ opacity: 0.3 }}>→</span>
          <span>{lang === 'zh' ? 'EN' : '中'}</span>
        </button>
      </div>

      {/* ---- Hero / 标题区 ---- */}
      <header style={{
        textAlign: 'center',
        padding: '80px 24px 48px',
      }}>
        <div style={{
          display: 'inline-block',
          width: 48,
          height: 48,
          borderRadius: 12,
          background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
          marginBottom: 20,
          opacity: 0.8,
        }} />
        <h1 style={{
          fontSize: 40,
          fontWeight: 700,
          letterSpacing: '-0.03em',
          marginBottom: 10,
          background: 'linear-gradient(135deg, #f0f0f5 0%, #9090cc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {t('home.title')}
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 420, margin: '0 auto' }}>
          {t('home.subtitle')}
        </p>
      </header>

      {/* ---- Case Grid / 案例网格 ---- */}
      <main style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '0 24px 64px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 20,
      }}>
        {cases.map((c) => (
          <div key={c.id} className="case-card" onClick={() => navigate(c.path)}>
            {/* 缩略图 / Thumbnail */}
            <div className="case-card-thumb" style={{ background: c.gradient }}>
              <span style={{ opacity: 0.7 }}>{c.icon}</span>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at 50% 50%, rgba(108,92,231,0.12), transparent 70%)',
              }} />
            </div>
            {/* 信息区 / Info area */}
            <div className="case-card-body">
              <h3>{t(c.titleKey)}</h3>
              <p>{t(c.descKey)}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {c.tagKeys.map((tagKey) => (
                  <span key={tagKey} className="tag">{t(tagKey)}</span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* 占位卡片：提示更多案例 / Placeholder card: more cases coming */}
        <div style={{
          background: 'var(--bg-glass)',
          border: '1px dashed var(--border)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 280,
          gap: 8,
          color: 'var(--text-muted)',
          fontSize: 14,
        }}>
          <span style={{ fontSize: 32, opacity: 0.3 }}>+</span>
          <span>{t('home.moreComing')}</span>
        </div>
      </main>

      {/* ---- Footer / 页脚 ---- */}
      <footer style={{
        textAlign: 'center',
        padding: '24px',
        fontSize: 12,
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border)',
      }}>
        {t('home.footer')}
      </footer>
    </div>
  );
}
