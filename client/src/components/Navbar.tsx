import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { RootState } from '../store';
import { logout, updateBalance } from '../store/authSlice';
import { Wallet, LogOut, Trophy, Swords, Crown, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/tournaments', label: 'Torneos', icon: Swords },
  { to: '/vip', label: 'VIP', icon: Crown },
  { to: '/fairness', label: 'Fairness', icon: Shield },
];

export default function Navbar() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

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
      if (data.balance != null) dispatch(updateBalance(data.balance));
    } catch { }
  };

  return (
    <nav className="sticky top-0 z-50 bg-surface-50/90 backdrop-blur-md border-b border-surface-200/60">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="h-14 flex items-center justify-between">
          {/* Left: Logo + Links */}
          <div className="flex items-center gap-8">
            <Link to="/game" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-brand/15 flex items-center justify-center">
                <span className="text-brand text-lg font-black leading-none">C</span>
              </div>
              <span className="text-sm font-semibold text-txt hidden sm:block">
                Chicken Cross
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${active ? 'text-brand bg-brand/10' : 'text-txt-muted hover:text-txt hover:bg-surface-100'
                      }`}
                  >
                    <Icon size={14} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: Balance + User + Logout */}
          <div className="flex items-center gap-2">
            {user && (
              <>
                <button
                  onClick={handleResetBalance}
                  title="Click para resetear balance"
                  className="flex items-center gap-2 bg-surface-100 hover:bg-surface-200 border border-surface-200/80 rounded-lg px-3 py-1.5 transition-colors"
                >
                  <Wallet size={14} className="text-brand" />
                  <span className="text-sm font-semibold text-txt tabular-nums">
                    ${user.balance.toFixed(2)}
                  </span>
                </button>

                <div className="hidden md:flex items-center gap-2 pl-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand/40 to-accent-purple/40 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-white">{user.username.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-[13px] text-txt-muted font-medium max-w-[90px] truncate">{user.username}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-txt-dim hover:text-accent-red hover:bg-accent-red/10 transition-colors"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>

                {/* Mobile menu toggle */}
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="lg:hidden p-2 rounded-lg text-txt-muted hover:text-txt hover:bg-surface-100 transition-colors"
                >
                  {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileOpen && (
          <div className="lg:hidden pb-3 pt-1 border-t border-surface-200/40 mt-1 space-y-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'text-brand bg-brand/10' : 'text-txt-muted hover:text-txt hover:bg-surface-100'
                    }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
