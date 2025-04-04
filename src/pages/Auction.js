import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux';
import { setLoginSuccess } from '../components/redux/reducer/authReducer';
import { setselectedLeagueId } from '../components/redux/reducer/leagueReducer';
import PlayerCard from './PlayerCard';
import OwnerStats from '../components/OwnerStats';
import settings from '../settings.json';
import './Auction.css';
import { useQuery } from '@tanstack/react-query';

const baseURL = process.env.REACT_APP_BASE_URL;

const fetchteamlist = async (Id) => {
  const response = await fetch(baseURL+'/get_data?collectionName=teams&leagueId='+Id);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

export const Auction = () => {
  const [selectedButton, setSelectedButton] = useState(null);
  const [bidder, setBidder] = useState('');
  const [amount, setAmount] = useState(20);
  const [disableMap, setDisableMap] = useState({});
  const [requestedPlayer, setRequestedPlayerChange] = useState("");
  const [editing, setEditing] = useState(false);
  const [timer, setTimer] = useState(15);
  const [firstClick, setFirstClick] = useState(true);
  const [isSold, setIsSold] = useState(false);
  const [isunSold, setIsunSold] = useState(false);
  const [buttonSold, setButtonSold] = useState(true);
  const [buttonunSold, setButtonUnSold] = useState(true);
  const [ownerToMaxBid, setOwnerToMaxBid] = useState({});
  const [ownersData, setOwnersData] = useState();
  const [isflag, setFlag] = useState(false);
  const timerId = useRef();
  const dispatch = useDispatch();
  const [buttonTexts, setButtonTexts] = useState([])

  const auctionleagueid = useSelector((state) => state.league.selectedLeagueId);
  console.log(auctionleagueid)
  console.log(buttonTexts)
  //const buttonTexts = settings.setup.teamNames;

  const sample = {
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
  }
  const [getPlayer, setPlayerData] = useState(sample);

  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   const leagueId = localStorage.getItem('leagueId');
  //   if (token) {
  //     const user = JSON.parse(atob(token.split('.')[1]));
  //     dispatch(setLoginSuccess(user));
  //   }

  //   if (leagueId) {
  //     dispatch(setselectedLeagueId(leagueId));
  //   }
  // }, [dispatch]);

  useEffect(() => {
    timerId.current = setInterval(() => {
      setTimer(timer => timer - 1)
    }, 1000)
    return () => clearInterval(timerId.current)
  }, [timer]);

  useEffect(() => {
    if (timer <= 0) {
      clearInterval(timerId.current)
    }
  }, [timer]);

  const handleRequestedPlayerChange = event => {
    setRequestedPlayerChange(event.target.value);
  };

  const handleClick = async () => {
    if (requestedPlayer !== "") {
      try {
        const response = await fetch(baseURL + '/getspecificplayer?leagueId=' + auctionleagueid + '&player_name=' + requestedPlayer);
        if (response.ok) {
          const json = await response.json();
          actionsAfterGetPlayer(json);
        } else {
          console.log('Error: ' + response.status + response.body);
        }
      } catch (error) {
        console.error(error);
      }
      return
    }

    try {
      const response = await fetch(baseURL + '/getplayer?leagueId=' + auctionleagueid);
      if (response.ok) {
        const json = await response.json();
        actionsAfterGetPlayer(json);
      } else {
        console.log('Error: ' + response.status + response.body);
      }
    } catch (error) {
      console.error(error);
    }
  };

  async function getOwnersData(prop) {
    try {
      const response = await fetch(baseURL + '/get_data?leagueId=' + auctionleagueid + '&collectionName=teams');
      if (response.ok) {
        const json = await response.json();
        setOwnersData(json);

        const data = json.reduce((acc, curr) => {
          acc[curr.teamName] = { maxBid: curr.maxBid, currentPurse: curr.currentPurse };
          return acc;
        }, {});
        
        const disableMapTemp = json.reduce((map, curr) => {
          if (curr.totalCount === settings.squadSize || (curr.fCount === 6 && prop !== 'India') || curr.maxBid < amount) {
            map[curr.teamName] = true;
          }
          return map;
        }, {});
        
        setDisableMap(disableMapTemp);
        setOwnerToMaxBid(data);
      } else {
        console.log('Error: ' + response.status + response.body);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const { isLoading, error, data:teamnameinfo } = useQuery({
    queryKey:['teamsnameinfo'], 
    queryFn:async()=>{
      let response;
      try{
        response = await fetchteamlist(auctionleagueid);
      }catch(error){
        console.log(error)
      }
      return response
    },
    enabled: (auctionleagueid !== null && buttonTexts.length===0),
    }
  );

  useEffect(() => {
    if (teamnameinfo) {
      const teamNames = teamnameinfo.map(team => team.teamName);
      setButtonTexts(teamNames);
    }
  }, [teamnameinfo]); 

  function actionsAfterGetPlayer(json) {
    setPlayerData(json);
    setAmount(json.afc_base_salary);
    setBidder('');
    setSelectedButton(null);
    setFirstClick(true);
    setRequestedPlayerChange("");
    getOwnersData(json.country);
    setTimer(15);
    setFlag(true);
    setIsSold(false);
    setIsunSold(false);
    setButtonSold(false);
    setButtonUnSold(false);
  }

  function increaseAmount(playercountry) {
    if (firstClick) {
      setFirstClick(false)
      return
    }
    
    let increment = 5;
    if (amount >= 500) {
      increment = 50
    } else if (amount >= 200 && amount < 500) {
      increment = 20;
    } else if (amount >= 100 && amount < 200) {
      increment = 10;
    }
    
    setAmount(amount + increment)
    
    const disableMapTemp = ownersData.reduce((map, curr) => {
      if (curr.totalCount === settings.squadSize || (curr.fCount === 6 && playercountry !== false) || curr.maxBid < amount) {
        map[curr.ownerName] = true;
      }
      return map;
    }, {});
    
    setDisableMap(disableMapTemp);
  }

  const handleDoubleClick = () => {
    setEditing(true);
  };

  const handleBlur = () => {
    setEditing(false);
  };

  const handleChange = event => {
    setAmount(parseInt(event.target.value));
  };

  const handleSoldClick = (inStatus, inBidder, inAmount) => {
    const payload = { 
      ownerTeam: inBidder, 
      status: inStatus, 
      boughtFor: inAmount, 
      player_role: getPlayer.player_role, 
      isOverseas: getPlayer.isOverseas 
    };
    
    if (inStatus === 'sold') {
      setIsSold(true)
      setButtonSold(true)
    } else {
      setIsunSold(true)
      setButtonUnSold(true)
    }
    
    fetch(baseURL + '/updateplayer/' + getPlayer._id.$oid, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      console.error(error);
    });
    
    setFlag(false)
  }

  return (
    <div className="auction-page">
      <div className="main-container">
        {/* Top Left (Player Display) */}
        <div className="player-display">
          <div className="player-card-wrapper">
            <PlayerCard 
              playerName={getPlayer?.player_name}
              country={getPlayer?.isOverseas ? "FOREIGN" : "INDIAN"}
              type={getPlayer?.player_role}
              franchise={getPlayer?.ipl_team_name}
            />
            {isSold && <div className="sold-tag">SOLD</div>}
            {isunSold && <div className="unsold-tag">UNSOLD</div>}
          </div>
          <div className="bidding-area">
            <div className="bid-info">
              <div className="bid-detail">
                <span className="label">Current Bidder:</span>
                <span className="value">{bidder || "—"}</span>
              </div>
              <div className="bid-detail">
                <span className="label">Bid Amount:</span>
                {editing ? (
                  <input
                    type="text"
                    value={amount}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    className="bid-input"
                  />
                ) : (
                  <span className="value" onDoubleClick={handleDoubleClick}>
                    {amount} lacs
                  </span>
                )}
              </div>
              {bidder && (
                <>
                  <div className="bid-detail">
                    <span className="label">Current Purse:</span>
                    <span className="value">{ownerToMaxBid[bidder]?.currentPurse || 0} lacs</span>
                  </div>
                  <div className="bid-detail">
                    <span className="label">Max Bid:</span>
                    <span className="value">{ownerToMaxBid[bidder]?.maxBid || 0} lacs</span>
                  </div>
                </>
              )}
            </div>
            <div className="auction-timer-and-actions">
              {isflag && (
                <div className={`auction-timer ${timer <= 5 ? 'auction-timer-warning' : ''}`}>
                  {timer}
                </div>
              )}
              <div className="action-buttons">
                <button 
                  className={`btn ${isSold ? 'btn-success' : 'btn-primary'}`} 
                  onClick={() => handleSoldClick('sold', bidder, amount)} 
                  disabled={buttonSold || !bidder}
                >
                  Mark Sold
                </button>
                <button 
                  className={`btn ${isunSold ? 'btn-secondary' : 'btn-outline-secondary'}`} 
                  onClick={() => handleSoldClick('unsold-processed', '', 0)} 
                  disabled={buttonunSold}
                >
                  Mark Unsold
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Top Right (Owner Stats) */}
        <div className="owner-stats-container">
          {ownersData && <OwnerStats data={ownersData} />}
        </div>

        {/* Bottom Left (Team Buttons) */}
        <div className="team-buttons">
          <div className="team-buttons-grid">
            {buttonTexts?.map((text, index) => (
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
                  disabled={disableMap[text]} 
                  onClick={() => {
                    setSelectedButton(index);
                    setBidder(text);
                    increaseAmount(getPlayer.isOverseas);
                    setTimer(15);
                  }}
                >
                  {text}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Right (Next Player Controls) */}
        <div className="next-player-controls">
          <div className="search-player">
            <input 
              type="text" 
              placeholder="Search player by name..." 
              value={requestedPlayer} 
              onChange={handleRequestedPlayerChange}
              className="player-search-input"
            />
            <button className="btn btn-primary" onClick={handleClick}>
              {requestedPlayer ? "Search Player" : "Next Player"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auction;