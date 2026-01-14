import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const VehicleTraceability = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [reservations, setReservations] = useState({});
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
      if (data && data.length > 0) {
        fetchReservations(data.map(v => v.id));
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async (vehicleIds) => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .in('vehicle_id', vehicleIds);

      if (error) throw error;

      const resByVehicle = {};
      data.forEach(res => {
        if (!resByVehicle[res.vehicle_id]) resByVehicle[res.vehicle_id] = [];
        resByVehicle[res.vehicle_id].push(res);
      });
      setReservations(resByVehicle);
    } catch (error) {
      console.error('Error fetching reservations:', error);
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

  const getReservationStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReservationStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
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

              {reservations[vehicle.id] && reservations[vehicle.id].length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-primary-700 mb-2">Reservas:</h4>
                  <div className="space-y-2">
                    {reservations[vehicle.id].map(res => (
                      <div key={res.id} className="p-3 bg-gray-50 rounded">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-primary-600">
                              Fecha: {new Date(res.reservation_date).toLocaleDateString()} a las {res.reservation_time}
                            </p>
                            {res.notes && <p className="text-sm text-primary-600">Notas: {res.notes}</p>}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReservationStatusColor(res.status)}`}>
                            {getReservationStatusText(res.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
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