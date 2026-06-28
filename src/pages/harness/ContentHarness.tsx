import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import HarnessShell from './HarnessShell';
import {
  Section,
  Toolbar,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Typography,
  Flex,
  Alert,
  message,
} from '@/components/ui';

const { Text } = Typography;

type Level = 'beginner' | 'intermediate' | 'advanced';

// Bungkus pemanggilan mutation supaya error tampil sebagai pesan, bukan crash.
function run(p: Promise<unknown>, ok: string) {
  p.then(() => message.success(ok)).catch((e) =>
    message.error(e instanceof Error ? e.message : 'Gagal'),
  );
}

function LessonRow({ lesson }: { lesson: { _id: string; title: string; slug: string } }) {
  const remove = useMutation(api.lessons.remove);
  return (
    <Flex justify="space-between" align="center" style={{ paddingLeft: 16 }}>
      <Text>
        📄 {lesson.title} <Text type="secondary">/{lesson.slug}</Text>
      </Text>
      <Button size="small" danger onClick={() => run(remove({ id: lesson._id as never }), 'Lesson dihapus')}>
        Hapus
      </Button>
    </Flex>
  );
}

function ModuleRow({ module }: { module: { _id: string; title: string } }) {
  const lessons = useQuery(api.lessons.listByModule, { moduleId: module._id as never });
  const createLesson = useMutation(api.lessons.create);
  const removeModule = useMutation(api.modules.remove);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');

  return (
    <div style={{ borderLeft: '2px solid rgba(0,0,0,0.08)', paddingLeft: 12, marginBottom: 12 }}>
      <Flex justify="space-between" align="center">
        <Text strong>📦 {module.title}</Text>
        <Button size="small" danger onClick={() => run(removeModule({ id: module._id as never }), 'Module dihapus')}>
          Hapus module
        </Button>
      </Flex>
      {lessons?.map((l) => <LessonRow key={l._id} lesson={l} />)}
      <Toolbar gap={8}>
        <Input size="small" placeholder="judul lesson" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: 160 }} />
        <Input size="small" placeholder="slug" value={slug} onChange={(e) => setSlug(e.target.value)} style={{ width: 120 }} />
        <Button
          size="small"
          onClick={() => {
            if (!title || !slug) return message.warning('Isi judul & slug');
            run(createLesson({ moduleId: module._id as never, title, slug }), 'Lesson dibuat');
            setTitle('');
            setSlug('');
          }}
        >
          + Lesson
        </Button>
      </Toolbar>
    </div>
  );
}

function CourseRow({ course }: { course: { _id: string; title: string; slug: string; published: boolean } }) {
  const modules = useQuery(api.modules.listByCourse, { courseId: course._id as never });
  const createModule = useMutation(api.modules.create);
  const setPublished = useMutation(api.courses.setPublished);
  const removeCourse = useMutation(api.courses.remove);
  const [title, setTitle] = useState('');

  return (
    <Section
      title={
        <Space>
          {course.title}
          <Text type="secondary" style={{ fontWeight: 400 }}>/{course.slug}</Text>
          <Tag color={course.published ? 'green' : 'default'}>{course.published ? 'published' : 'draft'}</Tag>
        </Space>
      }
      extra={
        <Space>
          <Button size="small" onClick={() => run(setPublished({ id: course._id as never, published: !course.published }), 'Status diubah')}>
            {course.published ? 'Unpublish' : 'Publish'}
          </Button>
          <Button size="small" danger onClick={() => run(removeCourse({ id: course._id as never }), 'Course dihapus')}>
            Hapus
          </Button>
        </Space>
      }
    >
      {modules?.map((m) => <ModuleRow key={m._id} module={m} />)}
      <Toolbar gap={8}>
        <Input size="small" placeholder="judul module" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: 200 }} />
        <Button
          size="small"
          onClick={() => {
            if (!title) return message.warning('Isi judul module');
            run(createModule({ courseId: course._id as never, title }), 'Module dibuat');
            setTitle('');
          }}
        >
          + Module
        </Button>
      </Toolbar>
    </Section>
  );
}

/** /_harness/content — uji CRUD Course→Module→Lesson (Task A1). Butuh role admin. */
export default function ContentHarness() {
  const isAdmin = useQuery(api.profiles.isCurrentUserAdmin);
  const courses = useQuery(api.courses.listAll, isAdmin ? {} : 'skip');
  const createCourse = useMutation(api.courses.create);

  const [form, setForm] = useState({ title: '', slug: '', description: '', level: 'beginner' as Level });

  return (
    <HarnessShell title="content">
      {isAdmin === false && (
        <Alert
          type="warning"
          showIcon
          title="Butuh role admin"
          description="Login lalu jalankan: npx convex run seed:promoteToAdmin '{&quot;email&quot;:&quot;<email-kamu>&quot;}'"
          style={{ marginBottom: 16 }}
        />
      )}

      <Section title="Buat Course">
        <Flex vertical gap={8}>
          <Space wrap>
            <Input placeholder="judul" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ width: 200 }} />
            <Input placeholder="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} style={{ width: 160 }} />
            <Select
              value={form.level}
              onChange={(level: Level) => setForm({ ...form, level })}
              options={[
                { value: 'beginner', label: 'beginner' },
                { value: 'intermediate', label: 'intermediate' },
                { value: 'advanced', label: 'advanced' },
              ]}
              style={{ width: 150 }}
            />
          </Space>
          <Input.TextArea placeholder="deskripsi" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          <Button
            type="primary"
            style={{ alignSelf: 'flex-start' }}
            onClick={() => {
              if (!form.title || !form.slug) return message.warning('Isi judul & slug');
              run(createCourse(form), 'Course dibuat');
              setForm({ title: '', slug: '', description: '', level: 'beginner' });
            }}
          >
            Buat Course
          </Button>
        </Flex>
      </Section>

      {courses?.map((c) => <CourseRow key={c._id} course={c} />)}
    </HarnessShell>
  );
}
