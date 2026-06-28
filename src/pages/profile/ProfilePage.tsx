import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import {
  PageContainer,
  PageHeader,
  Section,
  Avatar,
  Flex,
  Space,
  Tag,
  Typography,
  Loading,
} from '@/components/ui';
import MyXPBar from '@/features/gamification/MyXPBar';
import BadgeShelf from '@/features/gamification/BadgeShelf';

const { Title, Text } = Typography;

/** Profil siswa (Task C5): identitas + statistik XP/level + badge. */
export default function ProfilePage() {
  const profile = useQuery(api.profiles.getCurrentProfile);

  if (profile === undefined) return <Loading tip="Memuat profil…" />;

  return (
    <PageContainer maxWidth={720}>
      <PageHeader title="Profil" />

      <Section>
        <Flex align="center" gap={16}>
          <Avatar size={64} src={profile?.avatarUrl ?? undefined}>
            {profile?.displayName?.charAt(0)?.toUpperCase() ?? 'U'}
          </Avatar>
          <Flex vertical gap={4}>
            <Title level={4} style={{ margin: 0 }}>
              {profile?.displayName ?? 'Pengguna'}
            </Title>
            <Space>
              <Tag color={profile?.role === 'admin' ? 'purple' : 'default'}>
                {profile?.role ?? 'student'}
              </Tag>
              <Text type="secondary">
                Level {profile?.level ?? 1} · {profile?.totalXp ?? 0} XP
              </Text>
            </Space>
          </Flex>
        </Flex>
      </Section>

      <Section title="Progres XP">
        <MyXPBar />
      </Section>

      <Section title="Badge">
        <BadgeShelf />
      </Section>
    </PageContainer>
  );
}
