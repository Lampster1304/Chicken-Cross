import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setCredentials } from '../store/authSlice';
import { UserPlus, AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand/15 flex items-center justify-center mx-auto mb-4">
            <span className="text-brand text-2xl font-black">C</span>
          </div>
          <h1 className="text-xl font-bold text-txt">Chicken Cross</h1>
          <p className="text-sm text-txt-muted mt-1">Create your account</p>
        </div>

        {/* Card */}
        <div className="bg-surface-50 border border-surface-200/50 rounded-2xl p-6">
          {error && (
            <div className="flex items-center gap-2 bg-accent-red/10 border border-accent-red/20 rounded-xl px-3 py-2.5 mb-4">
              <AlertCircle size={14} className="text-accent-red shrink-0" />
              <p className="text-accent-red text-xs font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-txt-muted mb-1.5 block">Username</label>
              <input
                type="text" value={username} onChange={e => setUsername(e.target.value)}
                className="w-full bg-surface-100 border border-surface-300/50 focus:border-brand/50 rounded-xl px-3.5 py-3 text-txt text-sm outline-none transition-colors placeholder:text-txt-dim/40"
                placeholder="Choose a username" required minLength={3}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-txt-muted mb-1.5 block">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-surface-100 border border-surface-300/50 focus:border-brand/50 rounded-xl px-3.5 py-3 text-txt text-sm outline-none transition-colors placeholder:text-txt-dim/40"
                placeholder="you@email.com" required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-txt-muted mb-1.5 block">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-surface-100 border border-surface-300/50 focus:border-brand/50 rounded-xl px-3.5 py-3 text-txt text-sm outline-none transition-colors placeholder:text-txt-dim/40"
                placeholder="Min. 6 characters" required minLength={6}
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-brand hover:bg-brand-light text-surface font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <UserPlus size={15} />
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-txt-muted text-xs mt-4 pt-4 border-t border-surface-200/40">
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
