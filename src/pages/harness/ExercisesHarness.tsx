import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import HarnessShell from './HarnessShell';
import ExercisePanel from '@/features/exercises/ExercisePanel';
import { Loading, Typography } from '@/components/ui';

const { Title } = Typography;

function LessonPanel({ slug }: { slug: string }) {
  const lesson = useQuery(api.lessons.getBySlug, {
    courseSlug: 'dasar-html',
    lessonSlug: slug,
  });
  if (lesson === undefined) return <Loading minHeight={80} />;
  if (lesson === null) return null;
  return (
    <>
      <Title level={5} style={{ marginTop: 24 }}>
        Lesson: {lesson.title}
      </Title>
      <ExercisePanel lessonId={lesson._id} courseId={lesson.courseId} />
    </>
  );
}

/** /_harness/exercises — uji <ExercisePanel> per tipe lawan seed (Dev B). */
export default function ExercisesHarness() {
  return (
    <HarnessShell title="exercises">
      {/* apa-itu-html: quiz · tag-dasar: link+text · struktur-dokumen: code */}
      <LessonPanel slug="apa-itu-html" />
      <LessonPanel slug="tag-dasar" />
      <LessonPanel slug="struktur-dokumen" />
    </HarnessShell>
  );
}
