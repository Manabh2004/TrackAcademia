
import { useStore } from '../../store';
import { useNavigate, Link, Routes, Route } from 'react-router-dom';
import AttendanceUpload from './AttendanceUpload';
import SyllabusManager from './SyllabusManager';
import MarksEntry from './MarksEntry';
import TimetableView from './TimetableView';
import DoubtInbox from './DoubtInbox';
import { colors, layout, surface, buttons } from '../../theme';

const DEFAULT_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ProfDashboard() {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  // ✅ Download function
  const downloadSheet = async (subjectId, year, branch, section) => {
    try {
      const token = localStorage.getItem('token');

      const url = `${DEFAULT_API_URL}/reports/semester-sheet/${subjectId}?year=${year}&branch=${branch}&section=${section}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to download');
      }

      const blob = await res.blob();

      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `attendance_${subjectId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert('Download failed');
    }
  };

  return (
    <div style={layout.shell}>
      {/* Sidebar */}
      <nav style={layout.sidebar}>
        <h3 style={{ color: colors.textSoft, marginBottom: 24 }}>
          Professor
        </h3>

        <p style={{ fontWeight: 600, marginBottom: 24 }}>
          {user?.name}
        </p>

        {[
          ['Attendance', '/professor/attendance'],
          ['Syllabus', '/professor/syllabus'],
          ['Marks', '/professor/marks'],
          ['Timetable', '/professor/timetable'],
          ['Doubts', '/professor/doubts'],
        ].map(([label, path]) => (
          <Link
            key={path}
            to={path}
            style={{
              display: 'block',
              color: colors.text,
              padding: '8px 0',
              textDecoration: 'none',
            }}
          >
            {label}
          </Link>
        ))}

        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          style={{ ...buttons.secondary, marginTop: 40, color: colors.textSoft }}
        >
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <main style={layout.main}>
        
        {/* ✅ Test Download Button */}
        <button
          onClick={() => {}}
          style={{
            display: 'none',
            marginBottom: 20,
            padding: '10px 16px',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          Download Attendance Sheet
        </button>

        <Routes>
          <Route path="attendance" element={<AttendanceUpload />} />
          <Route path="syllabus" element={<SyllabusManager />} />
          <Route path="marks" element={<MarksEntry />} />
          <Route path="timetable" element={<TimetableView />} />
          <Route path="doubts" element={<DoubtInbox />} />
          <Route
            path="*"
            element={(
              <div style={{ ...surface.card, maxWidth: 760 }}>
                <h2 style={{ marginTop: 0, marginBottom: 8, color: colors.text }}>Welcome, {user?.name}</h2>
                <p style={{ color: colors.textSoft, lineHeight: 1.7 }}>
                  Use the sidebar to manage attendance, syllabus progress, timetable updates, marks,
                  and student doubts for your assigned classes.
                </p>
              </div>
            )}
          />
        </Routes>
      </main>
    </div>
  );
}
