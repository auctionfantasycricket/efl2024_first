import React from "react";
import csk from '../assets/images/csk.png';
import dc from '../assets/images/DC.jpg';
import gt from '../assets/images/GT.jpg';
import kkr from '../assets/images/KKR.png';
import kxip from '../assets/images/KXIP.png';
import mi from '../assets/images/MI.png';
import rr from '../assets/images/RR.jpg';
import rcb from '../assets/images/RCB.jpg';
import srh from '../assets/images/SRH.jpg';
import lsg from '../assets/images/LSG.jpg';

const TeamCellRenderer = (props) => {
    const { value } = props;
  
    let imageSrc;
    switch (value) {
      case 'Lucknow Super Giants':
        imageSrc = lsg;
        break;
      case 'Punjab Kings':
        imageSrc = kxip;
        break;
      case 'Chennai Super Kings':
        imageSrc = csk;
        break;
      case 'Delhi Capitals':
        imageSrc = dc;
        break;
      case 'Gujarat Titans':
        imageSrc = gt;
        break;
      case 'Kolkata Knight Riders':
        imageSrc = kkr;
        break;
      case 'Mumbai Indians':
        imageSrc = mi;
        break;
      case 'Rajasthan Royals':
        imageSrc = rr;
        break;
      case 'Royal Challengers Bengaluru':
        imageSrc = rcb;
        break;
      case 'Sunrisers Hyderabad':
        imageSrc = srh;
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
  
  export default TeamCellRenderer;