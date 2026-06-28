import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth } from 'convex/react';
import {
  PageContainer,
  Section,
  Button,
  Flex,
  Typography,
  Loading,
  message,
} from '@/components/ui';

const { Title, Text } = Typography;

type LocationState = { from?: { pathname?: string } } | null;

/** Halaman login: Google / GitHub OAuth (PRD §9 route `/login`). */
export default function LoginPage() {
  const { signIn } = useAuthActions();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const location = useLocation();
  const [busy, setBusy] = useState<'google' | 'github' | null>(null);

  if (isLoading) return <Loading tip="Memeriksa sesi…" />;

  // Sudah login → balik ke halaman asal atau dashboard.
  if (isAuthenticated) {
    const from = (location.state as LocationState)?.from?.pathname ?? '/dashboard';
    return <Navigate to={from} replace />;
  }

  const handle = async (provider: 'google' | 'github') => {
    setBusy(provider);
    try {
      await signIn(provider);
    } catch {
      message.error('Gagal masuk. Coba lagi.');
      setBusy(null);
    }
  };

  return (
    <PageContainer maxWidth={420}>
      <Flex vertical align="center" gap={8} style={{ marginTop: 48, marginBottom: 24, textAlign: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          Masuk ke Ruang Belajar
        </Title>
        <Text type="secondary">Pakai akun Google atau GitHub kamu.</Text>
      </Flex>
      <Section>
        <Flex vertical gap={12}>
          <Button
            size="large"
            block
            loading={busy === 'google'}
            disabled={busy !== null}
            onClick={() => handle('google')}
          >
            Lanjut dengan Google
          </Button>
          <Button
            size="large"
            block
            loading={busy === 'github'}
            disabled={busy !== null}
            onClick={() => handle('github')}
          >
            Lanjut dengan GitHub
          </Button>
        </Flex>
      </Section>
    </PageContainer>
  );
}
