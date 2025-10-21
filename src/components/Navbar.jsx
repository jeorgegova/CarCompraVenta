import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const getUserRole = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setUserRole(data.role);
        }
      }
    };

    getUserRole();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-primary-800 shadow-custom border-b border-primary-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white text-2xl font-bold text-gradient hover:text-white transition duration-200">
              CarCompraVenta
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <Link
              to="/vehicles"
              className="nav-link"
            >
              Vehículos
            </Link>

            {user ? (
              <>
                {userRole === 'seller' && (
                  <Link
                    to="/seller"
                    className="nav-link"
                  >
                    Panel Vendedor
                  </Link>
                )}

                {userRole === 'admin' && (
                  <Link
                    to="/admin"
                    className="nav-link"
                  >
                    Panel Admin
                  </Link>
                )}

                <button
                  onClick={handleSignOut}
                  className="btn-outline text-sm"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="nav-link"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;