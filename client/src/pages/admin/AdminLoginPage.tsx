import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setAdminCredentials } from '../../store/adminSlice';
import { Shield, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error al iniciar sesión'); return; }
      dispatch(setAdminCredentials(data));
      navigate('/admin');
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(180deg, #1a1b3a 0%, rgba(239,68,68,0.1) 50%, #1a1b3a 100%)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-500/10 border-2 border-red-500/30">
            <Shield size={32} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-red-400">Panel de Admin</h1>
          <p className="text-sm text-txt-muted mt-1">Administración de Chicken Cross</p>
        </div>

        {/* Card */}
        <div className="game-panel p-6" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
          {error && (
            <div className="flex items-center gap-2 bg-danger/10 border border-danger/20 rounded-xl px-3 py-2.5 mb-4">
              <AlertCircle size={14} className="text-danger shrink-0" />
              <p className="text-danger text-xs font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-txt-muted mb-1.5 block">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#2f3070] border border-red-500/20 focus:border-red-500/50 rounded-xl px-3.5 py-3 text-white text-sm outline-none transition-colors placeholder:text-txt-dim/40 focus:shadow-[0_0_12px_rgba(239,68,68,0.15)]"
                placeholder="admin@email.com" required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-txt-muted mb-1.5 block">Contraseña</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#2f3070] border border-red-500/20 focus:border-red-500/50 rounded-xl px-3.5 py-3 text-white text-sm outline-none transition-colors placeholder:text-txt-dim/40 focus:shadow-[0_0_12px_rgba(239,68,68,0.15)]"
                placeholder="••••••••" required
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Shield size={15} />
              {loading ? 'Iniciando sesión...' : 'Acceso Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
