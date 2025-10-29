import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';
import AuthModal from './AuthModal';
import SessionExpiredModal from './SessionExpiredModal';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      if (user) {
        console.log('Usuario: ',user);
        
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('role, first_name, last_name')
            .eq('id', user.id)
            .single();

          if (error) {
            console.log('error..', error);
            
            if (error.message.includes('JWT') || error.message.includes('session') || error.code === 'PGRST301') {
              setShowSessionExpiredModal(true);
              return;
            }
            throw error;
          }

          console.log('Data..', data);
          
          if (data) {
            setUserRole(data.role);
            setUserName(`${data.first_name} ${data.last_name}`.trim() || user.email);

            // Fetch notifications for buyers
            if (data.role === 'buyer') {
              const { data: messages, error: messagesError } = await supabase
                .from('messages')
                .select(`
                  *,
                  sender:profiles!messages_sender_id_fkey(first_name, last_name),
                  receiver:profiles!messages_receiver_id_fkey(first_name, last_name),
                  vehicle:vehicles(brand, model, year)
                `)
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

              if (messagesError) {
                if (messagesError.message.includes('JWT') || messagesError.message.includes('session') || messagesError.code === 'PGRST301') {
                  setShowSessionExpiredModal(true);
                  return;
                }
                throw messagesError;
              }

              // Group messages by vehicle_id, keeping only the latest message per vehicle
              const vehicleMap = new Map();
              messages?.forEach(message => {
                if (!vehicleMap.has(message.vehicle_id)) {
                  vehicleMap.set(message.vehicle_id, message);
                }
              });
              const groupedNotifications = Array.from(vehicleMap.values()).slice(0, 5); // Limit to 5 vehicles

              setNotifications(groupedNotifications);
              const unreadCount = groupedNotifications.filter(msg => msg.receiver_id === user.id && !msg.is_read).length;
              setUnreadNotifications(unreadCount);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          if (error.message.includes('JWT') || error.message.includes('session') || error.code === 'PGRST301') {
            setShowSessionExpiredModal(true);
          }
        }
      } else {
        setUserRole(null);
        setUserName('');
        setUnreadNotifications(0);
        setNotifications([]);
      }
    };

    getUserData();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark all messages for this vehicle as read
      const { error: updateError } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('vehicle_id', notification.vehicle_id)
        .eq('receiver_id', user.id);

      if (updateError) {
        if (updateError.message.includes('JWT') || updateError.message.includes('session') || updateError.code === 'PGRST301') {
          setShowSessionExpiredModal(true);
          return;
        }
        throw updateError;
      }

      // Refresh notifications
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(first_name, last_name),
          receiver:profiles!messages_receiver_id_fkey(first_name, last_name),
          vehicle:vehicles(brand, model, year)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (messagesError) {
        if (messagesError.message.includes('JWT') || messagesError.message.includes('session') || messagesError.code === 'PGRST301') {
          setShowSessionExpiredModal(true);
          return;
        }
        throw messagesError;
      }

      // Group messages by vehicle_id again
      const vehicleMap = new Map();
      messages?.forEach(message => {
        if (!vehicleMap.has(message.vehicle_id)) {
          vehicleMap.set(message.vehicle_id, message);
        }
      });
      const groupedNotifications = Array.from(vehicleMap.values()).slice(0, 5);

      setNotifications(groupedNotifications);
      setUnreadNotifications(groupedNotifications.filter(msg => msg.receiver_id === user.id && !msg.is_read).length);
      setShowNotifications(false);

      // Navigate to chats page
      navigate('/chats');
    } catch (error) {
      console.error('Error handling notification click:', error);
      if (error.message.includes('JWT') || error.message.includes('session') || error.code === 'PGRST301') {
        setShowSessionExpiredModal(true);
      }
    }
  };

  return (
    <>
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-gray-900 text-2xl font-bold hover:text-gray-700 transition duration-200">
                CarCompraVenta
              </Link>
            </div>

            <div className="flex items-center space-x-8">

              {user ? (
                <>
                  <span className="text-gray-700 text-sm font-medium">
                    Bienvenido, {userName}
                  </span>

                  {(userRole === 'buyer' || userRole === 'seller') && (
                    <Link
                      to="/account"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition duration-200 relative group"
                    >
                      Mi Cuenta
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-200"></span>
                    </Link>
                  )}

                  {userRole === 'buyer' && (
                    <div className="relative">
                      <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition duration-200 relative group"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {unreadNotifications > 0 && (
                          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[20px] h-5">
                            {unreadNotifications > 99 ? '99+' : unreadNotifications}
                          </span>
                        )}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-200"></span>
                      </button>

                      {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                          <div className="p-4 border-b border-gray-200">
                            <h3 className="text-sm font-medium text-gray-900">Mensajes</h3>
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="p-4 text-center text-gray-500 text-sm">
                                No tienes mensajes
                              </div>
                            ) : (
                              notifications.map((notification) => (
                                <div
                                  key={notification.vehicle_id}
                                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notification.is_read ? 'bg-blue-50' : ''}`}
                                  onClick={() => handleNotificationClick(notification)}
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {notification.sender_id === user.id
                                          ? `Tú → ${notification.receiver?.first_name} ${notification.receiver?.last_name}`
                                          : `${notification.sender?.first_name} ${notification.sender?.last_name}`
                                        }
                                      </p>
                                      <p className="text-sm text-gray-600 truncate">
                                        {notification.vehicle ? `${notification.vehicle.brand} ${notification.vehicle.model} ${notification.vehicle.year}` : 'Mensaje general'}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {new Date(notification.created_at).toLocaleDateString('es-ES')}
                                      </p>
                                    </div>
                                    {!notification.is_read && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                                        Nuevo
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                          <div className="p-3 border-t border-gray-200 text-center">
                            <Link
                              to="/chats"
                              className="text-sm text-gray-600 hover:text-gray-900"
                              onClick={() => setShowNotifications(false)}
                            >
                              Ver todas las conversaciones
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {userRole === 'seller' && (
                    <Link
                      to="/seller"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition duration-200 relative group"
                    >
                      Panel Vendedor
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-200"></span>
                    </Link>
                  )}

                  {userRole === 'admin' && (
                    <>
                      <Link
                        to="/admin"
                        className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition duration-200 relative group"
                      >
                        Panel Admin
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-200"></span>
                      </Link>
                      <Link
                        to="/admin/chats"
                        className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition duration-200 relative group"
                      >
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Chats
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-200"></span>
                      </Link>
                    </>
                  )}

                  <div className="h-6 w-px bg-gray-300"></div>

                  <button
                    onClick={handleSignOut}
                    className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:border-gray-400 transition duration-200"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setShowAuthModal(true);
                    }}
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition duration-200 relative group"
                  >
                    Iniciar Sesión
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-200"></span>
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setShowAuthModal(true);
                    }}
                    className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transform hover:scale-105 transition duration-200 shadow-md"
                  >
                    Registrarse
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={(newMode) => setAuthMode(newMode)}
        />
      )}

      {/* Session Expired Modal */}
      {showSessionExpiredModal && (
        <SessionExpiredModal
          onClose={() => setShowSessionExpiredModal(false)}
          onLogin={() => {
            setShowSessionExpiredModal(false);
            setAuthMode('login');
            setShowAuthModal(true);
          }}
        />
      )}
    </>
  );
};

export default Navbar;