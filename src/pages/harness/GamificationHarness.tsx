import HarnessShell from './HarnessShell';
import { Section, Space, XPBar, AchievementBadge } from '@/components/ui';

/** /_harness/gamification — uji komponen XP/level/badge mandiri (Dev C). */
export default function GamificationHarness() {
  return (
    <HarnessShell title="gamification">
      <Section title="XP & Level">
        <XPBar value={120} max={300} level={2} />
      </Section>
      <Section title="Badges">
        <Space wrap>
          <AchievementBadge icon="🥇" title="Lesson Pertama" unlocked />
          <AchievementBadge icon="🔥" title="5 Lesson Sehari" unlocked={false} />
          <AchievementBadge icon="🏆" title="Modul HTML" unlocked={false} />
        </Space>
      </Section>
    </HarnessShell>
  );
}
