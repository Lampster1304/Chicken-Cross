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

  return (
    <div
      className={`bg-surface-50 border border-surface-200/50 rounded-2xl overflow-hidden relative transition-all duration-700 h-full ${isActive ? 'shadow-[0_0_40px_rgba(52,211,153,0.08)]' : ''
        } ${isHit ? 'shadow-[0_0_40px_rgba(248,113,113,0.12)]' : ''} ${isWin ? 'shadow-[0_0_40px_rgba(240,180,41,0.12)]' : ''
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
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px]">
            <div className="text-center space-y-3">
              <div className="relative inline-block w-14 h-14 drop-shadow-2xl">
                <ChickenSvg />
              </div>
              <div>
                <h2 className="text-base font-bold text-txt tracking-tight">Chicken Cross</h2>
                <p className="text-[11px] text-txt-muted mt-0.5">Place a bet to start</p>
              </div>
            </div>
          </div>
        )}

        {/* Hit State */}
        {isHit && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-950/20">
            <div className="text-center space-y-3">
              <ExplosionSvg className="w-14 h-14 animate-shake mx-auto" />
              <div className="bg-surface-50/90 backdrop-blur-sm px-5 py-2 rounded-full border border-accent-red/30">
                <p className="text-accent-red font-bold text-sm">Crashed!</p>
              </div>
            </div>
          </div>
        )}

        {/* Win State */}
        {isWin && lastResult && (
          <div className="absolute inset-0 flex items-center justify-center bg-emerald-950/10">
            <div className="text-center space-y-2">
              <div className="relative">
                <svg viewBox="0 0 48 64" className="w-12 h-12 mx-auto" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="egg-grad" cx="40%" cy="35%" r="60%">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="40%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#d97706" />
                    </radialGradient>
                  </defs>
                  <ellipse cx="24" cy="36" rx="18" ry="24" fill="url(#egg-grad)" />
                  <ellipse cx="18" cy="28" rx="6" ry="10" fill="white" opacity="0.25" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-txt font-mono">{lastResult.multiplier.toFixed(2)}×</p>
                <div className="inline-block bg-surface-50/90 backdrop-blur-sm px-4 py-1 rounded-full border border-accent-green/30 mt-1">
                  <p className="text-accent-green font-bold text-sm font-mono">+${lastResult.profit.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{ boxShadow: `inset 0 0 80px rgba(0,0,0,${isActive ? Math.min(0.4 + (activeGame?.riskyLanesCrossed ?? 0) * 0.04, 0.8) : 0.4})` }}
      />
    </div>
  );
}
