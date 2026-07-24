import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useConvexAuth } from 'convex/react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

// Lucide Icons 
import {
  MessageCircle,
  Mail,
  Globe,
  LucideGroup,
  Users,
  BookOpen,
  GraduationCap,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Star,
  Menu,
  X,
  Target,
  Rocket,
  Handshake,
  Calendar,
  Code2,
  Palette,
  Terminal,
  Heart,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

import logoImg from '../assets/images/ruang-belajar-logo.png';
import oparImg from '../assets/images/opar.jpeg';
import adityaImg from '../assets/images/Aditya.jpeg';
import reishanImg from '../assets/images/Reishan.jpeg';
import utb from '../assets/images/utb.png';
import polsub from '../assets/images/polsub.png';
import mardira from '../assets/images/mardira.png';
import UHS from '../assets/images/UHS.webp';
import sttnf from '../assets/images/sttnf.png';

// ─────────────────────────────────────────────────────────────
// BRAND SOCIAL MEDIA SVG ICONS (100% Vector Crisp & Accurate)
// ─────────────────────────────────────────────────────────────

const InstagramIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const WhatsAppIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.15 4.195 4.354-1.144z" />
  </svg>
);

const YouTubeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const GitHubIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedInIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.6a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z" />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// DATA STRUCTURES (Scalable & Maintainable Architecture)
// ─────────────────────────────────────────────────────────────

const CAMPUS_PARTNERS = [
  { name: 'Universitas Teknologi Bandung', logo: utb, alt: 'UTB Bandung', shortName: 'UTB Bandung' },
  { name: 'Politeknik Negeri Subang', logo: polsub, alt: 'POLSUB', shortName: 'POLSUB Subang' },
  { name: 'STMIK Mardira Indonesia', logo: mardira, alt: 'STMIK Mardira', shortName: 'STMIK MARDIRA' },
  { name: 'Universitas Harapan Bangsa', logo: UHS, alt: 'UHS', shortName: 'UHS Bandung' },
  { name: 'STT Terpadu Nurul Fikri', logo: sttnf, alt: 'STT NF', shortName: 'STT NF Depok' },
];

const TENTANG_PILLARS = [
  {
    bg: 'bg-memphisCoral',
    badge: 'VISI UTAMA',
    title: 'Ekosistem Belajar Inklusif',
    desc: 'Menciptakan wadah pembelajaran IT & Kreatif gratis yang dapat diakses oleh siapapun di Indonesia tanpa hambatan finansial atau latar belakang.',
    icon: Target,
  },
  {
    bg: 'bg-memphisTeal',
    badge: 'MISI KOMUNITAS',
    title: 'Praktis & Siap Kerja',
    desc: 'Fokus pada studi kasus nyata, pengerjaan proyek portofolio, dan bimbingan langsung dari praktisi industri yang berpengalaman.',
    icon: Rocket,
  },
  {
    bg: 'bg-memphisViolet',
    badge: 'NILAI UTAMA',
    title: 'Kolaborasi & Suportif',
    desc: 'Mengutamakan budaya saling bantu, belajar bersama tanpa judging, dan lingkungan komunitas yang aman, positif, serta menyenangkan.',
    icon: Handshake,
  },
];

const TESTIMONIALS = [
  {
    id: 1,
    quote: 'Sebagai desainer grafis, awalnya saya nggak yakin bisa belajar coding. Tapi setelah gabung di Ruang Belajar, saya jadi ngerti banyak hal! Kursusnya jelas dan mudah dipahami. Sekarang saya bisa bikin website sederhana sendiri. Komunitasnya juga asyik banget buat nanya-nanya!',
    img: oparImg,
    name: 'Opar Yusuf',
    role: 'Graphic Designer',
    campus: 'Umum',
    rating: 5,
    tag: 'Design & Code',
  },
  {
    id: 2,
    quote: 'Awalnya aku bener-bener nggak ngerti apa-apa soal coding, tapi setelah ikut Ruang Belajar, semuanya jadi lebih jelas. Mulai dari HTML, CSS, sampai sekarang udah nyampe ke JavaScript! Materinya gampang dicerna, mentornya asik dan nggak pelit ilmu. Plus, ini gratis! Worth it buat yang pengen jadi web developer dari nol.',
    img: adityaImg,
    name: 'Aditya Beckham',
    role: 'Web Developer Intern at Mahreen Indonesia',
    campus: 'Universitas Teknologi Bandung',
    rating: 5,
    tag: 'Web Development',
  },
  {
    id: 3,
    quote: 'Ruang belajar ini seperti light mode di tengah kebingungan, tenang, fokus, dan nyaman untuk belajar IT. Pembahasannya runtut dan ruang diskusinya sangat suportif untuk mahasiswa yang ingin memperdalam skill praktis.',
    img: reishanImg,
    name: 'Muhammad Reishan Asvialdy',
    role: 'Mahasiswa Teknik Informatika',
    campus: 'Universitas Teknologi Bandung',
    rating: 5,
    tag: 'Teknik Informatika',
  },
];

