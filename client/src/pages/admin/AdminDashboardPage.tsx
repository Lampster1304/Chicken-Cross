import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { adminLogout } from '../../store/adminSlice';
import { Shield, Save, LogOut, AlertCircle, CheckCircle, TrendingUp, Wallet, DollarSign, Gauge, Users, Calendar } from 'lucide-react';

export default function AdminDashboardPage() {
  const [minBet, setMinBet] = useState('');
  const [maxBet, setMaxBet] = useState('');
  const [difficulty, setDifficulty] = useState('1');
  const [stats, setStats] = useState({
    totalWagered: 0, totalWon: 0, totalProfit: 0,
    todayWagered: 0, todayWon: 0, todayProfit: 0,
    connectedUsers: 0, activeGames: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mult1, setMult1] = useState('1.05');
  const [mult2, setMult2] = useState('1.10');
  const [mult3, setMult3] = useState('1.20');
  const [mult4, setMult4] = useState('1.45');
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
          setDifficulty(data.settings.difficulty || '1');
          setMult1(data.settings.mult_1 || '1.05');
          setMult2(data.settings.mult_2 || '1.10');
          setMult3(data.settings.mult_3 || '1.20');
          setMult4(data.settings.mult_4 || '1.45');
        }
      } catch {
        setError('Error al cargar configuración');
      }
    };

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${admin.accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch { }
    };

    fetchSettings();
    fetchStats();
  }, [admin.accessToken]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const body: Record<string, number> = {};
    if (minBet) body.minBet = parseFloat(minBet);
    if (maxBet) body.maxBet = parseFloat(maxBet);
    if (difficulty) body.difficulty = parseInt(difficulty);
    if (mult1) body.mult1 = parseFloat(mult1);
    if (mult2) body.mult2 = parseFloat(mult2);
    if (mult3) body.mult3 = parseFloat(mult3);
    if (mult4) body.mult4 = parseFloat(mult4);

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
        setDifficulty(data.settings.difficulty || '1');
        setMult1(data.settings.mult_1 || '1.05');
        setMult2(data.settings.mult_2 || '1.10');
        setMult3(data.settings.mult_3 || '1.20');
        setMult4(data.settings.mult_4 || '1.45');
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
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
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

        {/* Stats Section */}
        <div className="space-y-4">
          {/* Live Activity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="game-panel p-4 flex flex-col items-center text-center border-orange-500/20 bg-orange-500/5">
              <Users size={16} className="text-orange-400 mb-2" />
              <p className="text-[10px] uppercase tracking-wider text-orange-400 font-bold">Usuarios Online</p>
              <p className="text-xl font-bold text-txt">{stats.connectedUsers}</p>
            </div>
            <div className="game-panel p-4 flex flex-col items-center text-center border-brand/20 bg-brand/5">
              <Gauge size={16} className="text-brand mb-2" />
              <p className="text-[10px] uppercase tracking-wider text-brand font-bold">Partidas Activas</p>
              <p className="text-xl font-bold text-txt">{stats.activeGames}</p>
            </div>
          </div>

          {/* Daily Stats */}
          <div className="game-panel p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={14} className="text-txt-dim" />
              <h3 className="text-xs font-bold text-txt-dim uppercase tracking-wider">Actividad de Hoy</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#1e1f4b]/50 rounded-xl p-3 text-center">
                <p className="text-[9px] uppercase text-txt-dim font-bold mb-1">Apostado Hoy</p>
                <p className="text-base font-bold text-txt font-mono">${stats.todayWagered.toFixed(2)}</p>
              </div>
              <div className="bg-[#1e1f4b]/50 rounded-xl p-3 text-center">
                <p className="text-[9px] uppercase text-txt-dim font-bold mb-1">Pagado Hoy</p>
                <p className="text-base font-bold text-txt font-mono">${stats.todayWon.toFixed(2)}</p>
              </div>
              <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
                <p className="text-[9px] uppercase text-emerald-400 font-bold mb-1">Ganancia Hoy</p>
                <p className="text-base font-bold text-emerald-400 font-mono">${stats.todayProfit.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Historical Totals */}
          <div className="game-panel p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={14} className="text-txt-dim" />
              <h3 className="text-xs font-bold text-txt-dim uppercase tracking-wider">Totales Historicos</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#1e1f4b]/50 rounded-xl p-3 text-center">
                <p className="text-[9px] uppercase text-txt-dim font-bold mb-1">Total Apostado</p>
                <p className="text-base font-bold text-txt font-mono">${stats.totalWagered.toFixed(2)}</p>
              </div>
              <div className="bg-[#1e1f4b]/50 rounded-xl p-3 text-center">
                <p className="text-[9px] uppercase text-txt-dim font-bold mb-1">Total Pagado</p>
                <p className="text-base font-bold text-txt font-mono">${stats.totalWon.toFixed(2)}</p>
              </div>
              <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
                <p className="text-[9px] uppercase text-emerald-400 font-bold mb-1">Ganancia Neta</p>
                <p className="text-base font-bold text-emerald-400 font-mono">${stats.totalProfit.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Card */}
        <div className="game-panel p-6" style={{ borderColor: 'rgba(239,68,68,0.15)' }}>
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#3d3f7a]/40">
            <Shield size={16} className="text-red-400" />
            <h2 className="text-sm font-bold text-txt">Configuración del Sitio</h2>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-danger/10 border border-danger/20 rounded-xl px-3 py-2.5 mb-4 font-medium">
              <AlertCircle size={14} className="text-danger shrink-0" />
              <p className="text-danger text-xs">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5 mb-4 font-medium">
              <CheckCircle size={14} className="text-emerald-400 shrink-0" />
              <p className="text-emerald-400 text-xs">{success}</p>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-txt-muted mb-2 block uppercase tracking-tight">Apuesta Mínima ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-dim text-xs">$</span>
                  <input
                    type="number" value={minBet} onChange={e => setMinBet(e.target.value)}
                    className="w-full bg-[#2f3070] border border-[#3d3f7a]/50 focus:border-red-500/50 rounded-xl pl-7 pr-3.5 py-3 text-white text-sm outline-none transition-colors placeholder:text-txt-dim/40"
                    min="0.01" step="0.01" required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-txt-muted mb-2 block uppercase tracking-tight">Apuesta Máxima ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-dim text-xs">$</span>
                  <input
                    type="number" value={maxBet} onChange={e => setMaxBet(e.target.value)}
                    className="w-full bg-[#2f3070] border border-[#3d3f7a]/50 focus:border-red-500/50 rounded-xl pl-7 pr-3.5 py-3 text-white text-sm outline-none transition-colors placeholder:text-txt-dim/40"
                    min="0.01" step="0.01" required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-txt-muted mb-2 block uppercase tracking-tight flex items-center gap-1.5">
                <Gauge size={12} className="text-orange-400" />
                Dificultad Global
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: '1', label: 'Fácil', sub: `20% - ${mult1}x`, color: 'border-emerald-500/30 text-emerald-400', active: 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' },
                  { id: '2', label: 'Medio', sub: `40% - ${mult2}x`, color: 'border-amber-500/30 text-amber-400', active: 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' },
                  { id: '3', label: 'Difícil', sub: `60% - ${mult3}x`, color: 'border-orange-500/30 text-orange-400', active: 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)]' },
                  { id: '4', label: 'Extremo', sub: `80% - ${mult4}x`, color: 'border-red-500/30 text-red-500', active: 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' },
                ].map(d => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDifficulty(d.id)}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all active:scale-95 ${difficulty === d.id
                      ? d.active
                      : 'bg-[#2f3070] border-[#3d3f7a]/50 text-txt-dim hover:border-[#3d3f7a] hover:bg-[#363785]'
                      }`}
                  >
                    <span className="text-xs font-bold uppercase tracking-tight">{d.label}</span>
                    <span className="text-[10px] opacity-60 font-mono font-bold">{d.sub}</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-txt-dim mt-3 leading-relaxed">
                Este valor controla la densidad de tráfico en todas las partidas nuevas.
                Niveles altos aumentan exponencialmente los multiplicadores pero también el riesgo.
              </p>
            </div>

            <div className="pt-4 border-t border-[#3d3f7a]/40">
              <label className="text-xs font-bold text-txt-muted mb-4 block uppercase tracking-tight flex items-center gap-1.5">
                <TrendingUp size={12} className="text-brand" />
                Configuración de Multiplicadores (Por carril)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Fácil', val: mult1, set: setMult1 },
                  { label: 'Medio', val: mult2, set: setMult2 },
                  { label: 'Difícil', val: mult3, set: setMult3 },
                  { label: 'Extremo', val: mult4, set: setMult4 },
                ].map(m => (
                  <div key={m.label}>
                    <label className="text-[10px] text-txt-dim mb-1 block">{m.label}</label>
                    <input
                      type="number" step="0.01" value={m.val} onChange={e => m.set(e.target.value)}
                      className="w-full bg-[#1e1f4b] border border-[#3d3f7a]/50 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-brand/50"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20 active:scale-95 disabled:opacity-50"
            >
              <Save size={16} />
              {loading ? 'Guardando...' : 'Actualizar Configuración'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
