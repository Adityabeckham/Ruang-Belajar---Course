import { useState } from 'react';
import { useQuery, useMutation, useConvexAuth } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import {
  Section,
  Loading,
  EmptyState,
  Button,
  Input,
  Radio,
  Space,
  Flex,
  Tag,
  Alert,
  Typography,
  message,
} from '@/components/ui';
import Markdown from '@/components/Markdown';
import CodeEditor from './CodeEditor';

const { Text } = Typography;

export interface ExercisePanelProps {
  lessonId: string;
  courseId?: string;
}

type Question = { id: string; questionMd: string; options: string[] };
type Exercise = {
  _id: string;
  title: string;
  type: 'quiz' | 'code' | 'link' | 'text';
  promptMd: string;
  xpReward: number;
  quiz?: { questions: Question[]; passScore: number };
  starter?: { html: string; css: string; js: string };
};

const STATUS_COLOR: Record<string, string> = {
  passed: 'green',
  failed: 'red',
  pending: 'gold',
  reviewed: 'blue',
};

function QuizBody({
  ex,
  disabled,
}: {
  ex: Exercise;
  disabled: boolean;
}) {
  const quiz = ex.quiz!;
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const submit = useMutation(api.submissions.submitQuiz);

  const onSubmit = async () => {
    const ordered = quiz.questions.map((q) => answers[q.id] ?? -1);
    if (ordered.some((a) => a < 0)) return message.warning('Jawab semua soal dulu');
    setBusy(true);
    try {
      const res = await submit({ exerciseId: ex._id as Id<'exercises'>, answers: ordered });
      setResult({ score: res.score, passed: res.passed });
      message.success(res.passed ? `Lulus! Skor ${res.score}%` : `Skor ${res.score}% — coba lagi`);
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Gagal mengirim');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Flex vertical gap={16}>
      <Text type="secondary">Nilai lulus: {quiz.passScore}%</Text>
      {quiz.questions.map((q, i) => (
        <div key={q.id}>
          <Flex gap={6}>
            <Text strong>{i + 1}.</Text>
            <Markdown source={q.questionMd} />
          </Flex>
          <Radio.Group
            value={answers[q.id]}
            onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
          >
            <Space direction="vertical">
              {q.options.map((opt, idx) => (
                <Radio key={idx} value={idx}>
                  {opt}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </div>
      ))}
      {result && (
        <Alert
          type={result.passed ? 'success' : 'error'}
          showIcon
          title={`Skor: ${result.score}% — ${result.passed ? 'Lulus 🎉' : 'Belum lulus'}`}
        />
      )}
      <Button type="primary" loading={busy} disabled={disabled} onClick={onSubmit} style={{ alignSelf: 'flex-start' }}>
        Kirim jawaban
      </Button>
    </Flex>
  );
}

function LinkBody({ ex, disabled }: { ex: Exercise; disabled: boolean }) {
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = useMutation(api.submissions.submitLink);
  return (
    <Flex vertical gap={12}>
      <Input
        placeholder="https://github.com/... atau https://codepen.io/..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <Button
        type="primary"
        loading={busy}
        disabled={disabled}
        style={{ alignSelf: 'flex-start' }}
        onClick={async () => {
          setBusy(true);
          try {
            await submit({ exerciseId: ex._id as Id<'exercises'>, url });
            message.success('Terkirim — menunggu review admin');
            setUrl('');
          } catch (e) {
            message.error(e instanceof Error ? e.message : 'Gagal');
          } finally {
            setBusy(false);
          }
        }}
      >
        Kirim link
      </Button>
    </Flex>
  );
}

function TextBody({ ex, disabled }: { ex: Exercise; disabled: boolean }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = useMutation(api.submissions.submitText);
  return (
    <Flex vertical gap={12}>
      <Input.TextArea
        placeholder="Tulis jawabanmu (Markdown didukung)…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
      />
      <Button
        type="primary"
        loading={busy}
        disabled={disabled}
        style={{ alignSelf: 'flex-start' }}
        onClick={async () => {
          setBusy(true);
          try {
            await submit({ exerciseId: ex._id as Id<'exercises'>, text });
            message.success('Terkirim — menunggu review admin');
            setText('');
          } catch (e) {
            message.error(e instanceof Error ? e.message : 'Gagal');
          } finally {
            setBusy(false);
          }
        }}
      >
        Kirim jawaban
      </Button>
    </Flex>
  );
}

function ExerciseCard({ ex, isAuthenticated }: { ex: Exercise; isAuthenticated: boolean }) {
  const sub = useQuery(api.submissions.mySubmission, {
    exerciseId: ex._id as Id<'exercises'>,
  });
  const disabled = !isAuthenticated;

  return (
    <Section
      title={
        <Space>
          {ex.title}
          <Tag color="geekblue">{ex.type}</Tag>
          <Tag color="green">+{ex.xpReward} XP</Tag>
          {sub && (
            <Tag color={STATUS_COLOR[sub.status]}>
              {sub.status}
              {sub.score != null ? ` · ${sub.score}%` : ''}
            </Tag>
          )}
        </Space>
      }
    >
      {ex.promptMd.trim() && <Markdown source={ex.promptMd} />}
      {!isAuthenticated && (
        <Text type="secondary">Masuk untuk mengumpulkan jawaban.</Text>
      )}
      {ex.type === 'quiz' && ex.quiz && <QuizBody ex={ex} disabled={disabled} />}
      {ex.type === 'link' && <LinkBody ex={ex} disabled={disabled} />}
      {ex.type === 'text' && <TextBody ex={ex} disabled={disabled} />}
      {ex.type === 'code' && (
        <CodeEditor exerciseId={ex._id} starter={ex.starter} disabled={disabled} />
      )}
      {sub?.feedbackMd && (
        <Alert style={{ marginTop: 12 }} type="info" showIcon title="Feedback reviewer" description={<Markdown source={sub.feedbackMd} />} />
      )}
    </Section>
  );
}

/**
 * `<ExercisePanel lessonId>` — render UI + pengumpulan latihan per tipe
 * (Task B2 render, B3 submission). Auto-grade kuis di server.
 */
export default function ExercisePanel({ lessonId }: ExercisePanelProps) {
  const { isAuthenticated } = useConvexAuth();
  const exercises = useQuery(api.exercises.listByLesson, {
    lessonId: lessonId as Id<'lessons'>,
  }) as Exercise[] | undefined;

  if (exercises === undefined) return <Loading tip="Memuat latihan…" minHeight={120} />;
  if (exercises.length === 0) {
    return (
      <Section title="Latihan">
        <EmptyState icon="🧩" title="Belum ada latihan" description="Lesson ini belum punya latihan." />
      </Section>
    );
  }

  return (
    <>
      {exercises.map((ex) => (
        <ExerciseCard key={ex._id} ex={ex} isAuthenticated={isAuthenticated} />
      ))}
    </>
  );
}
