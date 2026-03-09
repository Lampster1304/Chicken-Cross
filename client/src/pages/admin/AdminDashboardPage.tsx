import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { adminLogout } from '../../store/adminSlice';
import { Shield, Save, LogOut, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminDashboardPage() {
  const [minBet, setMinBet] = useState('');
  const [maxBet, setMaxBet] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const admin = useSelector((state: RootState) => state.admin);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAuthError = () => {
    dispatch(adminLogout());
    navigate('/admin/login');
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings', {
          headers: { Authorization: `Bearer ${admin.accessToken}` },
        });
        if (res.status === 401 || res.status === 403) { handleAuthError(); return; }
        const data = await res.json();
        if (data.settings) {
          setMinBet(data.settings.min_bet || '1.00');
          setMaxBet(data.settings.max_bet || '500.00');
        }
      } catch {
        setError('Error al cargar configuración');
      }
    };
    fetchSettings();
  }, [admin.accessToken]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const body: Record<string, number> = {};
    if (minBet) body.minBet = parseFloat(minBet);
    if (maxBet) body.maxBet = parseFloat(maxBet);

    if (body.minBet !== undefined && (isNaN(body.minBet) || body.minBet <= 0)) {
      setError('La apuesta mínima debe ser un número positivo');
      setLoading(false);
      return;
    }
    if (body.maxBet !== undefined && (isNaN(body.maxBet) || body.maxBet <= 0)) {
      setError('La apuesta máxima debe ser un número positivo');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${admin.accessToken}`,
        },
        body: JSON.stringify(body),
      });
      if (res.status === 401 || res.status === 403) { handleAuthError(); return; }
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error al guardar'); return; }
      if (data.settings) {
        setMinBet(data.settings.min_bet || '1.00');
        setMaxBet(data.settings.max_bet || '500.00');
      }
      setSuccess('Configuración guardada exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: 'linear-gradient(180deg, #1a1b3a 0%, rgba(239,68,68,0.05) 50%, #1a1b3a 100%)' }}>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500/10 border border-red-500/30">
              <Shield size={20} className="text-red-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-red-400">Panel de Administración</h1>
              <p className="text-xs text-txt-dim">{admin.user?.email || 'Admin'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bg-surfaceHover hover:bg-bg-surfaceLight border border-[#3d3f7a]/40 text-xs text-txt-muted hover:text-red-400 transition-colors"
          >
            <LogOut size={13} />
            Cerrar Sesión
          </button>
        </div>

        {/* Settings Card */}
        <div className="game-panel p-6" style={{ borderColor: 'rgba(239,68,68,0.15)' }}>
          <h2 className="text-sm font-semibold text-txt mb-4">Límites de Apuesta</h2>

          {error && (
            <div className="flex items-center gap-2 bg-danger/10 border border-danger/20 rounded-xl px-3 py-2.5 mb-4">
              <AlertCircle size={14} className="text-danger shrink-0" />
              <p className="text-danger text-xs font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5 mb-4">
              <CheckCircle size={14} className="text-emerald-400 shrink-0" />
              <p className="text-emerald-400 text-xs font-medium">{success}</p>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-txt-muted mb-1.5 block">Apuesta Mínima ($)</label>
              <input
                type="number" value={minBet} onChange={e => setMinBet(e.target.value)}
                className="w-full bg-[#2f3070] border border-[#3d3f7a]/50 focus:border-red-500/50 rounded-xl px-3.5 py-3 text-white text-sm outline-none transition-colors placeholder:text-txt-dim/40 focus:shadow-[0_0_12px_rgba(239,68,68,0.15)]"
                min="0.01" step="0.01" required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-txt-muted mb-1.5 block">Apuesta Máxima ($)</label>
              <input
                type="number" value={maxBet} onChange={e => setMaxBet(e.target.value)}
                className="w-full bg-[#2f3070] border border-[#3d3f7a]/50 focus:border-red-500/50 rounded-xl px-3.5 py-3 text-white text-sm outline-none transition-colors placeholder:text-txt-dim/40 focus:shadow-[0_0_12px_rgba(239,68,68,0.15)]"
                min="0.01" step="0.01" required
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save size={15} />
              {loading ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
