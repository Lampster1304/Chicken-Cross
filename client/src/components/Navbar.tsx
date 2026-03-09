import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { RootState } from '../store';
import { logout, updateBalance } from '../store/authSlice';
import { Wallet, LogOut, Trophy, Swords, Crown, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';
import ChickenSvg from './svg/ChickenSvg';

const NAV_ITEMS = [
  { to: '/leaderboard', label: 'Clasificación', icon: Trophy },
  { to: '/tournaments', label: 'Torneos', icon: Swords },
  { to: '/vip', label: 'VIP', icon: Crown },
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
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await res.json();
      if (data.balance != null) dispatch(updateBalance(data.balance));
    } catch { }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#252660]/95 backdrop-blur-md border-b border-[#3d3f7a]/60">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="h-14 flex items-center justify-between">
          {/* Left: Logo + Links */}
          <div className="flex items-center gap-8">
            <Link to="/game" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8">
                <ChickenSvg />
              </div>
              <span className="text-sm font-bold bg-gradient-to-r from-brand to-action-primary bg-clip-text text-transparent hidden sm:block">
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${active ? 'text-action-primary bg-action-primary/15' : 'text-txt-muted hover:text-txt hover:bg-bg-surfaceHover'
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
                  className="flex items-center gap-2 border border-brand/40 bg-brand/10 hover:bg-brand/20 rounded-full px-3 py-1.5 transition-colors"
                >
                  <Wallet size={14} className="text-brand" />
                  <span className="text-sm font-semibold text-txt tabular-nums">
                    ${user.balance.toFixed(2)}
                  </span>
                </button>

                <div className="hidden md:flex items-center gap-2 pl-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand/50 to-action-secondary/50 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-white">{user.username.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-[13px] text-txt-muted font-medium max-w-[90px] truncate">{user.username}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-txt-dim hover:text-danger hover:bg-danger/10 transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut size={16} />
                </button>

                {/* Mobile menu toggle */}
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="lg:hidden p-2 rounded-full text-txt-muted hover:text-txt hover:bg-bg-surfaceHover transition-colors"
                >
                  {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileOpen && (
          <div className="lg:hidden pb-3 pt-1 border-t border-[#3d3f7a]/40 mt-1 space-y-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? 'text-action-primary bg-action-primary/15' : 'text-txt-muted hover:text-txt hover:bg-bg-surfaceHover'
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
