import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { getSocket } from '../hooks/useGameSocket';
import {
  resetGame, setLoading, gameError, clearError,
} from '../store/gameSlice';
import { Zap, TrendingUp, ArrowRight, RotateCcw, AlertCircle, Lock, X } from 'lucide-react';

export default function BetPanel() {
  const [betAmount, setBetAmount] = useState('10.00');
  const [autoCashOut, setAutoCashOut] = useState('');
  const [showAutoCashOutMobile, setShowAutoCashOutMobile] = useState(false);
  const [betLimits, setBetLimits] = useState({ minBet: 1, maxBet: 500, difficulty: 1 });

  const dispatch = useDispatch();
  const { status, activeGame, lastResult, isLoading, error, crossingLane } = useSelector((state: RootState) => state.game);
  const user = useSelector((state: RootState) => state.auth.user);

  const isIdle = status === 'idle';
  const isActive = status === 'active';
  const isGameOver = status === 'hit' || status === 'cashed_out';

  const actionLockRef = useRef(false);

  useEffect(() => {
    if (!isLoading) {
      actionLockRef.current = false;
    } else {
      const timer = setTimeout(() => {
        actionLockRef.current = false;
        dispatch(setLoading(false));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, dispatch]);

  useEffect(() => {
    if (status !== 'active') actionLockRef.current = false;
  }, [status]);

  // Safety: release lock when crossing animation finishes
  const prevCrossingRef = useRef(crossingLane);
  useEffect(() => {
    if (prevCrossingRef.current && !crossingLane) {
      actionLockRef.current = false;
    }
    prevCrossingRef.current = crossingLane;
  }, [crossingLane]);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => dispatch(clearError()), 4000);
    return () => clearTimeout(timer);
  }, [error, dispatch]);

  useEffect(() => {
    fetch('/api/settings/bet-limits')
      .then(res => res.json())
      .then(data => {
        if (data.minBet !== undefined && data.maxBet !== undefined) {
          setBetLimits({
            minBet: data.minBet,
            maxBet: data.maxBet,
            difficulty: data.difficulty ?? 1
          });
        }
      })
      .catch(() => { });
  }, []);

  const emitStartGame = useCallback((amount: number) => {
    const socket = getSocket();
    if (!socket || !socket.connected) { dispatch(gameError('Sin conexión')); return; }
    if (isNaN(amount) || amount <= 0) { dispatch(gameError('Apuesta inválida')); return; }
    if (amount < betLimits.minBet) { dispatch(gameError(`La apuesta mínima es $${betLimits.minBet.toFixed(2)}`)); return; }
    if (amount > betLimits.maxBet) { dispatch(gameError(`La apuesta máxima es $${betLimits.maxBet.toFixed(2)}`)); return; }
    if (user && amount > user.balance) { dispatch(gameError('Saldo insuficiente')); return; }
    const cashOutTarget = autoCashOut ? parseFloat(autoCashOut) : undefined;
    if (cashOutTarget !== undefined && cashOutTarget <= amount) { dispatch(gameError(`Auto cobro debe ser mayor a la apuesta ($${amount.toFixed(2)})`)); return; }
    const autoCashOutAt = cashOutTarget !== undefined ? cashOutTarget / amount : undefined;
    actionLockRef.current = true;
    dispatch(clearError());
    dispatch(setLoading(true));
    socket.emit('game:start', { amount, difficulty: betLimits.difficulty, autoCashOutAt });
  }, [autoCashOut, user, betLimits, dispatch]);

  const handleStartGame = useCallback(() => {
    if (actionLockRef.current) return;
    const amount = parseFloat(betAmount);
    emitStartGame(amount);
  }, [betAmount, emitStartGame]);

  const handleCross = useCallback(() => {
    if (actionLockRef.current) return;
    const socket = getSocket();
    if (!socket || !socket.connected) { dispatch(gameError('Sin conexión')); return; }
    actionLockRef.current = true;
    dispatch(setLoading(true));
    socket.emit('game:cross');
  }, [dispatch]);

  const handleCashOut = useCallback(() => {
    if (actionLockRef.current) return;
    const socket = getSocket();
    if (!socket || !socket.connected) { dispatch(gameError('Sin conexión')); return; }
    actionLockRef.current = true;
    dispatch(setLoading(true));
    socket.emit('game:cashout');
  }, [dispatch]);

  const handlePlayAgain = useCallback(() => {
    dispatch(resetGame());
  }, [dispatch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        if (isIdle) handleStartGame();
        else if (isActive) handleCross();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isIdle, isActive, handleStartGame, handleCross]);

  // Auto-cross: when autoCashOutAt is set, automatically cross lanes
  const autoCrossTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isActive || !activeGame?.autoCashOutAt || isLoading) return;

    autoCrossTimerRef.current = setTimeout(() => {
      autoCrossTimerRef.current = null;
      const socket = getSocket();
      if (!socket || !socket.connected) return;
      actionLockRef.current = true;
      dispatch(setLoading(true));
      socket.emit('game:cross');
    }, 400);

    return () => {
      if (autoCrossTimerRef.current) {
        clearTimeout(autoCrossTimerRef.current);
        autoCrossTimerRef.current = null;
      }
    };
  }, [isActive, activeGame?.autoCashOutAt, activeGame?.currentLane, isLoading, dispatch]);

  const adjustBet = (factor: number) => {
    const current = parseFloat(betAmount) || 0;
    setBetAmount(Math.max(0.01, current * factor).toFixed(2));
  };

  const currentMultiplier = activeGame?.currentMultiplier ?? 1;
  const nextMultiplier = activeGame?.nextMultiplier;
  const payout = activeGame ? Math.floor(activeGame.betAmount * currentMultiplier * 100) / 100 : 0;
  const nextLane = activeGame ? activeGame.currentLane + 1 : 0;
  const isAutoPlaying = isActive && !!activeGame?.autoCashOutAt;

  return (
    <div className="game-panel p-3 sm:p-4 md:p-5 flex flex-col gap-4 sm:gap-5 lg:gap-4">
      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-danger/10 border border-danger/20 rounded-xl px-3 py-2.5">
          <AlertCircle size={14} className="text-danger shrink-0" />
          <p className="text-danger text-xs font-medium">{error}</p>
        </div>
      )}

      {/* ── IDLE ── */}
      {isIdle && (
        <>
          {/* Bet Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm lg:text-xs font-medium text-txt-muted">Monto de Apuesta</span>
              <span className="text-xs lg:text-[11px] text-txt-dim font-mono">${user?.balance.toFixed(2) ?? '0.00'}</span>
            </div>
            <div className="relative mb-2">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-txt-dim text-base lg:text-sm">$</span>
              <input
                type="number"
                value={betAmount}
                onChange={e => setBetAmount(e.target.value)}
                className="w-full bg-[#2f3070] border border-[#3d3f7a]/50 focus:border-action-primary/50 rounded-xl py-3.5 lg:py-3 pl-8 pr-3 text-white text-xl lg:text-lg font-semibold outline-none transition-colors focus:shadow-[0_0_12px_rgba(163,230,53,0.15)]"
                min={betLimits.minBet} step="0.01"
              />
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: '½', fn: () => adjustBet(0.5) },
                { label: '2x', fn: () => adjustBet(2) },
                { label: 'Mín', fn: () => setBetAmount(betLimits.minBet.toFixed(2)) },
                { label: 'Max', fn: () => setBetAmount(Math.min(user?.balance ?? betLimits.maxBet, betLimits.maxBet).toFixed(2)) },
              ].map(b => (
                <button key={b.label} onClick={b.fn} className="py-2 lg:py-1.5 bg-bg-surfaceHover hover:bg-bg-surfaceLight border border-[#3d3f7a]/40 rounded-full text-sm lg:text-[11px] font-semibold text-txt-muted hover:text-action-primary transition-colors">
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Auto Cash-Out */}
          <div>
            <span className="text-xs font-medium text-txt-muted mb-1.5 block">
              Auto Cobro
              <span className="text-[10px] text-txt-dim ml-1">opcional</span>
            </span>

            {!showAutoCashOutMobile ? (
              <button
                onClick={() => setShowAutoCashOutMobile(true)}
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 border border-orange-400/50 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(249,115,22,0.2)] active:scale-95"
              >
                <TrendingUp size={14} />
                Establecer Auto Cobro
              </button>
            ) : null}

            <div className={`relative ${!showAutoCashOutMobile ? 'hidden' : 'block'}`}>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-dim text-sm">$</span>
              <input
                type="number" value={autoCashOut} onChange={e => setAutoCashOut(e.target.value)}
                placeholder={`e.g. ${(betLimits.minBet * 2).toFixed(2)}`}
                className="w-full bg-[#2f3070] border border-[#3d3f7a]/50 focus:border-action-primary/50 rounded-xl py-2.5 pl-7 pr-9 text-white text-sm font-medium outline-none transition-colors placeholder:text-txt-dim/50 focus:shadow-[0_0_12px_rgba(163,230,53,0.15)]"
                min="0.01" step="0.01"
                autoFocus={showAutoCashOutMobile}
              />
              {showAutoCashOutMobile && (
                <button
                  onClick={() => { setAutoCashOut(''); setShowAutoCashOutMobile(false); }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-[#3d3f7a]/60 hover:bg-danger/30 text-txt-dim hover:text-white transition-colors"
                  title="Cancelar"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Play Button */}
          <button
            onClick={handleStartGame} disabled={isLoading}
            className="w-full py-3.5 sm:py-4 lg:py-3.5 rounded-2xl btn-3d-primary text-base sm:text-lg lg:text-sm flex items-center justify-center gap-2"
          >
            <Zap size={16} className="lg:hidden" /><Zap size={14} className="hidden lg:block" />
            {isLoading ? 'Iniciando...' : 'Apostar'}
          </button>
        </>
      )}

      {/* ── ACTIVE ── */}
      {isActive && activeGame && (
        <>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="rounded-2xl p-3 sm:p-4 lg:p-3 border-2 border-success/20" style={{ background: 'linear-gradient(135deg, rgba(45,212,191,0.08) 0%, rgba(45,212,191,0.03) 100%)' }}>
              <p className="text-xs sm:text-sm lg:text-[10px] text-success/70 font-medium mb-0.5">Multiplicador</p>
              <p className="text-2xl sm:text-3xl lg:text-xl font-bold text-success font-mono">{currentMultiplier.toFixed(2)}x</p>
            </div>
            <div className="rounded-2xl p-3 sm:p-4 lg:p-3 border-2 border-brand/20 text-right" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(251,191,36,0.03) 100%)' }}>
              <p className="text-xs sm:text-sm lg:text-[10px] text-brand/70 font-medium mb-0.5">Pago</p>
              <p className={`${payout >= 10000 ? 'text-sm sm:text-base lg:text-xs' : payout >= 1000 ? 'text-base sm:text-lg lg:text-sm' : 'text-2xl sm:text-3xl lg:text-xl'} font-bold text-brand font-mono truncate`}>${payout.toFixed(2)}</p>
            </div>
          </div>

          {activeGame.autoCashOutAt && (
            <div className="flex items-center gap-2 bg-brand/8 border border-brand/20 rounded-xl px-3 py-2.5 lg:py-2">
              <Lock size={14} className="lg:hidden text-brand" /><Lock size={12} className="hidden lg:block text-brand" />
              <span className="text-sm lg:text-[11px] text-brand font-medium">Auto cobro en ${(activeGame.autoCashOutAt * activeGame.betAmount).toFixed(2)}</span>
              <span className="ml-auto text-xs lg:text-[10px] text-brand font-mono animate-pulse">JUGANDO</span>
            </div>
          )}

          {!isAutoPlaying && (
            <>
              <button
                onClick={handleCross} disabled={isLoading}
                className="w-full py-4 sm:py-5 lg:py-4 rounded-2xl text-base sm:text-lg lg:text-sm flex flex-col items-center gap-1 lg:gap-0.5 btn-3d-primary"
              >
                <span className="text-xs sm:text-sm lg:text-[10px] opacity-70 flex items-center gap-1">
                  <ArrowRight size={12} className="sm:hidden" /><ArrowRight size={14} className="hidden sm:inline lg:hidden" /><ArrowRight size={10} className="hidden lg:inline" /> Siguiente carril
                </span>
                <span className="text-xl sm:text-2xl lg:text-lg font-bold">{nextMultiplier?.toFixed(2)}x</span>
              </button>

              {activeGame.currentLane > 0 && (
                <button
                  onClick={handleCashOut} disabled={isLoading}
                  className="w-full py-3.5 sm:py-4 lg:py-3 rounded-2xl btn-3d-success text-base sm:text-lg lg:text-sm flex items-center justify-center gap-2"
                  style={{ boxShadow: '0 0 20px rgba(45,212,191,0.3)' }}
                >
                  <TrendingUp size={16} className="sm:hidden" /><TrendingUp size={18} className="hidden sm:inline lg:hidden" /><TrendingUp size={14} className="hidden lg:inline" />
                  Cobrar ${payout.toFixed(2)}
                </button>
              )}
            </>
          )}
        </>
      )}

      {/* ── GAME OVER ── */}
      {isGameOver && lastResult && (
        <>
          <div className={`p-4 sm:p-5 rounded-2xl text-center border-2 ${lastResult.result === 'hit'
            ? 'border-danger/30'
            : 'border-success/30'
            }`}
            style={{
              background: lastResult.result === 'hit'
                ? 'linear-gradient(135deg, rgba(255,107,107,0.1) 0%, rgba(255,107,107,0.03) 100%)'
                : 'linear-gradient(135deg, rgba(45,212,191,0.1) 0%, rgba(251,191,36,0.05) 100%)'
            }}
          >
            {lastResult.result === 'hit' ? (
              <div className="space-y-1">
                <p className="text-xl sm:text-2xl lg:text-lg font-bold text-danger">¡Chocaste!</p>
                <p className="text-2xl sm:text-3xl lg:text-xl font-bold text-txt/70 font-mono">-${Math.abs(lastResult.profit).toFixed(2)}</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xl sm:text-2xl lg:text-lg font-bold text-success">¡Ganaste!</p>
                <p className="text-3xl sm:text-4xl lg:text-2xl font-bold text-txt font-mono">{lastResult.multiplier.toFixed(2)}x</p>
                <p className="text-lg sm:text-xl lg:text-base font-semibold text-success font-mono">+${lastResult.profit.toFixed(2)}</p>
              </div>
            )}
          </div>

          <button
            onClick={handlePlayAgain}
            className="w-full py-3.5 sm:py-4 lg:py-3.5 rounded-2xl btn-3d-primary text-base sm:text-lg lg:text-sm flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} className="lg:hidden" /><RotateCcw size={14} className="hidden lg:block" />
            Jugar de Nuevo
          </button>
        </>
      )}

    </div>
  );
}
