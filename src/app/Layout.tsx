import { Outlet, useLocation } from 'react-router-dom';
import Nav from './Nav';
import AuthSync from './AuthSync';
import LevelUpWatcher from '@/features/gamification/LevelUpWatcher';
import BadgeUnlockWatcher from '@/features/gamification/BadgeUnlockWatcher';

/** Shell utama: sync auth + watcher level-up + badge unlock + nav atas + area konten route (Outlet). */
export default function Layout() {
  const { pathname } = useLocation();
  const showNav = pathname !== '/' && pathname !== '/login' && pathname !== '/playground';

  return (
    <div style={{ minHeight: '100vh' }}>
      <AuthSync />
      <LevelUpWatcher />
      <BadgeUnlockWatcher />
      {showNav && <Nav />}
      <Outlet />
    </div>
  );
}

