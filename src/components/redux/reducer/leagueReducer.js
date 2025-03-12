import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentLeague: null, // Store the entire league object here
    isleagueadmin: false,
    selectedLeagueId: null,
    memberof:[],
};

export const leagueSlice = createSlice({
    name: 'league',
    initialState,
    reducers: {
        setCurrentLeague: (state, action) => {
            state.currentLeague = action.payload;
        },
        setisLeagueadmin: (state, action) => {
            state.isleagueadmin = action.payload;
        },
        setselectedLeagueId: (state, action) => {
            state.selectedLeagueId = action.payload;
        },
        setmemberof: (state, action) => {
            state.memberof = action.payload;
        },
        clearLeagueState: (state) => {
            state.currentLeague = null;
            state.isleagueadmin = false;
            state.selectedLeagueId = null;
            state.memberof = [];
        },
    },
});

export const { 
    setCurrentLeague, 
    setisLeagueadmin,
    setselectedLeagueId,
    setmemberof,
    clearLeagueState,
} = leagueSlice.actions;

export default leagueSlice.reducer;