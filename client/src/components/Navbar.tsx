import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RootState } from '../store';
import { logout, updateBalance } from '../store/authSlice';
import { Wallet, LogOut } from 'lucide-react';
import ChickenSvg from './svg/ChickenSvg';
import { LanguageSwitcher } from './LanguageSwitcher';

export default function Navbar() {
  const { t } = useTranslation();
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


          </div>

          {/* Right: Language Switcher + Balance + User + Logout */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {user && (
              <>
                <button
                  onClick={handleResetBalance}
                  title={t('nav.resetBalance')}
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
                  title={t('nav.logout')}
                >
                  <LogOut size={16} />
                </button>

              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
