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
      if (!res.ok) { setError(data.error || 'Registration failed'); return; }
      dispatch(setCredentials(data));
      navigate('/game');
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(180deg, #1a1b3a 0%, rgba(139,92,246,0.1) 50%, #1a1b3a 100%)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 animate-bounce-slow">
            <ChickenSvg />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-brand to-action-primary bg-clip-text text-transparent">Chicken Cross</h1>
          <p className="text-sm text-txt-muted mt-1">Create your account</p>
        </div>

        {/* Card */}
        <div className="game-panel p-6">
          {error && (
            <div className="flex items-center gap-2 bg-danger/10 border border-danger/20 rounded-xl px-3 py-2.5 mb-4">
              <AlertCircle size={14} className="text-danger shrink-0" />
              <p className="text-danger text-xs font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-txt-muted mb-1.5 block">Username</label>
              <input
                type="text" value={username} onChange={e => setUsername(e.target.value)}
                className="w-full bg-[#2f3070] border border-[#3d3f7a]/50 focus:border-action-primary/50 rounded-xl px-3.5 py-3 text-white text-sm outline-none transition-colors placeholder:text-txt-dim/40 focus:shadow-[0_0_12px_rgba(163,230,53,0.15)]"
                placeholder="Choose a username" required minLength={3}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-txt-muted mb-1.5 block">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#2f3070] border border-[#3d3f7a]/50 focus:border-action-primary/50 rounded-xl px-3.5 py-3 text-white text-sm outline-none transition-colors placeholder:text-txt-dim/40 focus:shadow-[0_0_12px_rgba(163,230,53,0.15)]"
                placeholder="you@email.com" required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-txt-muted mb-1.5 block">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#2f3070] border border-[#3d3f7a]/50 focus:border-action-primary/50 rounded-xl px-3.5 py-3 text-white text-sm outline-none transition-colors placeholder:text-txt-dim/40 focus:shadow-[0_0_12px_rgba(163,230,53,0.15)]"
                placeholder="Min. 6 characters" required minLength={6}
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-2xl btn-3d-primary text-sm flex items-center justify-center gap-2"
            >
              <UserPlus size={15} />
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-txt-muted text-xs mt-4 pt-4 border-t border-[#3d3f7a]/30">
            Already have an account?{' '}
            <Link to="/login" className="text-brand hover:text-brand-light font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
