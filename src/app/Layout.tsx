import { Outlet } from 'react-router-dom';
import Nav from './Nav';

/** Shell utama: nav atas + area konten route (Outlet). */
export default function Layout() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Nav />
      <Outlet />
    </div>
  );
}
