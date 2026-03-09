import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

type Period = 'daily' | 'weekly' | 'monthly' | 'alltime';
type Category = 'biggest_win' | 'most_won' | 'most_wagered';

interface Entry {
  rank: number;
  userId: number;
  username: string;
  value: number;
  profit?: number;
  amount?: number;
}

const periods: { key: Period; label: string }[] = [
  { key: 'daily', label: 'Hoy' },
  { key: 'weekly', label: 'Semana' },
  { key: 'monthly', label: 'Mes' },
  { key: 'alltime', label: 'Histórico' },
];

const categories: { key: Category; label: string; unit: string }[] = [
  { key: 'biggest_win', label: 'Mayor Multiplicador', unit: 'x' },
  { key: 'most_won', label: 'Más Ganado', unit: '$' },
  { key: 'most_wagered', label: 'Más Apostado', unit: '$' },
];

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('alltime');
  const [category, setCategory] = useState<Category>('biggest_win');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?period=${period}&category=${category}`)
      .then(res => res.json())
      .then(data => setEntries(data.entries || []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [period, category]);

  const currentCat = categories.find(c => c.key === category)!;
  const getRankBorder = (rank: number) => {
    if (rank === 1) return 'border-l-4 border-l-brand';
    if (rank === 2) return 'border-l-4 border-l-gray-300';
    if (rank === 3) return 'border-l-4 border-l-orange-400';
    return '';
  };
  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'text-brand';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-orange-400';
    return 'text-txt-dim';
  };
  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const formatValue = (val: number) => {
    if (currentCat.unit === 'x') return `${val.toFixed(2)}x`;
    return `$${val.toFixed(2)}`;
  };

  const getValueColor = () => {
    if (category === 'biggest_win') return 'text-brand';
    if (category === 'most_won') return 'text-success';
    return 'text-action-secondary';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary text-txt">
      <Navbar />

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold">Clasificación</h1>
          <Link to="/game" className="text-brand hover:text-brand-light text-sm font-medium transition-colors">
            Volver al Juego
          </Link>
        </div>

        {/* Period tabs */}
        <div className="flex gap-1 game-panel p-1.5">
          {periods.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                period === p.key
                  ? 'bg-action-primary text-bg-primary font-bold'
                  : 'text-txt-muted hover:text-txt hover:bg-bg-surfaceHover'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 game-panel p-1.5">
          {categories.map(c => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                category === c.key
                  ? 'bg-action-secondary text-white font-bold'
                  : 'text-txt-muted hover:text-txt hover:bg-bg-surfaceHover'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="game-panel overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-txt-dim">Cargando...</div>
          ) : entries.length === 0 ? (
            <div className="p-8 text-center text-txt-dim">Sin datos para este periodo.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-txt-dim border-b border-[#3d3f7a]/40">
                  <th className="text-left py-3 px-4 w-16">Pos.</th>
                  <th className="text-left py-3 px-4">Jugador</th>
                  <th className="text-right py-3 px-4">{currentCat.label}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr key={`${entry.userId}-${entry.rank}`} className={`border-b border-[#3d3f7a]/20 hover:bg-bg-surfaceHover transition-colors rounded-xl ${getRankBorder(entry.rank)} ${i % 2 === 0 ? 'bg-bg-surface/30' : ''}`}>
                    <td className={`py-3 px-4 font-bold ${getRankStyle(entry.rank)}`}>
                      {getRankEmoji(entry.rank)}
                    </td>
                    <td className="py-3 px-4 text-txt font-medium">{entry.username}</td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${getValueColor()}`}>
                      {formatValue(entry.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
