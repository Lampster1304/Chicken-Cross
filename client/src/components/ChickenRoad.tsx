import { useState, useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import BarrierSvg from './svg/BarrierSvg';
import CarSvg from './svg/CarSvg';
import ChickenSvg from './svg/ChickenSvg';
import ExplosionSvg from './svg/ExplosionSvg';

const CAR_COLORS = ['#ef4444', '#eab308', '#3b82f6', '#8b5cf6'];
const CAR_VARIANTS: Array<'sedan' | 'pickup' | 'taxi' | 'sports'> = ['sedan', 'pickup', 'taxi', 'sports'];

const difficultyLabels: Record<number, string> = {
  1: 'Seguro',
  2: 'Clásico',
  3: 'Arriesgado',
  4: 'Extremo',
};

const difficultyColors: Record<number, string> = {
  1: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  2: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  3: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  4: 'bg-red-500/20 text-red-400 border-red-500/30',
};

/** Simple seeded pseudo-random (deterministic per lane+index, so no flicker on re-render) */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

/** Single animated car with random pause (0.3–4.0s) between each pass.
 *  When `rushing` is true, the car accelerates (3x) and doesn't start new cycles. */
function AnimatedCar({ goingDown, carColor, speed, initialDelay, variant, rushing }: {
  goingDown: boolean; carColor: string; speed: number; initialDelay: number; variant?: 'sedan' | 'pickup' | 'taxi' | 'sports'; rushing?: boolean;
}) {
  const [cycle, setCycle] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const carRef = useRef<HTMLDivElement>(null);
  const rushingRef = useRef(false);
  rushingRef.current = !!rushing;

  // Accelerate running animation via Web Animations API
  useEffect(() => {
    if (rushing && carRef.current) {
      const anims = carRef.current.getAnimations();
      anims.forEach(a => { a.playbackRate = 3; });
    }
  }, [rushing]);

  const handleAnimationEnd = useCallback(() => {
    setIsVisible(false);
    if (rushingRef.current) return; // Car left — don't restart
    const pause = 300 + Math.random() * 3700; // 0.3s – 4.0s
    setTimeout(() => {
      if (rushingRef.current) return;
      setIsVisible(true);
      setCycle(c => c + 1);
    }, pause);
  }, []);

  const animClass = goingDown ? 'car-pass-ltr' : 'car-pass-rtl';

  if (!isVisible) return null;

  return (
    <div
      ref={carRef}
      key={cycle}
      className="absolute left-1/2 -translate-x-1/2 w-28 h-40 lg:w-20 lg:h-32 drop-shadow-lg"
      style={{
        animation: `${animClass} ${speed}s linear ${cycle === 0 ? initialDelay : 0}s forwards`,
      }}
      onAnimationEnd={handleAnimationEnd}
    >
      <CarSvg color={carColor} direction={goingDown ? 'up' : 'down'} className="animate-wobble" variant={variant} />
    </div>
  );
}

/** Decorative animated car passing through unrevealed lanes (purely cosmetic).
 *  Always 1 car per lane — higher difficulty = faster speed. */
function AnimatedCars({ laneNum, difficulty, rushing }: { laneNum: number; difficulty: number; rushing?: boolean }) {
  const goingDown = laneNum % 2 === 0;
  const carColor = CAR_COLORS[laneNum % 4];
  const variant = CAR_VARIANTS[Math.floor(seededRandom(laneNum * 31) * 4)];

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
        variant={variant}
        rushing={rushing}
      />
    </div>
  );
}

