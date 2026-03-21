import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoginSuccess } from '../components/redux/reducer/authReducer';
import { setselectedLeagueId } from '../components/redux/reducer/leagueReducer';
import PlayerCard from './PlayerCard';
import OwnerStats from '../components/OwnerStats';
import settings from '../settings.json';
import './Auction.css';
import { useQuery } from '@tanstack/react-query';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import ShortcutConfigModal from '../components/ShortcutConfigModal';

const baseURL = process.env.REACT_APP_BASE_URL;

// Separate API service functions
const apiService = {
  fetchTeamList: async (leagueId) => {
    const response = await fetch(`${baseURL}/get_data?collectionName=teams&leagueId=${leagueId}`);
    if (!response.ok) throw new Error('Failed to fetch teams');
    return response.json();
  },
  
  getSpecificPlayer: async (leagueId, playerName) => {
    const response = await fetch(`${baseURL}/getspecificplayer?leagueId=${leagueId}&player_name=${playerName}`);
    if (!response.ok) throw new Error(`Failed to fetch player: ${playerName}`);
    return response.json();
  },
  
  getNextPlayer: async (leagueId) => {
    const response = await fetch(`${baseURL}/getplayer?leagueId=${leagueId}`);
    if (!response.ok) throw new Error('Failed to fetch next player');
    return response.json();
  },
  
  updatePlayerStatus: async (playerId, payload) => {
    const response = await fetch(`${baseURL}/updateplayer/${playerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Failed to update player status');
    return response.json();
  }
};

// Helper functions
const calculateIncrement = (currentAmount) => {
  if (currentAmount >= 500) return 50;
  if (currentAmount >= 200) return 20;
  if (currentAmount >= 100) return 10;
  return 5;
};

const isBidderDisabled = (owner, currentAmount, playerCountry) => {
  const squadFull = owner.totalCount >= settings.squadSize;
  const foreignFull = owner.fCount >= 6 && playerCountry === 'FOREIGN';
  const maxBidLow = owner.maxBid < currentAmount;
  return squadFull || foreignFull || maxBidLow;
};

// Default player object
const DEFAULT_PLAYER = {
  "_id": { "$oid": "63b90a44f4902c26b5359388" },
  "player_name": "Player Name",
  "ipl_salary": "50.0 L",
  "status": "unsold",
  "tier": 4,
  "player_role": "Type",
  "isOverseas": true,
  "ipl_team_name": "Franchise",
  "afc_base_salary": 20,
  "rank": 172,
  "points": 0,
  "todayPoints": 0
};

export const NewAuction = () => {
  // State variables
  const [selectedButton, setSelectedButton] = useState(null);
  const [bidder, setBidder] = useState('');
  const [amount, setAmount] = useState(20);
  const [disableMap, setDisableMap] = useState({});
  const [requestedPlayer, setRequestedPlayerChange] = useState("");
  const [editing, setEditing] = useState(false);
  const [timer, setTimer] = useState(15);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isSold, setIsSold] = useState(false);
  const [isunSold, setIsunSold] = useState(false);
  const [buttonSold, setButtonSold] = useState(true);
  const [buttonUnSold, setButtonUnSold] = useState(true);
  const [ownerToMaxBid, setOwnerToMaxBid] = useState({});
  const [ownersData, setOwnersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [player, setPlayerData] = useState(DEFAULT_PLAYER);
  const [firstBidMade, setFirstBidMade] = useState(false);
  const [shortcutModalOpen, setShortcutModalOpen] = useState(false);

  // Refs
  const timerId = useRef(null);
  const amountInputRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // Redux
  const dispatch = useDispatch();
  const auctionleagueid = useSelector((state) => state.league.selectedLeagueId);

  // Initialize from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const leagueId = localStorage.getItem('leagueId');
    
    if (token) {
      try {
        const user = JSON.parse(atob(token.split('.')[1]));
        dispatch(setLoginSuccess(user));
      } catch (e) {
        console.error("Failed to parse token:", e);
      }
    }

    if (leagueId) {
      dispatch(setselectedLeagueId(leagueId));
    }
  }, [dispatch]);

  // Timer effect
//   useEffect(() => {
//     if (timerId.current) {
//       clearInterval(timerId.current);
//       timerId.current = null;
//     }
    
//     if (isTimerRunning && timer > 0) {
//       timerId.current = setInterval(() => {
//         setTimer(prevTimer => {
//           if (prevTimer <= 1) {
//             clearInterval(timerId.current);
//             timerId.current = null;
//             setIsTimerRunning(false);
//             return 0;
//           }
//           return prevTimer - 1;
//         });
//       }, 1000);
//     }
    
//     return () => {
//       if (timerId.current) {
//         clearInterval(timerId.current);
//         timerId.current = null;
//       }
//     };
//   }, [isTimerRunning]);

    useEffect(() => {
        // Clear any existing interval first to prevent multiple timers
        clearInterval(timerId.current);
        
        if (isTimerRunning && timer > 0) {
            timerId.current = setInterval(() => {
                setTimer(prevTimer => prevTimer - 1);
            }, 1000);
        }
        
        return () => clearInterval(timerId.current);
    }, [isTimerRunning, timer]);

    useEffect(() => {
        if (timer <= 0) {
            clearInterval(timerId.current);
            // setIsTimerRunning(false);
        }
    }, [timer]);

  // Fetch teams data using react-query
  const { data: teamnameinfo, isLoading: teamsLoading } = useQuery({
    queryKey: ['teamsnameinfo', auctionleagueid],
    queryFn: () => apiService.fetchTeamList(auctionleagueid),
    enabled: !!auctionleagueid,
    onError: (error) => setError(`Failed to load teams: ${error.message}`)
  });

  // Store team names in state whenever teamnameinfo updates
  const buttonTexts = useMemo(() => {
    return teamnameinfo ? teamnameinfo.map(team => team.teamName) : [];
  }, [teamnameinfo]);

  const { shortcuts, setShortcut, resetShortcuts } = useKeyboardShortcuts(buttonTexts);

  // Fetch owners data
  const fetchOwnersData = useCallback(async (playerCountry, startingAmount = amount) => {
    try {
      const ownersData = await apiService.fetchTeamList(auctionleagueid);
      setOwnersData(ownersData);

      // Create a map of team name to maxBid and currentPurse
      const ownerMap = ownersData.reduce((acc, curr) => {
        acc[curr.teamName] = {
          maxBid: curr.maxBid,
          currentPurse: curr.currentPurse
        };
        return acc;
      }, {});
      setOwnerToMaxBid(ownerMap);

      // Update disable map based on current amount and player country
      const newDisableMap = {};
      ownersData.forEach(owner => {
        newDisableMap[owner.teamName] = isBidderDisabled(owner, startingAmount, playerCountry);
      });
      setDisableMap(newDisableMap);
      
      return ownersData;
    } catch (error) {
      setError(`Failed to fetch owners data: ${error.message}`);
      return [];
    }
  }, [auctionleagueid, amount]);

  // Handle player search and fetch
  const handlePlayerFetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let playerData;
      
      if (requestedPlayer) {
        playerData = await apiService.getSpecificPlayer(auctionleagueid, requestedPlayer);
      } else {
        playerData = await apiService.getNextPlayer(auctionleagueid);
      }
      
      // Reset auction state
      setPlayerData(playerData);
      setAmount(playerData.afc_base_salary);
      setBidder('');
      setSelectedButton(null);
      setRequestedPlayerChange("");
      setIsSold(false);
      setIsunSold(false);
      setButtonSold(false);
      setButtonUnSold(false);
      setFirstBidMade(false);
      
      // Reset and start timer
      if (timerId.current) {
        clearInterval(timerId.current);
        timerId.current = null;
      }
      setTimer(15);
      setIsTimerRunning(true);
      
      // Fetch updated owners data based on new player — pass base salary explicitly
      // to avoid stale `amount` closure reading the previous player's final bid
      await fetchOwnersData(playerData.isOverseas ? "FOREIGN" : "INDIAN", playerData.afc_base_salary);
    } catch (error) {
      setError(`Failed to fetch player: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [auctionleagueid, requestedPlayer, fetchOwnersData]);

  // Handle bidding and amount increase
  const handleBid = useCallback((teamName, index) => {
    if (!isTimerRunning || disableMap[teamName]) return;
    
    setSelectedButton(index);
    setBidder(teamName);
    
    // Reset timer on new bid
    setTimer(15);
    
    // Only increase amount after first bid has been made
    if (firstBidMade) {
      const increment = calculateIncrement(amount);
      const newAmount = amount + increment;
      setAmount(newAmount);
      
      // Update disable map with new amount
      if (ownersData.length > 0) {
        const playerCountry = player.isOverseas ? "FOREIGN" : "INDIAN";
        const newDisableMap = {};
        ownersData.forEach(owner => {
          newDisableMap[owner.teamName] = isBidderDisabled(owner, newAmount, playerCountry);
        });
        setDisableMap(newDisableMap);
      }
    } else {
      // Mark that first bid has been made
      setFirstBidMade(true);
    }
  }, [isTimerRunning, disableMap, amount, ownersData, player, firstBidMade]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = e.target.tagName;
      // Don't fire when typing in any input/textarea except our amount field
      if ((tag === 'INPUT' || tag === 'TEXTAREA') && e.target !== amountInputRef.current) return;

      const key = e.key === '?' ? '?' : e.key.toLowerCase();

      // Open shortcut config modal
      if (key === '?') {
        setShortcutModalOpen(true);
        return;
      }

      if (shortcutModalOpen) return;

      // Amount shortcuts
      if (key === 'a') {
        setEditing(true);
        setTimeout(() => amountInputRef.current?.focus(), 0);
        return;
      }

      // Search / Next Player shortcuts
      if (key === 's') {
        searchInputRef.current?.focus();
        return;
      }
      if (key === 'n') {
        handlePlayerFetch();
        return;
      }
      if (key === 'arrowup') {
        e.preventDefault();
        const next = amount + calculateIncrement(amount);
        setAmount(next);
        if (ownersData.length > 0) {
          const playerCountry = player.isOverseas ? 'FOREIGN' : 'INDIAN';
          const newDisableMap = {};
          ownersData.forEach(owner => { newDisableMap[owner.teamName] = isBidderDisabled(owner, next, playerCountry); });
          setDisableMap(newDisableMap);
        }
        return;
      }
      if (key === 'arrowdown') {
        e.preventDefault();
        const next = Math.max(player.afc_base_salary, amount - calculateIncrement(amount));
        setAmount(next);
        if (ownersData.length > 0) {
          const playerCountry = player.isOverseas ? 'FOREIGN' : 'INDIAN';
          const newDisableMap = {};
          ownersData.forEach(owner => { newDisableMap[owner.teamName] = isBidderDisabled(owner, next, playerCountry); });
          setDisableMap(newDisableMap);
        }
        return;
      }

      // Team bid shortcuts
      const teamName = Object.keys(shortcuts).find(t => shortcuts[t] === key);
      if (teamName) {
        const index = buttonTexts.indexOf(teamName);
        if (index !== -1) handleBid(teamName, index);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [shortcuts, buttonTexts, amount, player, ownersData, shortcutModalOpen, handleBid, handlePlayerFetch]);

  // Handle manual amount editing
  const handleAmountChange = (event) => {
    // Parse and validate input
    const newAmount = parseInt(event.target.value);
    if (isNaN(newAmount) || newAmount < 0) return;
    
    setAmount(newAmount);
    
    // Update disable map with new amount if owners data is available
    if (ownersData.length > 0) {
      const playerCountry = player.isOverseas ? "FOREIGN" : "INDIAN";
      const newDisableMap = {};
      ownersData.forEach(owner => {
        newDisableMap[owner.teamName] = isBidderDisabled(owner, newAmount, playerCountry);
      });
      setDisableMap(newDisableMap);
    }
  };

  // Handle sold/unsold status
  const handlePlayerStatus = async (status, currentBidder, currentAmount) => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      const payload = {
        ownerTeam: currentBidder,
        status: status,
        boughtFor: currentAmount,
        player_role: player.player_role,
        isOverseas: player.isOverseas
      };
      
      if (status === 'sold') {
        setIsSold(true);
        setButtonSold(true);
        setButtonUnSold(true);
      } else {
        setIsunSold(true);
        setButtonSold(true);
        setButtonUnSold(true);
      }
      
      // Stop timer
      setIsTimerRunning(false);
      if (timerId.current) {
        clearInterval(timerId.current);
        timerId.current = null;
      }
      
      // Update player status on server
      await apiService.updatePlayerStatus(player._id.$oid, payload);
      
      // Refresh owners data after successful update
      await fetchOwnersData(player.isOverseas ? "FOREIGN" : "INDIAN");
    } catch (error) {
      setError(`Failed to update player status: ${error.message}`);
      
      // Reset status on error
      if (status === 'sold') {
        setIsSold(false);
        setButtonSold(false);
      } else {
        setIsunSold(false);
        setButtonUnSold(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auction-page">
      <div className="main-container">
        {/* Error display */}
        {error && (
          <div className="error-message">
            <div className="alert alert-danger">{error}</div>
          </div>
        )}
        
        {/* Top Left (Player Display) */}
        <div className="player-display">
          <div className="player-card-wrapper">
            <PlayerCard
              playerName={player?.player_name}
              country={player?.isOverseas ? "FOREIGN" : "INDIAN"}
              type={player?.player_role}
              franchise={player?.ipl_team_name}
            />
            <div className="player-stats">
              <div className="stat-chip highlight">Rank #{player?.rank}</div>
              <div className="stat-chip">Tier {player?.tier}</div>
              <div className="stat-chip">Base {player?.afc_base_salary}L</div>
              <div className="stat-chip">IPL {player?.ipl_salary}</div>
              <div className="stat-chip">{player?.points} pts</div>
            </div>
            {isSold && <div className="sold-tag">SOLD</div>}
            {isunSold && <div className="unsold-tag">UNSOLD</div>}
          </div>
          <div className="bidding-area">
            <div className="bid-info">
              <div className="bid-stat-card">
                <span className="bid-stat-label">Current Bidder</span>
                <span className="bid-stat-value">{bidder || "—"}</span>
              </div>
              <div className="bid-stat-card amount-card">
                <span className="bid-stat-label">Bid Amount</span>
                {editing ? (
                  <input
                    ref={amountInputRef}
                    type="number"
                    value={amount}
                    min={1}
                    onBlur={() => setEditing(false)}
                    onChange={handleAmountChange}
                    className="bid-input"
                    autoFocus
                  />
                ) : (
                  <span className="bid-stat-value amount-value" onDoubleClick={() => setEditing(true)}>
                    {amount} <span className="bid-unit">lacs</span>
                  </span>
                )}
              </div>
              <div className="bid-stat-card">
                <span className="bid-stat-label">Current Purse</span>
                <span className="bid-stat-value">{bidder ? (ownerToMaxBid[bidder]?.currentPurse || 0) : "—"} {bidder ? <span className="bid-unit">lacs</span> : ""}</span>
              </div>
              <div className="bid-stat-card">
                <span className="bid-stat-label">Max Bid</span>
                <span className="bid-stat-value">{bidder ? (ownerToMaxBid[bidder]?.maxBid || 0) : "—"} {bidder ? <span className="bid-unit">lacs</span> : ""}</span>
              </div>
            </div>
            <div className="auction-timer-and-actions">
              {isTimerRunning && (
                <div className={`auction-timer ${timer <= 5 ? 'auction-timer-warning' : ''}`}>
                  {timer}
                </div>
              )}
              <button
                className="shortcut-hint-btn"
                onClick={() => setShortcutModalOpen(true)}
                title="Keyboard shortcuts"
              >
                ?
              </button>
              <div className="action-buttons">
                <button
                  className={`btn ${isSold ? 'btn-success' : 'btn-primary'}`}
                  onClick={() => handlePlayerStatus('sold', bidder, amount)}
                  disabled={buttonSold || !bidder || loading}
                >
                  {loading && isSold ? "Processing..." : "Mark Sold"}
                </button>
                <button
                  className={`btn ${isunSold ? 'btn-secondary' : 'btn-outline-secondary'}`}
                  onClick={() => handlePlayerStatus('unsold-processed', '', 0)}
                  disabled={buttonUnSold || loading}
                >
                  {loading && isunSold ? "Processing..." : "Mark Unsold"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Top Right (Owner Stats) */}
        <div className="owner-stats-container">
          {ownersData.length > 0 && <OwnerStats data={ownersData} />}
        </div>

        {/* Bottom Left (Team Buttons) */}
        <div className="team-buttons">
          <div className="team-buttons-grid">
            {buttonTexts.map((text, index) => (
              <div
                key={index}
                className={`team-btn-container ${selectedButton === index ? 'selected' : ''} ${disableMap[text] ? 'disabled' : ''}`}
              >
                {selectedButton === index && (
                  <img
                    src={require('../assets/images/auction_hand.png')}
                    alt="bidding"
                    className="bid-paddle"
                  />
                )}
                <button
                  disabled={disableMap[text] || loading || isSold || isunSold}
                  onClick={() => handleBid(text, index)}
                >
                  {text}
                  {shortcuts[text] && (
                    <span className="team-btn-shortcut-key">{shortcuts[text].toUpperCase()}</span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        <ShortcutConfigModal
          open={shortcutModalOpen}
          onClose={() => setShortcutModalOpen(false)}
          teams={buttonTexts}
          shortcuts={shortcuts}
          setShortcut={setShortcut}
          resetShortcuts={resetShortcuts}
        />

        {/* Bottom Right (Next Player Controls) */}
        <div className="next-player-controls">
          <div className="search-player">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search player by name..."
              value={requestedPlayer}
              onChange={(e) => setRequestedPlayerChange(e.target.value)}
              className="player-search-input"
              disabled={loading}
            />
            <button 
              className="btn btn-primary" 
              onClick={handlePlayerFetch}
              disabled={loading}
            >
              {loading ? "Loading..." : requestedPlayer ? "Search Player" : "Next Player"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewAuction;