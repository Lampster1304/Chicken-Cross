import { useState, useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import CarSvg from './svg/CarSvg';
import ChickenSvg from './svg/ChickenSvg';
import ExplosionSvg from './svg/ExplosionSvg';

const CAR_COLORS = ['#ef4444', '#eab308', '#3b82f6', '#8b5cf6'];
const SAFE_ZONE_INTERVAL = 5;

function isSafeZoneLane(lane: number): boolean {
  return lane > 0 && lane % SAFE_ZONE_INTERVAL === 0;
}

const difficultyLabels: Record<number, string> = {
  1: 'Safe',
  2: 'Classic',
  3: 'Risky',
  4: 'Hardcore',
};

/** Simple seeded pseudo-random (deterministic per lane+index, so no flicker on re-render) */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

/** Single animated car with random pause (0.3–4.0s) between each pass */
function AnimatedCar({ goingDown, carColor, speed, initialDelay, stop }: {
  goingDown: boolean; carColor: string; speed: number; initialDelay: number; stop?: boolean;
}) {
  const [cycle, setCycle] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleAnimationEnd = useCallback(() => {
    setIsVisible(false);
    const pause = 300 + Math.random() * 3700; // 0.3s – 4.0s
    setTimeout(() => {
      setIsVisible(true);
      setCycle(c => c + 1);
    }, pause);
  }, []);

  const animClass = stop
    ? (goingDown ? 'animate-emergency-brake-down' : 'animate-emergency-brake-up')
    : (goingDown ? 'car-pass-ltr' : 'car-pass-rtl');

  // If not stop-mode and not currently in an animation cycle (waiting for next pass), hide it
  if (!isVisible && !stop) return null;

  return (
    <div
      key={`${cycle}-${stop}`}
      className={`absolute left-1/2 -translate-x-1/2 w-20 h-32 drop-shadow-lg ${stop ? animClass : ''}`}
      style={{
        animation: !stop ? `${animClass} ${speed}s linear ${cycle === 0 ? initialDelay : 0}s forwards` : undefined,
      }}
      onAnimationEnd={!stop ? handleAnimationEnd : undefined}
    >
      <CarSvg color={carColor} direction={goingDown ? 'down' : 'up'} className="animate-wobble" />
    </div>
  );
}

/** Decorative animated car passing through unrevealed lanes (purely cosmetic).
 *  Always 1 car per lane — higher difficulty = faster speed. */
function AnimatedCars({ laneNum, difficulty, stop }: { laneNum: number; difficulty: number; stop?: boolean }) {
  const goingDown = laneNum % 2 === 0;
  const carColor = CAR_COLORS[laneNum % 4];

  const rand = seededRandom(laneNum * 100);
  // Synchronized with the 0.4s crash animation speed
  const speed = 0.4;
  const delay = -rand * speed;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      <AnimatedCar
        goingDown={goingDown}
        carColor={carColor}
        speed={speed}
        initialDelay={delay}
        stop={stop}
      />
    </div>
  );
}

