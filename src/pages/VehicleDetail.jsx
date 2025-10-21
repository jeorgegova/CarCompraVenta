import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setVehicle(data);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReservation = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setReserving(true);
    try {
      const { error } = await supabase
        .from('reservations')
        .insert({
          vehicle_id: id,
          user_id: user.id,
          reservation_date: reservationDate,
          reservation_time: reservationTime,
          status: 'pending',
        });

      if (error) throw error;

      setMessage('Reserva creada exitosamente. Te contactaremos pronto.');
      setReservationDate('');
      setReservationTime('');
    } catch (error) {
      console.error('Error creating reservation:', error);
      setMessage('Error al crear la reserva. Inténtalo de nuevo.');
    } finally {
      setReserving(false);
    }
  };

  const handleContact = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // TODO: Implement contact functionality
    alert('Funcionalidad de contacto próximamente disponible');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-primary-600">Vehículo no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vehicle Images */}
        <div className="space-y-4">
          <div className="aspect-w-16 aspect-h-9 bg-primary-200 rounded-lg overflow-hidden">
            {vehicle.images && vehicle.images.length > 0 ? (
              <img
                src={vehicle.images[0]}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="w-full h-96 flex items-center justify-center text-primary-500 text-6xl">
                🚗
              </div>
            )}
          </div>

          {vehicle.images && vehicle.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {vehicle.images.slice(1).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${vehicle.brand} ${vehicle.model} ${index + 2}`}
                  className="w-full h-20 object-cover rounded cursor-pointer"
                />
              ))}
            </div>
          )}
        </div>

        {/* Vehicle Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-primary-900 mb-2">
              {vehicle.brand} {vehicle.model} {vehicle.year}
            </h1>
            <p className="text-2xl font-semibold text-primary-600">
              ${vehicle.price?.toLocaleString()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-primary-900">Kilometraje</h3>
              <p className="text-primary-600">{vehicle.mileage?.toLocaleString()} km</p>
            </div>
            <div>
              <h3 className="font-semibold text-primary-900">Ubicación</h3>
              <p className="text-primary-600">{vehicle.location}</p>
            </div>
            <div>
              <h3 className="font-semibold text-primary-900">Transmisión</h3>
              <p className="text-primary-600">{vehicle.transmission}</p>
            </div>
            <div>
              <h3 className="font-semibold text-primary-900">Combustible</h3>
              <p className="text-primary-600">{vehicle.fuel_type}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-primary-900 mb-2">Descripción</h3>
            <p className="text-primary-600">{vehicle.description}</p>
          </div>

          {/* Reservation Form */}
          <div className="bg-primary-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-primary-900 mb-4">
              Reservar Cita para Ver el Vehículo
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={reservationDate}
                  onChange={(e) => setReservationDate(e.target.value)}
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Hora
                </label>
                <input
                  type="time"
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                  className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <button
                onClick={handleReservation}
                disabled={reserving || !reservationDate || !reservationTime}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
              >
                {reserving ? 'Reservando...' : 'Reservar Cita'}
              </button>
            </div>
          </div>

          {/* Contact Button */}
          <button
            onClick={handleContact}
            className="w-full bg-primary-700 hover:bg-primary-800 text-white py-3 px-4 rounded-md"
          >
            Contactar Asesor
          </button>

          {message && (
            <div className={`p-4 rounded-md ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;