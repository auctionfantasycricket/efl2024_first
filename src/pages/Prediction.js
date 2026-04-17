import React, { useState, useEffect, useMemo } from 'react';
import './Prediction.css';
import { useSelector, useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { Chip } from '@mui/material';
import { Card, Button, Spin, Empty, message } from 'antd';
import axios from 'axios';
import { setLoginSuccess } from '../components/redux/reducer/authReducer';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';


const baseURL = process.env.REACT_APP_BASE_URL;

// API Functions
const fetchTodaySchedule = async () => {
  const response = await fetch(`${baseURL}/schedule/today`);
  if (!response.ok) {
    throw new Error('Failed to fetch schedule');
  }
  return response.json();
};

const fetchUserPredictions = async (userId) => {
  const response = await fetch(`${baseURL}/predictions/my?&userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch predictions');
  }
  return response.json();
};

const fetchTodayPrediction = async (userId) => {
  const response = await fetch(`${baseURL}/predictions/my?userId=${userId}&today=true`);
  if (!response.ok) {
    throw new Error('Failed to fetch today\'s prediction');
  }
  return response.json();
};

const fetchLeaderboard = async () => {
  const response = await fetch(`${baseURL}/predictions/leaderboard`);
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }
  return response.json();
};

const savePrediction = async (userId, matchId, predictedWinner) => {
  const payload = { userId, matchId, predictedWinner };
  console.log('💾 Saving prediction with payload:', payload);
  
  if (!userId) {
    throw new Error('❌ userId is missing! Cannot save prediction.');
  }
  if (!matchId) {
    throw new Error('❌ matchId is missing! Cannot save prediction.');
  }
  
  const response = await axios.post(`${baseURL}/predictions/save`, payload);
  // console.log('✅ Prediction saved successfully:', response.data);
  return response.data;
};

export default function Prediction() {
  const dispatch = useDispatch();
  const [selectedPredictions, setSelectedPredictions] = useState({}); // matchId -> team
  const [savingMatchId, setSavingMatchId] = useState(null);

  const userProfile = useSelector((state) => state.login.userProfile);
  const isLoggedIn = useSelector((state) => state.login.isLoggedIn);

  // Decode token from localStorage and set in Redux (like other pages do)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !userProfile) {
      try {
        const user = JSON.parse(atob(token.split('.')[1]));
        dispatch(setLoginSuccess(user));
        // console.log('🔑 Token decoded and set in Redux:', user);
      } catch (e) {
        console.error('❌ Failed to parse token:', e);
      }
    }
  }, [dispatch, userProfile]);

  // Get userId from token - try all possible field names
  const userId = userProfile?._id || userProfile?.sub || userProfile?.userId;
  // console.log('📍 Current userProfile:', userProfile);
  // console.log('📍 Extracted userId:', userId);

  // Fetch schedule
  const {
    data: scheduleData,
    isLoading: scheduleLoading,
    error: scheduleError
  } = useQuery({
    queryKey: ['schedule-today'],
    queryFn: fetchTodaySchedule,
    enabled: isLoggedIn
  });

  // Fetch user predictions (for history)
  const {
    data: predictionsData,
    isLoading: predictionsLoading,
    error: predictionsError,
    refetch: refetchPredictions
  } = useQuery({
    queryKey: ['user-predictions', userId],
    queryFn: () => fetchUserPredictions(userId),
    enabled: isLoggedIn && !!userId
  });

  // Fetch today's prediction
  const {
    data: todayPredictionData,
    isLoading: todayPredictionLoading,
    error: todayPredictionError,
    refetch: refetchTodayPrediction
  } = useQuery({
    queryKey: ['today-prediction', userId],
    queryFn: () => fetchTodayPrediction(userId),
    enabled: isLoggedIn && !!userId
  });

  // Fetch leaderboard
  const {
    data: leaderboardData,
    isLoading: leaderboardLoading,
    error: leaderboardError
  } = useQuery({
    queryKey: ['predictions-leaderboard'],
    queryFn: fetchLeaderboard,
    enabled: isLoggedIn
  });

  // Get current match (first upcoming match)
  const currentMatch = scheduleData?.matches?.[0];
  const isMatchLocked = currentMatch?.status !== 'UpComing';
  const otherMatches = (predictionsData?.predictions || []).filter(
    p => currentMatch?.matchId !== p.matchId
  );

  // Populate selected prediction from today's prediction on load
  useEffect(() => {
    if (todayPredictionData?.prediction && currentMatch) {
      const prediction = todayPredictionData.prediction;
      setSelectedPredictions(prev => ({
        ...prev,
        [currentMatch.matchId]: prediction.predictedWinner
      }));
    }
  }, [todayPredictionData, currentMatch]);

  const handlePredictionChange = (matchId, winner) => {
    // Toggle logic: if same team is clicked, deselect it
    const currentSelection = selectedPredictions[matchId];
    if (currentSelection === winner) {
      setSelectedPredictions({
        ...selectedPredictions,
        [matchId]: undefined
      });
    } else {
      setSelectedPredictions({
        ...selectedPredictions,
        [matchId]: winner
      });
    }
  };

  const handleSavePrediction = async (match) => {
    console.log('🎯 Attempting to save prediction for match:', match);
    const winner = selectedPredictions[match.matchId];
    
    console.log('🔹 Match ID:', match.matchId);
    console.log('🔹 Winner selection:', winner);
    console.log('🔹 User ID:', userId);
    
    if (!winner) {
      message.warning('Please select a prediction before saving');
      return;
    }

    setSavingMatchId(match.matchId);
    try {
      const response = await savePrediction(userId, match.matchId, winner);
      message.success(response.message);
      refetchTodayPrediction();
      refetchPredictions();
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to save prediction';
      console.error('❌ Error saving prediction:', errorMsg);
      message.error(errorMsg);
    } finally {
      setSavingMatchId(null);
    }
  };

  const handleClearPrediction = async (match) => {
    console.log('🗑️ Clearing prediction for match:', match);
    setSavingMatchId(match.matchId);
    try {
      const response = await savePrediction(userId, match.matchId, null);
      message.success(response.message);
      setSelectedPredictions({
        ...selectedPredictions,
        [match.matchId]: undefined
      });
      refetchTodayPrediction();
      refetchPredictions();
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to clear prediction';
      console.error('❌ Error clearing prediction:', errorMsg);
      message.error(errorMsg);
    } finally {
      setSavingMatchId(null);
    }
  };

  // AG Grid Column Definitions
  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
    flex: 1,
    minWidth: 100
  }), []);

  // Leaderboard columns for AG Grid
  const leaderboardColumnDefs = useMemo(() => [
    {
      field: 'rank',
      headerName: 'Rank',
      headerTooltip: 'Rank',
      width: 80,
      valueGetter: (params) => params.node.rowIndex + 1,
      tooltipValueGetter: (params) => `Rank: ${params.node.rowIndex + 1}`,
      sortable: false,
      filter: false
    },
    {
      field: 'userName',
      headerName: 'User Name',
      headerTooltip: 'User Name',
      width: 150,
      tooltipValueGetter: (params) => params.data.userName
    },
    {
      field: 'totalPoints',
      headerName: 'Total Points',
      headerTooltip: 'Total Points',
      width: 120,
      tooltipValueGetter: (params) => `Total Points: ${params.data.totalPoints}`,
      sort: 'desc'
    },
    {
      field: 'currentStreak',
      headerName: 'Current Streak',
      headerTooltip: 'Current Streak',
      width: 140,
      tooltipValueGetter: (params) => `Current Streak: ${params.data.currentStreak}`
    },
    {
      field: 'maxStreak',
      headerName: 'Max Streak',
      headerTooltip: 'Max Streak',
      width: 120,
      tooltipValueGetter: (params) => `Max Streak: ${params.data.maxStreak}`
    }
  ], []);

  // History columns for AG Grid
  const historyColumnDefs = useMemo(() => [
    {
      field: 'matchId',
      headerName: 'Match',
      headerTooltip: 'Match',
      width: 120,
      valueGetter: (params) => `${params.data.team1} vs ${params.data.team2}`,
      tooltipValueGetter: (params) => `${params.data.team1} vs ${params.data.team2}`,
      sortable: false
    },
    {
      field: 'matchNumber',
      headerName: 'Match #',
      headerTooltip: 'Match Number',
      width: 100,
      tooltipValueGetter: (params) => `Match #${params.data.matchNumber}`
    },
    {
      field: 'predictedWinner',
      headerName: 'Predicted Winner',
      headerTooltip: 'Predicted Winner',
      width: 150,
      tooltipValueGetter: (params) => params.data.predictedWinner
    },
    {
      field: 'isCorrect',
      headerName: 'Correct',
      headerTooltip: 'Correct',
      width: 100,
      cellRenderer: (params) => (
        <span style={{ color: params.value ? '#10b981' : '#dc3545', fontWeight: 'bold' }}>
          {params.value ? '✓' : '✗'}
        </span>
      ),
      tooltipValueGetter: (params) => params.value ? 'Correct ✓' : 'Incorrect ✗',
      sortable: false
    },
    {
      field: 'streakLength',
      headerName: 'Streak Length',
      headerTooltip: 'Streak Length',
      width: 130,
      tooltipValueGetter: (params) => `Streak Length: ${params.data.streakLength}`
    },
    {
      field: 'streakPoints',
      headerName: 'Streak Points',
      headerTooltip: 'Streak Points',
      width: 130,
      tooltipValueGetter: (params) => `Streak Points: ${params.data.streakPoints}`
    },
    {
      field: 'correctPoints',
      headerName: 'Correct Points',
      headerTooltip: 'Correct Points',
      width: 140,
      tooltipValueGetter: (params) => `Correct Points: ${params.data.correctPoints}`
    },
    {
      field: 'totalPoints',
      headerName: 'Total Points',
      headerTooltip: 'Total Points',
      width: 120,
      tooltipValueGetter: (params) => `Total Points: ${params.data.totalPoints}`
    }
  ], []);

  const leaderboardSorted = [...(leaderboardData?.leaderboard || [])].sort(
    (a, b) => b.totalPoints - a.totalPoints
  );

  return (
    <div className="prediction-page">
      {/* Layout Container with percentage-based columns */}
      <div className="prediction-layout-wrapper">
        {/* Left Margin 5% */}
        <div className="layout-margin-left"></div>

        {/* Prediction Card 24% */}
        <div className="layout-card prediction-card-wrapper">
          <div className="match-section">
            <h3 className="section-title">Today's Prediction</h3>
            {scheduleLoading ? (
              <div className="loading-center">
                <Spin size="large" />
              </div>
            ) : scheduleError || !currentMatch ? (
              <div className="empty-state">
                <Empty description="No upcoming matches today" />
              </div>
            ) : (
              <Card className="match-card">
                {/* Match Header with Title and Status */}
                <div className="match-header">
                  <h4 className="match-title">Match {currentMatch.matchNumber}</h4>
                  <span className={`status-badge status-${currentMatch.status}`}>
                    {currentMatch.status}
                  </span>
                </div>

                {/* Match Details as Chips (1 Row) */}
                <div className="match-chips">
                  <Chip 
                    label={currentMatch.venue} 
                    size="small"
                    sx={{ 
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '11px'
                    }} 
                  />
                  <Chip 
                    label={currentMatch.scheduledAt} 
                    size="small"
                    sx={{ 
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '11px'
                    }} 
                  />
                </div>

                {/* Prediction Form */}
                <div className="prediction-form">
                  <p className="form-label">Who will win?</p>

                  {/* Teams Display */}
                  <div className="teams-display">
                    <button
                      className={`team-button ${selectedPredictions[currentMatch.matchId] === currentMatch.team1 ? 'selected' : ''}`}
                      onClick={() => !isMatchLocked && handlePredictionChange(currentMatch.matchId, currentMatch.team1)}
                      disabled={isMatchLocked}
                    >
                      {currentMatch.team1}
                    </button>
                    <span className="vs-divider">VS</span>
                    <button
                      className={`team-button ${selectedPredictions[currentMatch.matchId] === currentMatch.team2 ? 'selected' : ''}`}
                      onClick={() => !isMatchLocked && handlePredictionChange(currentMatch.matchId, currentMatch.team2)}
                      disabled={isMatchLocked}
                    >
                      {currentMatch.team2}
                    </button>
                  </div>

                  {isMatchLocked && (
                    <div className="lock-warning">
                      <strong>Match locked</strong> - Predictions cannot be changed
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="action-buttons">
                    <Button
                      type="primary"
                      disabled={!selectedPredictions[currentMatch.matchId] || isMatchLocked || savingMatchId === currentMatch.matchId}
                      loading={savingMatchId === currentMatch.matchId}
                      onClick={() => handleSavePrediction(currentMatch)}
                      className="btn-save"
                    >
                      Save
                    </Button>
                    {selectedPredictions[currentMatch.matchId] && !isMatchLocked && (
                      <Button
                        danger
                        disabled={savingMatchId === currentMatch.matchId}
                        loading={savingMatchId === currentMatch.matchId}
                        onClick={() => handleClearPrediction(currentMatch)}
                        className="btn-clear"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Gap between Prediction and History 1% */}
        <div className="layout-gap-small"></div>

        {/* History Card 24% */}
        <div className="layout-card history-card-wrapper">
          <div className="history-section">
            <h3 className="section-title">Your History</h3>
            {predictionsLoading ? (
              <div className="loading-center">
                <Spin size="large" />
              </div>
            ) : predictionsError ? (
              <div className="empty-state">
                <Empty description="Failed to load history" />
              </div>
            ) : otherMatches.length === 0 ? (
              <div className="empty-state">
                <Empty description="No predictions yet" />
              </div>
            ) : (
              <div className="ag-theme-alpine-dark history-grid-container">
                <AgGridReact
                  rowData={otherMatches}
                  columnDefs={historyColumnDefs}
                  defaultColDef={defaultColDef}
                  animateRows={true}
                  domLayout="normal"
                  suppressHorizontalScroll={false}
                />
              </div>
            )}
          </div>
        </div>

        {/* Gap between History and Leaderboard 2% */}
        <div className="layout-gap-medium"></div>

        {/* Leaderboard Card 39% */}
        <div className="layout-card leaderboard-card-wrapper">
          <div className="leaderboard-section">
            <h3 className="section-title">Leaderboard</h3>
            {leaderboardLoading ? (
              <div className="loading-center">
                <Spin size="large" />
              </div>
            ) : leaderboardError ? (
              <div className="empty-state">
                <Empty description="Failed to load leaderboard" />
              </div>
            ) : leaderboardSorted.length === 0 ? (
              <div className="empty-state">
                <Empty description="No users yet" />
              </div>
            ) : (
              <div className="ag-theme-alpine-dark leaderboard-grid-container">
                <AgGridReact
                  rowData={leaderboardSorted}
                  columnDefs={leaderboardColumnDefs}
                  defaultColDef={defaultColDef}
                  animateRows={true}
                  domLayout="normal"
                  suppressHorizontalScroll={false}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Margin 5% */}
        <div className="layout-margin-right"></div>
      </div>


    </div>
  );
}
