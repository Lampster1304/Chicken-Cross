import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type GameStatus = 'idle' | 'active' | 'hit' | 'cashed_out';

interface RevealedLane {
  lane: number;
  hasCar: boolean;
}

interface ActiveGame {
  gameId: number;
  difficulty: number;
  betAmount: number;
  currentLane: number;
  riskyLanesCrossed: number;
  currentMultiplier: number;
  nextMultiplier: number | null;
  laneMultiplier: number;
  hashedServerSeed: string;
  revealedLanes: RevealedLane[];
  autoCashOutAt: number | null;
}

interface GameOverResult {
  result: 'hit' | 'cashed_out';
  multiplier: number;
  profit: number;
  serverSeed: string;
  revealedLanes: RevealedLane[];
}

interface FeedEntry {
  id: number;
  type: 'win' | 'hit';
  username: string;
  multiplier?: number;
  profit?: number;
  betAmount?: number;
  difficulty: number;
  lane?: number;
  timestamp: number;
}

export interface AutobetConfig {
  enabled: boolean;
  totalRounds: number;
  onWinAction: 'reset' | 'increase';
  onWinPercent: number;
  onLossAction: 'reset' | 'increase';
  onLossPercent: number;
  stopOnProfit: number;
  stopOnLoss: number;
}

export interface AutobetState {
  active: boolean;
  roundsPlayed: number;
  wins: number;
  losses: number;
  totalProfit: number;
  currentBet: number;
  baseBet: number;
}

interface CrossingState {
  lane: number;
  safe: boolean;
  pendingData: {
    multiplier: number;
    nextMultiplier: number | null;
    revealedLane: RevealedLane;
  };
}

interface GameState {
  status: GameStatus;
  activeGame: ActiveGame | null;
  crossingLane: CrossingState | null;
  lastResult: GameOverResult | null;
  feed: FeedEntry[];
  isLoading: boolean;
  error: string | null;
  autobetConfig: AutobetConfig;
  autobetState: AutobetState | null;
}

const defaultAutobetConfig: AutobetConfig = {
  enabled: false,
  totalRounds: 0,
  onWinAction: 'reset',
  onWinPercent: 0,
  onLossAction: 'reset',
  onLossPercent: 0,
  stopOnProfit: 0,
  stopOnLoss: 0,
};

const initialState: GameState = {
  status: 'idle',
  activeGame: null,
  crossingLane: null,
  lastResult: null,
  feed: [],
  isLoading: false,
  error: null,
  autobetConfig: defaultAutobetConfig,
  autobetState: null,
};

