import {
  ConfigProvider,
  Button,
  Card,
  Input,
  Progress,
  Alert,
  Space,
  Typography,
} from 'antd';
import useIllustrationTheme from './theme/illustrationTheme';
import { AuthButtons } from './components/auth/AuthButtons';
import { useConvexAuth } from 'convex/react';

const { Title, Paragraph } = Typography;

export default function App() {
  const configProps = useIllustrationTheme();
  const { isAuthenticated } = useConvexAuth();

  return (
    <ConfigProvider {...configProps}>
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card title="Ruang Belajar" className="w-full max-w-md">
          <Space direction="vertical" size="large" style={{ display: 'flex' }}>
            <Title level={3} style={{ margin: 0 }}>
              Halo Ruang Belajar 🚀
            </Title>
            <Paragraph style={{ margin: 0 }}>
              Design system: <strong>Ant Design</strong> + illustration theme
              (neo-brutalist). Tempat belajar coding jadi lebih seru.
            </Paragraph>
            
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-md border border-gray-200">
              <span className="font-medium">Status: {isAuthenticated ? '✅ Terautentikasi' : '🔒 Belum Login'}</span>
              <AuthButtons />
            </div>

            <Input placeholder="Cari materi: HTML, CSS, JS..." disabled={!isAuthenticated} />

            <div>
              <Paragraph style={{ marginBottom: 4 }}>Progress modul HTML</Paragraph>
              <Progress percent={60} status={isAuthenticated ? 'active' : 'normal'} />
            </div>

            <Alert
              message={isAuthenticated ? "Selamat datang kembali!" : "Silakan login untuk memulai perjalanan belajarmu!"}
              type={isAuthenticated ? "success" : "info"}
              showIcon
            />

            <Space>
              <Button type="primary" disabled={!isAuthenticated}>Mulai Belajar</Button>
              <Button disabled={!isAuthenticated}>Pelajari Lagi</Button>
            </Space>
          </Space>
        </Card>
      </div>
    </ConfigProvider>
  );
}
