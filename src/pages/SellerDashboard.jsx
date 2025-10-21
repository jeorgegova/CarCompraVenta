import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import UploadVehicle from '../components/seller/UploadVehicle';
import VehicleTraceability from '../components/seller/VehicleTraceability';

const SellerDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-900">Panel de Vendedor</h1>
        <p className="text-primary-600 mt-2">Gestiona tus vehículos y ventas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            <Link
              to="/seller"
              className={`block px-4 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/seller'
                  ? 'bg-primary-600 text-white'
                  : 'text-primary-700 hover:bg-primary-50'
              }`}
            >
              Subir Vehículo
            </Link>
            <Link
              to="/seller/traceability"
              className={`block px-4 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/seller/traceability'
                  ? 'bg-primary-600 text-white'
                  : 'text-primary-700 hover:bg-primary-50'
              }`}
            >
              Trazabilidad
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Routes>
            <Route path="/" element={<UploadVehicle />} />
            <Route path="/traceability" element={<VehicleTraceability />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;