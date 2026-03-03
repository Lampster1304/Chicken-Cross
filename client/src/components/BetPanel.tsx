import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { getSocket } from '../hooks/useGameSocket';
import { resetGame, setLoading, gameError, clearError } from '../store/gameSlice';
import { Zap, TrendingUp, ArrowRight, RotateCcw, AlertCircle, ChevronDown, ChevronUp, Lock, Shield } from 'lucide-react';

const DIFFICULTIES = [
  { value: 1, label: 'Easy', cars: 1, mult: '1.21×', color: 'emerald' },
  { value: 2, label: 'Medium', cars: 2, mult: '1.61×', color: 'amber' },
  { value: 3, label: 'Hard', cars: 3, mult: '2.42×', color: 'orange' },
  { value: 4, label: 'Extreme', cars: 4, mult: '4.85×', color: 'red' },
];

export default function BetPanel() {
  const [betAmount, setBetAmount] = useState('10.00');
  const [difficulty, setDifficulty] = useState(1);
  const [autoCashOut, setAutoCashOut] = useState('');
  const [showAuto, setShowAuto] = useState(false);
  const dispatch = useDispatch();
  const { status, activeGame, lastResult, isLoading, error } = useSelector((state: RootState) => state.game);
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
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, dispatch]);

  useEffect(() => {
    if (status !== 'active') actionLockRef.current = false;
  }, [status]);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => dispatch(clearError()), 4000);
    return () => clearTimeout(timer);
  }, [error, dispatch]);

  const handleStartGame = useCallback(() => {
    if (actionLockRef.current) return;
    const socket = getSocket();
    if (!socket || !socket.connected) { dispatch(gameError('Not connected')); return; }
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) { dispatch(gameError('Invalid bet')); return; }
    if (user && amount > user.balance) { dispatch(gameError('Insufficient balance')); return; }
    const autoCashOutAt = autoCashOut ? parseFloat(autoCashOut) : undefined;
    if (autoCashOutAt !== undefined && autoCashOutAt <= 1) { dispatch(gameError('Auto cash-out must be > 1.00')); return; }
    actionLockRef.current = true;
    dispatch(clearError());
    dispatch(setLoading(true));
    socket.emit('game:start', { amount, difficulty, autoCashOutAt });
  }, [betAmount, difficulty, autoCashOut, user, dispatch]);

  const handleCross = useCallback(() => {
    if (actionLockRef.current) return;
    const socket = getSocket();
    if (!socket || !socket.connected) { dispatch(gameError('Not connected')); return; }
    actionLockRef.current = true;
    dispatch(setLoading(true));
    socket.emit('game:cross');
  }, [dispatch]);

  const handleCashOut = useCallback(() => {
    if (actionLockRef.current) return;
    const socket = getSocket();
    if (!socket || !socket.connected) { dispatch(gameError('Not connected')); return; }
    actionLockRef.current = true;
    dispatch(setLoading(true));
    socket.emit('game:cashout');
  }, [dispatch]);

  const handlePlayAgain = useCallback(() => {
    dispatch(resetGame());
  }, [dispatch]);

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

  const adjustBet = (factor: number) => {
    const current = parseFloat(betAmount) || 0;
    setBetAmount(Math.max(0.01, current * factor).toFixed(2));
  };

  const currentMultiplier = activeGame?.currentMultiplier ?? 1;
  const nextMultiplier = activeGame?.nextMultiplier;
  const payout = activeGame ? Math.floor(activeGame.betAmount * currentMultiplier * 100) / 100 : 0;
  const nextLane = activeGame ? activeGame.currentLane + 1 : 0;
  const nextIsSafeZone = nextLane > 0 && nextLane % 5 === 0;

  return (
    <div className="bg-surface-50 border border-surface-200/50 rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-accent-red/10 border border-accent-red/20 rounded-xl px-3 py-2.5">
          <AlertCircle size={14} className="text-accent-red shrink-0" />
          <p className="text-accent-red text-xs font-medium">{error}</p>
        </div>
      )}

      {/* ── IDLE ── */}
      {isIdle && (
        <>
          {/* Bet Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-txt-muted">Bet Amount</span>
              <span className="text-[11px] text-txt-dim font-mono">${user?.balance.toFixed(2) ?? '0.00'}</span>
            </div>
            <div className="relative mb-2">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-txt-dim text-sm">$</span>
              <input
                type="number"
                value={betAmount}
                onChange={e => setBetAmount(e.target.value)}
                className="w-full bg-surface-100 border border-surface-300/50 focus:border-brand/50 rounded-xl py-3 pl-8 pr-3 text-txt text-lg font-semibold outline-none transition-colors"
                min="0.01" step="0.01"
              />
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: '½', fn: () => adjustBet(0.5) },
                { label: '2×', fn: () => adjustBet(2) },
                { label: 'Min', fn: () => setBetAmount('1.00') },
                { label: 'Max', fn: () => setBetAmount(String(Math.min(user?.balance ?? 100, 500).toFixed(2))) },
              ].map(b => (
                <button key={b.label} onClick={b.fn} className="py-1.5 bg-surface-100 hover:bg-surface-200 border border-surface-200/60 rounded-lg text-[11px] font-semibold text-txt-muted hover:text-txt transition-colors">
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <span className="text-xs font-medium text-txt-muted mb-2 block">Difficulty</span>
            <div className="grid grid-cols-2 gap-2">
              {DIFFICULTIES.map(d => {
                const sel = difficulty === d.value;
                const colors: Record<string, { border: string; text: string; bg: string }> = {
                  emerald: { border: 'border-emerald-500/50', text: 'text-emerald-400', bg: 'bg-emerald-500/8' },
                  amber: { border: 'border-amber-500/50', text: 'text-amber-400', bg: 'bg-amber-500/8' },
                  orange: { border: 'border-orange-500/50', text: 'text-orange-400', bg: 'bg-orange-500/8' },
                  red: { border: 'border-red-500/50', text: 'text-red-400', bg: 'bg-red-500/8' },
                };
                const c = colors[d.color];
                return (
                  <button
                    key={d.value}
                    onClick={() => setDifficulty(d.value)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${sel ? `${c.border} ${c.bg}` : 'border-surface-200/50 bg-surface-100 hover:bg-surface-200/60'
                      }`}
                  >
                    <div className="flex flex-col items-start">
                      <span className={`text-[10px] font-semibold ${sel ? c.text : 'text-txt-dim'}`}>{d.label}</span>
                      <span className={`text-sm font-bold ${sel ? 'text-txt' : 'text-txt-muted'}`}>{d.cars} car{d.cars > 1 ? 's' : ''}</span>
                    </div>
                    <span className={`text-[10px] font-mono font-semibold ${sel ? c.text : 'text-txt-dim'}`}>{d.mult}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Auto Cash-Out (collapsible) */}
          <div>
            <button
              onClick={() => setShowAuto(!showAuto)}
              className="flex items-center gap-1.5 text-xs font-medium text-txt-dim hover:text-txt-muted transition-colors w-full"
            >
              {showAuto ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              Auto Cash-Out
              <span className="text-[10px] text-txt-dim ml-auto">optional</span>
            </button>
            {showAuto && (
              <div className="mt-2 relative">
                <input
                  type="number" value={autoCashOut} onChange={e => setAutoCashOut(e.target.value)}
                  placeholder="e.g. 2.50"
                  className="w-full bg-surface-100 border border-surface-300/50 focus:border-brand/50 rounded-xl py-2.5 pl-3 pr-8 text-txt text-sm font-medium outline-none transition-colors placeholder:text-txt-dim/50"
                  min="1.01" step="0.01"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-dim text-xs">×</span>
              </div>
            )}
          </div>

          {/* Play Button */}
          <button
            onClick={handleStartGame} disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-brand hover:bg-brand-light text-surface font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Zap size={16} />
            {isLoading ? 'Starting...' : 'Place Bet'}
          </button>
        </>
      )}

      {/* ── ACTIVE ── */}
      {isActive && activeGame && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-100 rounded-xl p-3 border border-surface-200/50">
              <p className="text-[10px] text-txt-dim font-medium mb-0.5">Multiplier</p>
              <p className="text-xl font-bold text-accent-green font-mono">{currentMultiplier.toFixed(2)}×</p>
            </div>
            <div className="bg-surface-100 rounded-xl p-3 border border-surface-200/50 text-right">
              <p className="text-[10px] text-txt-dim font-medium mb-0.5">Payout</p>
              <p className="text-xl font-bold text-txt font-mono">${payout.toFixed(2)}</p>
            </div>
          </div>

          {activeGame.autoCashOutAt && (
            <div className="flex items-center gap-2 bg-brand/8 border border-brand/20 rounded-lg px-3 py-2">
              <Lock size={12} className="text-brand" />
              <span className="text-[11px] text-brand font-medium">Auto cash-out at {activeGame.autoCashOutAt.toFixed(2)}×</span>
            </div>
          )}

          <button
            onClick={handleCross} disabled={isLoading}
            className={`w-full py-4 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 flex flex-col items-center gap-0.5 ${nextIsSafeZone
              ? 'bg-accent-purple hover:bg-accent-purple/90 text-white'
              : 'bg-brand hover:bg-brand-light text-surface'
              }`}
          >
            <span className="text-[10px] opacity-70 flex items-center gap-1">
              <ArrowRight size={10} /> Next lane
            </span>
            <span className="text-lg">{nextMultiplier?.toFixed(2)}×</span>
          </button>

          {activeGame.currentLane > 0 && (
            <button
              onClick={handleCashOut} disabled={isLoading}
              className="w-full py-3 rounded-xl border border-accent-green/30 text-accent-green text-sm font-semibold hover:bg-accent-green/5 transition-all flex items-center justify-center gap-2"
            >
              <TrendingUp size={14} />
              Cash Out ${payout.toFixed(2)}
            </button>
          )}
        </>
      )}

      {/* ── GAME OVER ── */}
      {isGameOver && lastResult && (
        <>
          <div className={`p-5 rounded-2xl text-center border ${lastResult.result === 'hit'
            ? 'bg-accent-red/5 border-accent-red/15'
            : 'bg-accent-green/5 border-accent-green/15'
            }`}>
            {lastResult.result === 'hit' ? (
              <div className="space-y-1">
                <p className="text-lg font-bold text-accent-red">Crashed</p>
                <p className="text-xl font-bold text-txt/70 font-mono">-${Math.abs(lastResult.profit).toFixed(2)}</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-lg font-bold text-accent-green">Won!</p>
                <p className="text-2xl font-bold text-txt font-mono">{lastResult.multiplier.toFixed(2)}×</p>
                <p className="text-base font-semibold text-accent-green font-mono">+${lastResult.profit.toFixed(2)}</p>
              </div>
            )}
          </div>

          <button
            onClick={handlePlayAgain}
            className="w-full py-3.5 rounded-xl bg-brand hover:bg-brand-light text-surface font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} />
            Play Again
          </button>
        </>
      )}

      {/* Provably fair footer */}
      <div className="mt-auto pt-3 border-t border-surface-200/30 flex items-center justify-between text-[9px] text-txt-dim">
        <div className="flex items-center gap-1">
          <Shield size={10} />
          <span>Provably Fair</span>
        </div>
        <span className="font-mono text-[8px] max-w-[120px] truncate">{activeGame?.hashedServerSeed || '—'}</span>
      </div>
    </div>
  );
}
