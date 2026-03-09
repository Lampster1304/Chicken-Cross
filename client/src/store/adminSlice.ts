import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AdminState {
  user: AdminUser | null;
  accessToken: string | null;
  refreshToken: string | null;
}

const initialState: AdminState = {
  user: null,
  accessToken: sessionStorage.getItem('adminAccessToken'),
  refreshToken: sessionStorage.getItem('adminRefreshToken'),
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAdminCredentials(state, action: PayloadAction<{ user: AdminUser; accessToken: string; refreshToken: string }>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      sessionStorage.setItem('adminAccessToken', action.payload.accessToken);
      sessionStorage.setItem('adminRefreshToken', action.payload.refreshToken);
    },
    adminLogout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      sessionStorage.removeItem('adminAccessToken');
      sessionStorage.removeItem('adminRefreshToken');
    },
  },
});

export const { setAdminCredentials, adminLogout } = adminSlice.actions;
export default adminSlice.reducer;
