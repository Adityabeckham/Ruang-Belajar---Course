import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useConvexAuth } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Progress, Loading, message } from '@/components/ui';

/** Detail course + outline + enroll (Memphis Styled). */
export default function CourseDetailPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useConvexAuth();

  const course = useQuery(api.courses.getBySlug, { slug });
  const enrolled = useQuery(
    api.enrollments.isEnrolled,
    course ? { courseId: course._id } : 'skip',
  );
  const progress = useQuery(
    api.progress.getCourseProgress,
    course ? { courseId: course._id } : 'skip',
  );
  const enroll = useMutation(api.enrollments.enroll);

  if (course === undefined) return <Loading tip="Memuat course…" minHeight={200} />;

  if (course === null) {
    return (
      <div className="lp-root min-h-screen w-full flex items-center justify-center p-4" style={{ background: '#f5efe2' }}>
        <div className="bg-white rounded-3xl memphis-border memphis-shadow-lg p-8 text-center max-w-md">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="font-display font-bold text-2xl text-ink mb-2">Course Tidak Ditemukan</h2>
          <p className="font-body text-sm text-ink/70 mb-6">Course yang kamu cari tidak tersedia atau belum dipublikasikan.</p>
          <Link to="/courses" className="bg-memphisTeal text-white font-body font-bold text-sm px-5 py-2.5 rounded-full memphis-border memphis-shadow-sm">
            Kembali ke Katalog
          </Link>
        </div>
      </div>
    );
  }

  const completedSet = new Set(progress?.completedLessonIds ?? []);
  const firstLesson = course.modules.flatMap((m) => m.lessons)[0];
  const lessonPath = firstLesson ? `/learn/${course.slug}/${firstLesson.slug}` : null;

  const handleEnroll = async () => {
    try {
      await enroll({ courseId: course._id });
      message.success('Berhasil terdaftar di course ini! Selamat belajar.');
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Gagal enroll');
    }
  };

  return (
    <div
      className="lp-root min-h-screen w-full relative pb-20"
      style={{ background: '#f5efe2', color: '#17140d', fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">

        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 font-body font-bold text-sm text-ink/70 hover:text-ink transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Katalog Course
          </Link>
        </div>

        {/* Hero Card / Banner */}
        <div className="bg-white rounded-3xl memphis-border memphis-shadow-lg p-6 sm:p-10 mb-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="bg-memphisViolet text-white px-3 py-1 rounded-full memphis-border uppercase">
                {course.level}
              </span>
              {course.tags.map((t) => (
                <span key={t} className="bg-cream text-ink px-3 py-1 rounded-full border border-ink">
                  #{t}
                </span>
              ))}
              {!course.published && (
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-300 font-bold">
                  Draft
                </span>
              )}
            </div>

            <div className="text-xs font-bold text-memphisTeal uppercase tracking-wider">
              100% GRATIS
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-ink leading-tight">
              {course.title}
            </h1>
            <p className="font-body text-base sm:text-lg text-ink/80 leading-relaxed max-w-3xl">
              {course.description}
            </p>
          </div>

          {/* Progress Bar (if enrolled) */}
          {enrolled && progress && progress.total > 0 && (
            <div className="bg-cream rounded-2xl p-4 memphis-border space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-ink">
                <span>Progres Belajar Kamu</span>
                <span>{progress.completed} dari {progress.total} lesson ({progress.percent}%)</span>
              </div>
              <Progress percent={progress.percent} showInfo={false} strokeColor="#12b3a4" />
            </div>
          )}

          {/* CTA Action Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            {!isAuthenticated ? (
              <button
                onClick={() => navigate('/login')}
                className="bg-memphisTeal text-white font-body font-bold text-base px-7 py-3.5 rounded-full memphis-border memphis-shadow-sm hover:bg-teal-600 transition-all inline-flex items-center gap-2"
              >
                <span>Masuk untuk Mulai Belajar</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            ) : enrolled ? (
              lessonPath ? (
                <Link
                  to={lessonPath}
                  className="bg-memphisTeal text-white font-body font-bold text-base px-7 py-3.5 rounded-full memphis-border memphis-shadow-sm hover:bg-teal-600 transition-all inline-flex items-center gap-2"
                >
                  <span>Lanjut Belajar</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              ) : (
                <button disabled className="bg-gray-200 text-ink/40 font-body font-bold text-base px-6 py-3 rounded-full memphis-border cursor-not-allowed">
                  Belum Ada Lesson
                </button>
              )
            ) : (
              <button
                onClick={handleEnroll}
                className="bg-memphisCoral text-white font-body font-bold text-base px-7 py-3.5 rounded-full memphis-border memphis-shadow-lg hover:bg-red-500 transition-all inline-flex items-center gap-2"
              >
                <span>Daftar Course Ini (Gratis)</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Outline Modul & Lesson */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-memphisMustard text-ink flex items-center justify-center memphis-border font-bold text-lg">
              📋
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-ink">
              Kurikulum & Silabus Modul
            </h2>
          </div>

          {course.modules.length === 0 ? (
            <div className="bg-white rounded-3xl memphis-border memphis-shadow-lg p-8 text-center">
              <p className="font-body text-ink/60">Belum ada modul yang ditambahkan ke course ini.</p>
            </div>
          ) : (
            course.modules.map((m, i) => (
              <div key={m._id} className="bg-white rounded-3xl memphis-border memphis-shadow-lg p-6 space-y-4">
                <div className="flex items-center justify-between border-b-2 border-ink/10 pb-3">
                  <h3 className="font-display font-bold text-lg sm:text-xl text-ink">
                    Modul {i + 1}: {m.title}
                  </h3>
                  <span className="text-xs font-bold bg-cream px-3 py-1 rounded-full border border-ink text-ink/70">
                    {m.lessons.length} Lesson
                  </span>
                </div>

                {m.lessons.length === 0 ? (
                  <p className="text-xs text-ink/50 italic">Belum ada materi di modul ini.</p>
                ) : (
                  <div className="space-y-2.5">
                    {m.lessons.map((l, j) => {
                      const done = completedSet.has(l._id);
                      return (
                        <div
                          key={l._id}
                          className="flex items-center justify-between p-3 sm:p-3.5 bg-cream/70 rounded-2xl memphis-border transition-colors hover:bg-cream"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${
                                done ? 'bg-memphisTeal text-white' : 'bg-white border-2 border-ink text-ink'
                              }`}
                            >
                              {done ? '✓' : j + 1}
                            </div>
                            <span className="font-body text-xs sm:text-sm font-bold text-ink">
                              {l.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[10px] sm:text-xs font-bold bg-memphisMustard text-ink px-2.5 py-0.5 rounded-full border border-ink">
                              +{l.xpReward} XP
                            </span>
                            {enrolled ? (
                              <Link
                                to={`/learn/${course.slug}/${l.slug}`}
                                className="font-body font-bold text-xs bg-ink text-white px-3 py-1.5 rounded-xl hover:bg-ink/80 transition-colors"
                              >
                                Buka
                              </Link>
                            ) : (
                              <span className="text-xs text-ink/40 font-bold">Terkunci</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
