import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../store';
import ChickenRoad from './ChickenRoad';
import ChickenSvg from './svg/ChickenSvg';
import ExplosionSvg from './svg/ExplosionSvg';
import { Trophy } from 'lucide-react';

export default function GameArea() {
  const { t } = useTranslation();
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
      <div className="absolute inset-0 pointer-events-none z-[70]">
        {/* Hit Flash */}
        {isHit && (
          <div className="absolute inset-0 z-[200] pointer-events-none animate-screen-flash-hit" />
        )}

        {/* Idle State */}
        {status === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'linear-gradient(180deg, rgba(26,27,58,0.95) 0%, rgba(139,92,246,0.15) 100%)' }}>
            <div className="text-center space-y-4 lg:space-y-3">
              <div className="relative inline-block w-24 h-24 lg:w-16 lg:h-16 drop-shadow-2xl">
                <ChickenSvg />
              </div>
              <div>
                <h2 className="text-2xl lg:text-lg font-bold bg-gradient-to-r from-brand to-action-primary bg-clip-text text-transparent tracking-tight">Chicken Cross</h2>
                <p className="text-base lg:text-[11px] text-txt-muted mt-1 lg:mt-0.5">{t('game.betToStart')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Hit State */}
        {isHit && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(180deg, rgba(255,107,107,0.08) 0%, rgba(255,107,107,0.15) 100%)' }}>
            <div className="text-center space-y-4 lg:space-y-3">
              <ExplosionSvg className="w-24 h-24 lg:w-14 lg:h-14 animate-shake mx-auto" />
              <div className="bg-danger/90 px-8 py-3 lg:px-6 lg:py-2.5 rounded-2xl border-b-4 border-[#b91c1c]">
                <p className="text-white font-black text-2xl lg:text-lg tracking-wide">{t('game.crashed')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Win State */}
        {isWin && lastResult && (
          <div className="absolute inset-0 flex items-center justify-center z-50 rounded-xl" style={{ background: 'linear-gradient(180deg, rgba(45,212,191,0.05) 0%, rgba(251,191,36,0.1) 100%)', backdropFilter: 'blur(3px)' }}>
            <div className="text-center space-y-4 lg:space-y-4">
              <div className="flex justify-center animate-bounce">
                <Trophy className="w-16 h-16 lg:w-14 lg:h-14 text-brand drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="inline-block bg-success/20 border-2 border-success/40 px-8 py-3 lg:px-6 lg:py-2.5 rounded-full shadow-[0_0_30px_rgba(45,212,191,0.4)] animate-pop">
                  <p className="text-success font-black text-5xl lg:text-4xl font-mono tracking-tight">+${lastResult.profit.toFixed(2)}</p>
                </div>
                <div className="inline-block bg-brand/20 border border-brand/40 px-4 py-1.5 lg:px-3 lg:py-1 rounded-full opacity-90 animate-pop" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                  <p className="text-brand font-bold text-2xl lg:text-xl font-mono">{lastResult.multiplier.toFixed(2)}×</p>
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
