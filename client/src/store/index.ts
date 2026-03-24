import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import gameReducer from './gameSlice';
import adminReducer from './adminSlice';
import languageReducer from './languageSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    game: gameReducer,
    admin: adminReducer,
    language: languageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
