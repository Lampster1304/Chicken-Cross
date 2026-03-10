import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setCredentials } from '../store/authSlice';
import { LogIn, AlertCircle } from 'lucide-react';
import ChickenSvg from '../components/svg/ChickenSvg';

export default function LoginPage() {
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error al iniciar sesión'); return; }
      dispatch(setCredentials(data));
      navigate('/game');
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(180deg, #1a1b3a 0%, rgba(139,92,246,0.1) 50%, #1a1b3a 100%)' }}>
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="w-32 h-32 mx-auto mb-6 animate-bounce-slow">
            <ChickenSvg />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-brand to-action-primary bg-clip-text text-transparent">Chicken Cross</h1>
          <p className="text-lg text-txt-muted mt-3">Inicia sesión en tu cuenta</p>
        </div>

        {/* Card */}
        <div className="game-panel p-10">
          {error && (
            <div className="flex items-center gap-3 bg-danger/10 border border-danger/20 rounded-xl px-5 py-4 mb-6">
              <AlertCircle size={22} className="text-danger shrink-0" />
              <p className="text-danger text-base font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-base font-medium text-txt-muted mb-2.5 block">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#2f3070] border-2 border-[#3d3f7a]/50 focus:border-action-primary/50 rounded-xl px-5 py-4 text-white text-lg outline-none transition-colors placeholder:text-txt-dim/40 focus:shadow-[0_0_12px_rgba(163,230,53,0.15)]"
                placeholder="you@email.com" required
              />
            </div>
            <div>
              <label className="text-base font-medium text-txt-muted mb-2.5 block">Contraseña</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#2f3070] border-2 border-[#3d3f7a]/50 focus:border-action-primary/50 rounded-xl px-5 py-4 text-white text-lg outline-none transition-colors placeholder:text-txt-dim/40 focus:shadow-[0_0_12px_rgba(163,230,53,0.15)]"
                placeholder="••••••••" required
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-5 rounded-2xl btn-3d-primary text-xl font-bold flex items-center justify-center gap-3"
            >
              <LogIn size={22} />
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="text-center text-txt-muted text-base mt-6 pt-6 border-t border-[#3d3f7a]/30">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="text-brand hover:text-brand-light font-semibold transition-colors">
              Registrarse
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
