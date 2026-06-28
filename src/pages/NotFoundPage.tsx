import { Link } from 'react-router-dom';
import { PageContainer, EmptyState, Button } from '@/components/ui';

export default function NotFoundPage() {
  return (
    <PageContainer>
      <EmptyState
        icon="🔍"
        title="Halaman tidak ditemukan"
        description="URL yang kamu tuju tidak ada."
        action={
          <Link to="/">
            <Button type="primary">Ke Beranda</Button>
          </Link>
        }
      />
    </PageContainer>
  );
}
