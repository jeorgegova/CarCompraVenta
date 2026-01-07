import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    user_id: '',
    reservation_date: '',
    reservation_time: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReservations();
    fetchVehicles();
    fetchUsers();
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

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, brand, model, year')
        .eq('status', 'approved')
        .order('brand');

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .order('first_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
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

  const openCreateModal = () => {
    setFormData({
      vehicle_id: '',
      user_id: '',
      reservation_date: '',
      reservation_time: '',
      notes: '',
    });
    setShowCreateModal(true);
  };

  const openEditModal = (reservation) => {
    setSelectedReservation(reservation);
    setFormData({
      vehicle_id: reservation.vehicle_id,
      user_id: reservation.user_id || '',
      reservation_date: reservation.reservation_date,
      reservation_time: reservation.reservation_time,
      notes: reservation.notes || '',
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedReservation(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = {
        vehicle_id: formData.vehicle_id,
        user_id: formData.user_id,
        reservation_date: formData.reservation_date,
        reservation_time: formData.reservation_time,
        status: 'pending',
        updated_at: new Date().toISOString(),
      };

      if (formData.notes.trim()) {
        data.notes = formData.notes.trim();
      }

      if (showCreateModal) {
        const { error } = await supabase.from('reservations').insert(data);
        if (error) throw error;
      } else if (showEditModal && selectedReservation) {
        const { error } = await supabase
          .from('reservations')
          .update(data)
          .eq('id', selectedReservation.id);
        if (error) throw error;
      }

      fetchReservations();
      closeModals();
    } catch (error) {
      console.error('Error saving reservation:', error);
      alert('Error al guardar la reserva');
    } finally {
      setSubmitting(false);
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary-900">Gestión de Reservas</h2>
        <button
          onClick={openCreateModal}
          className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          Crear Nueva Reserva
        </button>
      </div>

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

                    {reservation.notes && (
                      <div>
                        <span className="font-medium text-primary-700">Notas:</span>
                        <p className="text-primary-600">{reservation.notes}</p>
                      </div>
                    )}
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
                    <button
                      onClick={() => openEditModal(reservation)}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Editar Reserva
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Create/Edit Reservation */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {showCreateModal ? 'Crear Nueva Reserva' : 'Editar Reserva'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehículo *
                </label>
                <select
                  value={formData.vehicle_id}
                  onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <option value="">Selecciona un vehículo</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model} {vehicle.year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario *
                </label>
                <select
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <option value="">Selecciona un usuario</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de cita *
                </label>
                <input
                  type="date"
                  value={formData.reservation_date}
                  onChange={(e) => setFormData({ ...formData, reservation_date: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de cita *
                </label>
                <input
                  type="time"
                  value={formData.reservation_time}
                  onChange={(e) => setFormData({ ...formData, reservation_time: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="Notas adicionales sobre la reserva..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : (showCreateModal ? 'Crear' : 'Actualizar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationManagement;