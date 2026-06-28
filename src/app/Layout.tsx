import { Outlet } from 'react-router-dom';
import Nav from './Nav';
import AuthSync from './AuthSync';
import LevelUpWatcher from '@/features/gamification/LevelUpWatcher';

/** Shell utama: sync auth + watcher level-up + nav atas + area konten route (Outlet). */
export default function Layout() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <AuthSync />
      <LevelUpWatcher />
      <Nav />
      <Outlet />
    </div>
  );
}
