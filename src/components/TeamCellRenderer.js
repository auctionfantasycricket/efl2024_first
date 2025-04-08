import React from "react";
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