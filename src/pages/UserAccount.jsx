import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'

const UserAccount = () => {
  const { user, signOut, runQuery } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
    // Set activeTab based on URL param
    const tab = searchParams.get('tab');
    if (tab === 'reservations') {
      setActiveTab('reservations');
    }
  }, [user, navigate, searchParams]);

  useEffect(() => {
    if (activeTab === 'reservations' && user) {
      fetchReservations();
    }
  }, [activeTab, user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setFormData({
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        phone: data.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    setLoadingReservations(true);
    try {
      const { data, error } = await runQuery((s) =>
        s
          .from('reservations')
          .select(`
            *,
            vehicles (
              id,
              brand,
              model,
              year,
              price,
              location,
              images
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      );

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoadingReservations(false);
    }
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-CO');
  };


  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setMessage('Perfil actualizado exitosamente');
      fetchProfile(); // Refresh profile data
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error al actualizar el perfil');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      setUpdating(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;

      setMessage('Contraseña actualizada exitosamente');
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage('Error al actualizar la contraseña');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen font-sans text-gray-900 bg-gray-50 flex justify-center items-center">
        <Helmet>
          <meta name="robots" content="noindex,nofollow" />
          <link rel="canonical" href={window.location.origin + window.location.pathname} />
        </Helmet>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-gray-50">
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={window.location.origin + window.location.pathname} />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mi Cuenta</h1>
          <p className="text-gray-600 mt-2">Gestiona tu perfil y reservas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`block w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Perfil
                </button>
                <button
                  onClick={() => setActiveTab('reservations')}
                  className={`block w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'reservations'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Reservas
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Profile Information */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Apellido
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={updating}
                        className="bg-gray-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {updating ? 'Actualizando...' : 'Actualizar Perfil'}
                      </button>
                    </form>
                  </div>

                  {/* Password Change */}
                  <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Cambiar Contraseña</h2>
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nueva Contraseña
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirmar Nueva Contraseña
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={updating}
                        className="bg-gray-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {updating ? 'Actualizando...' : 'Cambiar Contraseña'}
                      </button>
                    </form>
                  </div>

                  {message && (
                    <div className={`p-4 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
                      {message}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reservations' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Mis Reservas</h2>
                    {loadingReservations ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                      </div>
                    ) : reservations.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600">No tienes reservas realizadas.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reservations.map((reservation) => (
                          <div key={reservation.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row gap-4">
                              {/* Vehicle Image */}
                              <div className="flex-shrink-0">
                                <img
                                  src={reservation.vehicles?.images?.[0] || '/placeholder.svg'}
                                  alt={`${reservation.vehicles?.brand} ${reservation.vehicles?.model}`}
                                  className="w-24 h-24 object-cover rounded-lg"
                                />
                              </div>

                              {/* Reservation Details */}
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">
                                  {reservation.vehicles?.brand} {reservation.vehicles?.model} {reservation.vehicles?.year}
                                </h3>
                                <p className="text-gray-600 text-sm">{reservation.vehicles?.location}</p>
                                <p className="text-gray-900 font-medium">
                                  ${reservation.vehicles?.price?.toLocaleString('es-CO')}
                                </p>
                                <div className="mt-2 text-sm text-gray-600">
                                  <p>Fecha de reserva: {formatDate(reservation.reservation_date)}</p>
                                  <p>Hora: {reservation.reservation_time}</p>
                                  {reservation.notes && <p>Notas: {reservation.notes}</p>}
                                </div>
                              </div>

                              {/* Status */}
                              <div className="flex-shrink-0">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  reservation.status === 'confirmed'
                                    ? 'bg-green-100 text-green-800'
                                    : reservation.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : reservation.status === 'completed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {reservation.status === 'confirmed' ? 'Confirmada' :
                                   reservation.status === 'pending' ? 'Pendiente' :
                                   reservation.status === 'completed' ? 'Completada' : 'Cancelada'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAccount;