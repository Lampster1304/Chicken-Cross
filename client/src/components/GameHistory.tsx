import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface GameRecord {
  id: number;
  difficulty: number;
  bet_amount: string;
  current_lane: number;
  final_multiplier: string | null;
  profit: string | null;
  status: string;
  started_at: string;
}

export default function GameHistory() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [history, setHistory] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const gameStatus = useSelector((state: RootState) => state.game.status);

  // Reload history when a game ends
  useEffect(() => {
    if (!user) return;
    if (gameStatus === 'idle' || gameStatus === 'hit' || gameStatus === 'cashed_out') {
      setLoading(true);
      fetch(`/api/games/history?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setHistory((data.games || []).slice(0, 10)))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user, gameStatus]);

  if (!user) return null;

  return (
    <div className="bg-casino-card border border-casino-border rounded-xl p-3 sm:p-4">
      <h3 className="text-gray-400 text-xs sm:text-sm font-bold mb-2 sm:mb-3">
        Your History
      </h3>

      {loading && history.length === 0 ? (
        <p className="text-gray-600 text-xs text-center py-3">Loading...</p>
      ) : history.length === 0 ? (
        <p className="text-gray-600 text-xs sm:text-sm text-center py-4">
          No games yet
        </p>
      ) : (
        <div className="space-y-1 max-h-[200px] sm:max-h-[250px] overflow-y-auto scrollbar-thin">
          {history.map((game) => {
            const profit = game.profit ? parseFloat(game.profit) : 0;
            const isWin = game.status === 'cashed_out' || game.status === 'completed';
            const multiplier = game.final_multiplier ? parseFloat(game.final_multiplier) : null;

            return (
              <div
                key={game.id}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded text-xs ${
                  isWin ? 'bg-green-900/10' : 'bg-red-900/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${isWin ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className="text-gray-400 font-mono">#{game.id}</span>
                  <span className={`px-1 py-0.5 rounded text-[10px] font-bold ${
                    game.difficulty === 1 ? 'bg-green-900/40 text-green-400' :
                    game.difficulty === 2 ? 'bg-yellow-900/40 text-yellow-400' :
                    game.difficulty === 3 ? 'bg-orange-900/40 text-orange-400' :
                    'bg-red-900/40 text-red-400'
                  }`}>
                    {game.difficulty}🚗
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {multiplier && (
                    <span className={`font-mono font-bold ${isWin ? 'text-casino-green' : 'text-gray-500'}`}>
                      {multiplier.toFixed(2)}x
                    </span>
                  )}
                  <span className={`font-mono ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {profit >= 0 ? '+' : ''}{profit.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
