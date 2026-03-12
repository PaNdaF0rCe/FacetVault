import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

function Layout() {
  const location = useLocation();
  const showNavbar = !['/login', '/signup'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#13203f_0%,#0b1224_35%,#060b16_100%)] text-gray-100">
      {showNavbar && <Navbar />}

      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;