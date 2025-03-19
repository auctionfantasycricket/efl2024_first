import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoginSuccess } from '../components/redux/reducer/authReducer';
import { setselectedLeagueId, setisLeagueadmin, setCurrentLeague, setmemberof } from '../components/redux/reducer/leagueReducer';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Container, Row, Col } from 'react-bootstrap';
import SearchIcon from '@mui/icons-material/Search';
import './Snakedraft.css';

import DraftOwnerStats from '../components/DraftOwnerStats';

// Constants
const baseURL = process.env.REACT_APP_BASE_URL;
const ROUNDS = 8;
const TIMER_DURATION = 30;

const Snakedraft = () => {
  // State management
  const [draftBoard, setDraftBoard] = useState([]);
  const [timer, setTimer] = useState(TIMER_DURATION);
  const [timerActive, setTimerActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [currentSelectingTeam, setCurrentSelectingTeam] = useState(null); // Added to track current team selection
  const [ownersData, setOwnersData] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [TEAMS, setTeams] = useState([]);

  const dispatch = useDispatch();

  // Refs
  const gridRef = useRef(null);
  const timerRef = useRef(null);
  const searchInputRef = useRef(null);

  const draftleagueid = useSelector((state) => state.league.selectedLeagueId);
  const userProfile = useSelector((state) => state.login.userProfile);
  const leagueinfo = useSelector((state) => state.league.currentLeague);

  const adminEmails = leagueinfo?.admins;
  const isAdmin = adminEmails && adminEmails.includes(userProfile?.email);
  const league_type = leagueinfo?.league_type;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const leaguecode = localStorage.getItem('leagueId');
    const leaguedetailsstring = localStorage.getItem('currentLeague');

    if (token) {
      const user = JSON.parse(atob(token.split('.')[1]));
      dispatch(setLoginSuccess(user));
    }

    if (leaguecode) {
      dispatch(setselectedLeagueId(leaguecode));
    }
    if (leaguedetailsstring) {
      const leaguedetails = JSON.parse(leaguedetailsstring);
      dispatch(setCurrentLeague(leaguedetails));
    }
  }, [dispatch]);

  // Fetch draft data when draftleagueid changes
  useEffect(() => {
    if (draftleagueid) {
      fetchDraftBoard();
    }
    return () => clearInterval(timerRef.current);
  }, [draftleagueid]); // Add draftleagueid as a dependency

  // Timer effect
  useEffect(() => {
    if (timerActive && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      handleTimerEnd();
    }

    return () => clearInterval(timerRef.current);
  }, [timerActive, timer]);

  const fetchDraftBoard = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${baseURL}/get_data?leagueId=${draftleagueid}&collectionName=teams`);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Draft board data:', data);
      setOwnersData(data);
      
      // Extract team names first, then format draft board
      const teamNames = data.map(team => team.teamName);
      setTeams(teamNames);
      
      // Use the team names we just got to format the board
      setDraftBoard(formatDraftBoard(data, teamNames));
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching draft board:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  // Modified formatDraftBoard to accept teams as a parameter
  const formatDraftBoard = (data, teams) => {
    if (!teams || teams.length === 0) {
      console.warn('No teams available to format draft board');
      return [];
    }
    
    return Array.from({ length: ROUNDS }, (_, roundIndex) => {
      const isEvenRound = roundIndex % 2 === 0;
      const direction = isEvenRound ? '➡️' : '⬅️';
      
      const row = { 
        round: `R${roundIndex + 1} ${direction}`,
        roundNumber: roundIndex + 1,
        direction: isEvenRound ? 'forward' : 'reverse'
      };
      
      teams.forEach((team, teamIndex) => {
        const teamData = data.find(t => t.teamName === team);
        row[`team${teamIndex}`] = teamData?.draftSequence?.[roundIndex] || '';
      });
      
      return row;
    });
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    setTimer(TIMER_DURATION);
    setTimerActive(true);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    setTimerActive(false);
  };

  const handleTimerEnd = () => {
    stopTimer();
    if (selectedPlayer === null) {
        searchRandomPlayer();
    }
  };

  const searchPlayer = async () => {
    if (!searchTerm.trim()) {
        if (selectedPlayer === null) {
            searchRandomPlayer();
        }
      return;
    }
    setError(null)
    try {
      setIsLoading(true);
      const response = await fetch(`${baseURL}/getspecificplayer?leagueId=${draftleagueid}&player_name=${searchTerm.toLowerCase()}`);
      
      if (!response.ok) {
        throw new Error(`Player search failed with status: ${response.status}`);
      }
      
      const player = await response.json();
      setSelectedPlayer(player);
      setIsLoading(false);
    } catch (err) {
      console.error('Error searching for player:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const searchRandomPlayer = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${baseURL}/getrandomdraftplayer`);
      
      if (!response.ok) {
        throw new Error(`Random player search failed with status: ${response.status}`);
      }
      
      const player = await response.json();
      setSelectedPlayer(player);
      setIsLoading(false);
    } catch (err) {
      console.error('Error getting random player:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const draftPlayer = async () => {
    if (!selectedPlayer || !selectedCell || !isAdmin) {
      return;
    }

    try {
      setIsLoading(true);
      const colId = selectedCell.column.colId;
      const teamIndex = parseInt(colId.replace('team', ''));
      
      // Make sure we have teams before accessing
      if (!TEAMS || teamIndex >= TEAMS.length) {
        throw new Error('Team data is not properly loaded');
      }
      
      const team = TEAMS[teamIndex];

      const payload = { 
        ownerTeam: team, 
        status: 'sold',
        leagueID: draftleagueid
      };

      const response = await fetch(`${baseURL}/draftplayer/${selectedPlayer._id.$oid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Draft failed with status: ${response.status}`);
      }

      await fetchDraftBoard();
      resetDraftState();
    } catch (err) {
      console.error('Error drafting player:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const resetDraftState = () => {
    setSelectedPlayer(null);
    setSearchTerm('');
    setTimer(TIMER_DURATION);
    setTimerActive(false);
    setCurrentSelectingTeam(null);
    setSelectedCell(null);
    setIsLoading(false);
    setError(null);
  };

  const onCellClicked = (params) => {
    // Don't allow non-admins to interact with the draft board
    if (!isAdmin) return;
    
    if (params.value) {
      // Cell already has a player, don't allow override
      return;
    }
    
    setSelectedCell(params);
    
    // Extract the team name from the column
    const colId = params.column.colId;
    const teamIndex = parseInt(colId.replace('team', ''));
    
    // Update current selecting team
    if (TEAMS && teamIndex < TEAMS.length) {
      setCurrentSelectingTeam(TEAMS[teamIndex]);
    }
    
    startTimer();
    
    // Focus search input
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Generate column definitions only if TEAMS has data
  const columnDefs = [
    { 
      headerName: 'Round', 
      field: 'round', 
      width: 100,
      pinned: 'left',
      cellClass: params => `round-cell ${params.data.direction === 'forward' ? 'forward' : 'reverse'}`
    },
    ...(TEAMS?.length > 0 ? TEAMS.map((team, index) => ({ 
      headerName: team, 
      field: `team${index}`, 
      width: 160,
      cellRenderer: params => {
        // For non-admins, always show player info if available, but no "Click to draft" text
        if (!isAdmin) {
          return params.value ? 
            <div className="player-cell">{params.value}</div> : 
            <div className="empty-cell"></div>;
        }
        
        return params.value ? 
          <div className="player-cell">{params.value}</div> : 
          <div className="empty-cell">Click to draft</div>;
      },
      cellClass: params => {
        if (!isAdmin && !params.value) {
          return 'empty-cell non-interactive';
        }
        return params.value ? 'filled-cell' : 'empty-cell';
      }
    })) : [])
  ];

  // Default ColDef for all columns
  const defaultColDef = {
    sortable: false,
    filter: false,
    resizable: true
  };

  const getTimerClass = () => {
    if (timer <= 10) return 'timer-critical';
    if (timer <= 15 && timer > 10) return 'timer-warning';
    return 'timer-normal';
  };

  return (
    <div className="snake-draft-container">
      <Container fluid className="draft-main-container">
        <div className="draft-board-card">
          <div className="draft-header">
            <h1 className="draft-title">Draft Board</h1>
            {currentSelectingTeam && (
            <div className="admin-team-status">
                <div className="admin-team-selecting">
                <p className="admin-team-label">Team On the Clock is </p>
                <p className="admin-team-name">{currentSelectingTeam}</p>
                </div>
            </div>
            )}
            {isAdmin && (
              <div className="draft-controls-toggle">
                <button 
                  onClick={() => setShowControls(!showControls)}
                  className="toggle-button"
                >
                  {showControls ? 'Hide Controls' : 'Show Controls'}
                </button>
              </div>
            )}
          </div>


          {isAdmin && showControls && (
            <div className="draft-control-panel">
              <div className="search-timer-controls">
                <div className="search-container">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for a player..."
                    className="search-input"
                  />
                  <span className="search-icon"><SearchIcon/></span>
                </div>
                
                <div className="action-controls">
                  <div className={`timer-display ${getTimerClass()}`}>
                    <span className="timer-icon">⏱️</span>
                    <span className="timer-value">{timer}s</span>
                  </div>
                  
                  <button
                    onClick={searchPlayer}
                    disabled={isLoading || !draftleagueid}
                    className="search-button"
                  >
                    Search
                  </button>
                  
                  <button
                    onClick={draftPlayer}
                    disabled={!selectedPlayer || !selectedCell || isLoading || !draftleagueid}
                    className="draft-button"
                  >
                    Draft
                  </button>
                </div>
              </div>
            
              {selectedPlayer && (
                <div className="selected-player-card">
                  <h3 className="player-card-title">Selected Player</h3>
                  <div className="player-card-content">
                    <div className="player-info">
                      <p className="player-name">{selectedPlayer.player_name}</p>
                      <p className="player-details">
                      {selectedPlayer.ipl_team_name} • {selectedPlayer.player_role}
                      </p>
                    </div>
                    {selectedCell && TEAMS.length > 0 && (
                      <div className="draft-destination">
                        Draft to: {TEAMS[parseInt(selectedCell.column.colId.replace('team', ''))]}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {!draftleagueid && (
            <div className="error-message">
              <p>No league selected. Please select a league first.</p>
            </div>
          )}

          {!isAdmin && !currentSelectingTeam && (
            <div className="info-message">
              <p>You are in view-only mode. Only league admins can make draft selections.</p>
            </div>
          )}

          <Row className="draft-content">
            <Col lg={8} className="draft-grid-section">
              <div className="ag-theme-alpine draft-grid">
                {isLoading && !draftBoard.length ? (
                  <div className="loading-indicator">
                    <div className="spinner"></div>
                  </div>
                ) : draftBoard.length > 0 ? (
                  <AgGridReact
                    ref={gridRef}
                    rowData={draftBoard}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    onCellClicked={onCellClicked}
                    rowHeight={60}
                    headerHeight={50}
                    suppressMovableColumns={true}
                    animateRows={true}
                    domLayout="autoHeight"
                  />
                ) : (
                  <div className="no-data-message">
                    <p>No draft board data available</p>
                  </div>
                )}
              </div>
            </Col>
            
            <Col lg={4}>
              <div className="stats-container">
                <h2 className="stats-title">
                  <span className="stats-icon">🏆</span>
                  Team Stats
                </h2>
                
                {ownersData ? (
                  <DraftOwnerStats data={ownersData} />
                ) : (
                  <div className="no-stats-message">
                    <span className="info-icon">ℹ️</span>
                    <p>No team stats available</p>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default Snakedraft;