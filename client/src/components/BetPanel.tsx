import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { getSocket } from '../hooks/useGameSocket';
import { resetGame, setLoading, gameError, clearError } from '../store/gameSlice';

const DIFFICULTY_OPTIONS = [
  { value: 1, label: '1 Car', color: 'text-green-400', bg: 'bg-green-900/30 border-green-500/40', desc: 'Easy', mult: '1.21x/lane' },
  { value: 2, label: '2 Cars', color: 'text-yellow-400', bg: 'bg-yellow-900/30 border-yellow-500/40', desc: 'Medium', mult: '1.61x/lane' },
  { value: 3, label: '3 Cars', color: 'text-orange-400', bg: 'bg-orange-900/30 border-orange-500/40', desc: 'Hard', mult: '2.42x/lane' },
  { value: 4, label: '4 Cars', color: 'text-red-400', bg: 'bg-red-900/30 border-red-500/40', desc: 'Extreme', mult: '4.85x/lane' },
];

export default function BetPanel() {
  const [betAmount, setBetAmount] = useState('10.00');
  const [difficulty, setDifficulty] = useState(1);
  const [autoCashOut, setAutoCashOut] = useState('');
  const dispatch = useDispatch();
  const { status, activeGame, lastResult, isLoading, error } = useSelector((state: RootState) => state.game);
  const user = useSelector((state: RootState) => state.auth.user);

  const isIdle = status === 'idle';
  const isActive = status === 'active';
  const isGameOver = status === 'hit' || status === 'cashed_out';

  // Ref-based lock to prevent double-emit (refs update instantly, no render needed)
  const actionLockRef = useRef(false);

  // Release lock when server responds (isLoading goes false)
  useEffect(() => {
    if (!isLoading) {
      actionLockRef.current = false;
    } else {
      // Safety timeout: if isLoading stays true for 3s (dropped event), force-release
      const timer = setTimeout(() => {
        actionLockRef.current = false;
        dispatch(setLoading(false));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, dispatch]);

  // Also release lock when game status changes (game over, idle)
  useEffect(() => {
    if (status !== 'active') {
      actionLockRef.current = false;
    }
  }, [status]);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => dispatch(clearError()), 4000);
    return () => clearTimeout(timer);
  }, [error, dispatch]);

  const handleStartGame = useCallback(() => {
    if (actionLockRef.current) return;
    const socket = getSocket();
    if (!socket || !socket.connected) {
      dispatch(gameError('Not connected to server'));
      return;
    }

    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) {
      dispatch(gameError('Invalid bet amount'));
      return;
    }
    if (user && amount > user.balance) {
      dispatch(gameError('Insufficient balance'));
      return;
    }

    const autoCashOutAt = autoCashOut ? parseFloat(autoCashOut) : undefined;
    if (autoCashOutAt !== undefined && autoCashOutAt <= 1) {
      dispatch(gameError('Auto cash-out must be > 1.00'));
      return;
    }

    actionLockRef.current = true;
    dispatch(clearError());
    dispatch(setLoading(true));
    socket.emit('game:start', { amount, difficulty, autoCashOutAt });
  }, [betAmount, difficulty, autoCashOut, user, dispatch]);

  const handleCross = useCallback(() => {
    if (actionLockRef.current) return;
    const socket = getSocket();
    if (!socket || !socket.connected) {
      dispatch(gameError('Not connected to server'));
      return;
    }
    actionLockRef.current = true;
    dispatch(setLoading(true));
    socket.emit('game:cross');
  }, [dispatch]);

  const handleCashOut = useCallback(() => {
    if (actionLockRef.current) return;
    const socket = getSocket();
    if (!socket || !socket.connected) {
      dispatch(gameError('Not connected to server'));
      return;
    }
    actionLockRef.current = true;
    dispatch(setLoading(true));
    socket.emit('game:cashout');
  }, [dispatch]);

  const handlePlayAgain = useCallback(() => {
    dispatch(resetGame());
  }, [dispatch]);

  // Keyboard: Space = cross or start
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
  const nextPayout = activeGame && nextMultiplier
    ? Math.floor(activeGame.betAmount * nextMultiplier * 100) / 100
    : 0;

  // Check if next lane is a safe zone
  const nextLane = activeGame ? activeGame.currentLane + 1 : 0;
  const nextIsSafeZone = nextLane > 0 && nextLane % 5 === 0;

  return (
    <div className="cartoon-panel p-6 space-y-6 relative overflow-hidden flex flex-col min-h-[500px]">
      {/* Cartoon Background Accents */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-20 -z-10 transition-colors duration-1000 ${isActive ? 'bg-emerald-500' : isGameOver && lastResult?.result === 'hit' ? 'bg-red-500' : 'bg-indigo-500'
        }`} />

      {/* Error display */}
      {error && (
        <div className="bg-red-500/20 border-2 border-red-500/40 rounded-2xl px-4 py-3 text-center animate-shake-hard">
          <p className="text-red-200 text-xs font-black uppercase tracking-widest">{error}</p>
        </div>
      )}

      {/* IDLE STATE - Bet setup */}
      {isIdle && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="space-y-3">
            <div className="flex justify-between items-end px-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Wager Amount</label>
              <span className="text-[10px] font-bold text-gray-400">Bal: ${user?.balance.toFixed(2) ?? '0.00'}</span>
            </div>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-black">$</div>
              <input
                type="number"
                value={betAmount}
                onChange={e => setBetAmount(e.target.value)}
                className="w-full bg-[#161821] border-2 border-[#2d3245] focus:border-emerald-500/50 rounded-2xl py-4 pl-10 pr-4 text-white text-2xl font-black outline-none transition-all placeholder:text-gray-700"
                min="0.01"
                step="0.01"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0.5, 2, 10, 100].map((val) => (
                <button
                  key={val}
                  onClick={() => val < 5 ? adjustBet(val) : setBetAmount(val.toString())}
                  className="py-2 bg-[#252a3a] border-b-4 border-[#0f1118] active:border-b-0 active:translate-y-1 hover:bg-[#2d3345] rounded-xl text-[10px] font-black text-gray-400 transition-all uppercase"
                >
                  {val < 5 ? `${val}X` : `$${val}`}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">Hazard Level</label>
            <div className="grid grid-cols-2 gap-3">
              {DIFFICULTY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDifficulty(opt.value)}
                  className={`relative p-3 rounded-2xl border-2 transition-all duration-300 ${difficulty === opt.value
                    ? 'bg-indigo-500/20 border-indigo-500 shadow-[0_4px_15px_rgba(99,102,241,0.2)]'
                    : 'bg-[#161821] border-[#2d3245] hover:border-gray-600'
                    }`}
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className={`text-[9px] font-black uppercase tracking-tight ${difficulty === opt.value ? 'text-indigo-400' : 'text-gray-500'}`}>
                      {opt.desc}
                    </span>
                    <span className={`text-sm font-black italic uppercase leading-tight ${difficulty === opt.value ? 'text-white' : 'text-gray-400'}`}>
                      {opt.value} {opt.value === 1 ? 'TRAIL' : 'TRAILS'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Auto Cash-Out (Optional) */}
          <div className="space-y-2">
            <div className="flex justify-between items-end px-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Auto Cash-Out</label>
              <span className="text-[10px] font-bold text-gray-600">Optional</span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={autoCashOut}
                onChange={e => setAutoCashOut(e.target.value)}
                placeholder="e.g. 2.50"
                className="w-full bg-[#161821] border-2 border-[#2d3245] focus:border-yellow-500/50 rounded-2xl py-3 pl-4 pr-10 text-white text-lg font-black outline-none transition-all placeholder:text-gray-700"
                min="1.01"
                step="0.01"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-500/60 font-black text-sm">x</span>
            </div>
          </div>

          <button
            onClick={handleStartGame}
            disabled={isLoading}
            className="btn-cartoon-emerald w-full py-5 rounded-2xl text-xl font-black italic uppercase tracking-widest shadow-[0_10px_30px_rgba(0,212,170,0.3)]"
          >
            {isLoading ? 'INITIATING...' : 'Deploy Chicken'}
          </button>
        </div>
      )}

      {/* ACTIVE STATE - Crossing */}
      {isActive && activeGame && (
        <div className="space-y-6 animate-in zoom-in-95 duration-500">
          <div className="grid grid-cols-2 gap-3">
            <div className="cartoon-card p-4 border-emerald-500/20">
              <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Current</p>
              <p className="text-2xl font-black text-emerald-400 font-mono">
                {currentMultiplier.toFixed(2)}x
              </p>
            </div>
            <div className="cartoon-card p-4 border-indigo-500/20 text-right">
              <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Return</p>
              <p className="text-2xl font-black text-white font-mono">
                ${payout.toFixed(2)}
              </p>
            </div>
          </div>

          {activeGame.autoCashOutAt && (
            <div className="cartoon-card p-2 border-yellow-500/20 text-center">
              <span className="text-[9px] font-black text-yellow-500/60 uppercase">Auto Cash-Out at </span>
              <span className="text-sm font-black text-yellow-400 font-mono">{activeGame.autoCashOutAt.toFixed(2)}x</span>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleCross}
              disabled={isLoading}
              className={`w-full py-6 rounded-2xl text-xl font-black italic uppercase tracking-widest transition-all ${nextIsSafeZone ? 'btn-cartoon-indigo' : 'btn-cartoon-emerald'
                }`}
            >
              {isLoading ? 'COMMITTING...' : (
                <span className="flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-widest opacity-60">PROCEED TO</span>
                  <span>{nextMultiplier?.toFixed(2)}x</span>
                </span>
              )}
            </button>

            {activeGame.currentLane > 0 && (
              <button
                onClick={handleCashOut}
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-white/5 border-2 border-dashed border-emerald-500/30 text-emerald-400 font-black italic uppercase tracking-widest hover:bg-emerald-500/10 transition-all"
              >
                Secure Profits: ${payout.toFixed(2)}
              </button>
            )}
          </div>
        </div>
      )}

      {/* GAME OVER STATE */}
      {isGameOver && lastResult && (
        <div className="space-y-6 animate-in-zoom-in-95 duration-500">
          <div className={`p-6 rounded-3xl text-center border-4 relative overflow-hidden ${lastResult.result === 'hit' ? 'bg-red-500/10 border-red-500/40' : 'bg-emerald-500/10 border-emerald-500/40'
            }`}>
            <div className="relative z-10 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Mission Result</p>
              {lastResult.result === 'hit' ? (
                <>
                  <p className="text-3xl font-black text-red-500 uppercase italic">Terminated</p>
                  <p className="text-2xl font-mono text-white/80">-${Math.abs(lastResult.profit).toFixed(2)}</p>
                </>
              ) : (
                <>
                  <p className="text-3xl font-black text-emerald-400 uppercase italic">Success</p>
                  <p className="text-4xl font-black text-white font-mono">{lastResult.multiplier.toFixed(2)}x</p>
                  <p className="text-xl font-bold text-emerald-400 font-mono tracking-widest">+${lastResult.profit.toFixed(2)}</p>
                </>
              )}
            </div>
          </div>

          <button
            onClick={handlePlayAgain}
            className="btn-cartoon-indigo w-full py-5 rounded-2xl text-xl font-black italic uppercase tracking-widest shadow-[0_10px_30px_rgba(99,102,241,0.3)]"
          >
            New Mission
          </button>

        </div>
      )}

      {/* Fairness Protocol (Footer of Panel) */}
      <div className="mt-auto pt-4 border-t-2 border-[#2d3245] opacity-30 hover:opacity-100 transition-opacity flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-gray-500">
        <span>Provably Fair</span>
        <span className="font-mono text-[7px] max-w-[150px] truncate">{activeGame?.hashedServerSeed || '---'}</span>
      </div>
    </div>
  );
}
