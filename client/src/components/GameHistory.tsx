import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Loader2 } from 'lucide-react';

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

  useEffect(() => {
    if (!user) return;
    if (gameStatus === 'idle' || gameStatus === 'hit' || gameStatus === 'cashed_out') {
      setLoading(true);
      fetch(`/api/games/history?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setHistory((data.games || []).slice(0, 15)))
        .catch(() => { })
        .finally(() => setLoading(false));
    }
  }, [user, gameStatus]);

  if (!user) return null;

  if (loading && history.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={16} className="text-txt-dim animate-spin" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-txt-dim">
        <p className="text-xs">No games yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-px max-h-[320px] overflow-y-auto">
      {history.map(game => {
        const profit = game.profit ? parseFloat(game.profit) : 0;
        const isWin = game.status === 'cashed_out' || game.status === 'completed';
        const multiplier = game.final_multiplier ? parseFloat(game.final_multiplier) : null;

        return (
          <div key={game.id} className="flex items-center justify-between px-2.5 py-2 rounded-lg text-[12px] hover:bg-surface-100/80 transition-colors">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isWin ? 'bg-accent-green' : 'bg-accent-red'}`} />
              <span className="text-txt-dim font-mono text-[10px]">#{game.id}</span>
              <DiffBadge value={game.difficulty} />
            </div>
            <div className="flex items-center gap-3">
              {multiplier && (
                <span className={`font-mono font-semibold ${isWin ? 'text-accent-green' : 'text-txt-dim'}`}>
                  {multiplier.toFixed(2)}×
                </span>
              )}
              <span className={`font-mono font-semibold ${profit >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                {profit >= 0 ? '+' : ''}{profit.toFixed(2)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DiffBadge({ value }: { value: number }) {
  const c = value === 1 ? 'bg-emerald-500/15 text-emerald-400'
    : value === 2 ? 'bg-amber-500/15 text-amber-400'
      : value === 3 ? 'bg-orange-500/15 text-orange-400'
        : 'bg-red-500/15 text-red-400';
  return <span className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold ${c}`}>{value}</span>;
}
