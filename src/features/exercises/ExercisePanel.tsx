import { Section, EmptyState } from '@/components/ui';

export interface ExercisePanelProps {
  /** Seam 2: panel selalu menerima lessonId; aman saat tak ada latihan. */
  lessonId: string;
  courseId?: string;
}

/**
 * STUB Fase 0 (milik Dev B / Stream Exercises).
 * Path impor dibekukan: `@/features/exercises/ExercisePanel`.
 * Diisi renderer per-tipe (kuis/link/teks/code) di Task B2.
 */
export default function ExercisePanel({ lessonId }: ExercisePanelProps) {
  return (
    <Section title="Latihan">
      <EmptyState
        icon="🧩"
        title="Panel latihan (stub)"
        description={`lessonId: ${lessonId} · diisi oleh Dev B (B2).`}
      />
    </Section>
  );
}
