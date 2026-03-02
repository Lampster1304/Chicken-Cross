import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { RootState } from '../store';
import { logout, updateBalance } from '../store/authSlice';

export default function Navbar() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleResetBalance = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const res = await fetch('/api/dev/reset-balance', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.balance != null) {
        dispatch(updateBalance(data.balance));
      }
    } catch {}
  };

  return (
    <nav className="bg-casino-card border-b border-casino-border px-3 sm:px-4 py-2 sm:py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-5">
          <Link to="/game" className="text-lg sm:text-xl font-bold text-white whitespace-nowrap hover:text-casino-accent transition">
            Chicken Cross
          </Link>
          <div className="hidden sm:flex items-center gap-1 text-xs">
            <Link to="/leaderboard" className="text-gray-400 hover:text-white px-2 py-1 rounded transition">Top</Link>
            <Link to="/tournaments" className="text-gray-400 hover:text-white px-2 py-1 rounded transition">Torneos</Link>
            <Link to="/vip" className="text-gray-400 hover:text-casino-gold px-2 py-1 rounded transition">VIP</Link>
            <Link to="/affiliate" className="text-gray-400 hover:text-casino-green px-2 py-1 rounded transition">Afiliados</Link>
            <Link to="/fairness" className="text-gray-400 hover:text-white px-2 py-1 rounded transition">Fair</Link>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {user && (
            <>
              <div
                className="bg-casino-darker px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-casino-border cursor-pointer hover:border-casino-gold/50 transition"
                onClick={handleResetBalance}
                title="Click to reset balance to $1000"
              >
                <span className="text-casino-gold font-bold text-sm sm:text-base">
                  ${user.balance.toFixed(2)}
                </span>
              </div>
              <span className="text-gray-400 text-sm hidden md:inline">
                {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white text-xs sm:text-sm transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
