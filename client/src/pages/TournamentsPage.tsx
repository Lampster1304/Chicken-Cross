import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../store';

interface Tournament {
  id: number;
  name: string;
  type: string;
  status: 'upcoming' | 'active' | 'finished';
  prizePool: number;
  entryFee: number;
  maxPlayers: number;
  playerCount: number;
  startsAt: string;
  endsAt: string;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  bestMultiplier: number;
  totalProfit: number;
  roundsPlayed: number;
  prizeWon: number | null;
}

const statusColors: Record<string, string> = {
  active: 'bg-casino-green/20 text-casino-green',
  upcoming: 'bg-casino-accent/20 text-casino-accent',
  finished: 'bg-gray-600/20 text-gray-400',
};

export default function TournamentsPage() {
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetch('/api/tournaments')
      .then(res => res.json())
      .then(data => setTournaments(data.tournaments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadDetails = (id: number) => {
    if (selectedId === id) {
      setSelectedId(null);
      return;
    }
    setSelectedId(id);
    setLbLoading(true);
    fetch(`/api/tournaments/${id}`)
      .then(res => res.json())
      .then(data => setLeaderboard(data.leaderboard || []))
      .catch(() => setLeaderboard([]))
      .finally(() => setLbLoading(false));
  };

  const joinTournament = async (id: number) => {
    if (!token) return;
    setJoining(true);
    try {
      const res = await fetch(`/api/tournaments/${id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        // Refresh tournament list
        const updated = await fetch('/api/tournaments').then(r => r.json());
        setTournaments(updated.tournaments || []);
      } else {
        alert(data.error || 'Failed to join');
      }
    } catch {
      alert('Failed to join tournament');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-casino-dark text-white">
      <div className="bg-casino-card border-b border-casino-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold">Tournaments</h1>
          <Link to="/game" className="text-casino-accent hover:underline text-sm">
            Back to Game
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No tournaments available right now. Check back later!
          </div>
        ) : (
          tournaments.map(t => (
            <div
              key={t.id}
              className="bg-casino-card border border-casino-border rounded-xl overflow-hidden"
            >
              {/* Tournament Header */}
              <button
                onClick={() => loadDetails(t.id)}
                className="w-full p-4 text-left hover:bg-casino-darker/30 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white">{t.name}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[t.status]}`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {t.playerCount}/{t.maxPlayers} players
                      {t.entryFee > 0 && ` · $${t.entryFee.toFixed(2)} entry`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-casino-gold font-bold text-lg">
                      ${t.prizePool.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">Prize Pool</p>
                  </div>
                </div>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span>Starts: {new Date(t.startsAt).toLocaleDateString()}</span>
                  <span>Ends: {new Date(t.endsAt).toLocaleDateString()}</span>
                </div>
              </button>

              {/* Expanded Details */}
              {selectedId === t.id && (
                <div className="border-t border-casino-border">
                  {(t.status === 'active' || t.status === 'upcoming') && (
                    <div className="p-4 border-b border-casino-border">
                      <button
                        onClick={() => joinTournament(t.id)}
                        disabled={joining}
                        className="w-full bg-casino-green hover:bg-casino-green/80 disabled:opacity-50 text-white py-2 rounded-lg font-bold text-sm transition"
                      >
                        {joining ? 'Joining...' : `Join Tournament${t.entryFee > 0 ? ` ($${t.entryFee.toFixed(2)})` : ' (Free)'}`}
                      </button>
                    </div>
                  )}

                  {lbLoading ? (
                    <div className="p-4 text-center text-gray-500 text-sm">Loading leaderboard...</div>
                  ) : leaderboard.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">No entries yet.</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-500 bg-casino-darker text-xs">
                          <th className="text-left py-2 px-4">#</th>
                          <th className="text-left py-2 px-4">Player</th>
                          <th className="text-right py-2 px-4">Score</th>
                          <th className="text-right py-2 px-4">Best</th>
                          <th className="text-right py-2 px-4">Prize</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map(e => (
                          <tr key={e.rank} className="border-t border-casino-border/30">
                            <td className="py-2 px-4 font-bold text-gray-500">#{e.rank}</td>
                            <td className="py-2 px-4 text-white">{e.username}</td>
                            <td className="py-2 px-4 text-right font-mono">{e.score.toFixed(2)}</td>
                            <td className="py-2 px-4 text-right font-mono text-casino-accent">
                              {e.bestMultiplier.toFixed(2)}x
                            </td>
                            <td className="py-2 px-4 text-right font-mono text-casino-gold">
                              {e.prizeWon !== null ? `$${e.prizeWon.toFixed(2)}` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
