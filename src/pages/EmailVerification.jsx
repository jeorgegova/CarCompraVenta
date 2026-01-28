import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState('Verificando tu cuenta...');
  const [type, setType] = useState('loading');

  useEffect(() => {
    const verifyEmail = async () => {
      const token_hash = searchParams.get('token_hash');
      const verifyType = searchParams.get('type') || 'signup';

      if (!token_hash) {
        setStatus('Enlace inválido o incompleto');
        setType('error');
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: verifyType,
        });

        if (error) {
          console.error('verifyOtp error:', error);

          let message = 'Ocurrió un error inesperado';

          if (error.message?.includes('invalid') || error.status === 403) {
            message = 'Este enlace ya fue utilizado o ha expirado';
          } else if (error.message?.includes('expired')) {
            message = 'El enlace ha caducado. Solicita uno nuevo';
          } else {
            message = error.message || 'Error al verificar';
          }

          setStatus(message);
          setType('error');
          return;
        }

        // Éxito
        if (verifyType === 'recovery') {
          setStatus('Enlace válido. Redirigiendo para restablecer contraseña...');
          setType('success');
          navigate('/reset-password');
        } else {
          setStatus('¡Cuenta verificada exitosamente!');
          setType('success');
          setTimeout(() => navigate('/', { replace: true }), 2200);
        }
      } catch (err) {
        console.error(err);
        setStatus('Error inesperado durante la verificación');
        setType('error');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 overflow-hidden transition-all duration-500">
          {/* Header */}
          <div className="bg-gray-900 px-6 sm:px-8 py-10 text-white text-center">
            <h1 className="text-3xl font-bold tracking-tight">ConectaCar</h1>
            <p className="mt-2 text-blue-100/90 text-sm font-medium">
              {type === 'recovery' ? 'Restablecimiento de contraseña' : 'Verificación de cuenta'}
            </p>
          </div>

          {/* Contenido principal */}
          <div className="p-6 sm:p-8 md:p-10 text-center">
            {type === 'loading' && (
              <div className="my-10 flex justify-center">
                <div className="w-14 h-14 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
              </div>
            )}

            {type === 'success' && (
              <div className="my-8 animate-fade-in">
                <div className="w-20 h-20 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            )}

            {type === 'error' && (
              <div className="my-8 animate-fade-in">
                <div className="w-20 h-20 mx-auto bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
            )}

            <p
              className={`
                mt-6 text-lg font-medium leading-relaxed transition-colors duration-300
                ${type === 'success' ? 'text-green-700' : ''}
                ${type === 'error' ? 'text-red-700' : 'text-gray-700'}
              `}
            >
              {status}
            </p>

            {type === 'success' && (
              <p className="mt-4 text-sm text-gray-500">
                Redirigiendo en unos segundos...
              </p>
            )}

            {type === 'error' && (
              <div className="mt-8">
                <button
                  onClick={() => navigate('/', { replace: true })}
                  className="
                    inline-flex items-center px-6 py-3 
                    bg-gray-800 hover:bg-gray-900 
                    text-white font-medium rounded-lg 
                    transition-all duration-300 shadow-sm
                    hover:shadow-md active:scale-98
                  "
                >
                  Volver al inicio
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer sutil */}
        <p className="mt-6 text-center text-sm text-gray-500/80">
          ConectaCar © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

// Pequeña animación de entrada (puedes moverla a tailwind.config si prefieres)
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0);   }
  }
  .animate-fade-in {
    animation: fadeIn 0.6s ease-out forwards;
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default EmailVerification; 