import { useState } from 'react';
import { useQuery } from 'convex/react';
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
  Tooltip,
  Typography,
} from '@/components/ui';
import Markdown from '@/components/Markdown';

const { Text } = Typography;

export interface ExercisePanelProps {
  /** Seam 2: panel selalu menerima lessonId; aman saat tak ada latihan. */
  lessonId: string;
  courseId?: string;
}

// Tombol kirim dinonaktifkan di B2 — pengumpulan + auto-grade dikerjakan di B3.
function SubmitStub() {
  return (
    <Tooltip title="Pengumpulan & auto-grade dikerjakan di B3">
      <Button type="primary" disabled>
        Kirim
      </Button>
    </Tooltip>
  );
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

function QuizBody({ quiz }: { quiz: { questions: Question[]; passScore: number } }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
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
      <SubmitStub />
    </Flex>
  );
}

function LinkBody() {
  const [url, setUrl] = useState('');
  return (
    <Flex vertical gap={12}>
      <Input
        placeholder="https://github.com/... atau https://codepen.io/..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <SubmitStub />
    </Flex>
  );
}

function TextBody() {
  const [text, setText] = useState('');
  return (
    <Flex vertical gap={12}>
      <Input.TextArea
        placeholder="Tulis jawabanmu (Markdown didukung)…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
      />
      <SubmitStub />
    </Flex>
  );
}

function ExerciseCard({ ex }: { ex: Exercise }) {
  return (
    <Section
      title={
        <Space>
          {ex.title}
          <Tag color="geekblue">{ex.type}</Tag>
          <Tag color="green">+{ex.xpReward} XP</Tag>
        </Space>
      }
    >
      {ex.promptMd.trim() && <Markdown source={ex.promptMd} />}
      {ex.type === 'quiz' && ex.quiz && <QuizBody quiz={ex.quiz} />}
      {ex.type === 'link' && <LinkBody />}
      {ex.type === 'text' && <TextBody />}
      {ex.type === 'code' && (
        <EmptyState
          icon="💻"
          title="Code editor in-browser"
          description="Editor + preview iframe dikerjakan di Fase 5 (B5)."
        />
      )}
    </Section>
  );
}

/**
 * `<ExercisePanel lessonId>` — render UI latihan per tipe (Task B2, Seam 2).
 * Render quiz/link/teks/code; pengumpulan (submission) = B3.
 */
export default function ExercisePanel({ lessonId }: ExercisePanelProps) {
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
        <ExerciseCard key={ex._id} ex={ex} />
      ))}
    </>
  );
}
