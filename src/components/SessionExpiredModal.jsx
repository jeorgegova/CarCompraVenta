import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const SessionExpiredModal = ({ onClose, onLogin }) => {
  const { refreshSession } = useAuth();

  const handleRefreshSession = async () => {
    const success = await refreshSession();
    if (success) {
      onClose();
    } else {
      onLogin();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Sesión Expirada
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-gray-700 mb-6">
              Su sesión ha caducado o se ha detectado un problema de conexión con el servidor. Por favor, intente reconectarse o inicie sesión nuevamente.
            </p>
            <div className="flex flex-col space-y-2 sm:space-y-3">
              <button
                onClick={handleRefreshSession}
                className="w-full bg-blue-600 text-white py-2 sm:py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Intentar Reconectar
              </button>
              <button
                onClick={onLogin}
                className="w-full bg-gray-900 text-white py-2 sm:py-3 px-4 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Iniciar Sesión Nuevamente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal;