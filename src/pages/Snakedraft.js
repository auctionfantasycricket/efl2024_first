import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Container, Row, Col } from 'react-bootstrap';
import SearchIcon from '@mui/icons-material/Search';
import './Snakedraft.css';
import DraftOwnerStats from '../components/DraftOwnerStats';

// Constants
const baseURL = process.env.REACT_APP_BASE_URL;
const ROUNDS = 10;
const TIMER_DURATION = 30;

// Get the actual team array index for a given round and pick position (snake order)
const getTeamArrayIndex = (round, pickIndex, teamCount) => {
  const isEven = round % 2 === 0;
  return isEven ? pickIndex : teamCount - 1 - pickIndex;
};

const Snakedraft = () => {
  const [draftBoard, setDraftBoard] = useState([]);
  const [timer, setTimer] = useState(TIMER_DURATION);
  const [timerActive, setTimerActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [ownersData, setOwnersData] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [TEAMS, setTeams] = useState([]);

  // Auto-draft position tracking
  const [currentRound, setCurrentRound] = useState(0);
  const [currentPickIndex, setCurrentPickIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [draftComplete, setDraftComplete] = useState(false);
  const [draftInitialized, setDraftInitialized] = useState(false);

  // Derived: which team is currently on the clock
  const currentSelectingTeam = (TEAMS.length > 0 && !draftComplete)
    ? TEAMS[getTeamArrayIndex(currentRound, currentPickIndex, TEAMS.length)]
    : null;

  const gridRef = useRef(null);
  const timerRef = useRef(null);
  const searchInputRef = useRef(null);

  const draftleagueid = useSelector((state) => state.league.selectedLeagueId);
  const userProfile = useSelector((state) => state.login.userProfile);
  const leagueinfo = useSelector((state) => state.league.currentLeague);

  const adminEmails = leagueinfo?.admins;
  const isAdmin = adminEmails && adminEmails.includes(userProfile?.email);

  // Fetch board when league changes
  useEffect(() => {
    if (draftleagueid) {
      setDraftInitialized(false);
      setDraftComplete(false);
      fetchDraftBoard();
    }
    return () => clearInterval(timerRef.current);
  }, [draftleagueid]);

  // Timer countdown
  useEffect(() => {
    if (timerActive && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0 && timerActive) {
      handleTimerEnd();
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, timer]);

  // Refresh grid highlight when pick position changes
  useEffect(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.refreshCells({ force: true });
    }
  }, [currentRound, currentPickIndex, draftComplete]);

  // Auto-start timer once board is first initialized
  useEffect(() => {
    if (draftInitialized && !draftComplete && !isPaused) {
      startTimer();
    }
  }, [draftInitialized]);

  // Scan board in snake order to find the first empty slot
  const findNextPick = (board, teams) => {
    for (let r = 0; r < ROUNDS; r++) {
      const isEven = r % 2 === 0;
      for (let i = 0; i < teams.length; i++) {
        const teamArrayIndex = isEven ? i : teams.length - 1 - i;
        if (!board[r][`team${teamArrayIndex}`]) {
          return { round: r, pickIndex: i };
        }
      }
    }
    return null; // all slots filled
  };

  const fetchDraftBoard = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${baseURL}/get_data?leagueId=${draftleagueid}&collectionName=teams`);
      if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);

      const data = await response.json();
      setOwnersData(data);

      const teamNames = data.map(team => team.teamName);
      setTeams(teamNames);

      const board = formatDraftBoard(data, teamNames);
      setDraftBoard(board);

      const next = findNextPick(board, teamNames);
      if (next) {
        setCurrentRound(next.round);
        setCurrentPickIndex(next.pickIndex);
        setDraftComplete(false);
      } else {
        setDraftComplete(true);
        stopTimer();
      }

      setDraftInitialized(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching draft board:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const formatDraftBoard = (data, teams) => {
    if (!teams || teams.length === 0) return [];
    return Array.from({ length: ROUNDS }, (_, roundIndex) => {
      const isEvenRound = roundIndex % 2 === 0;
      const row = {
        round: `R${roundIndex + 1} ${isEvenRound ? '➡️' : '⬅️'}`,
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

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      setTimerActive(true); // resume from current timer value
    } else {
      setIsPaused(true);
      clearInterval(timerRef.current);
      setTimerActive(false); // freeze without resetting timer
    }
  };

  const handleTimerEnd = async () => {
    stopTimer();
    if (!selectedPlayer) {
      await autoSelectNext();
    }
  };

  const autoSelectNext = async (retries = 0) => {
    if (retries >= 3) {
      setError('Could not find an available player after 3 attempts');
      return;
    }
    try {
      const response = await fetch(`${baseURL}/getrandomdraftplayer?leagueId=${draftleagueid}`);
      if (!response.ok) throw new Error('Player fetch failed');
      const player = await response.json();
      if (!player || typeof player !== 'object' || !player._id) throw new Error('No available player returned');
      setSelectedPlayer(player);
    } catch (err) {
      console.error('Auto-select attempt failed:', err);
      await autoSelectNext(retries + 1);
    }
  };

  const searchPlayer = async () => {
    if (!searchTerm.trim()) return;
    setError(null);
    try {
      setIsLoading(true);
      const response = await fetch(
        `${baseURL}/getspecificplayer?leagueId=${draftleagueid}&player_name=${searchTerm.toLowerCase()}`
      );
      if (!response.ok) {
        if (response.status === 404) {
          const errorData = await response.json();
          if (errorData?.error === 'Player not found') {
            setError('Player not found or Player already drafted');
            setIsLoading(false);
            return;
          }
        }
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

  // Core draft execution — takes player directly to avoid stale state issues
  const executeDraft = async (player) => {
    if (!player || !isAdmin || TEAMS.length === 0) return;

    const teamArrayIdx = getTeamArrayIndex(currentRound, currentPickIndex, TEAMS.length);
    const team = TEAMS[teamArrayIdx];

    const payload = {
      ownerTeam: team,
      status: 'sold',
      leagueID: draftleagueid
    };

    try {
      setIsLoading(true);
      const playerId = player._id?.$oid || player._id;
      const response = await fetch(`${baseURL}/draftplayer/${playerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Draft failed with status: ${response.status}`);

      // Refresh board
      const boardResponse = await fetch(
        `${baseURL}/get_data?leagueId=${draftleagueid}&collectionName=teams`
      );
      if (!boardResponse.ok) throw new Error('Board refresh failed');
      const data = await boardResponse.json();
      setOwnersData(data);
      const teamNames = data.map(t => t.teamName);
      setTeams(teamNames);
      const newBoard = formatDraftBoard(data, teamNames);
      setDraftBoard(newBoard);

      // Advance to next pick
      const next = findNextPick(newBoard, teamNames);
      if (next) {
        setCurrentRound(next.round);
        setCurrentPickIndex(next.pickIndex);
        if (!isPaused) startTimer();
      } else {
        setDraftComplete(true);
        stopTimer();
      }

      setSelectedPlayer(null);
      setSearchTerm('');
      setError(null);
      setIsLoading(false);
    } catch (err) {
      console.error('Error drafting player:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const draftPlayer = () => {
    if (selectedPlayer) executeDraft(selectedPlayer);
  };

  const getTimerClass = () => {
    if (timer <= 10) return 'timer-critical';
    if (timer <= 15) return 'timer-warning';
    return 'timer-normal';
  };

  const columnDefs = [
    {
      headerName: 'Round',
      field: 'round',
      width: 100,
      pinned: 'left',
      cellClass: params => `round-cell ${params.data.direction === 'forward' ? 'forward' : 'reverse'}`
    },
    ...(TEAMS?.length > 0 ? TEAMS.map((team, index) => {
      const onTheClockTeamIndex = getTeamArrayIndex(currentRound, currentPickIndex, TEAMS.length);
      const isOnTheClockCol = !draftComplete && onTheClockTeamIndex === index;

      return {
        headerName: team,
        field: `team${index}`,
        width: 160,
        cellRenderer: params => {
          const isThisCell = isOnTheClockCol && params.node.rowIndex === currentRound && !params.value;
          if (!isAdmin) {
            return params.value
              ? <div className="player-cell">{params.value}</div>
              : <div className="empty-cell"></div>;
          }
          if (isThisCell) {
            return <div className="on-the-clock-cell">🎯 On the Clock</div>;
          }
          return params.value
            ? <div className="player-cell">{params.value}</div>
            : <div className="empty-cell"></div>;
        },
        cellClassRules: {
          'on-the-clock-cell-wrapper': params =>
            isOnTheClockCol && params.node.rowIndex === currentRound && !params.value,
          'filled-cell': params => !!params.value,
          'empty-cell': params => !params.value && !(isOnTheClockCol && params.node.rowIndex === currentRound)
        }
      };
    }) : [])
  ];

  const defaultColDef = {
    sortable: false,
    filter: false,
    resizable: true
  };

  return (
    <div className="snake-draft-container">
      <Container fluid className="draft-main-container">
        <div className="draft-board-card">
          <div className="draft-header">
            <h1 className="draft-title">Draft Board</h1>

            {currentSelectingTeam && !draftComplete && (
              <div className="admin-team-status">
                <div className="admin-team-selecting">
                  <p className="admin-team-label">Team On the Clock is</p>
                  <p className="admin-team-name">{currentSelectingTeam}</p>
                </div>
              </div>
            )}

            {draftComplete && (
              <div className="draft-complete-badge">✅ Draft Complete</div>
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

          {isAdmin && showControls && !draftComplete && (
            <div className="draft-control-panel">
              <div className="search-timer-controls">
                <div className="search-container">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchPlayer()}
                    placeholder="Search for a player..."
                    className="search-input"
                  />
                  <span className="search-icon"><SearchIcon /></span>
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
                    disabled={!selectedPlayer || isLoading || !draftleagueid}
                    className="draft-button"
                  >
                    Draft
                  </button>

                  <button
                    onClick={togglePause}
                    className={`pause-button ${isPaused ? 'is-paused' : ''}`}
                  >
                    {isPaused ? '▶ Resume' : '⏸ Pause'}
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
                    {currentSelectingTeam && (
                      <div className="draft-destination">
                        Draft to: {currentSelectingTeam}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="error-message"><p>{error}</p></div>
          )}

          {!draftleagueid && (
            <div className="error-message">
              <p>No league selected. Please select a league first.</p>
            </div>
          )}

          {!isAdmin && (
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
