import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { AchievementBadge, Space, EmptyState, Loading } from '@/components/ui';

/** Rak badge user login (Task C3) — semua badge, yang belum earned tampil terkunci. */
export default function BadgeShelf() {
  const badges = useQuery(api.gamification.getMyBadges);

  if (badges === undefined) return <Loading minHeight={80} />;
  if (badges.length === 0) {
    return <EmptyState icon="🏅" title="Belum ada badge" description="Badge akan muncul di sini." />;
  }

  return (
    <Space wrap size="middle">
      {badges.map((b) => (
        <AchievementBadge
          key={b.key}
          icon={b.icon}
          title={b.title}
          description={b.description}
          unlocked={b.earned}
        />
      ))}
    </Space>
  );
}