/** Road barrier + optional half-visible stopped car (railroad crossing style). */
function AnimatedBarrier({ laneNum, showCar, isJustCrossed }: { laneNum: number; showCar: boolean; isJustCrossed?: boolean }) {
  useEffect(() => {
    if (showCar && isJustCrossed) {
      const audio = new Audio('/assets/olenchic--110065.mp3');
      audio.currentTime = 4.0;
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio error:', e));

      // Stop the audio after 2.0 seconds (so it stops at 6.0s)
      setTimeout(() => {
        audio.pause();
      }, 2000);
    }
  }, [showCar, isJustCrossed]);

  const goingDown = laneNum % 2 === 0;
  const carColor = CAR_COLORS[laneNum % 4];
  const carVariant = CAR_VARIANTS[Math.floor(seededRandom(laneNum * 31) * 4)];
  const side = goingDown ? 'left' as const : 'right' as const;

  return (
    <div className="absolute inset-0 pointer-events-none z-[58] overflow-hidden">
      {/* Car brakes to a halt, half-visible at the edge (30% chance) */}
      {showCar && (
        <div
          className={`absolute w-28 h-40 lg:w-20 lg:h-32 drop-shadow-lg ${goingDown ? 'animate-car-brake-top' : 'animate-car-brake-bottom'}`}
          style={goingDown
            ? { top: 0, left: '50%' }
            : { bottom: 0, left: '50%' }
          }
        >
          <CarSvg color={carColor} direction={goingDown ? 'up' : 'down'} variant={carVariant} />
        </div>
      )}

      {/* Barrier always drops */}
      <div
        className="absolute left-[30%] -translate-x-1/2 animate-barrier-drop-down"
        style={goingDown
          ? { top: '20%' }
          : { bottom: '20%' }
        }
      >
        <div className="w-20 h-24 lg:w-16 lg:h-20 drop-shadow-lg">
          <BarrierSvg side={side} />
        </div>
      </div>
    </div>
  );
}

