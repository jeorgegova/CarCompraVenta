import { useState, useRef, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import VehicleApprovals from '../components/admin/VehicleApprovals';
import UserManagement from '../components/admin/UserManagement';
import ReservationManagement from '../components/admin/ReservationManagement';
import ChatManagement from './admin/ChatManagement';
import AdminUploadVehicle from '../components/admin/AdminUploadVehicle';
import VehicleManagement from '../components/admin/VehicleManagement';
import AdminEditVehicle from '../components/admin/AdminEditVehicle';
import SalesHistory from './admin/SalesHistory';
import { Helmet } from 'react-helmet-async'

const AdminDashboard = () => {
  const location = useLocation();
  const navRef = useRef(null);
  const [showRightGradient, setShowRightGradient] = useState(true);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);

  const handleScroll = () => {
    if (navRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
      setShowLeftGradient(scrollLeft > 10);
      setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 10);

      // Show hint if at the beginning, hide if scrolled significantly or reached end
      if (scrollLeft < 10) {
        setShowScrollHint(true);
      } else if (scrollLeft > 50 || scrollLeft + clientWidth >= scrollWidth - 10) {
        setShowScrollHint(false);
      }
    }
  };

  useEffect(() => {
    const nav = navRef.current;
    if (nav) {
      nav.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
    }
    return () => nav?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-gray-50">
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={window.location.origin + window.location.pathname} />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Panel de Administrador</h1>
          <p className="text-gray-600 mt-2">Gestiona aprobaciones, usuarios y reservas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 overflow-hidden">
              <div className="relative">
                {/* Horizontal scroll indicators for mobile */}
                <div className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none lg:hidden z-10 transition-opacity duration-300 ${showRightGradient ? 'opacity-100' : 'opacity-0'}`} />
                <div className={`absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent pointer-events-none lg:hidden z-10 transition-opacity duration-300 ${showLeftGradient ? 'opacity-100' : 'opacity-0'}`} />

                <nav
                  ref={navRef}
                  className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible space-x-2 lg:space-x-0 lg:space-y-2 pb-2 lg:pb-0 scrollbar-hide"
                >
                  <Link
                    to="/admin"
                    className={`flex-shrink-0 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${location.pathname === '/admin'
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    Aprobar Vehículos
                  </Link>
                  <Link
                    to="/admin/create-vehicle"
                    className={`flex-shrink-0 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${location.pathname === '/admin/create-vehicle'
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    Crear Vehículo
                  </Link>
                  <Link
                    to="/admin/users"
                    className={`flex-shrink-0 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${location.pathname === '/admin/users'
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    Gestionar Usuarios
                  </Link>
                  <Link
                    to="/admin/reservations"
                    className={`flex-shrink-0 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${location.pathname === '/admin/reservations'
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    Gestionar Reservas
                  </Link>
                  <Link
                    to="/admin/chats"
                    className={`flex-shrink-0 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${location.pathname === '/admin/chats'
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    Gestionar Chats
                  </Link>
                  <Link
                    to="/admin/vehicles"
                    className={`flex-shrink-0 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${location.pathname === '/admin/vehicles'
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    Gestionar Vehículos Publicados
                  </Link>
                  <Link
                    to="/admin/sales-history"
                    className={`flex-shrink-0 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${location.pathname === '/admin/sales-history'
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    Historial de Ventas
                  </Link>
                </nav>
              </div>

              {/* Mobile hint */}
              {showScrollHint && (
                <div className="lg:hidden mt-2 text-[10px] text-gray-400 flex items-center justify-center gap-1 animate-pulse">
                  <span>Desliza para ver más</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Routes>
              <Route path="/" element={<VehicleApprovals />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/reservations" element={<ReservationManagement />} />
              <Route path="/chats" element={<ChatManagement />} />
              <Route path="/create-vehicle" element={<AdminUploadVehicle />} />
              <Route path="/vehicles" element={<VehicleManagement />} />
              <Route path="/edit-vehicle/:id" element={<AdminEditVehicle />} />
              <Route path="/sales-history" element={<SalesHistory />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;