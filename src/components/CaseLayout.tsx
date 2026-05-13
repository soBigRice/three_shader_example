import { useNavigate } from 'react-router-dom';

interface CaseLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function CaseLayout({ title, children }: CaseLayoutProps) {
  const navigate = useNavigate();

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* 顶部导航栏 */}
      <div style={{
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            padding: '6px 14px',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 14,
            backdropFilter: 'blur(8px)',
          }}
        >
          ← 案例列表
        </button>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{title}</span>
      </div>
      {children}
    </div>
  );
}
