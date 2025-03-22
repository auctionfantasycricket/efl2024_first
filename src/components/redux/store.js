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

// import { configureStore } from '@reduxjs/toolkit';
// import { persistStore, persistReducer } from 'redux-persist';
// import storage from 'redux-persist/lib/storage';
// import { combineReducers } from 'redux';
// import loginReducer from './reducer/authReducer';
// import leagueReducer from './reducer/leagueReducer';

// // Configuration for Redux Persist
// const persistConfig = {
//   key: 'root',
//   storage,
//   whitelist: ['login', 'league'] // only persist these reducers
// };

// // Combine reducers
// const rootReducer = combineReducers({
//   login: loginReducer,
//   league: leagueReducer,
// });

// // Create persisted reducer
// const persistedReducer = persistReducer(persistConfig, rootReducer);

// // Create store with persisted reducer
// const store = configureStore({
//   reducer: persistedReducer,
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         // Ignore these action types
//         ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
//       },
//     }),
// });

// // Create persistor
// export const persistor = persistStore(store);

// export default store;


import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import loginReducer from './reducer/authReducer';
import leagueReducer from './reducer/leagueReducer';

// Configuration for Redux Persist with versioning for migrations
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['login', 'league'], // only persist these reducers
  version: 1, // Add versioning to handle migrations
  // Add migration handling
  migrate: (state, currentVersion) => {
    // Logic to handle state versions if needed
    return Promise.resolve(state);
  }
};

// Combine reducers
const rootReducer = combineReducers({
  login: loginReducer,
  league: leagueReducer,
});

// Add a safety wrapper to handle corrupted state
const createSafeReducer = (reducer) => {
  return (state, action) => {
    try {
      return reducer(state, action);
    } catch (err) {
      console.error('Error in redux state management:', err);
      // If there's an error, return a fresh initial state
      if (action.type === REHYDRATE) {
        console.warn('Rehydration failed, resetting state');
        return rootReducer(undefined, { type: 'RESET_APP_STATE' });
      }
      return state || rootReducer(undefined, { type: 'RESET_APP_STATE' });
    }
  };
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);
const safePersistedReducer = createSafeReducer(persistedReducer);

// Create store with persisted reducer
const store = configureStore({
  reducer: safePersistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore all persist actions to avoid serialization warnings
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create persistor with error handling
export const persistor = persistStore(store, null, () => {
  console.log('Rehydration completed');
});

// Add a purge method to reset app state when needed
export const purgeStore = () => {
  return persistor.purge().then(() => {
    store.dispatch({ type: 'RESET_APP_STATE' });
    return Promise.resolve();
  });
};

export default store;
