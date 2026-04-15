import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import AdminConfig from './AdminConfig';
import UserManagement from './UserManagement';
import SubjectManagement from './SubjectManagement';
import AdminAnnouncements from './AdminAnnouncements';
import AdminOverview from './AdminOverview';
import { colors, layout, buttons } from '../../theme';

export default function AdminDashboard() {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const links = [
    ['Overview', '/admin'],
    ['Config', '/admin/config'],
    ['Users', '/admin/users'],
    ['Subjects', '/admin/subjects'],
    ['Announcements', '/admin/announcements'],
  ];
  return (
    <div style={layout.shell}>
      <nav style={layout.sidebar}>
        <h3 style={{ color: colors.textSoft, marginBottom: 8, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Admin Panel</h3>
        <p style={{ fontWeight: 700, marginBottom: 28, fontSize: 15 }}>{user?.name}</p>
        {links.map(([label, path]) => (
          <Link key={path} to={path} style={{ display: 'block', color: colors.text, padding: '10px 0', textDecoration: 'none', fontSize: 14 }}>{label}</Link>
        ))}
        <button onClick={() => { logout(); navigate('/login'); }} style={{ ...buttons.secondary, marginTop: 40, width: '100%', color: colors.textSoft }}>Logout</button>
      </nav>
      <main style={layout.main}>
        <Routes>
          <Route index element={<AdminOverview />} />
          <Route path="config" element={<AdminConfig />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="subjects" element={<SubjectManagement />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
        </Routes>
      </main>
    </div>
  );
}
