import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import HarnessShell from './HarnessShell';
import Discussion from '@/features/discussion/Discussion';
import { Loading } from '@/components/ui';

/** /_harness/discussion — uji <Discussion> lawan seed (Dev C). */
export default function DiscussionHarness() {
  const lesson = useQuery(api.lessons.getBySlug, {
    courseSlug: 'dasar-html',
    lessonSlug: 'apa-itu-html',
  });
  return (
    <HarnessShell title="discussion">
      {lesson === undefined ? (
        <Loading minHeight={80} />
      ) : lesson === null ? null : (
        <Discussion lessonId={lesson._id} courseId={lesson.courseId} />
      )}
    </HarnessShell>
  );
}
