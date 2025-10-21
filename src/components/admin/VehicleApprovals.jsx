import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const VehicleApprovals = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingVehicles();
  }, []);

  const fetchPendingVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          profiles:seller_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (vehicleId, action, notes = '') => {
    try {
      const updateData = {
        status: action,
        approved_at: action === 'approved' ? new Date().toISOString() : null,
        admin_notes: notes,
      };

      const { error } = await supabase
        .from('vehicles')
        .update(updateData)
        .eq('id', vehicleId);

      if (error) throw error;

      // Refresh the list
      fetchPendingVehicles();
    } catch (error) {
      console.error('Error updating vehicle:', error);
      alert('Error al actualizar el vehículo');
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
      <h2 className="text-2xl font-bold text-primary-900 mb-6">Vehículos Pendientes de Aprobación</h2>

      {vehicles.length === 0 ? (
        <p className="text-primary-600">No hay vehículos pendientes de aprobación.</p>
      ) : (
        <div className="space-y-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Vehicle Images */}
                <div className="lg:col-span-1">
                  <div className="aspect-w-16 aspect-h-9 bg-primary-200 rounded-lg overflow-hidden">
                    {vehicle.images && vehicle.images.length > 0 ? (
                      <img
                        src={vehicle.images[0]}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center text-primary-500 text-4xl">
                        🚗
                      </div>
                    )}
                  </div>
                </div>

                {/* Vehicle Details */}
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-primary-900">
                      {vehicle.brand} {vehicle.model} {vehicle.year}
                    </h3>
                    <p className="text-primary-600">
                      Vendedor: {vehicle.profiles?.first_name} {vehicle.profiles?.last_name}
                    </p>
                    <p className="text-primary-600">{vehicle.profiles?.email}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-primary-700">Precio:</span>
                      <p className="text-primary-600">${vehicle.price?.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-primary-700">Kilometraje:</span>
                      <p className="text-primary-600">{vehicle.mileage?.toLocaleString()} km</p>
                    </div>
                    <div>
                      <span className="font-medium text-primary-700">Ubicación:</span>
                      <p className="text-primary-600">{vehicle.location}</p>
                    </div>
                    <div>
                      <span className="font-medium text-primary-700">Transmisión:</span>
                      <p className="text-primary-600">{vehicle.transmission}</p>
                    </div>
                  </div>

                  {vehicle.description && (
                    <div>
                      <span className="font-medium text-primary-700">Descripción:</span>
                      <p className="text-primary-600 mt-1">{vehicle.description}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-4 pt-4">
                    <button
                      onClick={() => handleApproval(vehicle.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => {
                        const notes = prompt('Notas para el rechazo:');
                        if (notes !== null) {
                          handleApproval(vehicle.id, 'rejected', notes);
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VehicleApprovals;