import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: '4rem 2rem', maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>AI 严父 控制台</h1>
      <p style={{ fontSize: '1.125rem', marginBottom: '2rem', lineHeight: 1.6 }}>
        Track discipline metrics, oversee interception logs, and adjust personas across your user base.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link
          href="/dashboard"
          style={{
            padding: '0.875rem 1.5rem',
            borderRadius: '0.75rem',
            background: '#0f172a',
            color: '#ffffff',
            textDecoration: 'none'
          }}
        >
          进入仪表盘
        </Link>
        <Link
          href="/reports"
          style={{
            padding: '0.875rem 1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #0f172a',
            color: '#0f172a',
            textDecoration: 'none'
          }}
        >
          查看周报样例
        </Link>
      </div>
    </main>
  );
}
