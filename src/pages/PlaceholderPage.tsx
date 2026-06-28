import { PageContainer, PageHeader, EmptyState } from '@/components/ui';

export interface PlaceholderPageProps {
  title: string;
  subtitle?: string;
  /** Stream pemilik halaman ini (Fase 0 = stub, diisi nanti). */
  owner?: 'Dev A' | 'Dev B' | 'Dev C';
  icon?: string;
}

/**
 * Placeholder halaman untuk Fase 0. Tiap stream mengganti isinya nanti.
 * Route & navigasi sudah hidup; konten menyusul per task A/B/C.
 */
export default function PlaceholderPage({
  title,
  subtitle,
  owner,
  icon = '🚧',
}: PlaceholderPageProps) {
  return (
    <PageContainer>
      <PageHeader title={title} subtitle={subtitle} />
      <EmptyState
        icon={icon}
        title="Belum diimplementasi"
        description={
          owner
            ? `Placeholder Fase 0 — diisi oleh ${owner}.`
            : 'Placeholder Fase 0.'
        }
      />
    </PageContainer>
  );
}
