import { ConfigProvider } from 'antd';
import useIllustrationTheme from './theme/illustrationTheme';
import Showcase from './Showcase';

export default function App() {
  const configProps = useIllustrationTheme();

  return (
    <ConfigProvider {...configProps}>
      <Showcase />
    </ConfigProvider>
  );
}
