import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
  userProfile: null,
  isAdmin: false,
  selectedLeagueId: null
};

export const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setLoginSuccess: (state, action) => {
      state.isLoggedIn = true;
      state.userProfile = action.payload;
      state.isAdmin = action.payload.email === 'bkshaz@gmail.com' || action.payload.email === 'saksharhere@gmail.com';
    },
    setLogoutSuccess: (state) => {
      state.isLoggedIn = false;
      state.userProfile = null;
      state.isAdmin = false;
      state.selectedLeagueId = null;
    },
    setSelectedLeagueId: (state, action) => {
      state.selectedLeagueId = action.payload;
    },
  },
});

export const { setLoginSuccess, setLogoutSuccess, setSelectedLeagueId } = loginSlice.actions;

export default loginSlice.reducer;
