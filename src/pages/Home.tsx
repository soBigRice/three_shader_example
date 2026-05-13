import { useNavigate } from 'react-router-dom';

interface CaseItem {
  id: string;
  title: string;
  desc: string;
  tags: string[];
  path: string;
}

const cases: CaseItem[] = [
  {
    id: 'water-ripple',
    title: '水波涟漪',
    desc: '点击方块产生 Morlet 小波涟漪，GPU Shader 驱动，支持多点交互与实时参数调节',
    tags: ['Vertex Shader', '波动方程', 'InstancedMesh', '交互'],
    path: '/water-ripple',
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
      color: '#e0e0e0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Header */}
      <header style={{
        textAlign: 'center',
        padding: '60px 20px 40px',
      }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0, letterSpacing: -1 }}>
          Three.js Shader 案例库
        </h1>
        <p style={{ color: '#8899bb', marginTop: 8, fontSize: 16 }}>
          GPU 驱动的交互式视觉效果集合
        </p>
      </header>

      {/* Case Grid */}
      <main style={{
        maxWidth: 960,
        margin: '0 auto',
        padding: '0 24px 60px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 20,
      }}>
        {cases.map((c) => (
          <div
            key={c.id}
            onClick={() => navigate(c.path)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: 24,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* 预览占位 */}
            <div style={{
              background: 'linear-gradient(135deg, #1a1a3e 0%, #2a2a5e 100%)',
              borderRadius: 8,
              height: 140,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
            }}>
              🌊
            </div>

            <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 600 }}>
              {c.title}
            </h3>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: '#8899bb', lineHeight: 1.5 }}>
              {c.desc}
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {c.tags.map((tag) => (
                <span key={tag} style={{
                  background: 'rgba(255,255,255,0.08)',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  color: '#aabbcc',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
