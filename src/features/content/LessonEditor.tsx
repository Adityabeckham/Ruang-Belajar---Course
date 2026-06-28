import { useState, useRef, useMemo, type ChangeEvent } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { parseLessonMarkdown } from '../../../convex/lib/lessonMarkdown';
import {
  Button,
  Input,
  Flex,
  Space,
  Tag,
  Typography,
  message,
} from '@/components/ui';
import Markdown from '@/components/Markdown';

const { Text } = Typography;

const SAMPLE = `---
title: Judul Lesson
slug: judul-lesson
xpReward: 20
---

# Judul Lesson

Tulis materi di sini. Mendukung **Markdown**:

\`\`\`js
console.log("halo");
\`\`\`
`;

export interface LessonEditorProps {
  moduleId: string;
  onSaved?: () => void;
}

/**
 * Editor authoring lesson (Task A2): tulis/upload Markdown (frontmatter + body),
 * live preview, simpan via lessons.createFromMarkdown.
 */
export default function LessonEditor({ moduleId, onSaved }: LessonEditorProps) {
  const [raw, setRaw] = useState(SAMPLE);
  const fileRef = useRef<HTMLInputElement>(null);
  const createFromMd = useMutation(api.lessons.createFromMarkdown);
  const parsed = useMemo(() => parseLessonMarkdown(raw), [raw]);

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setRaw(String(reader.result));
    reader.readAsText(file);
    e.target.value = '';
  };

  const save = async () => {
    try {
      await createFromMd({ moduleId: moduleId as Id<'modules'>, raw });
      message.success('Lesson dibuat dari Markdown');
      onSaved?.();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Gagal menyimpan');
    }
  };

  return (
    <Flex gap={16} wrap style={{ marginTop: 8 }}>
      <Flex vertical gap={8} style={{ flex: '1 1 320px' }}>
        <Space>
          <Button size="small" onClick={() => fileRef.current?.click()}>
            Upload .md
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".md,.markdown,text/markdown"
            onChange={handleUpload}
            hidden
          />
          <Button size="small" type="primary" onClick={save}>
            Simpan lesson
          </Button>
        </Space>
        <Input.TextArea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={14}
          style={{ fontFamily: 'monospace', fontSize: 13 }}
        />
      </Flex>

      <Flex vertical gap={8} style={{ flex: '1 1 320px' }}>
        <Space wrap>
          <Text type="secondary">Preview:</Text>
          {typeof parsed.data.title === 'string' && (
            <Tag color="blue">title: {parsed.data.title}</Tag>
          )}
          {typeof parsed.data.slug === 'string' && (
            <Tag>slug: {parsed.data.slug}</Tag>
          )}
          {typeof parsed.data.xpReward === 'number' && (
            <Tag color="green">+{parsed.data.xpReward} XP</Tag>
          )}
        </Space>
        <div
          style={{
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: 8,
            padding: 12,
            minHeight: 120,
          }}
        >
          <Markdown source={parsed.contentMd} />
        </div>
      </Flex>
    </Flex>
  );
}
