import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

type FeedFilter = 'all' | 'big_wins' | 'lucky_wins';

const BIG_WIN_THRESHOLD = 100;

export default function BetsList() {
  const feed = useSelector((state: RootState) => state.game.feed);
  const [filter, setFilter] = useState<FeedFilter>('all');

  const filteredFeed = feed.filter(entry => {
    if (filter === 'all') return true;
    if (filter === 'big_wins') return entry.type === 'win' && (entry.profit ?? 0) >= BIG_WIN_THRESHOLD;
    if (filter === 'lucky_wins') return entry.type === 'win' && entry.difficulty >= 3;
    return true;
  });

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1 mb-3 px-1">
        {([
          { key: 'all' as FeedFilter, label: 'Todos' },
          { key: 'big_wins' as FeedFilter, label: 'Grandes' },
          { key: 'lucky_wins' as FeedFilter, label: 'Suerte' },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${filter === tab.key
              ? 'bg-action-primary/20 text-action-primary border border-action-primary/30'
              : 'text-txt-dim hover:text-txt-muted hover:bg-bg-surfaceHover border border-transparent'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredFeed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-txt-dim">
          <p className="text-xs">{filter === 'all' ? 'Esperando apuestas...' : 'Sin resultados'}</p>
        </div>
      ) : (
        <div className="space-y-1 max-h-[320px] overflow-y-auto">
          {filteredFeed.map((entry, i) => {
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
