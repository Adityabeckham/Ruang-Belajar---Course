import HarnessShell from './HarnessShell';
import Discussion from '@/features/discussion/Discussion';

/** /_harness/discussion — uji <Discussion> mandiri (Dev C). */
export default function DiscussionHarness() {
  return (
    <HarnessShell title="discussion">
      <Discussion lessonId="seed-lesson-1" />
    </HarnessShell>
  );
}
