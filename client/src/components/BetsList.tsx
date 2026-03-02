import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function BetsList() {
  const feed = useSelector((state: RootState) => state.game.feed);

  return (
    <div className="bg-casino-card border border-casino-border rounded-xl p-3 sm:p-4">
      <h3 className="text-gray-400 text-xs sm:text-sm font-bold mb-2 sm:mb-3">
        Activity Feed
      </h3>

      {feed.length === 0 ? (
        <p className="text-gray-600 text-xs sm:text-sm text-center py-4">
          No activity yet
        </p>
      ) : (
        <div className="space-y-1.5 max-h-[280px] sm:max-h-[350px] overflow-y-auto scrollbar-thin">
          {feed.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs sm:text-sm transition-colors ${
                entry.type === 'win'
                  ? 'bg-green-900/10 border border-green-500/20'
                  : 'bg-red-900/10 border border-red-500/20'
              } ${entry.id === feed[0]?.id ? 'animate-fade-in' : ''}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span>{entry.type === 'win' ? '💰' : '💥'}</span>
                <span className="text-white truncate max-w-[80px] sm:max-w-[120px]">
                  {entry.username}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {entry.type === 'win' ? (
                  <>
                    <span className="text-casino-green font-bold font-mono">
                      {entry.multiplier?.toFixed(2)}x
                    </span>
                    <span className="text-green-400 text-[10px] sm:text-xs">
                      +${entry.profit?.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-casino-accent">
                    Lane {entry.lane}
                  </span>
                )}

                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  entry.difficulty === 1 ? 'bg-green-900/40 text-green-400' :
                  entry.difficulty === 2 ? 'bg-yellow-900/40 text-yellow-400' :
                  entry.difficulty === 3 ? 'bg-orange-900/40 text-orange-400' :
                  'bg-red-900/40 text-red-400'
                }`}>
                  {entry.difficulty}🚗
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
