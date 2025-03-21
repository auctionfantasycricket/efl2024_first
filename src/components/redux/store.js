// import { configureStore } from '@reduxjs/toolkit';
// import loginReducer from './reducer/authReducer';
// import leagueReducer from './reducer/leagueReducer';

// const store = configureStore({
//   reducer: {
//     login: loginReducer,
//     league: leagueReducer,
//   },
// });

// export default store;

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import loginReducer from './reducer/authReducer';
import leagueReducer from './reducer/leagueReducer';

// Configuration for Redux Persist
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['login', 'league'] // only persist these reducers
};

// Combine reducers
const rootReducer = combineReducers({
  login: loginReducer,
  league: leagueReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store with persisted reducer
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);

export default store;
