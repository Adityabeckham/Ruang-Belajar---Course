import HarnessShell from './HarnessShell';
import { Section, Typography } from '@/components/ui';
import MyXPBar from '@/features/gamification/MyXPBar';
import BadgeShelf from '@/features/gamification/BadgeShelf';

const { Text } = Typography;

/** /_harness/gamification — XPBar + BadgeShelf data nyata (Task C3). */
export default function GamificationHarness() {
  return (
    <HarnessShell title="gamification">
      <Section title="XP & Level">
        <Text type="secondary">Tampil saat login (data getMyGamification).</Text>
        <div style={{ marginTop: 8 }}>
          <MyXPBar />
        </div>
      </Section>
      <Section title="Badges">
        <BadgeShelf />
      </Section>
    </HarnessShell>
  );
}
