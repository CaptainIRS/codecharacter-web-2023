import { LoadingBars } from '@arwes/core';
import { lazy } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Home, { DisplayModal } from './pages/Home/Home';
import { useAuth } from './providers/AuthProvider';
import { CodeProvider } from './providers/CodeProvider';
import { theme } from './theme';
import { AuthStatusResponseStatusEnum as AuthStatus } from '@codecharacter-2022/client';

const Sidebar = lazy(() => import('./components/SideBar/SideBar'));
const CodeEditor = lazy(() => import('./pages/CodeEditor/CodeEditor'));
const MapDesigner = lazy(() => import('./pages/MapDesigner/MapDesigner'));
const Header = lazy(() => import('./components/Header/Header'));
const BattleTv = lazy(() => import('./pages/BattleTv/BattleTv'));
const Leaderboard = lazy(() => import('./pages/Leaderboard/Leaderboard'));
const History = lazy(() => import('./pages/History/History'));

const Dashboard = () => {
  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        borderBottom: `2px solid ${theme.color.border}`,
      }}
    >
      <Header />
      <div
        css={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          height: '100%',
          minHeight: '0',
        }}
      >
        <Sidebar />
        <CodeProvider>
          <Outlet />
        </CodeProvider>
      </div>
    </div>
  );
};

const AuthenticatedRoutes = () => {
  const { isLoggedIn, authStatus } = useAuth();

  if (isLoggedIn && authStatus === AuthStatus.Authenticated) {
    return <Outlet />;
  } else if (isLoggedIn && authStatus === AuthStatus.ProfileIncomplete) {
    return <Navigate to="/profile-incomplete" />;
  } else {
    return <Navigate to="/home" />;
  }
};

const ProfileIncompleteRoutes = () => {
  const { isLoggedIn, authStatus } = useAuth();

  if (isLoggedIn && authStatus === AuthStatus.ProfileIncomplete) {
    return <Outlet />;
  } else {
    return <Navigate to="/profile-incomplete" />;
  }
};

const UnauthenticatedRoutes = () => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Outlet />;
  } else {
    return <Navigate to="/dashboard" />;
  }
};

const RootRoutes = () => {
  const { isLoggedIn, authStatus } = useAuth();

  if (isLoggedIn && authStatus === AuthStatus.Authenticated) {
    return <Navigate to="/dashboard" />;
  } else if (isLoggedIn && authStatus === AuthStatus.ProfileIncomplete) {
    return <Navigate to="/profile-incomplete" />;
  } else {
    return <Navigate to="/home" />;
  }
};

const Router = () => {
  const { isAuthLoading } = useAuth();

  return isAuthLoading ? (
    <LoadingBars full />
  ) : (
    <Routes>
      <Route element={<UnauthenticatedRoutes />}>
        <Route
          path="/login"
          element={<Home displayModal={DisplayModal.Login} />}
        />
        <Route
          path="/register"
          element={<Home displayModal={DisplayModal.Register} />}
        />
        <Route
          path="/forgot-password"
          element={<Home displayModal={DisplayModal.ForgotPassword} />}
        />
        <Route
          path="/reset-password"
          element={<Home displayModal={DisplayModal.ResetPassword} />}
        />
        <Route
          path="/activate"
          element={<Home displayModal={DisplayModal.ActivateUser} />}
        />
      </Route>
      <Route element={<ProfileIncompleteRoutes />}>
        <Route
          path="/profile-incomplete"
          element={<Home displayModal={DisplayModal.CompleteProfile} />}
        />
      </Route>
      <Route element={<Dashboard />}>
        <Route element={<AuthenticatedRoutes />}>
          <Route path="/dashboard" element={<CodeEditor />} />
          <Route path="/map-designer" element={<MapDesigner />} />
          <Route path="/battle-tv" element={<BattleTv />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/history" element={<History />} />
        </Route>
      </Route>
      <Route path="/home" element={<Home displayModal={DisplayModal.None} />} />
      <Route path="/" element={<RootRoutes />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default Router;
