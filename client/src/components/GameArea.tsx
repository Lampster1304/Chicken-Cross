import { useSelector } from 'react-redux';
import { RootState } from '../store';
import ChickenRoad from './ChickenRoad';
import ChickenSvg from './svg/ChickenSvg';
import ExplosionSvg from './svg/ExplosionSvg';

export default function GameArea() {
  const { status, activeGame, lastResult } = useSelector(
    (state: RootState) => state.game
  );

  const isActive = status === 'active';
  const isHit = status === 'hit';
  const isWin = status === 'cashed_out';

  const currentLane = activeGame?.currentLane ?? 0;
  const streakIntensity = Math.min((activeGame?.riskyLanesCrossed ?? 0) / 8, 1);

  return (
    <div
      className={`game-panel overflow-hidden relative transition-all duration-700 h-full ${isActive ? 'shadow-[0_0_50px_rgba(45,212,191,0.12)]' : ''
        } ${isHit ? 'shadow-[0_0_50px_rgba(255,107,107,0.2)]' : ''} ${isWin ? 'shadow-[0_0_50px_rgba(251,191,36,0.2)]' : ''
        }`}
    >
      <ChickenRoad />

      {/* Status Overlays */}
      <div className="absolute inset-0 pointer-events-none z-50">
        {/* Hit Flash */}
        {isHit && (
          <div className="absolute inset-0 z-[200] pointer-events-none animate-screen-flash-hit" />
        )}

        {/* Idle State */}
        {status === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'linear-gradient(180deg, rgba(26,27,58,0.95) 0%, rgba(139,92,246,0.15) 100%)' }}>
            <div className="text-center space-y-3">
              <div className="relative inline-block w-16 h-16 drop-shadow-2xl">
                <ChickenSvg />
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-brand to-action-primary bg-clip-text text-transparent tracking-tight">Chicken Cross</h2>
                <p className="text-[11px] text-txt-muted mt-0.5">Place a bet to start</p>
              </div>
            </div>
          </div>
        )}

        {/* Hit State */}
        {isHit && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(180deg, rgba(255,107,107,0.08) 0%, rgba(255,107,107,0.15) 100%)' }}>
            <div className="text-center space-y-3">
              <ExplosionSvg className="w-14 h-14 animate-shake mx-auto" />
              <div className="bg-danger/90 px-6 py-2.5 rounded-2xl border-b-4 border-[#b91c1c]">
                <p className="text-white font-black text-lg tracking-wide">CRASHED!</p>
              </div>
            </div>
          </div>
        )}

        {/* Win State */}
        {isWin && lastResult && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(180deg, rgba(45,212,191,0.05) 0%, rgba(251,191,36,0.1) 100%)' }}>
            <div className="text-center space-y-2">
              <div className="text-4xl">🏆</div>
              <div>
                <div className="inline-block bg-brand/20 border-2 border-brand/40 px-4 py-1 rounded-full mb-1">
                  <p className="text-xl font-bold text-brand font-mono">{lastResult.multiplier.toFixed(2)}×</p>
                </div>
                <div className="inline-block bg-success/15 border border-success/30 px-4 py-1 rounded-full mt-1">
                  <p className="text-success font-bold text-sm font-mono">+${lastResult.profit.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Colored border glow that intensifies with streak */}
      {isActive && streakIntensity > 0 && (
        <div
          className="absolute inset-0 pointer-events-none z-20 rounded-3xl"
          style={{
            boxShadow: `inset 0 0 ${30 + streakIntensity * 40}px rgba(45, 212, 191, ${0.05 + streakIntensity * 0.12})`,
          }}
        />
      )}
    </div>
  );
}
