import { Outlet } from 'react-router-dom';
import Nav from './Nav';
import AuthSync from './AuthSync';

/** Shell utama: sync auth + nav atas + area konten route (Outlet). */
export default function Layout() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <AuthSync />
      <Nav />
      <Outlet />
    </div>
  );
}
