import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GamePage from './pages/GamePage';
import FairnessPage from './pages/FairnessPage';
import LeaderboardPage from './pages/LeaderboardPage';
import VipPage from './pages/VipPage';
import AffiliatePage from './pages/AffiliatePage';
import TournamentsPage from './pages/TournamentsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const user = useSelector((state: RootState) => state.auth.user);
  if (!token || !user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/game"
        element={
          <ProtectedRoute>
            <GamePage />
          </ProtectedRoute>
        }
      />
      <Route path="/fairness" element={<FairnessPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route
        path="/vip"
        element={
          <ProtectedRoute>
            <VipPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/affiliate"
        element={
          <ProtectedRoute>
            <AffiliatePage />
          </ProtectedRoute>
        }
      />
      <Route path="/tournaments" element={<TournamentsPage />} />
      <Route path="*" element={<Navigate to="/game" replace />} />
    </Routes>
  );
}

export default App;
