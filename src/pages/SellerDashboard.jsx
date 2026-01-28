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
    <div className="min-h-screen font-sans text-gray-900 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Panel de Vendedor</h1>
          <p className="text-gray-600 mt-2">Gestiona tus vehículos y ventas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <nav className="space-y-2">
                <Link
                  to="/seller"
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/seller'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Subir Vehículo
                </Link>
                <Link
                  to="/seller/traceability"
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/seller/traceability'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Trazabilidad
                </Link>
              </nav>
            </div>
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
    </div>
  );
};

export default SellerDashboard;