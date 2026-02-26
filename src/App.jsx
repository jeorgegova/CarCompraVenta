import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Helmet } from 'react-helmet-async'
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Notification from './components/Notification';
import Breadcrumb from './components/Breadcrumb';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VehicleDetail from './pages/VehicleDetail';
import UserAccount from './pages/UserAccount';
import BuyerChats from './pages/BuyerChats';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EmailVerification from './pages/EmailVerification';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import CookieBanner from './components/CookieBanner';
import Footer from './components/Footer';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';
import TermsOfServiceModal from './components/TermsOfServiceModal';
import { useState, useEffect, useRef } from 'react';

const AppContent = () => {
  const { notification, clearNotification } = useAuth();
  const location = useLocation();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isWhatsAppCollapsed, setIsWhatsAppCollapsed] = useState(false);
  const footerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsWhatsAppCollapsed(entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.1, // Trigger when 10% of footer is visible
      }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  // Generate breadcrumb items based on current route
  const getBreadcrumbItems = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);

    if (pathSegments.length === 0) return [];

    const items = [{ label: 'Inicio', path: '/' }];

    if (pathSegments[0] === 'account') {
      items.push({ label: 'Mi Cuenta' });
    } else if (pathSegments[0] === 'seller') {
      items.push({ label: 'Panel Vendedor' });
    } else if (pathSegments[0] === 'admin') {
      items.push({ label: 'Panel Administrador' });
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();
  const showBreadcrumb = breadcrumbItems.length > 1; // Only show if there's more than just "Inicio"

  return (
    <div className="min-h-screen bg-gray-50">
      <CookieBanner />
      <Navbar />
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={clearNotification}
        />
      )}
      {showBreadcrumb && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      )}
      {showBreadcrumb && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": breadcrumbItems.map((item, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: item.label,
                item: item.path ? `${window.location.origin}${item.path}` : window.location.href,
              })),
            })}
          </script>
        </Helmet>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/vehicles/:id" element={<VehicleDetail />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute allowedRoles={['buyer', 'seller']}>
              <UserAccount />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chats"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <BuyerChats />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/*"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      <div ref={footerRef}>
        <Footer
          onOpenPrivacy={() => setShowPrivacyModal(true)}
          onOpenTerms={() => setShowTermsModal(true)}
        />
      </div>
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
      <TermsOfServiceModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/573006205493?text=Hola,%20requiero%20un%20servicio%20en%20tr%C3%A1nsito.%20%C2%BOMe%20pueden%20ayudar?"
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed bottom-4 left-4 z-50 flex items-center gap-2 p-2.5 bg-gray-800 hover:bg-gray-700 rounded-full shadow-lg hover:shadow-lg hover:scale-105 transition-all duration-500 ease-in-out ${isWhatsAppCollapsed ? 'max-w-[44px] overflow-hidden' : 'max-w-[300px] px-4'
          }`}
        aria-label="Contactar por WhatsApp"
      >
        <div className="relative flex-shrink-0">
          <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
          </svg>
          <span className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping"></span>
        </div>

        <div className={`text-white text-xs font-medium leading-tight whitespace-nowrap transition-all duration-500 ${isWhatsAppCollapsed ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'
          }`}>
          <div>¿Servicio en tránsito?</div>
          <div className="font-bold">Nosotros te ayudamos</div>
        </div>
      </a>
    </div>
  );
};

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
