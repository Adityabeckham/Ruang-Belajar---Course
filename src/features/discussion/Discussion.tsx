import { useState } from 'react';
import { useQuery, useMutation, useConvexAuth } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import {
  Section,
  Button,
  Input,
  Avatar,
  Space,
  Flex,
  Typography,
  Tag,
  EmptyState,
  Loading,
  message,
} from '@/components/ui';
import Markdown from '@/components/Markdown';

const { Text } = Typography;

export interface DiscussionProps {
  lessonId: string;
  courseId?: string;
}

type Author = { displayName: string; avatarUrl?: string; isAdmin: boolean };
type Comment = {
  _id: string;
  bodyMd: string;
  createdAt: number;
  mine: boolean;
  canModerate: boolean;
  author: Author;
  replies?: Comment[];
};

function when(ts: number) {
  return new Date(ts).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function Composer({
  onSubmit,
  initial = '',
  submitLabel,
  placeholder,
  onCancel,
}: {
  onSubmit: (body: string) => Promise<void>;
  initial?: string;
  submitLabel: string;
  placeholder?: string;
  onCancel?: () => void;
}) {
  const [body, setBody] = useState(initial);
  const [busy, setBusy] = useState(false);
  return (
    <Flex vertical gap={8} style={{ marginTop: 8 }}>
      <Input.TextArea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder={placeholder ?? 'Tulis komentar (Markdown didukung)…'}
      />
      <Space>
        <Button
          type="primary"
          size="small"
          loading={busy}
          onClick={async () => {
            if (!body.trim()) return message.warning('Komentar kosong');
            setBusy(true);
            try {
              await onSubmit(body.trim());
              setBody('');
            } catch (e) {
              message.error(e instanceof Error ? e.message : 'Gagal');
            } finally {
              setBusy(false);
            }
          }}
        >
          {submitLabel}
        </Button>
        {onCancel && (
          <Button size="small" onClick={onCancel}>
            Batal
          </Button>
        )}
      </Space>
    </Flex>
  );
}

function CommentItem({
  c,
  lessonId,
  isAuthenticated,
  isReply = false,
}: {
  c: Comment;
  lessonId: string;
  isAuthenticated: boolean;
  isReply?: boolean;
}) {
  const add = useMutation(api.comments.add);
  const edit = useMutation(api.comments.edit);
  const remove = useMutation(api.comments.remove);
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);

  return (
    <div
      style={{
        borderLeft: isReply ? '2px solid rgba(0,0,0,0.06)' : undefined,
        paddingLeft: isReply ? 12 : 0,
        marginTop: 12,
      }}
    >
      <Flex gap={10} align="flex-start">
        <Avatar size="small" src={c.author.avatarUrl}>
          {c.author.displayName.charAt(0).toUpperCase()}
        </Avatar>
        <Flex vertical gap={2} style={{ flex: 1 }}>
          <Space size="small" wrap>
            <Text strong>{c.author.displayName}</Text>
            {c.author.isAdmin && <Tag color="purple">admin</Tag>}
            <Text type="secondary" style={{ fontSize: 12 }}>
              {when(c.createdAt)}
            </Text>
          </Space>

          {editing ? (
            <Composer
              initial={c.bodyMd}
              submitLabel="Simpan"
              onCancel={() => setEditing(false)}
              onSubmit={async (body) => {
                await edit({ commentId: c._id as Id<'comments'>, bodyMd: body });
                setEditing(false);
              }}
            />
          ) : (
            <Markdown source={c.bodyMd} />
          )}

          {!editing && (
            <Space size="small">
              {isAuthenticated && !isReply && (
                <Button type="link" size="small" style={{ padding: 0 }} onClick={() => setReplying((r) => !r)}>
                  Balas
                </Button>
              )}
              {c.mine && (
                <Button type="link" size="small" style={{ padding: 0 }} onClick={() => setEditing(true)}>
                  Edit
                </Button>
              )}
              {(c.mine || c.canModerate) && (
                <Button
                  type="link"
                  size="small"
                  danger
                  style={{ padding: 0 }}
                  onClick={async () => {
                    try {
                      await remove({ commentId: c._id as Id<'comments'> });
                    } catch (e) {
                      message.error(e instanceof Error ? e.message : 'Gagal');
                    }
                  }}
                >
                  Hapus
                </Button>
              )}
            </Space>
          )}

          {replying && (
            <Composer
              submitLabel="Kirim balasan"
              placeholder="Tulis balasan…"
              onCancel={() => setReplying(false)}
              onSubmit={async (body) => {
                await add({
                  lessonId: lessonId as Id<'lessons'>,
                  bodyMd: body,
                  parentId: c._id as Id<'comments'>,
                });
                setReplying(false);
              }}
            />
          )}

          {c.replies?.map((r) => (
            <CommentItem key={r._id} c={r} lessonId={lessonId} isAuthenticated={isAuthenticated} isReply />
          ))}
        </Flex>
      </Flex>
    </div>
  );
}

/**
 * `<Discussion lessonId>` — komentar threaded per-lesson (Task C4, Seam 2).
 * Markdown ter-sanitize (via <Markdown>), edit/hapus milik sendiri + moderasi admin.
 */
export default function Discussion({ lessonId }: DiscussionProps) {
  const { isAuthenticated } = useConvexAuth();
  const data = useQuery(api.comments.listByLesson, {
    lessonId: lessonId as Id<'lessons'>,
  });
  const add = useMutation(api.comments.add);

  return (
    <Section title="Diskusi">
      {isAuthenticated ? (
        <Composer
          submitLabel="Kirim"
          onSubmit={async (body) => {
            await add({ lessonId: lessonId as Id<'lessons'>, bodyMd: body });
          }}
        />
      ) : (
        <Text type="secondary">Masuk untuk ikut berdiskusi.</Text>
      )}

      {data === undefined ? (
        <Loading minHeight={80} />
      ) : data.comments.length === 0 ? (
        <EmptyState icon="💬" title="Belum ada komentar" description="Jadi yang pertama bertanya atau menjawab." />
      ) : (
        <div style={{ marginTop: 8 }}>
          {data.comments.map((c) => (
            <CommentItem key={c._id} c={c as Comment} lessonId={lessonId} isAuthenticated={isAuthenticated} />
          ))}
        </div>
      )}
    </Section>
  );
}
