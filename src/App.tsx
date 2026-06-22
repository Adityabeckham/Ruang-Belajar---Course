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

const { Title, Paragraph } = Typography;

export default function App() {
  const configProps = useIllustrationTheme();

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

            <Input placeholder="Cari materi: HTML, CSS, JS..." />

            <div>
              <Paragraph style={{ marginBottom: 4 }}>Progress modul HTML</Paragraph>
              <Progress percent={60} />
            </div>

            <Alert
              message="Selamat datang di Ruang Belajar!"
              type="success"
              showIcon
            />

            <Space>
              <Button type="primary">Mulai Belajar</Button>
              <Button>Pelajari Lagi</Button>
            </Space>
          </Space>
        </Card>
      </div>
    </ConfigProvider>
  );
}
