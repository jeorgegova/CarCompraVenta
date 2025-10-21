import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import VehicleApprovals from '../components/admin/VehicleApprovals';
import UserManagement from '../components/admin/UserManagement';
import ReservationManagement from '../components/admin/ReservationManagement';

const AdminDashboard = () => {
  const location = useLocation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-900">Panel de Administrador</h1>
        <p className="text-primary-600 mt-2">Gestiona aprobaciones, usuarios y reservas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            <Link
              to="/admin"
              className={`block px-4 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/admin'
                  ? 'bg-primary-600 text-white'
                  : 'text-primary-700 hover:bg-primary-50'
              }`}
            >
              Aprobar Vehículos
            </Link>
            <Link
              to="/admin/users"
              className={`block px-4 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/admin/users'
                  ? 'bg-primary-600 text-white'
                  : 'text-primary-700 hover:bg-primary-50'
              }`}
            >
              Gestionar Usuarios
            </Link>
            <Link
              to="/admin/reservations"
              className={`block px-4 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/admin/reservations'
                  ? 'bg-primary-600 text-white'
                  : 'text-primary-700 hover:bg-primary-50'
              }`}
            >
              Gestionar Reservas
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Routes>
            <Route path="/" element={<VehicleApprovals />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/reservations" element={<ReservationManagement />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;