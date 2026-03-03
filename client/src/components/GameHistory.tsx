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
    <div className="space-y-1 max-h-[320px] overflow-y-auto">
      {history.map(game => {
        const profit = game.profit ? parseFloat(game.profit) : 0;
        const isWin = game.status === 'cashed_out' || game.status === 'completed';
        const multiplier = game.final_multiplier ? parseFloat(game.final_multiplier) : null;

        return (
          <div key={game.id} className={`flex items-center justify-between px-3 py-2 rounded-xl text-[12px] hover:bg-bg-surfaceHover transition-colors ${isWin ? 'bg-success/[0.03]' : 'bg-danger/[0.03]'}`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isWin ? 'bg-success shadow-[0_0_6px_#2dd4bf]' : 'bg-danger shadow-[0_0_6px_#ff6b6b]'}`} />
              <span className="text-txt-dim font-mono text-[10px]">#{game.id}</span>
              <DiffBadge value={game.difficulty} />
            </div>
            <div className="flex items-center gap-3">
              {multiplier && (
                <span className={`font-mono font-semibold px-1.5 py-0.5 rounded-full text-[11px] ${isWin ? 'text-brand bg-brand/10' : 'text-txt-dim'}`}>
                  {multiplier.toFixed(2)}×
                </span>
              )}
              <span className={`font-mono font-bold text-sm ${profit >= 0 ? 'text-success' : 'text-danger'}`}>
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
  return <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${c}`}>{value}</span>;
}
