import { Link, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { Authenticated, Unauthenticated, AuthLoading, useQuery } from 'convex/react';
import { auth } from '@/lib/firebase';
import { api } from '../../convex/_generated/api';
import { Flex, Button, Space, Typography, Avatar, Tag, Spin } from '@/components/ui';

const { Text } = Typography;

const links = [
  { to: '/courses', label: 'Katalog' },
  { to: '/dashboard', label: 'Dashboard' },
];

function ProfileChip() {
  const profile = useQuery(api.profiles.getCurrentProfile);
  const isAdmin = profile?.role === 'admin';

  return (
    <Space size="middle">
      {isAdmin && (
        <Link to="/admin">
          <Tag color="purple" style={{ cursor: 'pointer', margin: 0 }}>
            Admin
          </Tag>
        </Link>
      )}
      <Link to="/profile">
        <Space size="small">
          <Avatar size="small" src={profile?.avatarUrl}>
            {profile?.displayName?.charAt(0)?.toUpperCase() ?? 'U'}
          </Avatar>
          <Text>{profile?.displayName ?? 'Profil'}</Text>
        </Space>
      </Link>
      <Button size="small" onClick={() => void signOut(auth)}>
        Keluar
      </Button>
    </Space>
  );
}

/** Bar navigasi atas. Menu konteks-auth: login vs profil + logout. */
export default function Nav() {
  const { pathname } = useLocation();

  return (
    <Flex
      align="center"
      justify="space-between"
      style={{
        padding: '12px 24px',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        gap: 16,
      }}
    >
      <Space size="large">
        <Link to="/">
          <Text strong style={{ fontSize: 18 }}>
            Ruang Belajar
          </Text>
        </Link>
        <Space size="middle">
          {links.map((l) => (
            <Link key={l.to} to={l.to}>
              <Text type={pathname.startsWith(l.to) ? undefined : 'secondary'}>
                {l.label}
              </Text>
            </Link>
          ))}
        </Space>
      </Space>

      <div>
        <AuthLoading>
          <Spin size="small" />
        </AuthLoading>
        <Unauthenticated>
          <Link to="/login">
            <Button type="primary" size="small">
              Masuk
            </Button>
          </Link>
        </Unauthenticated>
        <Authenticated>
          <ProfileChip />
        </Authenticated>
      </div>
    </Flex>
  );
}