export default function ChickenRoad() {
  const { status, activeGame, crossingLane } = useSelector((state: RootState) => state.game);
  const [visibleLanes, setVisibleLanes] = useState(6);
  const brakingCarCache = useRef<Map<number, boolean>>(new Map());

  // Reset braking car cache on new game
  useEffect(() => {
    if (status === 'idle') brakingCarCache.current.clear();
  }, [status]);

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
    revealed: { lane: number; hasCar: boolean } | undefined;
    isNextLane: boolean;
    isChickenHere: boolean;
  }> = [];

  for (let lane = Math.max(1, viewStart + 1); lane <= viewEnd; lane++) {
    const revealed = revealedLanes.find(r => r.lane === lane);
    const isNextLane = isActive && lane === currentLane + 1;
    const isChickenHere = lane === currentLane && (isActive || isGameOver);

    lanes.push({ laneNum: lane, revealed, isNextLane, isChickenHere });
  }

  return (
    <div
      className={`relative w-full overflow-hidden transition-all duration-500 h-full min-h-[220px] bg-[#12132a] flex flex-col ${status === 'hit' || justHit ? 'animate-shake-hard bg-red-900/10' : ''}`}
    >
      {/* ─── STRUCTURED HUD BAR ─── */}
      <div className="game-hud-bar">
        <div key={activeGame?.currentMultiplier ?? 0} className="flex gap-2 items-center animate-mult-pulse">
          <div className="w-3 h-3 lg:w-2.5 lg:h-2.5 rounded-full bg-success shadow-[0_0_10px_#2dd4bf] animate-pulse" />
          <div className="flex items-center gap-2 bg-success/10 border border-success/20 rounded-full px-3 py-1.5 lg:py-1">
            <span className="text-[11px] lg:text-[8px] font-black text-success uppercase tracking-widest leading-none">MULT</span>
            <span className="text-xl lg:text-lg font-black text-success font-mono leading-none">
              {activeGame?.currentMultiplier?.toFixed(2) ?? '1.00'}x
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`hidden sm:block px-2.5 py-1 lg:px-2 lg:py-0.5 rounded-full border text-[11px] lg:text-[9px] font-bold ${difficultyColors[difficulty]}`}>
            {difficultyLabels[difficulty]}
          </div>
          <div className={`px-3 py-1.5 lg:py-1 rounded-full border-2 text-xs lg:text-[10px] font-black uppercase tracking-widest transition-all ${isActive
            ? 'border-action-primary/50 text-action-primary bg-action-primary/10'
            : status === 'hit'
              ? 'border-danger/50 text-danger bg-danger/10'
              : 'border-[#3d3f7a]/40 text-txt-dim'
            }`}>
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
              <span className="text-[8px] font-black tracking-widest text-white uppercase whitespace-nowrap">ACERA</span>
            </div>
            {currentLane === 0 && isActive && (
              <div className="relative z-20 animate-idle-bounce">
                <div className="w-20 h-20 lg:w-16 lg:h-16 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                  <ChickenSvg />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lanes — rendered as vertical columns left to right */}
        {lanes.map(({ laneNum, revealed, isNextLane, isChickenHere }) => {
          const isCrossingThisLane = crossingLane !== null && crossingLane.lane === laneNum;
          const isRevealed = !!revealed;
          const isHitLane = (status === 'hit' || justHit) && (revealed?.hasCar || (isCrossingThisLane && !crossingLane.safe));
          const goingDown = laneNum % 2 === 0;
          const carColor = CAR_COLORS[laneNum % 4];
          const carVariant = CAR_VARIANTS[Math.floor(seededRandom(laneNum * 31) * 4)];
          if (!brakingCarCache.current.has(laneNum)) {
            brakingCarCache.current.set(laneNum, Math.random() < 0.30);
          }
          const showBrakingCar = brakingCarCache.current.get(laneNum)!;

          return (
            <div
              key={laneNum}
              className={`cartoon-road-lane ${isNextLane ? 'cartoon-road-lane-active' : ''} ${isHitLane ? 'bg-red-500/20' : ''}`}
            >
              {/* Road Markings — vertical stripe */}
              <div className="road-stripe" />

              {/* Lane Designator — top of column */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-0 opacity-20">
                <span className="text-sm lg:text-xs font-black text-action-primary/60 italic">L{laneNum}</span>
              </div>

              {/* Lane Content Container */}
              <div className="relative flex-1 h-full flex items-center justify-center">

                {/* Next Multiplier Target (Manhole Cover style) */}
                {isNextLane && activeGame?.nextMultiplier && !isChickenHere && (
                  <div className="manhole-cover animate-pop z-40 cursor-pointer hover:scale-105 active:scale-95 group">
                    <span className="text-base lg:text-[10px] font-black leading-none text-white drop-shadow-md">{activeGame.nextMultiplier.toFixed(2)}x</span>
                  </div>
                )}

                {/* ─── PHASE 1: CROSSING ANIMATION ─── */}
                {isCrossingThisLane && !crossingLane.safe && (
                  <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
                    <div
                      className={`absolute left-1/2 w-28 h-40 lg:w-20 lg:h-32 drop-shadow-lg ${goingDown ? 'animate-crash-from-left' : 'animate-crash-from-right'}`}
                    >
                      <CarSvg color={carColor} direction={goingDown ? 'up' : 'down'} variant={carVariant} />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[55] animate-crash-fire">
                      <ExplosionSvg className="w-24 h-24 lg:w-20 lg:h-20 drop-shadow-[0_4px_0_rgba(255,0,0,0.4)] animate-shake-hard" />
                    </div>
                  </div>
                )}

                {/* ─── PHASE 2: REVEALED STATES ─── */}
                {isRevealed && revealed.hasCar && !isChickenHere && (
                  <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-40 lg:w-20 lg:h-32 drop-shadow-lg">
                      <CarSvg color={carColor} direction={goingDown ? 'up' : 'down'} variant={carVariant} />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[55]">
                      <ExplosionSvg className="w-24 h-24 lg:w-20 lg:h-20 drop-shadow-[0_4px_0_rgba(255,0,0,0.4)] animate-shake-hard" />
                    </div>
                  </div>
                )}


                {/* Decorative Traffic — stays during safe crossing so car accelerates out */}
                {!isRevealed && !(isCrossingThisLane && !crossingLane.safe) && (
                  <AnimatedCars laneNum={laneNum} difficulty={difficulty} rushing={isCrossingThisLane && crossingLane.safe} />
                )}

                {/* Road Barrier (always on safe lanes) */}
                {((isCrossingThisLane && crossingLane.safe) || (isRevealed && !revealed.hasCar)) && (
                  <AnimatedBarrier
                    laneNum={laneNum}
                    showCar={showBrakingCar}
                    isJustCrossed={isCrossingThisLane && crossingLane.safe}
                  />
                )}

                {/* ────── CHICKEN SPRITE ────── */}
                {isChickenHere && (() => {
                  const isSafeCrossing = isCrossingThisLane && crossingLane?.safe;
                  const chickenAnim = isSafeCrossing
                    ? 'animate-dodge'
                    : isCrossingThisLane
                      ? 'animate-hop'
                      : '';
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
                        <div className="w-20 h-20 lg:w-16 lg:h-16 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
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
