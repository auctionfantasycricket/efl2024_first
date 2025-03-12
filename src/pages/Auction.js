import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col } from "react-bootstrap";
import './Auction.css'
import PlayerCard from './PlayerCard';
import settings from '../settings.json'
import OwnerStats from '../components/OwnerStats'
import { useSelector } from 'react-redux';

const baseURL = process.env.REACT_APP_BASE_URL;
//const auctionleagueid = process.env.REACT_APP_AUCTION_LEAGUE_ID;

export const Auction = () => {

    const [selectedButton, setSelectedButton] = useState(null);
    const [bidder, setBidder] = useState('');
    const [amount, setAmount] = useState(20);
    const [disableMap, setDisableMap] = useState({})

    const auctionleagueid = useSelector((state) => state.league.selectedLeagueId);


    const buttonTexts = settings.setup.teamNames;

    const sample = {
        "_id":{"$oid":"63b90a44f4902c26b5359388"},
        "player_name": "Player Name",
        "ipl_salary": "50.0 L",
        "status": "unsold",
        "tier": 4,
        "player_role": "Type",
        "isOverseas": true,
        //"country": "Country Name",
        "ipl_team_name": "Franchise",
        //"ownerTeam": "",
        //"boughtFor": 0,
        "afc_base_salary": 20,
        "rank": 172,
        "points":0,
        "todayPoints":0
      }
    const [getPlayer, setPlayerData] = useState(sample);
    const [isflag, setFlag] = useState(false) 
    const [ownerToMaxBid, setOwnerToMaxBid] = useState({})
    const [ownersData, setOwnersData] = useState()
    const [isSold, setIsSold] = useState(false);
    const [isunSold, setIsunSold] = useState(false);
    const [buttonSold, setButtonSold] = useState(true);
    const [buttonunSold, setButtonUnSold] = useState(true);
    const [firstClick,setFirstClick] = useState(true)
    const [editing, setEditing] = useState(false);
    const [timer, setTimer] = useState(10)
    const timerId = useRef()

    /*****Getting the Player code *******/
    const [requestedPlayer, setRequestedPlayerChange] = useState("");
    const handleRequestedPlayerChange = event => {
        setRequestedPlayerChange(event.target.value);
    };

    const handleClick = async () => {
        if(requestedPlayer!=="")
        {
          try{
          const response = await fetch(baseURL+'/getspecificplayer?leagueId='+auctionleagueid+'&player_name='+requestedPlayer);
          if(response.ok)
          {
            const json = await response.json();
            actionsAfterGetPlayer(json);
         } else {
           console.log('Error: ' + response.status + response.body);
         }
          
    
          }catch (error) {
            console.error(error);
          }
          return
          
        }
        try {
          const response = await fetch(baseURL+'/getplayer?leagueId='+auctionleagueid);
          if(response.ok){
            const json = await response.json();
            actionsAfterGetPlayer(json);
         } else {
           console.log('Error: ' + response.status + response.body);
         }
        } catch (error) {
          console.error(error);
        }
      };


      /*********Get Owners data ********/

      async function getOwnersData(prop)
    {
    try {
      const response = await fetch(baseURL+'/get_data?leagueId='+auctionleagueid+'&collectionName=teams');
      if(response.ok){
        const json = await response.json();
        //console.log("teams",json)
        setOwnersData(json)
        const data = json.reduce((acc, curr) => {
          acc[curr.teamName] = {maxBid:curr.maxBid,currentPurse: curr.currentPurse};
          return acc;
      }, {});
      const disableMapTemp = json.reduce((map, curr) => {
        //console.log('CURR',curr);
        // if squad is full or foreigner count is 6 or current amount is greater than maxBid for owner
        // set disable to true
        if(curr.totalCount===settings.squadSize||(curr.fCount===6 && prop !== 'India')||curr.maxBid<amount)
        {
          map[curr.teamName]=true;
        }
        return map;
    }, {});
    //console.log(disableMapTemp);
    setDisableMap(disableMapTemp);
        //console.log(data)
        setOwnerToMaxBid(data)
     } else {
       console.log('Error: ' + response.status + response.body);
     }
    } catch (error) {
      console.error(error);
    }
  }



  function actionsAfterGetPlayer(json) {
    setPlayerData(json);
    setAmount(json.afc_base_salary);
    setBidder('');
    setSelectedButton(null);
    setFirstClick(true);
    setRequestedPlayerChange("");
    getOwnersData(json.country);
    setTimer(10);
    setFlag(true);
    setIsSold(false);
    setIsunSold(false);
    setButtonSold(false);
    setButtonUnSold(false);
  }


  /*****Bid increament*****/  
  function increaseAmount(playercountry)
  {
    // for the first bid set to base price
    if(firstClick)
    {
      setFirstClick(false)
      return
    }
    let increment = 5;
    if (amount >= 500)
    {
        increment = 50
    }
    else if (amount >= 200 && amount < 500)
    {
      increment = 20;
    }else if (amount >= 100 && amount < 200){
      increment = 10;
    }
    setAmount(amount+increment)
    const disableMapTemp = ownersData.reduce((map, curr) => {
      if(curr.totalCount===settings.squadSize||(curr.fCount===6 && playercountry !== false )||curr.maxBid<amount)
      {
        map[curr.ownerName]=true;
      }
      return map;
  }, {});
  setDisableMap(disableMapTemp);
  }

  /****Manual Bid ****/
    const handleDoubleClick = () => {
        setEditing(true);
    };

    const handleBlur = () => {
        setEditing(false);
    };

    const handleChange = event => {
        setAmount(parseInt(event.target.value));
    };

    /*****Timer*****/
    useEffect(() => {
        timerId.current = setInterval(() => {
                setTimer(timer => timer - 1)
            },1000)
            return () => clearInterval(timerId.current)
        }, [timer])

    useEffect(() =>{
        if (timer <= 0) {
            clearInterval(timerId.current)
        }
    }, [timer])

    /***Handle sold and unsold***/

    const handleSoldClick = (inStatus,inBidder,inAmount) => {

        const payload = { ownerTeam: inBidder , status: inStatus, boughtFor: inAmount, player_role: getPlayer.player_role, isOverseas: getPlayer.isOverseas};
        //console.log(inStatus,inBidder,inAmount)
        if (inStatus === 'sold')
        {
            setIsSold(true)
            setButtonSold(true)
        }
        else
        {
            setIsunSold(true)
            setButtonUnSold(true)
        }
        //console.log(payload)
        fetch(baseURL+'/updateplayer/'+getPlayer._id.$oid, {
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
    <div className='auctionpage'>
        <div className='auctioncontainer'>
      <Row className="autiontoprow">
        <Col>
        <div className="owner-table-item">
          <div style={{display: "flex", flexDirection:"column",position:"relative",marginTop:"15px"}}>
          {ownersData && <OwnerStats data={ownersData}/> }
          </div>
      </div>
        </Col>
        <Col>
        <Row className='itemstoprow'>
        <div className="player-card-container">
        <PlayerCard playerName={getPlayer.player_name}
         country={getPlayer.isOverseas? "Foreign":"Indian"} 
         type={getPlayer.player_role} 
         franchise={getPlayer.ipl_team_name}/>
         
        {isSold && <div style={{color:"red", fontSize:"40px",marginTop:"-60px"}}>SOLD</div>}
        {isunSold && <div style={{color:"gray", fontSize:"40px",marginTop:"-60px"}}>UNSOLD</div>}
        </div>
         </Row>
         <Row className='itemsbottomrow'>
        <Col>
         <div className="text-boxes-container">
         <p style={{marginTop:"15px",marginRight:"20px"}} className='shiny-text'> Current Bidder: {bidder}</p>
         {editing ? (
        <input
          type="text"
          value={amount}
          onBlur={handleBlur}
          onChange={handleChange}
        />
      ) :(
         <p style={{marginTop:"15px",marginRight:"20px"}} className="shiny-text" onDoubleClick={handleDoubleClick}>
          BID: {amount} lacs
        </p>)}

        <p style={{marginTop:"15px",marginRight:"20px"}} className='shiny-text'>Current Purse:{ownerToMaxBid[bidder]?.currentPurse} lacs</p>
         <p style={{marginTop:"15px",marginRight:"20px"}} className='shiny-text'>Max Bid: {ownerToMaxBid[bidder]?.maxBid} lacs</p>

        </div>
        </Col>
        <Col>
        <div className="timer-container">
        <div style={{color: timer <= '5' ? 'red':'black' }}>
        {isflag &&(
          <div className="time-text show">Time Remaining: {timer}</div>) }
      </div>
        </div>
        <div className='buttons-container'>
        <button className="action-button" onClick={()=>handleSoldClick('sold', bidder, amount)} disabled={buttonSold}>Mark Sold</button>
      <button className="action-button" onClick={()=>handleSoldClick('unsold-processed','',0)} disabled={buttonunSold}>Mark Unsold</button>
      </div>
        </Col>
        </Row>
        </Col>
      </Row>
      <Row className="autionbottomrow">
        <Col>
        
        {buttonTexts.map((text, index) => (
        <div key={index} className="team-button-containers">
          <img src={require('../assets/images/auction_hand.png')} alt="my-image" className="my-image" style={{ display: selectedButton === index ? 'block' : 'none'}}/>
          <button id= {text} disabled={disableMap[text]} onClick={() => {setSelectedButton(index)
          setBidder(text);increaseAmount(getPlayer.isOverseas);setTimer(10);}} >{text}</button>
         </div>
      ))}
        </Col>
        <Col>
      
      <input type="text" placeholder="Player Name" value={requestedPlayer} onChange={handleRequestedPlayerChange} /> 
      <button className="action-button" onClick={handleClick}>Next Player</button>
        </Col>
      </Row>
    </div>
    </div>
  )
}
