import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setCredentials } from '../store/authSlice';
import { UserPlus, AlertCircle } from 'lucide-react';
import ChickenSvg from '../components/svg/ChickenSvg';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error al registrarse'); return; }
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
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto mb-4 sm:mb-6 animate-bounce-slow">
            <ChickenSvg />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-brand to-action-primary bg-clip-text text-transparent">Chicken Cross</h1>
          <p className="text-sm sm:text-base md:text-lg text-txt-muted mt-2 sm:mt-3">Crea tu cuenta</p>
        </div>

        {/* Card */}
        <div className="game-panel p-5 sm:p-7 md:p-10">
          {error && (
            <div className="flex items-center gap-3 bg-danger/10 border border-danger/20 rounded-xl px-5 py-4 mb-6">
              <AlertCircle size={22} className="text-danger shrink-0" />
              <p className="text-danger text-base font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm sm:text-base font-medium text-txt-muted mb-2 sm:mb-2.5 block">Nombre de usuario</label>
              <input
                type="text" value={username} onChange={e => setUsername(e.target.value)}
                className="w-full bg-[#2f3070] border-2 border-[#3d3f7a]/50 focus:border-action-primary/50 rounded-xl px-4 py-3 sm:px-5 sm:py-4 text-white text-base sm:text-lg outline-none transition-colors placeholder:text-txt-dim/40 focus:shadow-[0_0_12px_rgba(163,230,53,0.15)]"
                placeholder="Elige un nombre de usuario" required minLength={3}
              />
            </div>
            <div>
              <label className="text-sm sm:text-base font-medium text-txt-muted mb-2 sm:mb-2.5 block">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#2f3070] border-2 border-[#3d3f7a]/50 focus:border-action-primary/50 rounded-xl px-4 py-3 sm:px-5 sm:py-4 text-white text-base sm:text-lg outline-none transition-colors placeholder:text-txt-dim/40 focus:shadow-[0_0_12px_rgba(163,230,53,0.15)]"
                placeholder="you@email.com" required
              />
            </div>
            <div>
              <label className="text-sm sm:text-base font-medium text-txt-muted mb-2 sm:mb-2.5 block">Contraseña</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#2f3070] border-2 border-[#3d3f7a]/50 focus:border-action-primary/50 rounded-xl px-4 py-3 sm:px-5 sm:py-4 text-white text-base sm:text-lg outline-none transition-colors placeholder:text-txt-dim/40 focus:shadow-[0_0_12px_rgba(163,230,53,0.15)]"
                placeholder="Mín. 6 caracteres" required minLength={6}
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 sm:py-4 md:py-5 rounded-2xl btn-3d-primary text-base sm:text-lg md:text-xl font-bold flex items-center justify-center gap-2 sm:gap-3"
            >
              <UserPlus size={20} />
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <p className="text-center text-txt-muted text-base mt-6 pt-6 border-t border-[#3d3f7a]/30">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-brand hover:text-brand-light font-semibold transition-colors">
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
