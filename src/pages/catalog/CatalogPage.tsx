import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Loading } from '@/components/ui';

const LEVEL_STYLE: Record<string, { bg: string; text: string }> = {
  beginner: { bg: 'bg-memphisTeal', text: 'Beginner' },
  intermediate: { bg: 'bg-memphisMustard text-ink', text: 'Intermediate' },
  advanced: { bg: 'bg-memphisCoral', text: 'Advanced' },
};

/** Katalog course publik (Task A3, route `/courses` — Memphis Styled). */
export default function CatalogPage() {
  const courses = useQuery(api.courses.listPublished);
  const [level, setLevel] = useState<string>('all');
  const [tag, setTag] = useState<string>('all');

  const allTags = useMemo(() => {
    const set = new Set<string>();
    courses?.forEach((c) => c.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [courses]);

  const filtered = useMemo(() => {
    return (courses ?? []).filter(
      (c) =>
        (level === 'all' || c.level === level) &&
        (tag === 'all' || c.tags.includes(tag)),
    );
  }, [courses, level, tag]);

  return (
    <div
      className="lp-root min-h-screen w-full relative pb-20"
      style={{ background: '#f5efe2', color: '#17140d', fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">

        {/* Page Header */}
        <div className="mb-8 sm:mb-10">
          <div className="inline-block bg-memphisViolet text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full memphis-border memphis-shadow-sm mb-3">
            KATALOG COURSE
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-ink leading-tight">
            Eksplor <span className="marker-highlight marker-mustard text-ink">Materi Belajar</span>
          </h1>
          <p className="font-body text-ink/70 text-sm sm:text-base mt-2">
            Pilih course sesuai minat dan tingkat keahlianmu, lalu mulai belajar sekarang!
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-3xl memphis-border memphis-shadow-sm p-4 sm:p-6 mb-8 sm:mb-10 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            {/* Level Filters */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-ink/60 uppercase tracking-wider block">Level Kursus</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'Semua Level' },
                  { id: 'beginner', label: 'Beginner' },
                  { id: 'intermediate', label: 'Intermediate' },
                  { id: 'advanced', label: 'Advanced' },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => setLevel(lvl.id)}
                    className={`font-body font-bold text-xs sm:text-sm px-3.5 py-1.5 rounded-full memphis-border transition-colors ${
                      level === lvl.id ? 'bg-ink text-white' : 'bg-cream text-ink hover:bg-memphisMustard'
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag Filters */}
            {allTags.length > 0 && (
              <div className="space-y-1.5 w-full sm:w-auto">
                <span className="text-xs font-bold text-ink/60 uppercase tracking-wider block">Kategori Tag</span>
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="font-body font-bold text-xs sm:text-sm px-4 py-2 rounded-full memphis-border bg-cream text-ink cursor-pointer outline-none w-full sm:w-auto"
                >
                  <option value="all">Semua Tag ({allTags.length})</option>
                  {allTags.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            )}

          </div>
        </div>

        {/* Course Grid */}
        {courses === undefined ? (
          <Loading minHeight={200} tip="Memuat daftar course…" />
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl memphis-border memphis-shadow-lg p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="text-5xl">🔍</div>
            <h3 className="font-display font-bold text-xl text-ink">Tidak Ada Course Ditemukan</h3>
            <p className="text-sm text-ink/70">
              Coba sesuaikan filter level atau tag untuk menemukan course yang sesuai.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setLevel('all');
                  setTag('all');
                }}
                className="bg-memphisTeal text-white font-body font-bold text-sm px-5 py-2.5 rounded-full memphis-border memphis-shadow-sm hover:bg-teal-600 transition-all"
              >
                Reset Filter
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filtered.map((c) => {
              const lvlInfo = LEVEL_STYLE[c.level] ?? { bg: 'bg-memphisViolet text-white', text: c.level };
              return (
                <div
                  key={c._id}
                  className="bg-white rounded-3xl memphis-border memphis-shadow-lg overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Header Banner */}
                    <div className={`${lvlInfo.bg} p-5 sm:p-6 border-b-[3px] border-ink relative`}>
                      <span className="bg-white text-ink font-bold text-[10px] sm:text-xs px-2.5 py-1 rounded-full memphis-border uppercase absolute top-3 sm:top-4 right-3 sm:right-4">
                        {lvlInfo.text}
                      </span>
                      <h3 className="text-white font-display font-extrabold text-xl sm:text-2xl pt-4 leading-snug">
                        {c.title}
                      </h3>
                    </div>

                    {/* Content Body */}
                    <div className="p-5 sm:p-6 space-y-3 sm:space-y-4">
                      <p className="text-sm text-ink/70 line-clamp-3 leading-relaxed">
                        {c.description}
                      </p>

                      {/* Tags */}
                      {c.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 text-xs font-bold text-ink pt-1">
                          {c.tags.map((t) => (
                            <span key={t} className="bg-cream px-2.5 py-1 rounded-lg border border-ink">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-4 border-t border-ink/10 flex items-center justify-between">
                    <span className="font-display font-extrabold text-sm sm:text-base text-memphisTeal">
                      100% GRATIS
                    </span>
                    <Link
                      to={`/courses/${c.slug}`}
                      className="bg-memphisMustard text-ink font-body font-bold text-xs sm:text-sm px-4 py-2 rounded-xl memphis-border memphis-shadow-sm hover:bg-yellow-400 transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>Lihat Detail</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
