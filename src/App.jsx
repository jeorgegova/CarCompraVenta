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

const AppContent = () => {
  const { notification, clearNotification } = useAuth();
  const location = useLocation();

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
