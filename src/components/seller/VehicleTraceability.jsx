import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const VehicleTraceability = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'sold':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Aprobado';
      case 'pending':
        return 'Pendiente';
      case 'rejected':
        return 'Rechazado';
      case 'sold':
        return 'Vendido';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-primary-900 mb-6">Trazabilidad de Vehículos</h2>

      {vehicles.length === 0 ? (
        <p className="text-primary-600">No has subido ningún vehículo aún.</p>
      ) : (
        <div className="space-y-4">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-primary-900">
                    {vehicle.brand} {vehicle.model} {vehicle.year}
                  </h3>
                  <p className="text-primary-600">
                    Precio: ${vehicle.price?.toLocaleString()} | Kilometraje: {vehicle.mileage?.toLocaleString()} km
                  </p>
                  <p className="text-primary-600">Ubicación: {vehicle.location}</p>
                </div>

                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vehicle.status)}`}>
                  {getStatusText(vehicle.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-primary-700">Fecha de subida:</span>
                  <p className="text-primary-600">
                    {new Date(vehicle.created_at).toLocaleDateString()}
                  </p>
                </div>

                {vehicle.approved_at && (
                  <div>
                    <span className="font-medium text-primary-700">Fecha de aprobación:</span>
                    <p className="text-primary-600">
                      {new Date(vehicle.approved_at).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {vehicle.sold_at && (
                  <div>
                    <span className="font-medium text-primary-700">Fecha de venta:</span>
                    <p className="text-primary-600">
                      {new Date(vehicle.sold_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {vehicle.admin_notes && (
                <div className="mt-4 p-3 bg-primary-50 rounded">
                  <span className="font-medium text-primary-700">Notas del administrador:</span>
                  <p className="text-primary-600 mt-1">{vehicle.admin_notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VehicleTraceability;