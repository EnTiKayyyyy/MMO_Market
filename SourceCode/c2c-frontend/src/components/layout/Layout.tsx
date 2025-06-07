import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileNav from './MobileNav';
import { useAuthStore } from '../../stores/authStore';
import { useEffect, useState } from 'react';
// import ChatWidget from '../chat/ChatWidget';

const Layout = () => {
  const { user } = useAuthStore();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Close mobile nav when route changes
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onMenuClick={() => setIsMobileNavOpen(true)} />
      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
      <main className="flex-grow container-custom py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;