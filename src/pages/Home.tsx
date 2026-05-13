import { useNavigate } from 'react-router-dom';

interface CaseItem {
  id: string;
  title: string;
  desc: string;
  tags: string[];
  path: string;
  gradient: string;
  icon: string;
}

const cases: CaseItem[] = [
  {
    id: 'water-ripple',
    title: '水波涟漪',
    desc: '点击方块产生 Morlet 小波涟漪扩散，GPU Vertex Shader 实时计算阻尼波动方程，支持多点交互。',
    tags: ['Vertex Shader', '波动方程', 'InstancedMesh', '多点交互'],
    path: '/water-ripple',
    gradient: 'linear-gradient(135deg, #1a1040 0%, #0d3b5c 50%, #0a2a3a 100%)',
    icon: '🌊',
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-bg animate-in">
      {/* ---- Hero ---- */}
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
          Three.js Shader 案例实验室
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 420, margin: '0 auto' }}>
          GPU 驱动的交互式视觉效果集合 · 每个案例独立可运行
        </p>
      </header>

      {/* ---- Case Grid ---- */}
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
            {/* 缩略图 */}
            <div className="case-card-thumb" style={{ background: c.gradient }}>
              <span style={{ opacity: 0.7 }}>{c.icon}</span>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at 50% 50%, rgba(108,92,231,0.12), transparent 70%)',
              }} />
            </div>
            {/* 信息区 */}
            <div className="case-card-body">
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {c.tags.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* 占位卡片：提示更多案例 */}
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
          <span>更多案例即将添加</span>
        </div>
      </main>

      {/* ---- Footer ---- */}
      <footer style={{
        textAlign: 'center',
        padding: '24px',
        fontSize: 12,
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border)',
      }}>
        Built with Three.js · React · Vite
      </footer>
    </div>
  );
}