export default function ChickenRoad() {
  const { status, activeGame, crossingLane } = useSelector((state: RootState) => state.game);
  const [visibleLanes, setVisibleLanes] = useState(6);

  // Dynamic lanes based on width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setVisibleLanes(3);
      else if (width < 1024) setVisibleLanes(4);
      else setVisibleLanes(6);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const difficulty = activeGame?.difficulty ?? 1;
  const currentLane = activeGame?.currentLane ?? 0;
  const revealedLanes = activeGame?.revealedLanes ?? [];
  const isGameOver = status === 'hit' || status === 'cashed_out';
  const isActive = status === 'active';

  // Detect "just hit" state
  const lastRevealed = revealedLanes.length > 0 ? revealedLanes[revealedLanes.length - 1] : null;
  const justHit = isActive && (
    (crossingLane !== null && !crossingLane.safe) ||
    lastRevealed?.hasCar === true
  );

  // Streak glow intensity based on risky lanes crossed
  const streakIntensity = Math.min((activeGame?.riskyLanesCrossed ?? 0) / 8, 1);

  // Determine which lanes to show in viewport using dynamic visibleLanes
  let viewStart: number;
  if (currentLane <= Math.floor(visibleLanes / 2)) {
    viewStart = 0;
  } else {
    viewStart = currentLane - Math.floor(visibleLanes / 2);
  }
  const viewEnd = viewStart + visibleLanes;

  // Build lane data from left (viewStart+1) to right (viewEnd) — columns left to right
  const lanes: Array<{
    laneNum: number;
    revealed: { lane: number; hasCar: boolean; isSafeZone: boolean } | undefined;
    safeZone: boolean;
    isNextLane: boolean;
    isChickenHere: boolean;
  }> = [];

  for (let lane = Math.max(1, viewStart + 1); lane <= viewEnd; lane++) {
    const revealed = revealedLanes.find(r => r.lane === lane);
    const safeZone = isSafeZoneLane(lane);
    const isNextLane = isActive && lane === currentLane + 1;
    const isChickenHere = lane === currentLane && (isActive || isGameOver);

    lanes.push({ laneNum: lane, revealed, safeZone, isNextLane, isChickenHere });
  }

  return (
    <div
      className={`relative w-full overflow-hidden transition-all duration-500 h-full min-h-[220px] bg-[#1a1c24] flex flex-col ${status === 'hit' || justHit ? 'animate-shake-hard bg-red-900/10' : ''}`}
    >
      {/* ─── STRUCTURED HUD BAR ─── */}
      <div className="game-hud-bar">
        <div key={activeGame?.currentMultiplier ?? 0} className="flex gap-2 items-center animate-mult-pulse">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest leading-none">Multiplier</span>
            <span className="text-sm sm:text-lg font-black text-white font-mono leading-none">
              {activeGame?.currentMultiplier?.toFixed(2) ?? '1.00'}x
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none">Hazard Level</span>
            <span className="text-[10px] font-black text-red-400 uppercase italic leading-none">{difficultyLabels[difficulty]}</span>
          </div>
          <div className={`px-3 py-1 rounded-full border-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/5' : 'border-white/10 text-gray-400'}`}>
            {status.toUpperCase().replace('_', ' ')}
          </div>
        </div>
      </div>

      <div className="flex flex-row flex-1 overflow-hidden p-2 gap-1">
        {/* Start Station — Sidewalk */}
        {viewStart <= 0 && (
          <div className="sidewalk-station">
            <div className="absolute inset-0 opacity-[0.05] pattern-dots" />
            <div className="absolute right-[-24px] top-1/2 -translate-y-1/2 z-10 opacity-20 transform rotate-[-90deg]">
              <span className="text-[8px] font-black tracking-widest text-white uppercase whitespace-nowrap">SIDEWALK</span>
            </div>
            {currentLane === 0 && isActive && (
              <div className="relative z-20 animate-idle-bounce">
                <div className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                  <ChickenSvg />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lanes — rendered as vertical columns left to right */}
        {lanes.map(({ laneNum, revealed, safeZone, isNextLane, isChickenHere }) => {
          const isCrossingThisLane = crossingLane !== null && crossingLane.lane === laneNum;
          const isRevealed = !!revealed;
          const isHitLane = (status === 'hit' || justHit) && (revealed?.hasCar || (isCrossingThisLane && !crossingLane.safe));
          const goingDown = laneNum % 2 === 0;
          const carColor = CAR_COLORS[laneNum % 4];
          const showStoppedCar = seededRandom(laneNum * 777) < 0.66;

          return (
            <div
              key={laneNum}
              className={`cartoon-road-lane ${isNextLane ? 'cartoon-road-lane-active' : ''} ${isHitLane ? 'bg-red-500/20' : ''
                } ${safeZone ? 'bg-emerald-900/10' : ''}`}
            >
              {/* Road Markings — vertical stripe */}
              {!safeZone && <div className="road-stripe" />}

              {/* Lane Designator — top of column */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-0 opacity-10">
                <span className="text-[10px] sm:text-xs font-black text-white italic">L{laneNum}</span>
              </div>

              {/* Lane Content Container */}
              <div className="relative flex-1 h-full flex items-center justify-center">

                {/* Safe Zone Visuals — borders top/bottom */}
                {safeZone && (
                  <div className="absolute inset-0 border-y-2 border-dashed border-emerald-500/20 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs opacity-30">🏁</span>
                      <span className="text-[8px] font-black tracking-[0.1em] text-emerald-500/40 uppercase" style={{ writingMode: 'vertical-rl' }}>Safe</span>
                      <span className="text-xs opacity-30">🏁</span>
                    </div>
                  </div>
                )}

                {/* Next Multiplier Target (Manhole Cover style) */}
                {isNextLane && activeGame?.nextMultiplier && !isChickenHere && (
                  <div className="manhole-cover animate-pop z-40 cursor-pointer hover:scale-105 active:scale-95 group">
                    <span className="text-[9px] sm:text-[10px] font-black leading-none text-white/90 drop-shadow-md">{activeGame.nextMultiplier.toFixed(2)}x</span>
                  </div>
                )}

                {/* ─── PHASE 1: CROSSING ANIMATION ─── */}
                {isCrossingThisLane && !crossingLane.safe && (
                  <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
                    <div
                      className={`absolute left-1/2 w-20 h-32 drop-shadow-lg ${goingDown ? 'animate-crash-from-left' : 'animate-crash-from-right'}`}
                    >
                      <CarSvg color={carColor} direction={goingDown ? 'down' : 'up'} />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[55] animate-crash-fire">
                      <ExplosionSvg className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_4px_0_rgba(255,0,0,0.4)] animate-shake-hard" />
                    </div>
                  </div>
                )}

                {/* ─── PHASE 2: REVEALED STATES ─── */}
                {isRevealed && revealed.hasCar && !isChickenHere && (
                  <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-32 drop-shadow-lg">
                      <CarSvg color={carColor} direction={goingDown ? 'down' : 'up'} />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[55]">
                      <ExplosionSvg className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_4px_0_rgba(255,0,0,0.4)] animate-shake-hard" />
                    </div>
                  </div>
                )}

                {/* Checkmark bubble */}
                {isRevealed && !revealed.hasCar && (
                  <div className="relative z-50 animate-pop">
                    <div className="multiplier-bubble-cartoon bg-emerald-500 border-emerald-700 text-white shadow-[#00000033]">
                      <span className="text-lg font-black">✓</span>
                    </div>
                  </div>
                )}

                {/* Decorative Traffic (only if not revealed and not crossing) */}
                {!isRevealed && !isCrossingThisLane && !safeZone && (
                  <AnimatedCars laneNum={laneNum} difficulty={difficulty} />
                )}

                {/* Emergency Brake Car (if safe) */}
                {((isCrossingThisLane && crossingLane.safe) || (isRevealed && !revealed.hasCar)) && !safeZone && showStoppedCar && (
                  <AnimatedCars laneNum={laneNum} difficulty={difficulty} stop={true} />
                )}

                {/* ────── CHICKEN SPRITE ────── */}
                {isChickenHere && (() => {
                  const chickenAnim = (isCrossingThisLane && crossingLane?.safe && !crossingLane?.isSafeZone)
                    ? 'animate-dodge'
                    : 'animate-hop';
                  const isHit = status === 'hit' || justHit;

                  return (
                    <>
                      <div
                        className={`absolute z-[60] transition-all duration-300 ${isHit ? 'animate-squish' : chickenAnim}`}
                        style={{
                          filter: !isHit && streakIntensity > 0
                            ? `drop-shadow(0 0 ${8 + streakIntensity * 16}px rgba(16, 185, 129, ${0.3 + streakIntensity * 0.5}))`
                            : undefined,
                        }}
                      >
                        <div className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                          <ChickenSvg hit={isHit} />
                        </div>
                      </div>
                      {/* Feather particles on hit */}
                      {isHit && (
                        <div className="absolute z-[61] pointer-events-none">
                          {[1, 2, 3, 4].map((n) => (
                            <svg
                              key={n}
                              className={`absolute animate-feather-${n}`}
                              width="10"
                              height="6"
                              viewBox="0 0 10 6"
                              style={{ top: '-4px', left: '-2px' }}
                            >
                              <ellipse cx="5" cy="3" rx="5" ry="3" fill={n % 2 === 0 ? '#f5f5f5' : '#fbbf24'} opacity="0.9" />
                            </svg>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
