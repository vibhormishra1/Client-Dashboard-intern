import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import { useSocket } from './socket/useSocket';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MainLayout from './layouts/MainLayout';
import api from './api/axios';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { setAccessToken, login, logout } = useAuthStore();
  useSocket();

  useEffect(() => {
    // Attempt to restore session via refresh token cookie
    api.post('/auth/refresh').then(res => {
      setAccessToken(res.data.data.accessToken);
      api.get('/auth/me').then(userRes => {
        login(userRes.data.data.user, res.data.data.accessToken);
      });
    }).catch(() => {
      logout();
    });
  }, [setAccessToken, login, logout]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
