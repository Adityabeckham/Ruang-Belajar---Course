import { Link } from 'react-router-dom';
import { PageContainer, Button, Typography, Flex, Space } from '@/components/ui';

const { Title, Paragraph } = Typography;

/** Landing publik + CTA login (PRD §9 route `/`). */
export default function LandingPage() {
  return (
    <PageContainer>
      <Flex vertical align="center" gap={24} style={{ padding: '64px 16px', textAlign: 'center' }}>
        <Title style={{ margin: 0 }}>Ruang Belajar</Title>
        <Paragraph type="secondary" style={{ maxWidth: 520, fontSize: 16 }}>
          Belajar programming secara terstruktur: baca materi, kerjakan latihan,
          diskusi, dan lihat progresmu naik lewat XP, level, dan badge.
        </Paragraph>
        <Space>
          <Link to="/login">
            <Button type="primary" size="large">
              Masuk
            </Button>
          </Link>
          <Link to="/courses">
            <Button size="large">Lihat Katalog</Button>
          </Link>
        </Space>
      </Flex>
    </PageContainer>
  );
}
