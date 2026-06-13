import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuthStore } from '../store/auth.store';

// ── Public pages ───────────────────────────────────────────────────────────────
import Home              from '../pages/Home';
import Teams             from '../pages/Teams';
import TeamDetail        from '../pages/TeamDetail';
import Matches           from '../pages/Matches';
import MatchDetail       from '../pages/MatchDetail';
import Standings         from '../pages/Standings';
import TournamentBracket from '../pages/TournamentBracket';
import LiveMatch         from '../pages/LiveMatch';
import Terms             from '../pages/Terms';
import InviteForm        from '../pages/InviteForm';
import Players          from '../pages/Players';
import PostDetail       from '../pages/PostDetail';

// ── Auth pages ─────────────────────────────────────────────────────────────────
import Login    from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// ── Captain pages ──────────────────────────────────────────────────────────────
import CaptainDashboard from '../pages/captain/Dashboard';
import TeamSetup        from '../pages/captain/TeamSetup';
import PlayerInvites    from '../pages/captain/PlayerInvites';
import Payment          from '../pages/captain/Payment';
import MyTeam           from '../pages/captain/MyTeam';

// ── Admin pages ────────────────────────────────────────────────────────────────
import AdminDashboard  from '../pages/admin/Dashboard';
import TeamsAdmin      from '../pages/admin/TeamsAdmin';
import MatchesAdmin    from '../pages/admin/MatchesAdmin';
import PlayersAdmin    from '../pages/admin/PlayersAdmin';
import RefereesAdmin   from '../pages/admin/RefereesAdmin';
import TournamentAdmin from '../pages/admin/TournamentAdmin';
import ReportsAdmin    from '../pages/admin/ReportsAdmin';
import GroupDrawAdmin  from '../pages/admin/GroupDrawAdmin';
import GroupSchedule   from '../pages/admin/GroupSchedule';
import GroupDraw       from '../pages/GroupDraw';
import SponsorsAdmin   from '../pages/admin/SponsorsAdmin';
import PostsAdmin      from '../pages/admin/PostsAdmin';

// ── Protected route wrapper ───────────────────────────────────────────────────
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
      { index: true,             element: <Home /> },
      { path: 'teams',           element: <Teams /> },
      { path: 'players',         element: <Players /> },
      { path: 'teams/:id',       element: <TeamDetail /> },
      { path: 'matches',         element: <Matches /> },
      { path: 'matches/:id',     element: <MatchDetail /> },
      { path: 'standings',       element: <Standings /> },
      { path: 'bracket',         element: <TournamentBracket /> },
      { path: 'live',            element: <LiveMatch /> },
      { path: 'terms',           element: <Terms /> },
      { path: 'draw',            element: <GroupDraw /> },
      { path: 'posts/:id',       element: <PostDetail /> },

      // Auth
      { path: 'login',    element: <Login /> },
      { path: 'register', element: <Register /> },

      // Player invite (public token link)
      { path: 'join/:token', element: <InviteForm /> },

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
            element: <ProtectedRoute roles={['captain']}><TeamSetup /></ProtectedRoute>,
          },
          {
            path: 'invites',
            element: <ProtectedRoute roles={['captain']}><PlayerInvites /></ProtectedRoute>,
          },
          {
            path: 'payment',
            element: <ProtectedRoute roles={['captain']}><Payment /></ProtectedRoute>,
          },
          {
            path: 'my-team',
            element: <ProtectedRoute roles={['captain']}><MyTeam /></ProtectedRoute>,
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
            element: <ProtectedRoute roles={['admin']}><TeamsAdmin /></ProtectedRoute>,
          },
          {
            path: 'matches',
            element: <ProtectedRoute roles={['admin']}><MatchesAdmin /></ProtectedRoute>,
          },
          {
            path: 'players',
            element: <ProtectedRoute roles={['admin']}><PlayersAdmin /></ProtectedRoute>,
          },
          {
            path: 'referees',
            element: <ProtectedRoute roles={['admin']}><RefereesAdmin /></ProtectedRoute>,
          },
          {
            path: 'tournament',
            element: <ProtectedRoute roles={['admin']}><TournamentAdmin /></ProtectedRoute>,
          },
          {
            path: 'reports',
            element: <ProtectedRoute roles={['admin']}><ReportsAdmin /></ProtectedRoute>,
          },
          {
            path: 'draw',
            element: <ProtectedRoute roles={['admin']}><GroupDrawAdmin /></ProtectedRoute>,
          },
          {
            path: 'draw/schedule',
            element: <ProtectedRoute roles={['admin']}><GroupSchedule /></ProtectedRoute>,
          },
          {
            path: 'sponsors',
            element: <ProtectedRoute roles={['admin']}><SponsorsAdmin /></ProtectedRoute>,
          },
          {
            path: 'posts',
            element: <ProtectedRoute roles={['admin']}><PostsAdmin /></ProtectedRoute>,
          },
        ],
      },

      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
