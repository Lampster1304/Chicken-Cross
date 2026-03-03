import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
  { key: 'daily', label: 'Today' },
  { key: 'weekly', label: 'Week' },
  { key: 'monthly', label: 'Month' },
  { key: 'alltime', label: 'All Time' },
];

const categories: { key: Category; label: string; unit: string }[] = [
  { key: 'biggest_win', label: 'Biggest Multiplier', unit: 'x' },
  { key: 'most_won', label: 'Most Won', unit: '$' },
  { key: 'most_wagered', label: 'Most Wagered', unit: '$' },
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
  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'text-brand';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-orange-400';
    return 'text-gray-500';
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

  return (
    <div className="min-h-screen bg-surface text-white">
      <div className="bg-surface-50 border-b border-surface-200/50 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold">Leaderboard</h1>
          <Link to="/game" className="text-brand hover:underline text-sm">
            Back to Game
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Period tabs */}
        <div className="flex gap-1 bg-surface-50 rounded-lg p-1 border border-surface-200/50">
          {periods.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                period === p.key
                  ? 'bg-brand text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 bg-surface-50 rounded-lg p-1 border border-surface-200/50">
          {categories.map(c => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`flex-1 py-2 rounded-md text-xs sm:text-sm font-medium transition ${
                category === c.key
                  ? 'bg-casino-border text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-surface-50 border border-surface-200/50 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : entries.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No data for this period yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-surface-200/50 bg-surfaceer">
                  <th className="text-left py-3 px-4 w-16">Rank</th>
                  <th className="text-left py-3 px-4">Player</th>
                  <th className="text-right py-3 px-4">{currentCat.label}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr key={`${entry.userId}-${entry.rank}`} className="border-b border-surface-200/50/30 hover:bg-surfaceer/50 transition">
                    <td className={`py-3 px-4 font-bold ${getRankStyle(entry.rank)}`}>
                      {getRankEmoji(entry.rank)}
                    </td>
                    <td className="py-3 px-4 text-white font-medium">{entry.username}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-accent-green">
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
