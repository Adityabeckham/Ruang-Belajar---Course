import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';
import {
  PageContainer,
  PageHeader,
  Section,
  Button,
  Input,
  InputNumber,
  Space,
  Flex,
  Tag,
  Typography,
  EmptyState,
  Loading,
  message,
} from '@/components/ui';
import Markdown from '@/components/Markdown';

const { Text } = Typography;

type Pending = {
  _id: string;
  type: 'quiz' | 'code' | 'link' | 'text';
  link: string | null;
  text: string | null;
  submittedAt: number;
  exerciseTitle: string;
  exerciseXp: number;
  studentName: string;
};

function ReviewCard({ s }: { s: Pending }) {
  const review = useMutation(api.submissions.review);
  const [score, setScore] = useState<number | null>(100);
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (status: 'passed' | 'failed') => {
    setBusy(true);
    try {
      await review({
        submissionId: s._id as Id<'submissions'>,
        status,
        score: score ?? undefined,
        feedbackMd: feedback.trim() || undefined,
      });
      message.success(status === 'passed' ? `Di-pass (+${s.exerciseXp} XP)` : 'Ditandai gagal');
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Gagal');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section
      title={
        <Space>
          {s.exerciseTitle}
          <Tag color="geekblue">{s.type}</Tag>
          <Tag color="green">+{s.exerciseXp} XP</Tag>
        </Space>
      }
    >
      <Flex vertical gap={10}>
        <Text type="secondary">
          Dari <Text strong>{s.studentName}</Text> ·{' '}
          {new Date(s.submittedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
        </Text>

        {s.type === 'link' && s.link && (
          <a href={s.link} target="_blank" rel="noopener noreferrer">
            {s.link}
          </a>
        )}
        {s.type === 'text' && s.text && (
          <div style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, padding: 12 }}>
            <Markdown source={s.text} />
          </div>
        )}

        <Space wrap align="start">
          <span>
            Skor:{' '}
            <InputNumber min={0} max={100} value={score} onChange={(v) => setScore(v)} />
          </span>
        </Space>
        <Input.TextArea
          placeholder="Feedback (Markdown, opsional)…"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
        />
        <Space>
          <Button type="primary" loading={busy} onClick={() => submit('passed')}>
            Pass
          </Button>
          <Button danger loading={busy} onClick={() => submit('failed')}>
            Gagal
          </Button>
        </Space>
      </Flex>
    </Section>
  );
}

/** Review queue admin (Task B4): submission pending → passed/failed + feedback. */
export default function AdminSubmissionsPage() {
  const pending = useQuery(api.submissions.listPending) as Pending[] | undefined;

  if (pending === undefined) return <Loading tip="Memuat antrian review…" />;

  return (
    <PageContainer>
      <PageHeader title="Review Queue" subtitle={`${pending.length} submission menunggu`} />
      {pending.length === 0 ? (
        <EmptyState icon="✅" title="Tidak ada antrian" description="Semua submission sudah direview." />
      ) : (
        pending.map((s) => <ReviewCard key={s._id} s={s} />)
      )}
    </PageContainer>
  );
}
