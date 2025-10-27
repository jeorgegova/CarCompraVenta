import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          vehicles (
            brand,
            model,
            year,
            price
          ),
          profiles:user_id (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reservationId, newStatus) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', reservationId);

      if (error) throw error;

      // Refresh the list
      fetchReservations();
    } catch (error) {
      console.error('Error updating reservation:', error);
      alert('Error al actualizar la reserva');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      case 'completed':
        return 'Completada';
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
      <h2 className="text-2xl font-bold text-primary-900 mb-6">Gestión de Reservas</h2>

      {reservations.length === 0 ? (
        <p className="text-primary-600">No hay reservas registradas.</p>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Reservation Details */}
                <div>
                  <h3 className="text-lg font-semibold text-primary-900 mb-2">
                    Reserva #{reservation.id.slice(-8)}
                  </h3>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-primary-700">Cliente:</span>
                      <p className="text-primary-600">
                        {reservation.profiles?.first_name} {reservation.profiles?.last_name}
                      </p>
                      <p className="text-primary-600">{reservation.profiles?.email}</p>
                      <p className="text-primary-600">{reservation.profiles?.phone}</p>
                    </div>

                    <div>
                      <span className="font-medium text-primary-700">Vehículo:</span>
                      <p className="text-primary-600">
                        {reservation.vehicles?.brand} {reservation.vehicles?.model} {reservation.vehicles?.year}
                      </p>
                      <p className="text-primary-600">
                        Precio: ${reservation.vehicles?.price?.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <span className="font-medium text-primary-700">Fecha de cita:</span>
                      <p className="text-primary-600">
                        {new Date(reservation.reservation_date).toLocaleDateString()} a las {reservation.reservation_time}
                      </p>
                    </div>

                    <div>
                      <span className="font-medium text-primary-700">Fecha de reserva:</span>
                      <p className="text-primary-600">
                        {new Date(reservation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex flex-col justify-between">
                  <div>
                    <span className="font-medium text-primary-700">Estado:</span>
                    <div className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                        {getStatusText(reservation.status)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-primary-700">
                      Cambiar estado:
                    </label>
                    <select
                      value={reservation.status}
                      onChange={(e) => handleStatusChange(reservation.id, e.target.value)}
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="confirmed">Confirmada</option>
                      <option value="completed">Completada</option>
                      <option value="cancelled">Cancelada</option>
                    </select>
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

export default ReservationManagement;