const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    icon: InstagramIcon,
    url: 'https://instagram.com/ruangbelajar.space',
    color: 'hover:bg-pink-500 hover:text-white',
    handle: '@ruangbelajar.space',
  },
  {
    name: 'WhatsApp',
    icon: WhatsAppIcon,
    url: 'https://wa.me/6281234567890?text=Halo%20Admin%20Ruang%20Belajar%20Komunitas',
    color: 'hover:bg-emerald-500 hover:text-white',
    handle: '+62 812-3456-7890',
  },
  {
    name: 'YouTube',
    icon: YouTubeIcon,
    url: 'https://youtube.com/@ruangbelajar-space',
    color: 'hover:bg-red-600 hover:text-white',
    handle: 'Ruang Belajar Indonesia',
  },
  {
    name: 'GitHub',
    icon: GitHubIcon,
    url: 'https://github.com/Adityabeckham/Ruang-Belajar---Course',
    color: 'hover:bg-gray-800 hover:text-white',
    handle: 'Ruang-Belajar-Course',
  },
  {
    name: 'LinkedIn',
    icon: LinkedInIcon,
    url: 'https://linkedin.com/company/ruangbelajar-space',
    color: 'hover:bg-blue-600 hover:text-white',
    handle: 'Ruang Belajar Community',
  },
];

