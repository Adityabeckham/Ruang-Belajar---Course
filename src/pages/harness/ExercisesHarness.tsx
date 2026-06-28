import HarnessShell from './HarnessShell';
import ExercisePanel from '@/features/exercises/ExercisePanel';

/** /_harness/exercises — uji <ExercisePanel> mandiri (Dev B). */
export default function ExercisesHarness() {
  return (
    <HarnessShell title="exercises">
      <ExercisePanel lessonId="seed-lesson-1" />
    </HarnessShell>
  );
}
