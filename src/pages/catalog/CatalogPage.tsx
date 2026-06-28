import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import {
  PageContainer,
  PageHeader,
  Card,
  Tag,
  Select,
  Space,
  Flex,
  Typography,
  Loading,
  EmptyState,
} from '@/components/ui';

const { Title, Paragraph, Text } = Typography;

const LEVEL_COLOR: Record<string, string> = {
  beginner: 'green',
  intermediate: 'blue',
  advanced: 'volcano',
};

/** Katalog course publik (Task A3, route `/courses`). */
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
    <PageContainer>
      <PageHeader
        title="Katalog Course"
        subtitle="Pilih course dan mulai belajar."
        extra={
          <Space wrap>
            <Select
              value={level}
              onChange={setLevel}
              style={{ width: 150 }}
              options={[
                { value: 'all', label: 'Semua level' },
                { value: 'beginner', label: 'Beginner' },
                { value: 'intermediate', label: 'Intermediate' },
                { value: 'advanced', label: 'Advanced' },
              ]}
            />
            <Select
              value={tag}
              onChange={setTag}
              style={{ width: 150 }}
              options={[
                { value: 'all', label: 'Semua tag' },
                ...allTags.map((t) => ({ value: t, label: t })),
              ]}
            />
          </Space>
        }
      />

      {courses === undefined ? (
        <Loading tip="Memuat course…" />
      ) : filtered.length === 0 ? (
        <EmptyState icon="📚" title="Belum ada course" description="Course yang dipublikasikan akan tampil di sini." />
      ) : (
        <Flex wrap gap={16}>
          {filtered.map((c) => (
            <Link key={c._id} to={`/courses/${c.slug}`} style={{ flex: '1 1 280px', maxWidth: 360 }}>
              <Card hoverable style={{ height: '100%' }}>
                <Flex vertical gap={8}>
                  <Space>
                    <Tag color={LEVEL_COLOR[c.level]}>{c.level}</Tag>
                    {c.tags.map((t) => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                  </Space>
                  <Title level={4} style={{ margin: 0 }}>
                    {c.title}
                  </Title>
                  <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ margin: 0 }}>
                    {c.description}
                  </Paragraph>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Lihat detail →
                  </Text>
                </Flex>
              </Card>
            </Link>
          ))}
        </Flex>
      )}
    </PageContainer>
  );
}