export default function LandingPage() {
  const { isAuthenticated: convexAuth } = useConvexAuth();
  const { isAuthenticated: firebaseAuth } = useFirebaseAuth();
  const isAuthenticated = convexAuth || firebaseAuth;

  const [filterCategory, setFilterCategory] = useState<'all' | 'tech' | 'desain'>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  // Testimonial Carousel State (Scalable & Horizontal Auto-sliding)
  const [currentTestiIndex, setCurrentTestiIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setCurrentTestiIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const joinGroup = (groupName: string) => {
    const msg = `Halo Admin Ruang Belajar, saya berminat untuk gabung study group: ${groupName}`;
    window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  const nextTesti = () => {
    setIsAutoPlay(false);
    setCurrentTestiIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTesti = () => {
    setIsAutoPlay(false);
    setCurrentTestiIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <div className="lp-root min-h-screen w-full relative overflow-x-hidden" style={{ background: '#f5efe2', color: '#17140d', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Memphis Confetti Background (fixed, pointer-events-none) ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <svg className="absolute top-12 left-8 w-12 h-12 anim-drift" viewBox="0 0 100 100">
          <polygon points="50,10 90,90 10,90" fill="#ff5b57" stroke="#17140d" strokeWidth="8" strokeLinejoin="round" />
        </svg>
        <svg className="absolute top-20 right-16 w-16 h-16 anim-bob" viewBox="0 0 100 100">
          <path d="M 10 90 A 80 80 0 0 1 90 10 L 90 90 Z" fill="#12b3a4" stroke="#17140d" strokeWidth="7" strokeLinejoin="round" />
        </svg>
        <svg className="absolute top-1/3 left-6 w-10 h-10 anim-spin" viewBox="0 0 100 100">
          <path d="M 35 10 H 65 V 35 H 90 V 65 H 65 V 90 H 35 V 65 H 10 V 35 H 35 Z" fill="#6b5be6" stroke="#17140d" strokeWidth="7" strokeLinejoin="round" />
        </svg>
        <svg className="absolute top-1/2 right-8 w-14 h-14 anim-drift" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="38" fill="none" stroke="#ffc531" strokeWidth="12" strokeDasharray="10 15" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="#17140d" strokeWidth="5" />
        </svg>
        <svg className="absolute top-28 left-1/2 -translate-x-1/2 w-24 h-12 anim-sway" viewBox="0 0 120 60">
          <path d="M 10 30 Q 30 5, 50 30 T 90 30 T 110 30" fill="none" stroke="#17140d" strokeWidth="8" strokeLinecap="round" />
        </svg>
        <svg className="absolute bottom-32 left-12 w-16 h-10 anim-bob" viewBox="0 0 120 60">
          <path d="M 10 50 L 35 10 L 60 50 L 85 10 L 110 50" fill="none" stroke="#3aa0ff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 10 50 L 35 10 L 60 50 L 85 10 L 110 50" fill="none" stroke="#17140d" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg className="absolute bottom-20 left-1/3 w-12 h-12 anim-drift" viewBox="0 0 100 100">
          <path d="M 10 50 A 40 40 0 0 1 90 50 Z" fill="#ffc531" stroke="#17140d" strokeWidth="7" />
        </svg>
        <svg className="absolute bottom-16 right-20 w-16 h-16 anim-spin" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="#ff5b57" stroke="#17140d" strokeWidth="6" />
          <line x1="20" y1="30" x2="80" y2="30" stroke="#17140d" strokeWidth="5" />
          <line x1="10" y1="50" x2="90" y2="50" stroke="#17140d" strokeWidth="5" />
          <line x1="20" y1="70" x2="80" y2="70" stroke="#17140d" strokeWidth="5" />
        </svg>
      </div>

      {/* ── STICKY NAVBAR ── */}
      <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur-sm border-b-2 border-ink/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16 sm:h-20">

            {/* Logo */}
            <a href="#" className="flex items-center gap-2.5 shrink-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border-2 border-white/50 overflow-hidden shadow-sm">
                <img src={logoImg} alt="Logo Ruang Belajar" className="object-cover w-full h-full" />
              </div>
              <span className="font-display font-extrabold text-lg sm:text-2xl tracking-tight text-ink">Ruang Belajar</span>
            </a>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <a href="#tentang" className="font-body font-bold text-ink hover:text-memphisCoral transition-colors text-sm lg:text-base">Tentang</a>
              <a href="#fitur" className="font-body font-bold text-ink hover:text-memphisCoral transition-colors text-sm lg:text-base">Aktivitas</a>
              <a href="#study-groups" className="font-body font-bold text-ink hover:text-memphisCoral transition-colors text-sm lg:text-base">Study Groups</a>
              <a href="#testimoni" className="font-body font-bold text-ink hover:text-memphisCoral transition-colors text-sm lg:text-base">Testimoni</a>
              <Link to="/courses" className="font-body font-bold text-memphisViolet hover:text-indigo-700 transition-colors text-sm lg:text-base flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-memphisViolet" />
                <span>Katalog Kursus</span>
                <span className="text-xs bg-memphisMustard text-ink px-1.5 py-0.5 rounded border border-ink">NEW</span>
              </Link>
            </div>

            {/* Desktop CTA + Mobile Hamburger */}
            <div className="flex items-center gap-2 sm:gap-3">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="bg-memphisTeal text-white font-body font-bold text-xs sm:text-sm px-4 py-2 sm:px-5 sm:py-2.5 rounded-full memphis-border memphis-shadow-sm hover:bg-teal-600 transition-all flex items-center gap-1.5"
                >
                  <span>Dashboard Saya</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hidden sm:inline-block bg-white text-ink font-body font-bold text-sm px-4 py-2 sm:px-5 sm:py-2.5 rounded-full memphis-border memphis-shadow-sm hover:bg-gray-50 transition-all"
                  >
                    Masuk
                  </Link>
                  <Link
                    to="/login"
                    className="hidden sm:inline-block bg-memphisTeal text-white font-body font-bold text-sm px-4 py-2 sm:px-5 sm:py-2.5 rounded-full memphis-border memphis-shadow-sm hover:bg-teal-600 transition-all"
                  >
                    Daftar Gratis
                  </Link>
                  <Link
                    to="/login"
                    className="sm:hidden bg-memphisTeal text-white font-body font-bold text-xs px-3.5 py-2 rounded-full memphis-border"
                  >
                    Daftar
                  </Link>
                </>
              )}

              {/* Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl memphis-border bg-white hover:bg-cream transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t-2 border-ink/10 bg-cream/98 backdrop-blur-sm px-4 pb-4 pt-2 space-y-1">
            <a href="#tentang" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl font-body font-bold text-ink hover:bg-memphisMustard/20 transition-colors">Tentang</a>
            <a href="#fitur" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl font-body font-bold text-ink hover:bg-memphisMustard/20 transition-colors">Aktivitas</a>
            <a href="#study-groups" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl font-body font-bold text-ink hover:bg-memphisMustard/20 transition-colors">Study Groups</a>
            <a href="#testimoni" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl font-body font-bold text-ink hover:bg-memphisMustard/20 transition-colors">Testimoni</a>
            <Link to="/courses" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl font-body font-bold text-memphisViolet hover:bg-memphisViolet/10 transition-colors flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Katalog Kursus</span>
            </Link>
            <div className="flex gap-3 pt-2">
              {isAuthenticated ? (
                <Link to="/dashboard" className="flex-1 text-center bg-memphisTeal text-white font-body font-bold text-sm py-2.5 rounded-full memphis-border">Dashboard Saya</Link>
              ) : (
                <>
                  <Link to="/login" className="flex-1 text-center bg-white text-ink font-body font-bold text-sm py-2.5 rounded-full memphis-border">Masuk</Link>
                  <Link to="/login" className="flex-1 text-center bg-memphisTeal text-white font-body font-bold text-sm py-2.5 rounded-full memphis-border">Daftar Gratis</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 md:pt-16 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

          {/* Left: Copy */}
          <div className="lg:col-span-7 space-y-6">
            {/* Eyebrow pill */}
            <div className="inline-flex items-center gap-2 bg-memphisViolet text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-4 py-1.5 rounded-full memphis-border memphis-shadow-sm">
              <LucideGroup className="w-4 h-4 text-memphisMustard animate-pulse" />
              <span>KOMUNITAS BELAJAR INDONESIA</span>
            </div>

            {/* H1 */}
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-[68px] xl:text-[72px] leading-[1.05] tracking-tight text-ink">
              Belajar Bareng,<br />
              <span className="marker-highlight marker-mustard text-ink">Tumbuh Bareng</span>
            </h1>

            {/* Sub-copy */}
            <p className="font-body text-base sm:text-lg lg:text-xl text-ink/80 max-w-xl leading-relaxed">
              Komunitas tempat kita saling berbagi ilmu, belajar bersama, dan tumbuh bersama. Gabung dengan ribuan teman belajar di seluruh Indonesia!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <Link
                to={isAuthenticated ? "/dashboard" : "/login"}
                className="bg-memphisCoral text-white font-body font-bold text-sm sm:text-base lg:text-lg px-5 sm:px-7 py-3 sm:py-3.5 rounded-full memphis-border memphis-shadow-lg hover:bg-red-500 transition-all flex items-center gap-2"
              >
                <span>{isAuthenticated ? "Buka Dashboard Belajar" : "Gabung Komunitas - Gratis"}</span>
                <ArrowRight className="w-5 h-5 shrink-0" />
              </Link>
              <a
                href="#study-groups"
                className="bg-white text-ink font-body font-bold text-sm sm:text-base lg:text-lg px-5 sm:px-7 py-3 sm:py-3.5 rounded-full memphis-border memphis-shadow-lg hover:bg-gray-50 transition-all"
              >
                Lihat Study Groups
              </a>
            </div>

            {/* Trust badges */}
            <div className="pt-5 flex items-center gap-4 border-t-2 border-ink/10">
              <div className="flex -space-x-2">
                {[
                  { bg: 'bg-memphisCoral', label: '100%' },
                  { bg: 'bg-memphisTeal', label: 'Seru' },
                  { bg: 'bg-memphisViolet', label: 'Gratis' },
                ].map((item, idx) => (
                  <div key={idx} className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${item.bg} text-white font-bold text-xs flex items-center justify-center border-2 border-ink memphis-shadow-sm`}>
                    {item.label}
                  </div>
                ))}
              </div>
              <div>
                <div className="font-display font-extrabold text-ink text-sm sm:text-base">Komunitas 100% Gratis</div>
                <div className="font-body text-xs sm:text-sm text-ink/70">Tidak ada biaya tersembunyi, lingkungan belajar positif, suportif, dan gratis.</div>
              </div>
            </div>
          </div>

          {/* Right: Interactive Memphis Card */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white rounded-3xl p-5 sm:p-7 memphis-border memphis-shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-memphisMustard text-ink text-xs font-bold px-3 py-1 rounded-full memphis-border uppercase tracking-wider flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  STUDY GROUP HIGHLIGHT
                </span>
                <span className="text-xs text-ink/60 font-bold">Terbaru 2026</span>
              </div>

              <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-ink mb-2">
                Frontend Web Dev
              </h3>
              <p className="font-body text-sm text-ink/75 mb-4">
                HTML5, CSS3, Tailwind v4 & React 19. Dari nol sampai bisa bikin portofolio sendiri!
              </p>

              {/* Progress card */}
              <div className="bg-cream rounded-xl p-3 sm:p-4 memphis-border mb-4 sm:mb-5">
                <div className="text-[10px] sm:text-xs font-bold mb-2 sm:mb-3 text-ink flex items-center justify-between">
                  <span>Aktivitas Belajar (Menit)</span>
                  <span className="text-memphisTeal font-extrabold">+85% Konsistensi</span>
                </div>
                <div className="flex items-end justify-between h-24 sm:h-28 gap-1.5 sm:gap-2 px-1 sm:px-2">
                  {[
                    { bg: 'bg-memphisMustard', h: '45%', label: 'Senin' },
                    { bg: 'bg-memphisCoral', h: '65%', label: 'Selasa' },
                    { bg: 'bg-memphisViolet', h: '50%', label: 'Rabu' },
                    { bg: 'bg-memphisTeal', h: '85%', label: 'Kamis' },
                    { bg: 'bg-memphisSky', h: '70%', label: 'Jumat' },
                    { bg: 'bg-memphisCoral', h: '95%', label: 'Sabtu' },
                  ].map((bar) => (
                    <div key={bar.label} className={`w-full ${bar.bg} rounded-t-lg memphis-border`} style={{ height: bar.h }} title={bar.label} />
                  ))}
                </div>
                <div className="flex justify-between text-[9px] sm:text-[10px] font-bold mt-1.5 sm:mt-2 text-ink/70 px-0.5 sm:px-1">
                  <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
                </div>
              </div>

              {/* Action buttons inside card */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDemoModalOpen(true)}
                  className="flex-1 bg-memphisViolet text-white font-body font-bold text-xs sm:text-sm py-2.5 sm:py-3 rounded-xl memphis-border memphis-shadow-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Tonton Demo Kelas</span>
                </button>
                <Link
                  to="/courses"
                  className="bg-white text-ink font-body font-bold text-xs sm:text-sm px-4 py-2.5 sm:py-3 rounded-xl memphis-border hover:bg-gray-100 transition-colors"
                >
                  Katalog
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── LOGO STRIP (KAMPUS & ASOSIASI MEMBER) - RESPONSIVE & ELEGANT ── */}
      <section className="bg-ink text-white py-6 sm:py-8 border-y-4 border-ink relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">

            {/* Label */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-3 h-3 rounded-full bg-memphisMustard animate-ping" />
              <div className="font-display font-extrabold text-memphisMustard text-xs sm:text-sm tracking-widest uppercase text-center md:text-left flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                <span>KAMPUS & ASOSIASI MEMBER:</span>
              </div>
            </div>

            {/* Responsive Logo Container Grid / Flex */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 sm:gap-4 md:gap-6 w-full">
              {CAMPUS_PARTNERS.map((partner) => (
                <div
                  key={partner.alt}
                  className="group bg-white/95 hover:bg-white px-3 sm:px-4 py-2 rounded-2xl border-2 border-white/20 hover:border-memphisMustard transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2.5 shadow-md"
                  title={partner.name}
                >
                  <img
                    src={partner.logo}
                    alt={partner.alt}
                    className="h-8 sm:h-10 w-auto max-w-[80px] sm:max-w-[100px] object-contain transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  <span className="font-display font-bold text-ink text-xs sm:text-sm hidden lg:inline-block">
                    {partner.shortName}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION TENTANG RUANG BELAJAR (INSPIRASI RUANGBELAJAR.SPACE) ── */}
      <section id="tentang" className="py-16 sm:py-24 relative z-10 bg-white border-b-4 border-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-block bg-memphisMustard text-ink text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full memphis-border memphis-shadow-sm mb-4">
              💡 TENTANG RUANG BELAJAR
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight text-ink">
              Wadah Belajar Inklusif & Gratis untuk{' '}
              <span className="marker-highlight marker-mustard text-ink">Generasi Digital</span>
            </h2>
            <p className="font-body text-base sm:text-lg text-ink/75 mt-4 leading-relaxed">
              Ruang Belajar adalah komunitas pembelajaran digital independen Indonesia yang didirikan untuk menjembatani generasi muda dengan kebutuhan teknologi modern melalui ekosistem belajar yang terstruktur, positif, dan 100% tanpa biaya.
            </p>
          </div>

          {/* 3 Pillar Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-14">
            {TENTANG_PILLARS.map((pillar) => {
              const IconComp = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="bg-cream rounded-3xl p-6 sm:p-8 memphis-border memphis-shadow-lg hover:-translate-y-1.5 transition-transform flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className={`w-12 h-12 rounded-2xl ${pillar.bg} text-white flex items-center justify-center memphis-border`}>
                        <IconComp className="w-6 h-6" />
                      </span>
                      <span className="font-display font-extrabold text-xs px-3 py-1 bg-white text-ink rounded-full memphis-border">
                        {pillar.badge}
                      </span>
                    </div>
                    <h3 className="font-display font-extrabold text-xl sm:text-2xl text-ink mb-3">
                      {pillar.title}
                    </h3>
                    <p className="font-body text-sm sm:text-base text-ink/80 leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Impact & Key Statistics Banner */}
          <div className="bg-ink text-white rounded-3xl p-6 sm:p-10 memphis-border memphis-shadow-static relative overflow-hidden">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center relative z-10">
              <div className="p-3">
                <div className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-memphisMustard mb-1">
                  1.500+
                </div>
                <div className="font-body font-bold text-xs sm:text-sm text-white/80">Member Komunitas</div>
              </div>
              <div className="p-3">
                <div className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-memphisCoral mb-1">
                  100%
                </div>
                <div className="font-body font-bold text-xs sm:text-sm text-white/80">Gratis Selamanya</div>
              </div>
              <div className="p-3">
                <div className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-memphisTeal mb-1">
                  15+
                </div>
                <div className="font-body font-bold text-xs sm:text-sm text-white/80">Study Groups & Proyek</div>
              </div>
              <div className="p-3">
                <div className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-memphisSky mb-1">
                  5+
                </div>
                <div className="font-body font-bold text-xs sm:text-sm text-white/80">Kampus Partner</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── AKTIVITAS KOMUNITAS SECTION ── */}
      <section id="fitur" className="py-16 sm:py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-block bg-memphisViolet text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full memphis-border memphis-shadow-sm mb-4">
              AKTIVITAS KOMUNITAS KAMI
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight text-ink">
              Kembangkan potensimu lewat{' '}
              <span className="marker-highlight marker-mustard text-ink">kegiatan seru</span>{' '}
              di komunitas.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                bg: 'bg-memphisCoral',
                accent: 'bg-memphisCoral/10',
                title: 'Study Groups',
                desc: 'Gabung grup belajar sesuai minat dan level kamu. Belajar bareng dengan kurikulum terstruktur jadi jauh lebih asyik dan efektif!',
                icon: Users,
              },
              {
                bg: 'bg-memphisTeal',
                accent: 'bg-memphisTeal/10',
                title: 'Mentorship & Sharing',
                desc: 'Dapatkan bimbingan langsung dari senior di bidang IT, serta bagikan pengetahuanmu kepada sesama member komunitas.',
                icon: Heart,
              },
              {
                bg: 'bg-memphisViolet',
                accent: 'bg-memphisViolet/10',
                title: 'Workshop & Meetup',
                desc: 'Ikuti workshop online reguler dan meetup offline di berbagai kota untuk memperluas jaringan koneksi profesionalmu.',
                icon: Calendar,
              },
            ].map((card) => {
              const IconComponent = card.icon;
              return (
                <div key={card.title} className="bg-white rounded-3xl p-6 sm:p-8 memphis-border memphis-shadow-lg relative overflow-hidden">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${card.bg} text-white flex items-center justify-center memphis-border memphis-shadow-sm mb-5 sm:mb-6`}>
                    <IconComponent className="w-7 h-7" />
                  </div>
                  <h3 className="font-display font-bold text-xl sm:text-2xl mb-3 text-ink">{card.title}</h3>
                  <p className="font-body text-ink/75 leading-relaxed text-sm sm:text-base">{card.desc}</p>
                  <div className={`absolute -bottom-8 -right-8 w-28 h-28 rounded-full ${card.accent} pointer-events-none`} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── STUDY GROUPS SECTION ── */}
      <section id="study-groups" className="py-14 sm:py-16 border-t-4 border-ink relative z-10" style={{ background: '#f5efe2' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header + Filters */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 sm:mb-12 gap-5 sm:gap-6">
            <div>
              <div className="inline-block bg-memphisMustard text-ink text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full memphis-border memphis-shadow-sm mb-3">
                STUDY GROUPS AKTIF
              </div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-ink">
                Temukan Study Group <span className="marker-highlight marker-mustard text-ink">Favoritmu</span>
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'tech', label: 'Teknologi & Coding' },
                { id: 'desain', label: 'Desain & Kreatif' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterCategory(f.id as typeof filterCategory)}
                  className={`font-body font-bold text-sm px-4 sm:px-5 py-2 rounded-full memphis-border transition-colors ${filterCategory === f.id ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-memphisMustard'
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                category: 'tech',
                headerBg: 'bg-memphisViolet',
                badgeBg: 'bg-memphisMustard text-ink',
                badgeText: 'WEB DEVELOPMENT',
                title: 'Frontend Web (HTML, CSS, JS, React)',
                desc: 'Belajar membuat website interaktif dari nol. Kita bahas dasar layouting hingga framework React untuk membangun aplikasi web modern.',
                tags: ['52 Member', 'Mingguan', 'Tingkat Dasar'],
                btnBg: 'bg-memphisMustard text-ink hover:bg-yellow-400',
                priceColor: 'text-memphisCoral',
                key: 'frontend-web',
                icon: Code2,
              },
              {
                category: 'desain',
                headerBg: 'bg-memphisTeal',
                badgeBg: 'bg-white text-ink',
                badgeText: 'DESIGN KREATIF',
                title: 'UI/UX Design & Prototyping Figma',
                desc: 'Kuasai riset pengguna, wireframing, pembuatan visual UI, hingga prototyping interaktif dengan Figma untuk aplikasi mobile & web.',
                tags: ['38 Member', 'Dua Mingguan'],
                btnBg: 'bg-memphisTeal text-white hover:bg-teal-600',
                priceColor: 'text-memphisTeal',
                key: 'uiux-design',
                icon: Palette,
              },
              {
                category: 'tech',
                headerBg: 'bg-memphisCoral',
                badgeBg: 'bg-memphisMustard text-ink',
                badgeText: 'BACKEND DEV',
                title: 'Backend Development (Node.js & Express)',
                desc: 'Belajar mendesain RESTful API, mengelola database SQL/NoSQL, dan menerapkan autentikasi serta sistem keamanan server modern.',
                tags: ['45 Member', 'Mingguan'],
                btnBg: 'bg-memphisCoral text-white hover:bg-red-600',
                priceColor: 'text-memphisCoral',
                key: 'backend-dev',
                icon: Terminal,
              },
            ]
              .filter((g) => filterCategory === 'all' || g.category === filterCategory)
              .map((group) => {
                const GroupIcon = group.icon;
                return (
                  <div key={group.key} className="bg-white rounded-3xl memphis-border memphis-shadow-lg overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className={`${group.headerBg} p-5 sm:p-6 border-b-[3px] border-ink relative`}>
                        <span className={`${group.badgeBg} font-bold text-xs px-3 py-1 rounded-full memphis-border absolute top-3 sm:top-4 right-3 sm:right-4`}>
                          {group.badgeText}
                        </span>
                        <div className="text-white font-display font-extrabold text-lg sm:text-2xl pt-6 sm:pt-4 flex items-center gap-2">
                          <GroupIcon className="w-6 h-6 text-white shrink-0" />
                          <span>{group.title}</span>
                        </div>
                      </div>
                      <div className="p-5 sm:p-6 space-y-3 sm:space-y-4">
                        <p className="text-sm text-ink/70">{group.desc}</p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs font-bold text-ink">
                          {group.tags.map((t) => (
                            <span key={t} className="bg-cream px-2.5 py-1 rounded-lg border border-ink">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 border-t border-ink/10 flex items-center justify-between pt-4">
                      <div>
                        <div className="text-xs text-ink/50 line-through">Rp 450.000</div>
                        <div className={`font-display font-extrabold text-xl sm:text-2xl ${group.priceColor}`}>GRATIS</div>
                      </div>
                      <button
                        onClick={() => joinGroup(group.key)}
                        className={`font-body font-bold text-sm px-4 py-2 rounded-xl memphis-border memphis-shadow-sm transition-colors ${group.btnBg} flex items-center gap-1.5`}
                      >
                        <span>Gabung Grup</span>
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONI (ANIMATED HORIZONTAL CAROUSEL SLIDER - SCALABLE & ZERO HEIGHT BLOAT) ── */}
      <section id="testimoni" className="py-16 sm:py-24 relative z-10 bg-white border-t-4 border-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <div className="inline-block bg-memphisTeal text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full memphis-border memphis-shadow-sm mb-3">
              💬 TESTIMONI MEMBER KOMUNITAS
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-ink">
              Apa kata mereka setelah join <span className="marker-highlight marker-mustard text-ink">Ruang Belajar?</span>
            </h2>
            <p className="font-body text-sm sm:text-base text-ink/70 mt-2">
              Kisah nyata pengalaman belajar & berkembang bersama teman-teman komunitas.
            </p>
          </div>

          {/* Carousel Card Container */}
          <div className="max-w-4xl mx-auto relative">

            {/* Active Testimonial Card */}
            <div
              className="bg-cream rounded-3xl p-6 sm:p-10 memphis-border memphis-shadow-lg transition-all duration-500 relative overflow-hidden"
              onMouseEnter={() => setIsAutoPlay(false)}
              onMouseLeave={() => setIsAutoPlay(true)}
            >
              {/* Rating stars & Tag */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(TESTIMONIALS[currentTestiIndex].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-memphisMustard text-memphisMustard" />
                  ))}
                </div>
                <span className="bg-white text-ink font-display font-bold text-xs px-3 py-1 rounded-full memphis-border">
                  {TESTIMONIALS[currentTestiIndex].tag}
                </span>
              </div>

              {/* Quote text */}
              <blockquote className="font-body text-ink text-base sm:text-xl md:text-2xl leading-relaxed italic mb-8 relative z-10">
                "{TESTIMONIALS[currentTestiIndex].quote.replace(/^"|"$/g, '')}"
              </blockquote>

              {/* Member Profile Footer */}
              <div className="flex items-center justify-between pt-6 border-t-2 border-ink/10 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={TESTIMONIALS[currentTestiIndex].img}
                    alt={TESTIMONIALS[currentTestiIndex].name}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover memphis-border memphis-shadow-sm"
                  />
                  <div>
                    <div className="font-display font-extrabold text-ink text-base sm:text-lg">
                      {TESTIMONIALS[currentTestiIndex].name}
                    </div>
                    <div className="text-xs sm:text-sm text-ink/75 font-medium">
                      {TESTIMONIALS[currentTestiIndex].role}
                    </div>
                    <div className="text-[11px] sm:text-xs text-memphisViolet font-bold flex items-center gap-1 mt-0.5">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{TESTIMONIALS[currentTestiIndex].campus}</span>
                    </div>
                  </div>
                </div>

                {/* Slider Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={prevTesti}
                    aria-label="Previous Testimonial"
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white hover:bg-memphisMustard text-ink font-bold flex items-center justify-center memphis-border memphis-shadow-sm transition-transform active:scale-95"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextTesti}
                    aria-label="Next Testimonial"
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white hover:bg-memphisMustard text-ink font-bold flex items-center justify-center memphis-border memphis-shadow-sm transition-transform active:scale-95"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Decorative Accent */}
              <div className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full bg-memphisCoral/10 pointer-events-none" />
            </div>

            {/* Pagination Indicators / Dots */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {TESTIMONIALS.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setIsAutoPlay(false);
                    setCurrentTestiIndex(idx);
                  }}
                  className={`h-3 rounded-full transition-all duration-300 memphis-border ${idx === currentTestiIndex ? 'w-8 bg-memphisCoral' : 'w-3 bg-white hover:bg-memphisMustard'
                    }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* ── FINAL CTA SECTION (JOIN COMMUNITY BANNER) ── */}
      <section className="py-16 sm:py-20 relative z-10 bg-memphisMustard border-t-4 border-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-12 md:p-16 memphis-border memphis-shadow-static text-center max-w-4xl mx-auto relative overflow-hidden">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-memphisCoral text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-4 py-1.5 rounded-full memphis-border memphis-shadow-sm mb-6">
              <Rocket className="w-4 h-4" />
              <span>SIAP UNTUK MULAI BELAJAR?</span>
            </div>

            {/* Title */}
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-ink leading-tight mb-4">
              Tunggu Apa Lagi? Gabung Komunitas Ruang Belajar <span className="marker-highlight marker-mustard text-ink">Sekarang!</span>
            </h2>

            {/* Description */}
            <p className="font-body text-base sm:text-lg text-ink/80 max-w-2xl mx-auto mb-8 leading-relaxed">
              Dapatkan akses gratis ke seluruh materi, gabung study group terstruktur, dan bangun jaringan koneksi dengan ribuan teman belajar di seluruh Indonesia.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              <Link
                to={isAuthenticated ? "/dashboard" : "/login"}
                className="bg-memphisTeal text-white font-body font-bold text-base sm:text-lg px-7 py-3.5 sm:px-8 sm:py-4 rounded-full memphis-border memphis-shadow-lg hover:bg-teal-600 transition-all flex items-center gap-2"
              >
                <span>{isAuthenticated ? "Masuk ke Dashboard Saya" : "Daftar Sekarang - 100% Gratis"}</span>
                <ArrowRight className="w-5 h-5 shrink-0" />
              </Link>
              <a
                href="https://wa.me/6281234567890?text=Halo%20Admin%20Ruang%20Belajar,%20saya%20ingin%20gabung%20komunitas"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-ink font-body font-bold text-base sm:text-lg px-7 py-3.5 sm:px-8 sm:py-4 rounded-full memphis-border memphis-shadow-lg hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <WhatsAppIcon className="w-5 h-5 text-emerald-600" />
                <span>Grup WhatsApp</span>
              </a>
            </div>

            {/* Trust points */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-bold text-ink/75 pt-6 border-t-2 border-ink/10">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-memphisTeal" />
                <span>100% Gratis Selamanya</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-memphisCoral" />
                <span>Lingkungan Suportif</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-memphisViolet" />
                <span>Studi Kasus & Proyek Nyata</span>
              </div>
            </div>

            {/* Decorative background shapes */}
            <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-memphisTeal/10 pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full bg-memphisCoral/10 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-ink text-white border-t-4 border-ink py-10 sm:py-14 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 mb-10">

            {/* Brand & Mission */}
            <div className="sm:col-span-2 lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <img src={logoImg} alt="Logo Footer" className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border-2 border-white/50 overflow-hidden" />
                <span className="font-display font-extrabold text-xl sm:text-2xl text-white">Ruang Belajar</span>
              </div>
              <p className="text-white/75 max-w-sm text-sm leading-relaxed">
                Komunitas pembelajaran online Indonesia yang menyediakan lingkungan suportif untuk mengembangkan kompetensi bersama.
              </p>
              {/* Media Sosial Badges */}
              <div className="pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-memphisMustard mb-3">
                  IKUTI MEDIA SOSIAL KAMI:
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {SOCIAL_LINKS.map((soc) => {
                    const SocIcon = soc.icon;
                    return (
                      <a
                        key={soc.name}
                        href={soc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-10 h-10 rounded-xl bg-white/10 text-white border border-white/20 flex items-center justify-center transition-all ${soc.color} memphis-shadow-sm transform hover:-translate-y-1`}
                        aria-label={soc.name}
                        title={`${soc.name}: ${soc.handle}`}
                      >
                        <SocIcon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Navigasi Quick Links */}
            <div className="lg:col-span-3 space-y-3 text-sm">
              <div className="font-display font-bold text-memphisMustard uppercase tracking-wider mb-4">Navigasi</div>
              <div><a href="#tentang" className="text-white/80 hover:text-memphisTeal transition-colors flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5 text-memphisMustard" />Tentang Kami</a></div>
              <div><a href="#fitur" className="text-white/80 hover:text-memphisTeal transition-colors flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5 text-memphisMustard" />Aktivitas Komunitas</a></div>
              <div><a href="#study-groups" className="text-white/80 hover:text-memphisTeal transition-colors flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5 text-memphisMustard" />Study Groups</a></div>
              <div><a href="#testimoni" className="text-white/80 hover:text-memphisTeal transition-colors flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5 text-memphisMustard" />Testimoni Member</a></div>
              <div><Link to="/courses" className="text-memphisSky hover:underline flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />Katalog Kursus</Link></div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 pt-6 text-xs text-white/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>© 2026 Komunitas Ruang Belajar. Hak Cipta Dilindungi.</div>
            <div className="flex gap-4">
              <a href="#" className="text-white/80 hover:text-memphisTeal transition-colors">Syarat & Ketentuan</a>
              <a href="#" className="text-white/80 hover:text-memphisTeal transition-colors">Kebijakan Privasi</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── DEMO MODAL ── */}
      {demoModalOpen && (
        <div className="fixed inset-0 bg-ink/80 z-50 flex items-center justify-center p-4" onClick={() => setDemoModalOpen(false)}>
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-2xl w-full memphis-border memphis-shadow-static relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setDemoModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-memphisCoral text-white font-bold flex items-center justify-center memphis-border"
              aria-label="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-ink mb-4">Preview Pembelajaran Ruang Belajar</h3>
            <div className="aspect-video bg-ink rounded-2xl flex flex-col items-center justify-center text-white p-6 memphis-border relative group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-memphisMustard text-ink flex items-center justify-center font-extrabold text-xl mb-4 cursor-pointer hover:scale-110 transition-transform shadow-lg">
                <Play className="w-7 h-7 fill-ink ml-1" />
              </div>
              <p className="font-body text-center font-medium text-sm sm:text-base">Klik untuk memutar video simulasi kelas interaktif</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
