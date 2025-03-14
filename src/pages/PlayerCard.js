import React from 'react';
import './PlayerCard.css'
import csk from '../assets/images/csk_nobck.png';
import dc from '../assets/images/DC_nobck.png';
import gt from '../assets/images/GT_nobck.png';
import kkr from '../assets/images/KKR_nobck.png';
import kxip from '../assets/images/KXIP_nobck.png';
import mi from '../assets/images/MI_nobck.png';
import rr from '../assets/images/rr_nobck.png';
import rcb from '../assets/images/RCB_bck.png';
import srh from '../assets/images/srh-nobck.png';
import lsg from '../assets/images/LSG_nobck.png';

 const PlayerCard = ({playerName, country, type, franchise}) => {

  const getImage = (franchiseName) => {
    switch (franchiseName) {
      case 'Lucknow Super Giants':
        return lsg;
      case 'Punjab Kings':
        return kxip;
      case 'Chennai Super Kings':
        return csk;
      case 'Delhi Capitals':
        return dc;
      case 'Gujarat Titans':
        return gt;
      case 'Kolkata Knight Riders':
        return kkr;
      case 'Mumbai Indians':
        return mi;
      case 'Rajasthan Royals':
        return rr;
      case 'Royal Challengers Bengaluru':
        return rcb;
      case 'Sunrisers Hyderabad':
        return srh;
      default:
        return null;
    }
  };

  const franchiseImage =  getImage(franchise);

  return (
    <div className="player-card">
      <h1 className="player-name" style={{fontSize: '25px'}}>{playerName} ({franchise})</h1>
      <h2 className="player-country" style={{fontSize: '20px'}}>{(playerName !== 'Player Name') ? country:'Country'} {type}</h2>
    </div>
  );
}

export default PlayerCard;

//{franchiseImage  && <img src={franchiseImage} alt="image"/>}