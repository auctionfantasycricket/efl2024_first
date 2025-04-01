import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  Typography, 
  Button, 
  Box, 
  Grid 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import { ArrowRight } from 'lucide-react';
import './WaiverResults.css';

const WaiverResults = ({waiverResults}) => {
  const [selectedRounds, setSelectedRounds] = useState([1, 2, 3, 4]);

  // Sample data for 4 rounds
  // const [waiverResults, setWaiverResults] = useState([
  //   {
  //     "_id": "unique-id-1",
  //     "round": 1,
  //     "waiverOrder": ["BRF", "MBCB", "BAAP", "Untouchaballz", "TTH", "Anonymous", "Dads Of Pitches", "One Pitch One Hand", "Nani"],
  //     "picks": [
  //       {
  //         "team": "Bhaisaab's Royal Fixers",
  //         "drop": "T Natarajan",
  //         "pick": "Noor Ahmed",
  //         "status": "success", 
  //         "message": "Noor Ahmed successfully added to the team"
  //       },
  //       {
  //         "team": "MotaBhai ChotaBhai",
  //         "drop": "Prasidh Krishna",
  //         "pick": "Shardul Thakur",
  //         "status": "success", 
  //         "message": "Shardul Thakur successfully added to the team"
  //       },
  //       {
  //         "team": "The BAAP's",
  //         "drop": "Glenn Maxwell",
  //         "pick": "Ashutosh Sharma",
  //         "status": "success", 
  //         "message": "Ashutosh Sharma successfully added to the team"
  //       },
  //       {
  //         "team": "Untouchaballz",
  //         "drop": "Rohit Sharma",
  //         "pick": "QDK",
  //         "status": "success", 
  //         "message": "QDK successfully picked as the new player"
  //       },
  //       {
  //         "team": "Thala The Head",
  //         "drop": "Adam Zampa",
  //         "pick": "Mitchell Starc",
  //         "status": "success", 
  //         "message": "Mitchell Starc successfully added to the team"
  //       },
  //       {
  //         "team": "Anonymous",
  //         "drop": "Devon Conway",
  //         "pick": "QDK",
  //         "status": "failure", 
  //         "message": "QDK is already picked by Untouchaballz"
  //       },
  //       {
  //         "team": "Dads Of Pitches",
  //         "drop": "Josh Inglis",
  //         "pick": "Angrishk raghuvanshi",
  //         "status": "success", 
  //         "message": "Angrishk raghuvanshi successfully added to the team"
  //       },
  //       {
  //         "team": "One Pitch One Hand",
  //         "drop": "Matheesha Pathirana",
  //         "pick": "Khaleel Ahmed",
  //         "status": "success", 
  //         "message": "Khaleel Ahmed successfully added to the team"
  //       },
  //       {
  //         "team": "Nani",
  //         "drop": "Mitchell Santner",
  //         "pick": "Josh Hazlewood",
  //         "status": "success", 
  //         "message": "Josh Hazlewood successfully added to the team"
  //       }
  //     ]
  //   },
  //   {
  //     "_id": "unique-id-2",
  //     "round": 2,
  //     "waiverOrder": ["MBCB", "BAAP", "Untouchaballz", "TTH", "Anonymous", "Dads Of Pitches", "One Pitch One Hand", "Nani", "BRF"],
  //     "picks": [
  //       {
  //         "team": "MotaBhai ChotaBhai",
  //         "drop": "",
  //         "pick": "Noor Ahmed",
  //         "status": "", 
  //         "message": "Already dropped player, so pick is not applicable"
  //       },
  //       {
  //         "team": "The BAAP's",
  //         "drop": "",
  //         "pick": "Sai Kishore",
  //         "status": "", 
  //         "message": "Already dropped player, so pick is not applicable"
  //       },
  //       {
  //         "team": "Untouchaballz",
  //         "drop": "R Ashwin",
  //         "pick": "Shimron Hetmyer",
  //         "status": "failure", 
  //         "message": "Replacement does not meet the criteria"
  //       },
  //       {
  //         "team": "Thala The Head",
  //         "drop": "Sam Curran",
  //         "pick": "Noor Ahmed",
  //         "status": "failure", 
  //         "message": "Noor Ahmed is already picked by MotaBhai ChotaBhai"
  //       },
  //       {
  //         "team": "Anonymous",
  //         "drop": "Devon Conway",
  //         "pick": "Aniket Verma",
  //         "status": "success", 
  //         "message": "Aniket Verma successfully added to the team"
  //       },
  //       {
  //         "team": "Dads Of Pitches",
  //         "drop": "",
  //         "pick": "Aniket Verma",
  //         "status": "", 
  //         "message": "Already dropped player, so pick is not applicable"
  //       },
  //       {
  //         "team": "One Pitch One Hand",
  //         "drop": "Wanindu Hasaranga",
  //         "pick": "Josh Hazlewood",
  //         "status": "failure", 
  //         "message": "Josh Hazlewood is already picked by Nani"
  //       },
  //       {
  //         "team": "Nani",
  //         "drop": "",
  //         "pick": "Mitchell Starc",
  //         "status": "", 
  //         "message": "Already dropped player, so pick is not applicable"
  //       },
  //       {
  //         "team": "Bhaisaab's Royal Fixers",
  //         "drop": "Nitish Rana",
  //         "pick": "Shardul Thakur",
  //         "status": "failure", 
  //         "message": "Shardul Thakur is already picked by MotaBhai ChotaBhai"
  //       }
  //     ]
  //   },
  //   {
  //     "_id": "unique-id-3",
  //     "round": 3,
  //     "waiverOrder": ["BAAP", "Untouchaballz", "TTH", "Anonymous", "Dads Of Pitches", "One Pitch One Hand", "Nani", "BRF", "MBCB"],
  //     "picks": [
  //       {
  //         "team": "The BAAP's",
  //         "drop": "Depth Defensive Back",
  //         "pick": "Explosive Return Specialist",
  //         "status": "success", 
  //         "message": "Explosive Return Specialist successfully picked"
  //       },
  //       {
  //         "team": "Untouchaballz",
  //         "drop": "Extra Tight End",
  //         "pick": "Red Zone Threat",
  //         "status": "success", 
  //         "message": "Red Zone Threat successfully added"
  //       },
  //       {
  //         "team": "Thala The Head",
  //         "drop": "Extra Linebacker",
  //         "pick": "Impact Defensive Player",
  //         "status": "success", 
  //         "message": "Impact Defensive Player successfully added"
  //       },
  //       {
  //         "team": "Anonymous",
  //         "drop": "Depth Receiver",
  //         "pick": "Emerging Running Back",
  //         "status": "success", 
  //         "message": "Emerging Running Back successfully picked"
  //       },
  //       // {
  //       //   "team": "Dads Of Pitches",
  //       //   "drop": "Third-string QB",
  //       //   "pick": "Potential Starter",
  //       //   "status": "success", 
  //       //   "message": "Potential Starter successfully acquired"
  //       // },
  //       {
  //         "team": "One Pitch One Hand",
  //         "drop": "Bench Defensive Player",
  //         "pick": "Versatile Defensive Talent",
  //         "status": "success", 
  //         "message": "Versatile Defensive Talent added"
  //       },
  //       {
  //         "team": "Nani",
  //         "drop": "Backup Special Teams Player",
  //         "pick": "Promising Wide Receiver",
  //         "status": "success", 
  //         "message": "Promising Wide Receiver successfully picked"
  //       },
  //       {
  //         "team": "Bhaisaab's Royal Fixers",
  //         "drop": "Extra Kicker",
  //         "pick": "High-accuracy Kicker",
  //         "status": "success", 
  //         "message": "High-accuracy Kicker successfully added"
  //       },
  //       {
  //         "team": "MotaBhai ChotaBhai",
  //         "drop": "Practice Squad Player",
  //         "pick": "Developmental Talent",
  //         "status": "failure", 
  //         "message": "Failed: No suitable players available"
  //       }
  //     ]
  //   },
  //   {
  //     "_id": "unique-id-4",
  //     "round": 4,
  //     "waiverOrder": ["Untouchaballz", "TTH", "Anonymous", "Dads Of Pitches", "One Pitch One Hand", "Nani", "BRF", "MBCB", "BAAP"],
  //     "picks": [
  //       {
  //         "team": "Untouchaballz",
  //         "drop": "Depth Quarterback",
  //         "pick": "Promising QB Talent",
  //         "status": "success", 
  //         "message": "Promising QB Talent successfully picked"
  //       },
  //       {
  //         "team": "Thala The Head",
  //         "drop": "Extra Wide Receiver",
  //         "pick": "High-potential Receiver",
  //         "status": "success", 
  //         "message": "High-potential Receiver successfully added"
  //       },
  //       {
  //         "team": "Anonymous",
  //         "drop": "Backup Defensive Player",
  //         "pick": "Impact Special Teams Player",
  //         "status": "success", 
  //         "message": "Impact Special Teams Player successfully acquired"
  //       },
  //       {
  //         "team": "Dads Of Pitches",
  //         "drop": "Depth Receiver",
  //         "pick": "Game-changing Talent",
  //         "status": "success", 
  //         "message": "Game-changing Talent successfully added"
  //       },
  //       {
  //         "team": "One Pitch One Hand",
  //         "drop": "Practice Squad Player",
  //         "pick": "Emerging Young Star",
  //         "status": "success", 
  //         "message": "Emerging Young Star successfully picked"
  //       },
  //       {
  //         "team": "Nani",
  //         "drop": "Extra Defensive Back",
  //         "pick": "Top Defensive Prospect",
  //         "status": "success", 
  //         "message": "Top Defensive Prospect successfully added"
  //       },
  //       // {
  //       //   "team": "Bhaisaab's Royal Fixers",
  //       //   "drop": "Backup Running Back",
  //       //   "pick": "Dynamic Playmaker",
  //       //   "status": "success", 
  //       //   "message": "Dynamic Playmaker successfully acquired"
  //       // },
  //       {
  //         "team": "MotaBhai ChotaBhai",
  //         "drop": "Low-impact Receiver",
  //         "pick": "Potential Breakout Player",
  //         "status": "success", 
  //         "message": "Potential Breakout Player added"
  //       },
  //       {
  //         "team": "The BAAP's",
  //         "drop": "Extra Defensive Lineman",
  //         "pick": "Versatile Defensive Player",
  //         "status": "failure", 
  //         "message": "Failed: No suitable players available"
  //       }
  //     ]
  //   }
  // ]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'success':
        return {
          icon: <CheckCircleIcon className="modal-status-icon success" />,
          textColor: 'success-text',
          bgColor: 'success-bg'
        };
      case 'failure':
        return {
          icon: <CancelIcon className="modal-status-icon failure" />,
          textColor: 'failure-text',
          bgColor: 'failure-bg'
        };
      default:
        return {
          icon: <NotInterestedIcon className="modal-status-icon default" />,
          textColor: 'default-text',
          bgColor: 'default-bg'
        };
    }
  };

  const toggleRoundSelection = (round) => {
    setSelectedRounds(prev => 
      prev.includes(round) 
        ? prev.filter(r => r !== round)
        : [...prev, round].sort()
    );
  };

  return (
    <div className="modal-waiver-results-container">
      <Card className="modal-waiver-results-container-card" sx={{ width: '100%' }}>
        {/* <CardHeader 
          title={
            <Typography variant="h6" component="div">
              Waiver Results Dashboard
            </Typography>
          } 
        /> */}
        <CardContent sx={{ p: 0 }}>
          {/* Round Selector */}
          <Box className="modal-rounds-selector">
            {waiverResults.map((result) => (
              <Button
                key={result.round}
                onClick={() => toggleRoundSelection(result.round)}
                variant={selectedRounds.includes(result.round) ? 'contained' : 'outlined'}
                color="primary"
                size="small"
                sx={{ 
                  m: 0.5, 
                  textTransform: 'none',
                  minWidth: 'auto'
                }}
              >
                Round {result.round}
              </Button>
            ))}
          </Box>

          {/* Rounds Container */}
          <div className="modal-all-rounds-container">
            {waiverResults.map((result) => (
              selectedRounds.includes(result.round) && (
                <div 
                  key={result.round} 
                  className="modal-round-section"
                >
                  <div className="modal-round-title">
                    Round {result.round}
                  </div>
                  
                  {/* Waiver Order */}
                  <div className="modal-waiver-order">
                    {result.waiverOrder.map((team,index) => (
                      <div 
                        key={team} 
                        className="modal-waiver-order-item"
                      >
                        {team}
                        {index < result.waiverOrder.length - 1 && (
                        <ArrowRight className="order-arrow" size={12} />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Picks Grid */}
                  <div className="modal-picks-grid-all-rounds">
                    {result.picks.map((pick) => {
                      const statusStyle = getStatusStyle(pick.status);

                      return (
                        <div 
                          key={`${result.round}-${pick.team}`} 
                          className={`modal-pick-card-small ${statusStyle.bgColor}`}
                        >
                          <div className="modal-pick-header-small">
                            <div className="modal-team-identifier-small">
                              {pick.team}
                            </div>
                            <div 
                              className={`modal-status-indicator-small ${statusStyle.textColor}`}
                            >
                              {statusStyle.icon}
                              {pick.status.charAt(0).toUpperCase() + pick.status.slice(1)}
                            </div>
                          </div>
                          
                          <div className="pick-details-small">
                            <div>Drop: {pick.drop}</div>
                            <div>Pick: {pick.pick}</div>
                            <div>{pick.message}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaiverResults;