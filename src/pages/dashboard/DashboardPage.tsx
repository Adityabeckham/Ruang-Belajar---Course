import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { Progress, Loading, EmptyState } from '@/components/ui';
import MyXPBar from '@/features/gamification/MyXPBar';
import BadgeShelf from '@/features/gamification/BadgeShelf';

type Course = {
  _id: string;
  title: string;
  slug: string;
  level: string;
};

function EnrolledCourseCard({ course }: { course: Course }) {
  const progress = useQuery(api.progress.getCourseProgress, {
    courseId: course._id as Id<'courses'>,
  });

  return (
    <div className="bg-white rounded-3xl memphis-border memphis-shadow-lg p-5 sm:p-6 flex flex-col justify-between h-full">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="bg-memphisViolet text-white font-bold text-xs px-3 py-1 rounded-full memphis-border uppercase">
            {course.level}
          </span>
          <span className="bg-memphisMustard text-ink font-bold text-xs px-2.5 py-0.5 rounded-full border border-ink">
            {progress?.percent ?? 0}%
          </span>
        </div>

        <h3 className="font-display font-extrabold text-lg sm:text-xl text-ink leading-snug">
          {course.title}
        </h3>

        <div className="space-y-1 pt-1">
          <Progress percent={progress?.percent ?? 0} showInfo={false} strokeColor="#12b3a4" />
          <div className="flex justify-between text-xs text-ink/60 font-medium">
            <span>Progress Belajar</span>
            <span>{progress ? `${progress.completed}/${progress.total} lesson` : '…'}</span>
          </div>
        </div>
      </div>

      <div className="pt-5 mt-4 border-t border-ink/10">
        <Link
          to={`/courses/${course.slug}`}
          className="w-full inline-flex items-center justify-center gap-2 bg-memphisTeal text-white font-body font-bold text-sm px-4 py-2.5 rounded-xl memphis-border memphis-shadow-sm hover:bg-teal-600 transition-all text-center"
        >
          <span>Lanjut Belajar</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

/** Dashboard siswa: lanjut belajar + XP/level + badge (Memphis styled). */
export default function DashboardPage() {
  const enrolled = useQuery(api.enrollments.listMine) as Course[] | undefined;

  return (
    <div
      className="lp-root min-h-screen w-full relative pb-20"
      style={{ background: '#f5efe2', color: '#17140d', fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">

        {/* Page Header */}
        <div className="mb-8 sm:mb-10">
          <div className="inline-block bg-memphisMustard text-ink text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full memphis-border memphis-shadow-sm mb-3">
            DASHBOARD BELAJAR
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-ink leading-tight">
            Selamat Datang <span className="marker-highlight marker-mustard text-ink">Kembali!</span>
          </h1>
          <p className="font-body text-ink/70 text-sm sm:text-base mt-2">
            Lanjutkan perjalanan belajarmu, kumpulkan XP, dan raih badge pencapaian.
          </p>
        </div>

        <div className="space-y-10">

          {/* Section 1: XP & Level */}
          <section className="bg-white rounded-3xl memphis-border memphis-shadow-lg p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 rounded-2xl bg-memphisMustard text-ink flex items-center justify-center memphis-border font-bold text-lg">
                ⚡
              </div>
              <div>
                <h2 className="font-display font-bold text-xl sm:text-2xl text-ink">Progres Level & XP</h2>
                <p className="text-xs sm:text-sm text-ink/60">Tingkatkan XP dengan menyelesaikan lesson dan latihan.</p>
              </div>
            </div>
            <MyXPBar />
          </section>

          {/* Section 2: Enrolled Courses */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-memphisCoral text-white flex items-center justify-center memphis-border font-bold text-lg">
                  📚
                </div>
                <h2 className="font-display font-bold text-xl sm:text-2xl text-ink">Lanjut Belajar</h2>
              </div>
              <Link
                to="/courses"
                className="font-body font-bold text-xs sm:text-sm bg-white text-ink px-4 py-2 rounded-full memphis-border memphis-shadow-sm hover:bg-memphisMustard transition-colors"
              >
                Lihat Semua Katalog →
              </Link>
            </div>

            {enrolled === undefined ? (
              <Loading minHeight={160} />
            ) : enrolled.length === 0 ? (
              <div className="bg-white rounded-3xl memphis-border memphis-shadow-lg p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4">
                <div className="text-5xl">📖</div>
                <h3 className="font-display font-bold text-xl text-ink">Belum Mengikuti Course</h3>
                <p className="text-sm text-ink/70">
                  Kamu belum mendaftar di course manapun. Jelajahi katalog course gratis kami dan mulai belajar sekarang!
                </p>
                <div className="pt-2">
                  <Link
                    to="/courses"
                    className="inline-block bg-memphisCoral text-white font-body font-bold text-sm px-6 py-3 rounded-full memphis-border memphis-shadow-sm hover:bg-red-600 transition-all"
                  >
                    Eksplor Katalog Course
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolled.map((c) => (
                  <EnrolledCourseCard key={c._id} course={c} />
                ))}
              </div>
            )}
          </section>

          {/* Section 3: Badges */}
          <section className="bg-white rounded-3xl memphis-border memphis-shadow-lg p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-memphisViolet text-white flex items-center justify-center memphis-border font-bold text-lg">
                🏆
              </div>
              <div>
                <h2 className="font-display font-bold text-xl sm:text-2xl text-ink">Koleksi Badge</h2>
                <p className="text-xs sm:text-sm text-ink/60">Badge yang berhasil kamu kumpulkan sepanjang belajar.</p>
              </div>
            </div>
            <BadgeShelf />
          </section>

        </div>
      </div>
    </div>
  );
}
