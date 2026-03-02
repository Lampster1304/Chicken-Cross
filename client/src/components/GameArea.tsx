import { useSelector } from 'react-redux';
import { RootState } from '../store';
import ChickenRoad from './ChickenRoad';

export default function GameArea() {
  const { status, activeGame, lastResult } = useSelector(
    (state: RootState) => state.game
  );

  const isActive = status === 'active';
  const isHit = status === 'hit';
  const isWin = status === 'cashed_out';

  const currentLane = activeGame?.currentLane ?? 0;
  const lanesToSafeZone = currentLane > 0 ? 5 - (currentLane % 5) : 5;

  return (
    <div
      className={`glass-panel rounded-3xl overflow-hidden relative transition-all duration-700 h-full ${isActive ? 'shadow-[0_0_50px_rgba(16,185,129,0.1)]' : ''
        } ${isHit ? 'shadow-[0_0_50px_rgba(239,68,68,0.2)]' : ''} ${isWin ? 'shadow-[0_0_50px_rgba(245,158,11,0.2)]' : ''}`}
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
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-700">
            <div className="text-center space-y-4">
              <div className="relative inline-block w-16 h-16 rounded-full overflow-hidden border-4 border-white/5 bg-[#12141d] shadow-2xl">
                <img
                  src="/assets/chicken.png"
                  className="absolute max-w-none w-[200%] h-[200%] left-[0%] top-[-25%] object-contain"
                  alt="Chicken"
                />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-black text-white tracking-widest uppercase italic">Chicken Cross</h2>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Initialize Mission</p>
              </div>
            </div>
          </div>
        )}

        {/* Hit State */}
        {isHit && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-950/20 animate-in fade-in duration-300">
            <div className="text-center space-y-4">
              <div className="relative">
                <img src="/assets/fire.png" className="w-16 h-16 object-contain animate-shake" alt="Hit" />
                <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full -z-10 animate-pulse" />
              </div>
              <div className="glass-panel px-6 py-2 rounded-full border-red-500/40">
                <p className="text-red-400 font-black tracking-widest uppercase">Mission Failed</p>
              </div>
            </div>
          </div>
        )}

        {/* Win State */}
        {isWin && lastResult && (
          <div className="absolute inset-0 flex items-center justify-center bg-emerald-950/10 animate-in zoom-in-95 duration-500">
            <div className="text-center space-y-4">
              <div className="relative">
                <img src="/assets/egg.png" className="w-14 h-14 object-contain animate-glow" alt="Reward" />
                <div className="absolute inset-0 bg-yellow-400/20 blur-2xl rounded-full -z-10" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-black text-white font-mono drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  {lastResult.multiplier.toFixed(2)}x
                </p>
                <div className="inline-block glass-panel px-4 py-1 rounded-full border-emerald-500/40">
                  <p className="text-emerald-400 font-black text-sm tracking-widest">
                    +${lastResult.profit.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ambient Vignette — intensifies with streak progress */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{ boxShadow: `inset 0 0 100px rgba(0,0,0,${isActive ? Math.min(0.5 + (activeGame?.riskyLanesCrossed ?? 0) * 0.05, 0.9) : 0.5})` }}
      />
    </div>
  );
}