let feedIdCounter = 0;

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    gameStarted(
      state,
      action: PayloadAction<{
        gameId: number;
        difficulty: number;
        nextMultiplier: number | null;
        hashedServerSeed: string;
        betAmount: number;
        laneMultiplier: number;
        autoCashOutAt?: number | null;
      }>
    ) {
      const p = action.payload;
      state.status = 'active';
      state.lastResult = null;
      state.isLoading = false;
      state.error = null;
      state.activeGame = {
        gameId: p.gameId,
        difficulty: p.difficulty,
        betAmount: p.betAmount,
        currentLane: 0,
        riskyLanesCrossed: 0,
        currentMultiplier: 1.0,
        nextMultiplier: p.nextMultiplier,
        laneMultiplier: p.laneMultiplier,
        hashedServerSeed: p.hashedServerSeed,
        revealedLanes: [],
        autoCashOutAt: p.autoCashOutAt ?? null,
      };
    },

    laneCrossed(
      state,
      action: PayloadAction<{
        lane: number;
        safe: boolean;
        multiplier: number;
        nextMultiplier: number | null;
        revealedLane: RevealedLane;
      }>
    ) {
      if (!state.activeGame) return;
      const p = action.payload;
      state.activeGame.currentLane = p.lane;
      state.activeGame.currentMultiplier = p.multiplier;
      state.activeGame.nextMultiplier = p.nextMultiplier;
      state.activeGame.revealedLanes.push(p.revealedLane);
      if (p.safe) {
        state.activeGame.riskyLanesCrossed++;
      }
      // If hit (safe=false), keep isLoading true to lock UI until gameOver overlay
      state.isLoading = !p.safe;
    },

    startCrossing(
      state,
      action: PayloadAction<{
        lane: number;
        safe: boolean;
        multiplier: number;
        nextMultiplier: number | null;
        revealedLane: RevealedLane;
      }>
    ) {
      if (!state.activeGame) return;
      const p = action.payload;
      // Move chicken to the new lane immediately
      state.activeGame.currentLane = p.lane;
      state.activeGame.currentMultiplier = p.multiplier;
      state.activeGame.nextMultiplier = p.nextMultiplier;
      // Store crossing state (lane NOT yet revealed)
      state.crossingLane = {
        lane: p.lane,
        safe: p.safe,
        pendingData: {
          multiplier: p.multiplier,
          nextMultiplier: p.nextMultiplier,
          revealedLane: p.revealedLane,
        },
      };
      // Keep loading true during crossing animation
      state.isLoading = true;
    },

    finishCrossing(state) {
      if (!state.activeGame || !state.crossingLane) return;
      const c = state.crossingLane;
      // Now officially reveal the lane
      state.activeGame.revealedLanes.push(c.pendingData.revealedLane);
      if (c.safe) {
        state.activeGame.riskyLanesCrossed++;
      }
      // If safe, unlock UI. If hit, keep loading until gameOver overlay.
      state.isLoading = !c.safe;
      state.crossingLane = null;
    },

    gameOver(
      state,
      action: PayloadAction<{
        result: 'hit' | 'cashed_out';
        multiplier: number;
        profit: number;
        serverSeed: string;
        revealedLanes: RevealedLane[];
      }>
    ) {
      state.status = action.payload.result;
      state.lastResult = action.payload;
      state.isLoading = false;
      state.crossingLane = null;
      // Sync revealed lanes from server to ensure consistency
      if (state.activeGame && action.payload.revealedLanes) {
        state.activeGame.revealedLanes = action.payload.revealedLanes;
      }
    },

    resetGame(state) {
      state.status = 'idle';
      state.activeGame = null;
      state.crossingLane = null;
      state.lastResult = null;
      state.isLoading = false;
    },

    restoreActiveGame(
      state,
      action: PayloadAction<{
        gameId: number;
        difficulty: number;
        currentLane: number;
        riskyLanesCrossed: number;
        currentMultiplier: number;
        nextMultiplier: number | null;
        hashedServerSeed: string;
        betAmount: number;
        laneMultiplier: number;
        status: string;
        revealedLanes: RevealedLane[];
        autoCashOutAt?: number | null;
      } | null>
    ) {
      if (!action.payload) {
        state.status = 'idle';
        state.activeGame = null;
        state.crossingLane = null;
        return;
      }

      const p = action.payload;
      state.status = p.status === 'active' ? 'active' : 'idle';
      state.activeGame = p.status === 'active'
        ? {
            gameId: p.gameId,
            difficulty: p.difficulty,
            betAmount: p.betAmount,
            currentLane: p.currentLane,
            riskyLanesCrossed: p.riskyLanesCrossed,
            currentMultiplier: p.currentMultiplier,
            nextMultiplier: p.nextMultiplier,
            laneMultiplier: p.laneMultiplier,
            hashedServerSeed: p.hashedServerSeed,
            revealedLanes: p.revealedLanes || [],
            autoCashOutAt: p.autoCashOutAt ?? null,
          }
        : null;
    },

    addFeedEntry(
      state,
      action: PayloadAction<Omit<FeedEntry, 'id' | 'timestamp'>>
    ) {
      feedIdCounter++;
      state.feed.unshift({
        ...action.payload,
        id: feedIdCounter,
        timestamp: Date.now(),
      });
      if (state.feed.length > 50) {
        state.feed = state.feed.slice(0, 50);
      }
    },

    gameError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },

    clearError(state) {
      state.error = null;
    },

    setAutobetConfig(state, action: PayloadAction<Partial<AutobetConfig>>) {
      state.autobetConfig = { ...state.autobetConfig, ...action.payload };
    },

    startAutobet(state, action: PayloadAction<{ baseBet: number }>) {
      state.autobetConfig.enabled = true;
      state.autobetState = {
        active: true,
        roundsPlayed: 0,
        wins: 0,
        losses: 0,
        totalProfit: 0,
        currentBet: action.payload.baseBet,
        baseBet: action.payload.baseBet,
      };
    },

    stopAutobet(state) {
      state.autobetConfig.enabled = false;
      if (state.autobetState) {
        state.autobetState.active = false;
      }
    },

    autobetRoundComplete(state, action: PayloadAction<{ won: boolean; profit: number }>) {
      if (!state.autobetState) return;
      const s = state.autobetState;
      const config = state.autobetConfig;
      s.roundsPlayed++;
      s.totalProfit += action.payload.profit;

      if (action.payload.won) {
        s.wins++;
        if (config.onWinAction === 'reset') {
          s.currentBet = s.baseBet;
        } else {
          s.currentBet = Math.round(s.currentBet * (1 + config.onWinPercent / 100) * 100) / 100;
        }
      } else {
        s.losses++;
        if (config.onLossAction === 'reset') {
          s.currentBet = s.baseBet;
        } else {
          s.currentBet = Math.round(s.currentBet * (1 + config.onLossPercent / 100) * 100) / 100;
        }
      }

      // Check stop conditions
      if (config.totalRounds > 0 && s.roundsPlayed >= config.totalRounds) {
        s.active = false;
        config.enabled = false;
      }
      if (config.stopOnProfit > 0 && s.totalProfit >= config.stopOnProfit) {
        s.active = false;
        config.enabled = false;
      }
      if (config.stopOnLoss > 0 && s.totalProfit <= -config.stopOnLoss) {
        s.active = false;
        config.enabled = false;
      }
    },
  },
});

export const {
  setLoading,
  gameStarted,
  laneCrossed,
  startCrossing,
  finishCrossing,
  gameOver,
  resetGame,
  restoreActiveGame,
  addFeedEntry,
  gameError,
  clearError,
  setAutobetConfig,
  startAutobet,
  stopAutobet,
  autobetRoundComplete,
} = gameSlice.actions;
export default gameSlice.reducer;
