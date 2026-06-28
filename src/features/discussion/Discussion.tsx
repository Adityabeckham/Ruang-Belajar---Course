import { Section, EmptyState } from '@/components/ui';

export interface DiscussionProps {
  /** Seam 2: selalu menerima lessonId; aman saat belum ada komentar. */
  lessonId: string;
  courseId?: string;
}

/**
 * STUB Fase 0 (milik Dev C / Stream Platform).
 * Path impor dibekukan: `@/features/discussion/Discussion`.
 * Diisi komentar threaded + sanitize + moderasi di Task C4.
 */
export default function Discussion({ lessonId }: DiscussionProps) {
  return (
    <Section title="Diskusi">
      <EmptyState
        icon="💬"
        title="Diskusi (stub)"
        description={`lessonId: ${lessonId} · diisi oleh Dev C (C4).`}
      />
    </Section>
  );
}
