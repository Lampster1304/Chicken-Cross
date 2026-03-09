import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { RootState } from '../store';
import { updateBalance } from '../store/authSlice';
import {
  setLoading,
  gameStarted,
  laneCrossed,
  startCrossing,
  finishCrossing,
  gameOver,
  restoreActiveGame,
  addFeedEntry,
  gameError,
} from '../store/gameSlice';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function useGameSocket() {
  const dispatch = useDispatch();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const socketRef = useRef<Socket | null>(null);
  const crossingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const newSocket = io(window.location.origin, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    socket = newSocket;
    socketRef.current = newSocket;

    // Reconnect - restore state
    newSocket.on('game:state', (data) => {
      dispatch(restoreActiveGame(data.activeGame || null));
    });

    // Game started
    newSocket.on('game:started', (data) => {
      dispatch(gameStarted({
        gameId: data.gameId,
        difficulty: data.difficulty,
        nextMultiplier: data.nextMultiplier,
        hashedServerSeed: data.hashedServerSeed,
        betAmount: data.betAmount || 0,
        laneMultiplier: data.laneMultiplier || 1,
        autoCashOutAt: data.autoCashOutAt,
      }));
      dispatch(updateBalance(data.balance));
    });

    // Lane crossed — two-phase animation for risky lanes
    newSocket.on('game:crossed', (data) => {
      const crossData = {
        lane: data.lane,
        safe: data.safe,
        multiplier: data.multiplier,
        nextMultiplier: data.nextMultiplier,
        revealedLane: data.revealedLane,
      };

      // Both safe and hit use two-phase crossing:
      // Phase 1: startCrossing (car accelerates out / crash anim)
      // Phase 2: finishCrossing (reveal lane)
      dispatch(startCrossing(crossData));

      if (crossingTimerRef.current) {
        clearTimeout(crossingTimerRef.current);
      }

      crossingTimerRef.current = setTimeout(() => {
        crossingTimerRef.current = null;
        dispatch(finishCrossing());
      }, crossData.safe ? 600 : 850);
    });

    // Game over
    newSocket.on('game:over', (data) => {
      const applyGameOver = () => {
        // Safety net: if crossing timer is still pending, finish it first
        if (crossingTimerRef.current) {
          clearTimeout(crossingTimerRef.current);
          crossingTimerRef.current = null;
          dispatch(finishCrossing());
        }
        dispatch(gameOver({
          result: data.result,
          multiplier: data.multiplier,
          profit: data.profit,
          serverSeed: data.serverSeed,
          revealedLanes: data.revealedLanes || [],
        }));
        dispatch(updateBalance(data.balance));
      };

      // On hit: shorter delay overlay
      if (data.result === 'hit') {
        setTimeout(applyGameOver, 850);
      } else {
        applyGameOver();
      }
    });

    // Error
    newSocket.on('game:error', (data) => {
      const msg = data.error || 'Unknown error';
      // Suppress internal "busy" errors - just release the loading lock
      if (msg === 'Processing previous action') {
        dispatch(setLoading(false));
        return;
      }
      dispatch(gameError(msg));
    });

    // Social feed - wins
    newSocket.on('feed:win', (data) => {
      dispatch(addFeedEntry({
        type: 'win',
        username: data.username,
        multiplier: data.multiplier,
        profit: data.profit,
        difficulty: data.difficulty,
        betAmount: data.betAmount,
      }));
    });

    // Social feed - hits
    newSocket.on('feed:hit', (data) => {
      dispatch(addFeedEntry({
        type: 'hit',
        username: data.username,
        difficulty: data.difficulty,
        lane: data.lane,
        betAmount: data.betAmount,
      }));
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    return () => {
      if (crossingTimerRef.current) {
        clearTimeout(crossingTimerRef.current);
        crossingTimerRef.current = null;
      }
      newSocket.disconnect();
      socket = null;
      socketRef.current = null;
    };
  }, [accessToken, dispatch]);
}
