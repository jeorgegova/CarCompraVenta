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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <nav className="space-y-2">
                <Link
                  to="/admin"
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/admin'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  Aprobar Vehículos
                </Link>
                <Link
                  to="/admin/create-vehicle"
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/admin/create-vehicle'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  Crear Vehículo
                </Link>
                <Link
                  to="/admin/users"
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/admin/users'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  Gestionar Usuarios
                </Link>
                <Link
                  to="/admin/reservations"
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/admin/reservations'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  Gestionar Reservas
                </Link>
                <Link
                  to="/admin/chats"
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/admin/chats'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  Gestionar Chats
                </Link>
                <Link
                  to="/admin/vehicles"
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/admin/vehicles'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  Gestionar Vehículos Publicados
                </Link>
                <Link
                  to="/admin/sales-history"
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/admin/sales-history'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  Historial de Ventas
                </Link>
              </nav>
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