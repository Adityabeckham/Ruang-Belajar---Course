import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer, PageHeader, Tag, Space } from '@/components/ui';

const harnesses = [
  { to: '/_harness/content', label: 'content' },
  { to: '/_harness/exercises', label: 'exercises' },
  { to: '/_harness/discussion', label: 'discussion' },
  { to: '/_harness/gamification', label: 'gamification' },
  { to: '/_harness/markdown', label: 'markdown' },
  { to: '/_harness/ui-kit', label: 'ui-kit' },
];

/** Pembungkus halaman harness: judul + navigasi antar-harness. */
export default function HarnessShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <PageContainer>
      <PageHeader
        title={`Harness · ${title}`}
        subtitle="Halaman uji mandiri per-stream (lawan seed). Tidak ter-guard."
      />
      <Space wrap style={{ marginBottom: 24 }}>
        {harnesses.map((h) => (
          <Link key={h.to} to={h.to}>
            <Tag color={h.label === title ? 'blue' : 'default'} style={{ cursor: 'pointer' }}>
              {h.label}
            </Tag>
          </Link>
        ))}
      </Space>
      {children}
    </PageContainer>
  );
}
