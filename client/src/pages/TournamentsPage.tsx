import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../store';
import Navbar from '../components/Navbar';

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
  active: 'bg-success/20 text-success border border-success/30',
  upcoming: 'bg-brand/20 text-brand border border-brand/30',
  finished: 'bg-txt-dim/20 text-txt-dim border border-txt-dim/30',
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
    <div className="min-h-screen bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary text-txt">
      <Navbar />

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold">Tournaments</h1>
          <Link to="/game" className="text-brand hover:text-brand-light text-sm font-medium transition-colors">
            Back to Game
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-txt-dim">Loading...</div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-12 text-txt-dim">
            No tournaments available right now. Check back later!
          </div>
        ) : (
          tournaments.map(t => (
            <div
              key={t.id}
              className={`game-panel overflow-hidden ${
                t.status === 'active' ? 'border-success/30' : t.status === 'upcoming' ? 'border-brand/30' : ''
              }`}
            >
              {/* Tournament Header */}
              <button
                onClick={() => loadDetails(t.id)}
                className="w-full p-4 text-left hover:bg-bg-surfaceHover/30 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-txt">{t.name}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[t.status]}`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs text-txt-dim">
                      {t.playerCount}/{t.maxPlayers} players
                      {t.entryFee > 0 && ` · $${t.entryFee.toFixed(2)} entry`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-brand font-bold text-lg">
                      ${t.prizePool.toFixed(2)}
                    </p>
                    <p className="text-xs text-txt-dim">Prize Pool</p>
                  </div>
                </div>
                <div className="flex gap-4 mt-2 text-xs text-txt-dim">
                  <span>Starts: {new Date(t.startsAt).toLocaleDateString()}</span>
                  <span>Ends: {new Date(t.endsAt).toLocaleDateString()}</span>
                </div>
              </button>

              {/* Expanded Details */}
              {selectedId === t.id && (
                <div className="border-t border-[#3d3f7a]/40">
                  {(t.status === 'active' || t.status === 'upcoming') && (
                    <div className="p-4 border-b border-[#3d3f7a]/40">
                      <button
                        onClick={() => joinTournament(t.id)}
                        disabled={joining}
                        className="w-full py-2.5 rounded-2xl btn-3d-primary text-sm"
                      >
                        {joining ? 'Joining...' : `Join Tournament${t.entryFee > 0 ? ` ($${t.entryFee.toFixed(2)})` : ' (Free)'}`}
                      </button>
                    </div>
                  )}

                  {lbLoading ? (
                    <div className="p-4 text-center text-txt-dim text-sm">Loading leaderboard...</div>
                  ) : leaderboard.length === 0 ? (
                    <div className="p-4 text-center text-txt-dim text-sm">No entries yet.</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-txt-dim border-b border-[#3d3f7a]/30 text-xs">
                          <th className="text-left py-2 px-4">#</th>
                          <th className="text-left py-2 px-4">Player</th>
                          <th className="text-right py-2 px-4">Score</th>
                          <th className="text-right py-2 px-4">Best</th>
                          <th className="text-right py-2 px-4">Prize</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map(e => (
                          <tr key={e.rank} className="border-t border-[#3d3f7a]/20 hover:bg-bg-surfaceHover transition-colors">
                            <td className="py-2 px-4 font-bold text-txt-dim">#{e.rank}</td>
                            <td className="py-2 px-4 text-txt">{e.username}</td>
                            <td className="py-2 px-4 text-right font-mono">{e.score.toFixed(2)}</td>
                            <td className="py-2 px-4 text-right font-mono text-brand">
                              {e.bestMultiplier.toFixed(2)}x
                            </td>
                            <td className="py-2 px-4 text-right font-mono text-brand">
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
