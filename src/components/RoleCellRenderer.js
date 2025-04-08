import React from 'react';
import bat from '../assets/images/Cricket_bat.svg.png';
import ball from '../assets/images/Cricketball.svg.png';
import allround from '../assets/images/AR.png';

const RoleCellRenderer = (props) => {
  const { value } = props;

  let imageSrc;
  switch (value) {
    case 'BATTER':
      imageSrc = bat;
      break;
    case 'BOWLER':
      imageSrc = ball;
      break;
    case 'ALL_ROUNDER':
      imageSrc = allround;
      break;
    default:
      imageSrc = null;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {imageSrc && <img src={imageSrc} alt={value} style={{ width: '20px', height: '20px', marginRight: '5px' }} />}
      <span>{value}</span>
    </div>
  );
};

export default RoleCellRenderer;