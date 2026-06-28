import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import {
  PageContainer,
  PageHeader,
  Section,
  Loading,
  EmptyState,
  Tag,
  Button,
  Space,
  message,
} from '@/components/ui';
import Markdown from '@/components/Markdown';
import ExercisePanel from '@/features/exercises/ExercisePanel';
import Discussion from '@/features/discussion/Discussion';

/**
 * Lesson viewer (Task A4, Seam 2). Render `contentMd` via <Markdown> + pasang
 * slot ExercisePanel (Dev B) & Discussion (Dev C) dengan lessonId asli.
 * Tombol "Tandai selesai" + progress = Task A5.
 */
export default function LessonView() {
  const { courseSlug = '', lessonSlug = '' } = useParams();
  const navigate = useNavigate();
  const lesson = useQuery(api.lessons.getBySlug, { courseSlug, lessonSlug });
  const completed = useQuery(
    api.progress.isLessonComplete,
    lesson ? { lessonId: lesson._id } : 'skip',
  );
  const markComplete = useMutation(api.progress.markLessonComplete);

  const handleComplete = async () => {
    if (!lesson) return;
    try {
      const res = await markComplete({ lessonId: lesson._id });
      message.success(
        res.alreadyComplete
          ? 'Lesson sudah selesai'
          : `Selesai! +${res.xpAwarded} XP`,
      );
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Gagal menandai selesai');
    }
  };

  if (lesson === undefined) return <Loading tip="Memuat lesson…" />;
  if (lesson === null) {
    return (
      <PageContainer>
        <EmptyState
          icon="🔍"
          title="Lesson tidak ditemukan"
          description="Lesson tidak ada atau kamu belum berhak mengaksesnya."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={lesson.title}
        subtitle={lesson.course.title}
        onBack={() => navigate(`/courses/${courseSlug}`)}
        extra={
          <Space>
            <Tag color="green">+{lesson.xpReward} XP</Tag>
            {completed ? (
              <Button disabled>✓ Selesai</Button>
            ) : (
              <Button type="primary" onClick={handleComplete}>
                Tandai selesai
              </Button>
            )}
          </Space>
        }
      />

      {/* AREA KONTEN — render Markdown (A4) */}
      <Section title="Materi">
        {lesson.contentMd.trim() ? (
          <Markdown source={lesson.contentMd} />
        ) : (
          <EmptyState icon="📝" title="Materi masih kosong" />
        )}
      </Section>

      {/* SLOT 1 — Latihan (Dev B) */}
      <ExercisePanel lessonId={lesson._id} courseId={lesson.courseId} />

      {/* SLOT 2 — Diskusi (Dev C) */}
      <Discussion lessonId={lesson._id} courseId={lesson.courseId} />
    </PageContainer>
  );
}
