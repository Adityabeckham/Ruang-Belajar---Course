import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import {
  PageContainer,
  PageHeader,
  Section,
  Card,
  Button,
  Progress,
  Flex,
  Space,
  Tag,
  Typography,
  EmptyState,
  Loading,
} from '@/components/ui';
import MyXPBar from '@/features/gamification/MyXPBar';
import BadgeShelf from '@/features/gamification/BadgeShelf';

const { Title, Text } = Typography;

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
    <Card style={{ flex: '1 1 280px', maxWidth: 360 }}>
      <Flex vertical gap={8}>
        <Space>
          <Tag color="blue">{course.level}</Tag>
        </Space>
        <Title level={5} style={{ margin: 0 }}>
          {course.title}
        </Title>
        <Progress percent={progress?.percent ?? 0} />
        <Text type="secondary" style={{ fontSize: 12 }}>
          {progress ? `${progress.completed}/${progress.total} lesson` : '…'}
        </Text>
        <Link to={`/courses/${course.slug}`}>
          <Button type="primary" size="small">
            Lanjut belajar
          </Button>
        </Link>
      </Flex>
    </Card>
  );
}

/** Dashboard siswa (Task C5): lanjut belajar + XP/level + badge. */
export default function DashboardPage() {
  const enrolled = useQuery(api.enrollments.listMine) as Course[] | undefined;

  return (
    <PageContainer>
      <PageHeader title="Dashboard" subtitle="Lanjutkan perjalanan belajarmu." />

      <Section title="XP & Level">
        <MyXPBar />
      </Section>

      <Section title="Lanjut belajar">
        {enrolled === undefined ? (
          <Loading minHeight={100} />
        ) : enrolled.length === 0 ? (
          <EmptyState
            icon="📚"
            title="Belum enroll course"
            description="Jelajahi katalog dan mulai belajar."
            action={
              <Link to="/courses">
                <Button type="primary">Lihat Katalog</Button>
              </Link>
            }
          />
        ) : (
          <Flex wrap gap={16}>
            {enrolled.map((c) => (
              <EnrolledCourseCard key={c._id} course={c} />
            ))}
          </Flex>
        )}
      </Section>

      <Section title="Badge">
        <BadgeShelf />
      </Section>
    </PageContainer>
  );
}
