import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';
import {
  PageContainer,
  PageHeader,
  Section,
  Table,
  Button,
  Avatar,
  Space,
  Tag,
  Typography,
  Loading,
  message,
} from '@/components/ui';

const { Text } = Typography;

type Row = {
  userId: string;
  displayName: string;
  email: string | null;
  avatarUrl: string | null;
  role: 'admin' | 'student';
  level: number;
  totalXp: number;
};

/** Admin kelola user & role (Task C5). */
export default function AdminUsersPage() {
  const users = useQuery(api.admin.listUsers) as Row[] | undefined;
  const setRole = useMutation(api.admin.setUserRole);

  if (users === undefined) return <Loading tip="Memuat user…" />;

  const toggle = async (r: Row) => {
    const next = r.role === 'admin' ? 'student' : 'admin';
    try {
      await setRole({ userId: r.userId as Id<'users'>, role: next });
      message.success(`${r.displayName} → ${next}`);
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Gagal');
    }
  };

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_: unknown, r: Row) => (
        <Space>
          <Avatar size="small" src={r.avatarUrl ?? undefined}>
            {r.displayName.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div>{r.displayName}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {r.email ?? '—'}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      key: 'role',
      render: (_: unknown, r: Row) => (
        <Tag color={r.role === 'admin' ? 'purple' : 'default'}>{r.role}</Tag>
      ),
    },
    {
      title: 'XP / Level',
      key: 'xp',
      render: (_: unknown, r: Row) => (
        <Text type="secondary">
          Lv {r.level} · {r.totalXp} XP
        </Text>
      ),
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_: unknown, r: Row) => (
        <Button size="small" onClick={() => toggle(r)}>
          Jadikan {r.role === 'admin' ? 'student' : 'admin'}
        </Button>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader title="Kelola User & Role" subtitle={`${users.length} pengguna`} />
      <Section>
        <Table
          rowKey="userId"
          dataSource={users}
          columns={columns}
          pagination={false}
          size="middle"
        />
      </Section>
    </PageContainer>
  );
}
