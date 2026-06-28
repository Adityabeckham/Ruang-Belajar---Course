import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useConvexAuth } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import {
  PageContainer,
  PageHeader,
  Section,
  Button,
  Tag,
  Space,
  Flex,
  Typography,
  Loading,
  EmptyState,
  message,
} from '@/components/ui';

const { Paragraph, Text } = Typography;

/** Detail course + outline + enroll (Task A3, route `/courses/:slug`). */
export default function CourseDetailPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useConvexAuth();

  const course = useQuery(api.courses.getBySlug, { slug });
  const enrolled = useQuery(
    api.enrollments.isEnrolled,
    course ? { courseId: course._id } : 'skip',
  );
  const enroll = useMutation(api.enrollments.enroll);

  if (course === undefined) return <Loading tip="Memuat course…" />;
  if (course === null) {
    return (
      <PageContainer>
        <EmptyState icon="🔍" title="Course tidak ditemukan" />
      </PageContainer>
    );
  }

  const firstLesson = course.modules.flatMap((m) => m.lessons)[0];
  const lessonPath = firstLesson
    ? `/learn/${course.slug}/${firstLesson.slug}`
    : null;

  const handleEnroll = async () => {
    try {
      await enroll({ courseId: course._id });
      message.success('Berhasil enroll!');
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Gagal enroll');
    }
  };

  const cta = !isAuthenticated ? (
    <Button type="primary" onClick={() => navigate('/login')}>
      Masuk untuk enroll
    </Button>
  ) : enrolled ? (
    lessonPath ? (
      <Link to={lessonPath}>
        <Button type="primary">Lanjut belajar</Button>
      </Link>
    ) : (
      <Button disabled>Belum ada lesson</Button>
    )
  ) : (
    <Button type="primary" onClick={handleEnroll}>
      Enroll
    </Button>
  );

  return (
    <PageContainer>
      <PageHeader
        title={course.title}
        subtitle={course.description}
        onBack={() => navigate('/courses')}
        extra={cta}
      />
      <Space style={{ marginBottom: 16 }} wrap>
        <Tag color="blue">{course.level}</Tag>
        {course.tags.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
        {!course.published && <Tag color="default">draft</Tag>}
      </Space>

      {course.modules.length === 0 ? (
        <EmptyState icon="📭" title="Outline belum tersedia" />
      ) : (
        course.modules.map((m, i) => (
          <Section key={m._id} title={`Modul ${i + 1}: ${m.title}`}>
            {m.lessons.length === 0 ? (
              <Text type="secondary">Belum ada lesson.</Text>
            ) : (
              <Flex vertical gap={8}>
                {m.lessons.map((l, j) => {
                  const row = (
                    <Flex justify="space-between" align="center">
                      <Text>
                        {j + 1}. {l.title}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        +{l.xpReward} XP
                      </Text>
                    </Flex>
                  );
                  // Lesson bisa dibuka hanya jika sudah enroll (gating ringan UX).
                  return enrolled ? (
                    <Link key={l._id} to={`/learn/${course.slug}/${l.slug}`}>
                      {row}
                    </Link>
                  ) : (
                    <div key={l._id} style={{ opacity: 0.7 }}>
                      {row}
                    </div>
                  );
                })}
              </Flex>
            )}
          </Section>
        ))
      )}

      {!enrolled && isAuthenticated && (
        <Paragraph type="secondary">Enroll dulu untuk membuka lesson.</Paragraph>
      )}
    </PageContainer>
  );
}
