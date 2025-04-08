import React from 'react';
import './PlayerCard.css'
import csk from '../assets/images/Chennai_Super_Kings_Logo.svg';
import dc from '../assets/images/Delhi_Capitals.svg';
import gt from '../assets/images/Gujarat_Titans_Logo.svg';
import kkr from '../assets/images/Kolkata_Knight_Riders_Logo.svg';
import kxip from '../assets/images/Punjab_Kings_Logo.svg';
import mi from '../assets/images/Mumbai_Indians_Logo.svg';
import rr from '../assets/images/Rajasthan_Royals.svg';
import rcb from '../assets/images/Royal_Challengers_Bengaluru_Logo.svg';
import srh from '../assets/images/Sunrisers_Hyderabad_Logo.svg';
import lsg from '../assets/images/Lucknow_Super_Giants_IPL_Logo.svg';

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