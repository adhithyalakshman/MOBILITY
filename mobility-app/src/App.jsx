import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import LoginPage         from './pages/auth/LoginPage';
import RegisterPage      from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

import DriverDashboard   from './pages/driver/DriverDashboard';
import DriverLocationPage from './pages/driver/DriverLocationPage';
import DriverSuggestPage from './pages/driver/DriverSuggestPage';

import RiderDashboard    from './pages/rider/RiderDashboard';
import RiderRequestPage  from './pages/rider/RiderRequestPage';

import AdminDashboard    from './pages/admin/AdminDashboard';
import ProtectedRoute    from './components/common/ProtectedRoute';

function RootRedirect() {
  const { isAuthenticated, role, roleLoading } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Show a clean spinner while role is being auto-detected
  if (roleLoading || !role) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#f1f5f9', gap: '14px',
      }}>
        <div style={{
          width: 40, height: 40, border: '3px solid #e2e8f0',
          borderTopColor: '#2563eb', borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#94a3b8' }}>
          Loading your profile…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (role === 'driver') return <Navigate to="/driver/dashboard" replace />;
  if (role === 'rider')  return <Navigate to="/rider/dashboard"  replace />;
  return <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"                  element={<RootRedirect />} />
      <Route path="/login"             element={<LoginPage />} />
      <Route path="/register"          element={<RegisterPage />} />
      <Route path="/forgot-password"   element={<ForgotPasswordPage />} />

      {/* Driver */}
      <Route path="/driver/dashboard"  element={<ProtectedRoute allowedRole="driver"><DriverDashboard /></ProtectedRoute>} />
      <Route path="/driver/location"   element={<ProtectedRoute allowedRole="driver"><DriverLocationPage /></ProtectedRoute>} />
      <Route path="/driver/suggest"    element={<ProtectedRoute allowedRole="driver"><DriverSuggestPage /></ProtectedRoute>} />

      {/* Rider */}
      <Route path="/rider/dashboard"   element={<ProtectedRoute allowedRole="rider"><RiderDashboard /></ProtectedRoute>} />
      <Route path="/rider/request"     element={<ProtectedRoute allowedRole="rider"><RiderRequestPage /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard"   element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

      <Route path="*"                  element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#fff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13.5px',
              boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
            },
            success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
