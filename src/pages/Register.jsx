import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import { Mail, Lock, User, Phone, CreditCard, ChevronRight, ShieldCheck, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    documentId: '',
    role: 'buyer', // buyer, seller, admin
    acceptPolicy: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

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

    if (!formData.acceptPolicy) {
      setError('Debes aceptar la política de tratamiento de datos personales');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const userData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        document_id: formData.documentId,
        role: formData.role,
      };

      await signUp(formData.email, formData.password, userData);
      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-slate-50 flex flex-col items-center justify-center p-4">
      <Helmet>
        <title>Crear Cuenta | Conecta Car</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="max-w-xl w-full">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 font-bold text-sm transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver al inicio
        </Link>

        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden animate-in zoom-in-95 duration-500">
          {/* Header */}
          <div className="p-8 md:p-12 pb-4 text-center">
            <div className="inline-flex p-4 bg-slate-50 rounded-2xl mb-6">
              <ShieldCheck className="w-10 h-10 text-slate-900" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              Únete a Conecta Car
            </h1>
            <p className="text-gray-500 text-lg font-medium opacity-80">
              La plataforma más confiable para tu próximo vehículo
            </p>
          </div>

          {/* Form */}
          <div className="p-8 md:p-12 pt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-sm font-bold">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-slate-900 transition-colors" />
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-slate-900 outline-none transition-all duration-200 text-sm font-medium"
                    placeholder="Tu nombre"
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
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-slate-900 outline-none transition-all duration-200 text-sm font-medium"
                    placeholder="Tu apellido"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-slate-900 transition-colors" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-slate-900 outline-none transition-all duration-200 text-sm font-medium"
                    placeholder="Tu teléfono"
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
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-slate-900 outline-none transition-all duration-200 text-sm font-medium"
                    placeholder="Documento de identidad"
                  />
                </div>
              </div>

              <div className="relative group">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-slate-900 outline-none transition-all duration-200 text-sm font-bold text-gray-700 appearance-none cursor-pointer"
                >
                  <option value="buyer">Comprador (Quiero comprar)</option>
                  <option value="seller">Vendedor (Quiero vender)</option>
                </select>
                <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rotate-90 pointer-events-none" />
              </div>

              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-slate-900 transition-colors" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-slate-900 outline-none transition-all duration-200 text-sm font-medium"
                  placeholder="tu@email.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-slate-900 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-11 pr-12 py-4 bg-slate-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-slate-900 outline-none transition-all duration-200 text-sm font-medium"
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
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-slate-900 transition-colors" />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border-transparent border-2 rounded-2xl focus:bg-white focus:border-slate-900 outline-none transition-all duration-200 text-sm font-medium"
                    placeholder="Confirmar"
                  />
                </div>
              </div>

              <div className="flex items-start gap-4 p-2">
                <div className="relative flex items-center h-6 mt-1">
                  <input
                    type="checkbox"
                    name="acceptPolicy"
                    id="acceptPolicy"
                    required
                    checked={formData.acceptPolicy}
                    onChange={handleChange}
                    className="w-5 h-5 text-slate-900 border-gray-300 rounded-lg focus:ring-slate-900 cursor-pointer"
                  />
                </div>
                <label htmlFor="acceptPolicy" className="text-sm font-medium text-gray-500 leading-relaxed">
                  Acepto la{' '}
                  <button
                    type="button"
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-slate-900 font-bold hover:underline"
                  >
                    política de tratamiento de datos personales
                  </button>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-black transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Estamos creando tu cuenta...
                  </>
                ) : (
                  <>
                    Crear mi cuenta ahora
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="text-center pt-4">
                <p className="text-gray-500 font-bold text-sm">
                  ¿Ya tienes cuenta?{' '}
                  <Link
                    to="/login"
                    className="text-slate-900 hover:underline"
                  >
                    Inicia sesión aquí
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        <p className="text-center mt-8 text-gray-400 text-xs font-medium uppercase tracking-widest">
          &copy; 2026 Conecta Car Colombia
        </p>
      </div>

      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </div>
  );
};

export default Register;