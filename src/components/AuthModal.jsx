import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, Mail, Lock, User, Phone, CreditCard, ChevronRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import PrivacyPolicyModal from './PrivacyPolicyModal';

const AuthModal = ({ mode, onClose, onSwitchMode }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    documentId: '',
    role: 'buyer',
    acceptPolicy: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { signUp, signIn, resetPassword } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (mode === 'register' && formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (mode === 'register' && !formData.acceptPolicy) {
      setError('Debes aceptar la política de tratamiento de datos personales');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        await signIn(formData.email, formData.password);
        onClose();
      } else if (mode === 'forgotPassword') {
        await resetPassword(formData.email);
        setResetSent(true);
      } else {
        const userData = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          document_id: formData.documentId,
          role: formData.role,
        };
        await signUp(formData.email, formData.password, userData);
        setShowSuccess(true);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess || resetSent) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 text-center animate-in zoom-in-95 duration-500">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-3xl bg-slate-50 mb-6">
            {resetSent ? (
              <Mail className="h-10 w-10 text-slate-900" />
            ) : (
              <ShieldCheck className="h-10 w-10 text-slate-900" />
            )}
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
            {resetSent ? 'Correo enviado' : '¡Registro Exitoso!'}
          </h2>
          <p className="text-gray-500 font-medium mb-8 leading-relaxed">
            {resetSent
              ? 'Hemos enviado un enlace de recuperación a tu correo electrónico. Por favor, revisa tu bandeja de entrada.'
              : 'Por favor, verifica tu correo electrónico para completar el registro y activar tu cuenta.'}
          </p>
          <button
            onClick={() => {
              setShowSuccess(false);
              setResetSent(false);
              onClose();
            }}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl"
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-500 ease-out">
          {/* Header */}
          <div className="relative p-8 pb-4 text-center">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-gray-400 hover:text-gray-600 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="inline-flex p-3 bg-slate-50 rounded-2xl mb-4">
              <ShieldCheck className="w-8 h-8 text-slate-900" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {mode === 'login' ? 'Bienvenido de nuevo' : mode === 'forgotPassword' ? 'Recuperar contraseña' : 'Crea tu cuenta'}
            </h2>
            <p className="text-gray-500 mt-2 text-sm font-medium">
              {mode === 'login'
                ? 'Ingresa tus credenciales para continuar'
                : mode === 'forgotPassword'
                  ? 'Te enviaremos un enlace de recuperación'
                  : 'Únete a la mejor plataforma de gestión vehicular'}
            </p>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto px-8 pb-8 pt-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-300">
                  {error}
                </div>
              )}

              {mode === 'register' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-slate-900 transition-colors" />
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-slate-900 outline-none transition-all duration-200 text-sm font-medium"
                        placeholder="Nombre"
                      />
                    </div>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-slate-900 transition-colors" />
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-slate-900 outline-none transition-all duration-200 text-sm font-medium"
                        placeholder="Apellido"
                      />
                    </div>
                  </div>

                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-slate-900 transition-colors" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-slate-900 outline-none transition-all duration-200 text-sm font-medium"
                      placeholder="Teléfono"
                    />
                  </div>

                  <div className="relative group">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-slate-900 transition-colors" />
                    <input
                      type="text"
                      name="documentId"
                      required
                      value={formData.documentId}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-slate-900 outline-none transition-all duration-200 text-sm font-medium"
                      placeholder="Documento de Identidad"
                    />
                  </div>

                  <div className="relative group">
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 bg-slate-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-slate-900 outline-none transition-all duration-200 text-sm font-bold text-gray-700 appearance-none cursor-pointer"
                    >
                      <option value="buyer">Soy Comprador</option>
                      <option value="seller">Soy Vendedor</option>
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                  </div>
                </div>
              )}

              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-slate-900 transition-colors" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-slate-900 outline-none transition-all duration-200 text-sm font-medium"
                  placeholder="Correo electrónico"
                />
              </div>

              {mode !== 'forgotPassword' && (
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-slate-900 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-slate-900 outline-none transition-all duration-200 text-sm font-medium"
                    placeholder="Contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-900 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {mode === 'login' && (
                <div className="flex justify-end px-1 mt-[-1rem]">
                  <button
                    type="button"
                    onClick={() => onSwitchMode('forgotPassword')}
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

              {mode === 'register' && (
                <div className="relative group animate-in slide-in-from-top-2 duration-300">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-slate-900 transition-colors" />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-slate-900 outline-none transition-all duration-200 text-sm font-medium"
                    placeholder="Confirmar contraseña"
                  />
                </div>
              )}

              {mode === 'register' && (
                <div className="flex items-start gap-3 p-1">
                  <div className="relative flex items-center h-5 mt-0.5">
                    <input
                      type="checkbox"
                      name="acceptPolicy"
                      id="acceptPolicyModal"
                      required
                      className="w-5 h-5 text-slate-900 border-gray-300 rounded-lg focus:ring-slate-900 transition-all cursor-pointer"
                      checked={formData.acceptPolicy}
                      onChange={handleChange}
                    />
                  </div>
                  <label htmlFor="acceptPolicyModal" className="text-[11px] sm:text-xs text-gray-500 leading-relaxed font-medium">
                    Acepto la{' '}
                    <button
                      type="button"
                      className="text-slate-900 font-bold hover:underline"
                      onClick={() => setShowPrivacyModal(true)}
                    >
                      política de tratamiento de datos personales
                    </button>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-4 rounded-[1.25rem] font-bold text-sm hover:bg-black transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {mode === 'login' ? 'Conectando...' : mode === 'forgotPassword' ? 'Enviando...' : 'Creando cuenta...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {mode === 'login' ? 'Iniciar Sesión' : mode === 'forgotPassword' ? 'Enviar enlace' : 'Registrarme ahora'}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => onSwitchMode(mode === 'login' || mode === 'forgotPassword' ? 'register' : 'login')}
                className="text-sm font-bold text-gray-500 hover:text-slate-900 transition-colors inline-flex items-center gap-1 group"
              >
                {mode === 'login' || mode === 'forgotPassword' ? (
                  <>¿No tienes cuenta? <span className="text-slate-900 group-hover:underline">Regístrate gratis</span></>
                ) : (
                  <>¿Ya tienes cuenta? <span className="text-slate-900 group-hover:underline">Inicia sesión</span></>
                )}
              </button>

              {mode === 'forgotPassword' && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => onSwitchMode('login')}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Regresar al inicio de sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </>
  );
};

export default AuthModal;