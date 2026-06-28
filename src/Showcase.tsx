import {
  PageContainer,
  PageHeader,
  Section,
  Toolbar,
  EmptyState,
  Loading,
  StatCard,
  ErrorState,
  XPBar,
  LevelBadge,
  AchievementBadge,
  Button,
  Input,
  Tag,
  Switch,
  Alert,
  Progress,
  Flex,
} from '@/components/ui';

/** Living catalog of the design-system kit. Doubles as a visual smoke test. */
export default function Showcase() {
  return (
    <PageContainer maxWidth={960}>
      <PageHeader
        title="Ruang Belajar UI Kit"
        subtitle="Komponen reusable dari design system (Ant Design + illustration theme)"
        extra={<Button type="primary">Aksi Utama</Button>}
      />

      <Section title="Stat Cards">
        <Flex gap={16} wrap>
          <StatCard label="Total XP" value="1.240" icon="⚡" />
          <StatCard label="Course Selesai" value="3" suffix="/ 8" icon="📚" />
          <StatCard label="Streak" value="5" suffix="hari" icon="🔥" />
        </Flex>
      </Section>

      <Section title="Gamifikasi">
        <Flex vertical gap={20}>
          <XPBar level={3} value={240} max={300} />
          <Flex align="center" gap={16} wrap>
            <LevelBadge level={7} />
            <AchievementBadge icon="🏅" title="HTML Master" description="Selesai modul HTML" />
            <AchievementBadge icon="🚀" title="First Submission" />
            <AchievementBadge icon="🔥" title="Streak 7 Hari" unlocked={false} />
          </Flex>
        </Flex>
      </Section>

      <Section title="Form & Aksi">
        <Flex vertical gap={16} style={{ maxWidth: 460 }}>
          <Input placeholder="Cari materi: HTML, CSS, JS..." />
          <Toolbar>
            <Button type="primary">Simpan</Button>
            <Button>Batal</Button>
            <Switch defaultChecked />
            <Tag>HTML</Tag>
            <Tag color="green">CSS</Tag>
          </Toolbar>
          <Alert title="Perubahan tersimpan otomatis" type="success" showIcon />
          <Progress percent={70} />
        </Flex>
      </Section>

      <Section title="Empty & Loading">
        <Flex gap={24} wrap>
          <div style={{ flex: 1, minWidth: 260 }}>
            <EmptyState
              title="Belum ada course"
              description="Course yang kamu enroll akan muncul di sini."
              action={<Button type="primary">Jelajah Course</Button>}
            />
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <Loading tip="Memuat materi..." minHeight={180} />
          </div>
        </Flex>
      </Section>

      <Section title="Error State">
        <ErrorState
          status="404"
          title="Halaman tidak ditemukan"
          description="Materi yang kamu cari mungkin sudah dipindah."
          action={<Button type="primary">Kembali ke Beranda</Button>}
        />
      </Section>
    </PageContainer>
  );
}
