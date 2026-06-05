import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuthStore } from '../store/auth.store';
import ComingSoon from '../pages/ComingSoon';

// ── Implemented pages ─────────────────────────────────────────────────────────
import Home       from '../pages/Home';
import Teams      from '../pages/Teams';
import Matches    from '../pages/Matches';
import Standings  from '../pages/Standings';
import Login      from '../pages/auth/Login';
import Register   from '../pages/auth/Register';
import CaptainDashboard from '../pages/captain/Dashboard';
import AdminDashboard   from '../pages/admin/Dashboard';

// ─── Protected route wrapper ──────────────────────────────────────────────────
function ProtectedRoute({ children, roles }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // Public
      { index: true,     element: <Home /> },
      { path: 'teams',   element: <Teams /> },
      { path: 'matches', element: <Matches /> },
      { path: 'standings', element: <Standings /> },
      { path: 'bracket', element: <ComingSoon title="Tournament Bracket" /> },
      { path: 'live',    element: <ComingSoon title="Live Match" /> },
      { path: 'terms',   element: <ComingSoon title="Terms & Conditions" /> },

      // Auth
      { path: 'login',    element: <Login /> },
      { path: 'register', element: <Register /> },

      // Player invite (public token link) — Phase 2
      { path: 'join/:token', element: <ComingSoon title="Player Registration" /> },

      // Captain — protected
      {
        path: 'captain',
        children: [
          {
            path: 'dashboard',
            element: <ProtectedRoute roles={['captain']}><CaptainDashboard /></ProtectedRoute>,
          },
          {
            path: 'team',
            element: <ProtectedRoute roles={['captain']}><ComingSoon title="Team Setup" /></ProtectedRoute>,
          },
          {
            path: 'invites',
            element: <ProtectedRoute roles={['captain']}><ComingSoon title="Player Invites" /></ProtectedRoute>,
          },
          {
            path: 'payment',
            element: <ProtectedRoute roles={['captain']}><ComingSoon title="Payment" /></ProtectedRoute>,
          },
          {
            path: 'my-team',
            element: <ProtectedRoute roles={['captain']}><ComingSoon title="My Team" /></ProtectedRoute>,
          },
        ],
      },

      // Admin — protected
      {
        path: 'admin',
        children: [
          {
            index: true,
            element: <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>,
          },
          {
            path: 'teams',
            element: <ProtectedRoute roles={['admin']}><ComingSoon title="Teams Management" /></ProtectedRoute>,
          },
          {
            path: 'matches',
            element: <ProtectedRoute roles={['admin']}><ComingSoon title="Matches Management" /></ProtectedRoute>,
          },
          {
            path: 'players',
            element: <ProtectedRoute roles={['admin']}><ComingSoon title="Players Management" /></ProtectedRoute>,
          },
          {
            path: 'referees',
            element: <ProtectedRoute roles={['admin']}><ComingSoon title="Referees Management" /></ProtectedRoute>,
          },
          {
            path: 'tournament',
            element: <ProtectedRoute roles={['admin']}><ComingSoon title="Tournament Settings" /></ProtectedRoute>,
          },
          {
            path: 'reports',
            element: <ProtectedRoute roles={['admin']}><ComingSoon title="Reports" /></ProtectedRoute>,
          },
        ],
      },

      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
