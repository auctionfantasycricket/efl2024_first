import { configureStore } from '@reduxjs/toolkit';
import loginReducer from './reducer/authReducer';
import leagueReducer from './reducer/leagueReducer';

const store = configureStore({
  reducer: {
    login: loginReducer,
    league: leagueReducer,
  },
});

export default store;
