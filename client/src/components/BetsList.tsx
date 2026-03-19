import { useSelector } from 'react-redux';
import { RootState } from '../store';

const BIG_WIN_THRESHOLD = 100;

export default function BetsList() {
  const feed = useSelector((state: RootState) => state.game.feed);

  return (
    <div>
      {feed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-txt-dim">
          <p className="text-xs">Esperando apuestas...</p>
        </div>
      ) : (
        <div className="space-y-1 max-h-[320px] overflow-y-auto">
          {feed.map((entry, i) => {
            const isWin = entry.type === 'win';
            const isBigWin = isWin && (entry.profit ?? 0) >= BIG_WIN_THRESHOLD;
            return (
              <div
                key={entry.id}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-[12px] hover:bg-bg-surfaceHover transition-colors ${i === 0 ? 'animate-fade-in' : ''
                  } ${isBigWin ? 'border border-amber-500/30 bg-amber-500/5' : ''}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${isWin ? 'bg-success shadow-[0_0_6px_#2dd4bf]' : 'bg-danger shadow-[0_0_6px_#ff6b6b]'}`} />
                  <span className="text-txt/80 truncate max-w-[100px] font-medium">{entry.username}</span>
                  {entry.betAmount != null && (
                    <span className="text-txt-dim text-[10px] font-mono">${entry.betAmount.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isWin ? (
                    <div className="flex flex-col items-end leading-tight">
                      <span className={`font-bold font-mono ${isBigWin ? 'text-amber-400' : 'text-success'}`}>
                        +${entry.profit?.toFixed(2)}
                      </span>
                      <span className={`text-[10px] font-mono ${isBigWin ? 'text-amber-400/70' : 'text-success/60'}`}>
                        {entry.multiplier?.toFixed(2)}x
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end leading-tight">
                      <span className="text-danger font-bold font-mono">
                        -${entry.betAmount?.toFixed(2)}
                      </span>
                      <span className="text-danger/60 text-[10px] font-mono font-medium">
                        L{entry.lane}
                      </span>
                    </div>
                  )}
                  <DiffBadge value={entry.difficulty} />
                </div>
              </div>
            );
          })}
        </div>
      )}
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
