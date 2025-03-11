import React from 'react';
import './PlayerCard.css'

 const PlayerCard = ({playerName, country, type, franchise}) => {
  return (
    <div className="player-card">
      <h1 className="player-name" style={{fontSize: '25px'}}>{playerName} ({franchise})</h1>
      <h2 className="player-country" style={{fontSize: '20px'}}>{country} {type}</h2>
    </div>
  );
}

export default PlayerCard;