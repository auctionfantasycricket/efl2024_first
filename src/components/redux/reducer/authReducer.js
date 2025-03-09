import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
  userProfile: null,
  isAdmin: false,
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
    },
  },
});

export const { setLoginSuccess, setLogoutSuccess } = loginSlice.actions;

export default loginSlice.reducer;
