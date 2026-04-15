import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import ProfDashboard from './pages/professor/Dashboard';

function ProtectedRoute({ children, roles }) {
  const user = useStore(s => s.user);

  if (!user) return <Navigate to="/login" />;

  // 🔴 HARD BLOCK STUDENTS
  if (user.role === 'student') {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
}

export default function App() {
  const user = useStore(s => s.user);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/professor/*"
          element={
            <ProtectedRoute roles={['professor']}>
              <ProfDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <Navigate to={user ? `/${user.role}` : '/login'} />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}