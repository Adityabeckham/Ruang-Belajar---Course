import { ConfigProvider } from 'antd';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import useIllustrationTheme from './theme/illustrationTheme';
import { routes } from './app/routes';

const router = createBrowserRouter(routes);

export default function App() {
  const configProps = useIllustrationTheme();

  return (
    <ConfigProvider {...configProps}>
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}
