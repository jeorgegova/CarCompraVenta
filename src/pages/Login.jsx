import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet-async'

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('login'); // 'login' or 'forgotPassword'
  const [resetSent, setResetSent] = useState(false);
  const { signIn, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        await signIn(email, password);
        navigate('/');
      } else {
        await resetPassword(email);
        setResetSent(true);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-gray-50">
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={window.location.origin + window.location.pathname} />
      </Helmet>
      <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {mode === 'login' ? 'Iniciar Sesión' : 'Recuperar Contraseña'}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {mode === 'login'
                ? 'Accede a tu cuenta para continuar'
                : 'Te enviaremos un enlace de recuperación'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            {resetSent ? (
              <div className="text-center py-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Correo enviado</h3>
                <p className="text-gray-600 mb-6">Hemos enviado un enlace de recuperación a <strong>{email}</strong>.</p>
                <button
                  onClick={() => {
                    setResetSent(false);
                    setMode('login');
                  }}
                  className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Regresar al inicio
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {mode === 'login' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Contraseña
                      </label>
                      <button
                        type="button"
                        onClick={() => setMode('forgotPassword')}
                        className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
                      placeholder="Tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {mode === 'login' ? 'Iniciando sesión...' : 'Enviando enlace...'}
                    </span>
                  ) : (
                    mode === 'login' ? 'Iniciar Sesión' : 'Enviar Enlace'
                  )}
                </button>

                {mode === 'forgotPassword' && (
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      Regresar al inicio de sesión
                    </button>
                  </div>
                )}

                <div className="text-center">
                  <p className="text-gray-600 text-sm">
                    {mode === 'login' ? (
                      <>
                        ¿No tienes cuenta?{' '}
                        <Link
                          to="/register"
                          className="font-medium text-gray-900 hover:text-gray-700 transition-colors"
                        >
                          Regístrate aquí
                        </Link>
                      </>
                    ) : (
                      <>
                        ¿Ya recordaste tu contraseña?{' '}
                        <button
                          type="button"
                          onClick={() => setMode('login')}
                          className="font-medium text-gray-900 hover:text-gray-700 transition-colors"
                        >
                          Inicia sesión
                        </button>
                      </>
                    )}
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;