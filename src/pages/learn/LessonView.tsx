import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Loading, message } from '@/components/ui';
import Markdown from '@/components/Markdown';
import ExercisePanel from '@/features/exercises/ExercisePanel';
import Discussion from '@/features/discussion/Discussion';

/** Lesson viewer (Task A4, Seam 2 - Memphis Styled). */
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
          ? 'Lesson sudah selesai!'
          : `Selamat! Kamu mendapatkan +${res.xpAwarded} XP 🎉`,
      );
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Gagal menandai selesai');
    }
  };

  if (lesson === undefined) return <Loading tip="Memuat lesson…" minHeight={200} />;

  if (lesson === null) {
    return (
      <div className="lp-root min-h-screen w-full flex items-center justify-center p-4" style={{ background: '#f5efe2' }}>
        <div className="bg-white rounded-3xl memphis-border memphis-shadow-lg p-8 text-center max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="font-display font-bold text-2xl text-ink mb-2">Lesson Tidak Ditemukan</h2>
          <p className="font-body text-sm text-ink/70 mb-6">Lesson ini tidak ada atau kamu belum terdaftar di course ini.</p>
          <Link to="/courses" className="bg-memphisTeal text-white font-body font-bold text-sm px-5 py-2.5 rounded-full memphis-border memphis-shadow-sm">
            Kembali ke Katalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="lp-root min-h-screen w-full relative pb-20"
      style={{ background: '#f5efe2', color: '#17140d', fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">

        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <button
            onClick={() => navigate(`/courses/${courseSlug}`)}
            className="inline-flex items-center gap-2 font-body font-bold text-sm text-ink/70 hover:text-ink transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Course {lesson.course.title}
          </button>

          <span className="bg-memphisMustard text-ink font-bold text-xs px-3 py-1 rounded-full border border-ink">
            +{lesson.xpReward} XP Reward
          </span>
        </div>

        {/* Lesson Header Banner */}
        <div className="bg-white rounded-3xl memphis-border memphis-shadow-lg p-6 sm:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-memphisTeal uppercase tracking-wider">
              {lesson.course.title}
            </span>
            <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-ink leading-tight">
              {lesson.title}
            </h1>
          </div>

          <div className="shrink-0">
            {completed ? (
              <span className="bg-emerald-100 text-emerald-800 font-body font-bold text-sm px-5 py-2.5 rounded-full border-2 border-emerald-500 inline-flex items-center gap-2">
                <span>✓ Sudah Selesai</span>
              </span>
            ) : (
              <button
                onClick={handleComplete}
                className="bg-memphisCoral text-white font-body font-bold text-sm sm:text-base px-6 py-3 rounded-full memphis-border memphis-shadow-sm hover:bg-red-500 transition-all inline-flex items-center gap-2"
              >
                <span>Tandai Selesai & Klaim XP</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-10">

          {/* Area Content (Markdown) */}
          <section className="bg-white rounded-3xl memphis-border memphis-shadow-lg p-6 sm:p-10 space-y-6">
            <div className="flex items-center gap-3 border-b-2 border-ink/10 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-memphisViolet text-white flex items-center justify-center memphis-border font-bold text-lg">
                📖
              </div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-ink">Materi Pembelajaran</h2>
            </div>

            <div className="prose max-w-none font-body text-ink leading-relaxed">
              {lesson.contentMd.trim() ? (
                <Markdown source={lesson.contentMd} />
              ) : (
                <div className="p-8 text-center text-ink/50 italic bg-cream/50 rounded-2xl border border-ink/10">
                  Materi untuk lesson ini masih belum diisi.
                </div>
              )}
            </div>
          </section>

          {/* Slot 1: Latihan Interaktif */}
          <section className="bg-white rounded-3xl memphis-border memphis-shadow-lg p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-memphisTeal text-white flex items-center justify-center memphis-border font-bold text-lg">
                💻
              </div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-ink">Latihan & Evaluasi</h2>
            </div>
            <ExercisePanel lessonId={lesson._id} courseId={lesson.courseId} />
          </section>

          {/* Slot 2: Diskusi */}
          <section className="bg-white rounded-3xl memphis-border memphis-shadow-lg p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-memphisMustard text-ink flex items-center justify-center memphis-border font-bold text-lg">
                💬
              </div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-ink">Diskusi & Tanya Jawab</h2>
            </div>
            <Discussion lessonId={lesson._id} courseId={lesson.courseId} />
          </section>

        </div>

      </div>
    </div>
  );
}
