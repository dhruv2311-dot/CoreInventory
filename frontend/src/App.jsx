import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import { ActivityLoader, FullScreenLoader } from './components/GlobalLoader';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Receipts from './pages/Receipts';
import ReceiptDetail from './pages/ReceiptDetail';
import Deliveries from './pages/Deliveries';
import DeliveryDetail from './pages/DeliveryDetail';
import Stock from './pages/Stock';
import MoveHistory from './pages/MoveHistory';
import Warehouse from './pages/Warehouse';
import Locations from './pages/Locations';
import Transfers from './pages/Transfers';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  const location = useLocation();
  const [isBootLoading, setIsBootLoading] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !window.sessionStorage.getItem('app_boot_loaded');
  });
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [isNetworkLoading, setIsNetworkLoading] = useState(false);

  useEffect(() => {
    if (!isBootLoading) return undefined;

    const bootTimer = setTimeout(() => {
      setIsBootLoading(false);
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('app_boot_loaded', '1');
      }
    }, 850);

    return () => clearTimeout(bootTimer);
  }, [isBootLoading]);

  useEffect(() => {
    if (isBootLoading) return undefined;

    setIsRouteLoading(true);
    const routeTimer = setTimeout(() => {
      setIsRouteLoading(false);
    }, 320);

    return () => clearTimeout(routeTimer);
  }, [location.pathname, isBootLoading]);

  useEffect(() => {
    const handleNetworkLoading = (event) => {
      const activeRequests = Number(event.detail?.activeRequests || 0);
      setIsNetworkLoading(activeRequests > 0);
    };

    window.addEventListener('app:network-loading', handleNetworkLoading);
    return () => {
      window.removeEventListener('app:network-loading', handleNetworkLoading);
    };
  }, []);

  return (
    <>
      <FullScreenLoader visible={isBootLoading} label="Preparing your workspace" />
      <ActivityLoader
        visible={!isBootLoading && (isRouteLoading || isNetworkLoading)}
        label={isRouteLoading ? 'Opening page' : 'Syncing data'}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/receipts" element={<ProtectedRoute><Receipts /></ProtectedRoute>} />
        <Route path="/receipts/:id" element={<ProtectedRoute><ReceiptDetail /></ProtectedRoute>} />
        <Route path="/deliveries" element={<ProtectedRoute><Deliveries /></ProtectedRoute>} />
        <Route path="/deliveries/:id" element={<ProtectedRoute><DeliveryDetail /></ProtectedRoute>} />
        <Route path="/stock" element={<ProtectedRoute><Stock /></ProtectedRoute>} />
        <Route path="/transfers" element={<ProtectedRoute><Transfers /></ProtectedRoute>} />
        <Route path="/move-history" element={<ProtectedRoute><MoveHistory /></ProtectedRoute>} />
        <Route path="/warehouse" element={<ProtectedRoute><Warehouse /></ProtectedRoute>} />
        <Route path="/locations" element={<ProtectedRoute><Locations /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
