import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setCredentials } from '../store/authSlice';

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

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      dispatch(setCredentials(data));
      navigate('/game');
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-casino-dark flex items-center justify-center px-4">
      <div className="bg-casino-card border border-casino-border rounded-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">Chicken Cross</h1>
        <p className="text-gray-400 text-center mb-6">Sign in to play</p>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-casino-darker border border-casino-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-casino-accent"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-casino-darker border border-casino-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-casino-accent"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-casino-accent hover:bg-red-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-casino-accent hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
