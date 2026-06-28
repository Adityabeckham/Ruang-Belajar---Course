import { useParams } from 'react-router-dom';
import { PageContainer, PageHeader, Section, EmptyState } from '@/components/ui';
import ExercisePanel from '@/features/exercises/ExercisePanel';
import Discussion from '@/features/discussion/Discussion';

/**
 * Skeleton lesson viewer (Fase 0, Seam 2). Dev A mengisi AREA KONTEN
 * (render `contentMd` via <Markdown>) + tombol "Tandai selesai" di Task A4,
 * dan mengganti `lessonId` placeholder dengan id asli dari query getBySlug.
 *
 * Slot di bawah memakai PATH IMPOR TETAP — diisi oleh Dev B & Dev C, tanpa
 * mengubah file ini lagi.
 */
export default function LessonView() {
  const { courseSlug, lessonSlug } = useParams();
  // Placeholder: Dev A mengganti dengan lessonId asli (api.lessons.getBySlug).
  const lessonId = lessonSlug ?? '';

  return (
    <PageContainer>
      <PageHeader
        title={lessonSlug ?? 'Lesson'}
        subtitle={courseSlug ? `Course: ${courseSlug}` : undefined}
      />

      {/* AREA KONTEN — diisi Dev A (A4) */}
      <Section title="Materi">
        <EmptyState
          icon="📄"
          title="Area materi (skeleton)"
          description="Dev A render contentMd via <Markdown> di sini."
        />
      </Section>

      {/* SLOT 1 — Latihan (Dev B) */}
      <ExercisePanel lessonId={lessonId} />

      {/* SLOT 2 — Diskusi (Dev C) */}
      <Discussion lessonId={lessonId} />
    </PageContainer>
  );
}
