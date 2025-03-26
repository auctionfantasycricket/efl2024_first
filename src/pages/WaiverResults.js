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
import { ArrowRight } from 'lucide-react';
import './WaiverResults.css';

const WaiverResults = () => {
  const [selectedRounds, setSelectedRounds] = useState([1, 2, 3, 4]);

  // Sample data for 4 rounds
  const [waiverResults, setWaiverResults] = useState([
    {
      "_id": "unique-id-1",
      "round": 1,
      "waiverOrder": ["Team A", "Team B", "Team C", "Team D", "Team E", "Team F", "Team G", "Team H", "Team I"],
      "picks": [
        {
          "team": "Team A",
          "drop": "Bench Player",
          "pick": "Top WR Prospect",
          "status": "success", 
          "message": "Top WR Prospect successfully added"
        },
        {
          "team": "Team B",
          "drop": "Injured RB",
          "pick": "Backup QB",
          "status": "success", 
          "message": "Backup QB successfully added"
        },
        {
          "team": "Team C",
          "drop": "Low-performing TE",
          "pick": "Emerging TE Talent",
          "status": "success", 
          "message": "Emerging TE Talent successfully picked"
        },
        {
          "team": "Team D",
          "drop": "Depth WR",
          "pick": "High-upside RB",
          "status": "success", 
          "message": "High-upside RB successfully acquired"
        },
        {
          "team": "Team E",
          "drop": "Backup Defense",
          "pick": "Top Defensive Player",
          "status": "success", 
          "message": "Top Defensive Player added"
        },
        {
          "team": "Team F",
          "drop": "Kicker",
          "pick": "Rookie Kicker",
          "status": "failure", 
          "message": "Failed: No available kickers"
        },
        {
          "team": "Team G",
          "drop": "Aging QB",
          "pick": "Young Quarterback",
          "status": "success", 
          "message": "Young Quarterback successfully added"
        },
        {
          "team": "Team H",
          "drop": "Third-string RB",
          "pick": "Promising WR",
          "status": "success", 
          "message": "Promising WR successfully picked"
        },
        {
          "team": "Team I",
          "drop": "Underperforming Defense",
          "pick": "Top Defensive Unit",
          "status": "success", 
          "message": "Top Defensive Unit successfully added"
        }
      ]
    },
    {
      "_id": "unique-id-2",
      "round": 2,
      "waiverOrder": ["Team C", "Team D", "Team E", "Team F", "Team G", "Team H", "Team I", "Team A", "Team B"],
      "picks": [
        {
          "team": "Team C",
          "drop": "Depth WR",
          "pick": "Breakout Running Back",
          "status": "success", 
          "message": "Breakout Running Back successfully added"
        },
        {
          "team": "Team D",
          "drop": "Backup Tight End",
          "pick": "Emerging Wide Receiver",
          "status": "success", 
          "message": "Emerging Wide Receiver successfully picked"
        },
        {
          "team": "Team E",
          "drop": "Special Teams Player",
          "pick": "Versatile Flex Player",
          "status": "success", 
          "message": "Versatile Flex Player added"
        },
        {
          "team": "Team F",
          "drop": "Practice Squad WR",
          "pick": "Sleeper Tight End",
          "status": "success", 
          "message": "Sleeper Tight End successfully acquired"
        },
        {
          "team": "Team G",
          "drop": "Injured Receiver",
          "pick": "Promising Running Back",
          "status": "success", 
          "message": "Promising Running Back added"
        },
        {
          "team": "Team H",
          "drop": "Backup QB",
          "pick": "Veteran Quarterback",
          "status": "failure", 
          "message": "Failed: No quarterbacks available"
        },
        {
          "team": "Team I",
          "drop": "Depth Defense",
          "pick": "High-potential Defensive End",
          "status": "success", 
          "message": "High-potential Defensive End successfully picked"
        },
        {
          "team": "Team A",
          "drop": "Bench Receiver",
          "pick": "Emerging Tight End",
          "status": "success", 
          "message": "Emerging Tight End successfully added"
        },
        {
          "team": "Team B",
          "drop": "Low-performing RB",
          "pick": "Dynamic Wide Receiver",
          "status": "success", 
          "message": "Dynamic Wide Receiver successfully picked"
        }
      ]
    },
    {
      "_id": "unique-id-3",
      "round": 3,
      "waiverOrder": ["Team E", "Team F", "Team G", "Team H", "Team I", "Team A", "Team B", "Team C", "Team D"],
      "picks": [
        {
          "team": "Team E",
          "drop": "Extra Linebacker",
          "pick": "Impact Defensive Player",
          "status": "success", 
          "message": "Impact Defensive Player successfully added"
        },
        {
          "team": "Team F",
          "drop": "Depth Receiver",
          "pick": "Emerging Running Back",
          "status": "success", 
          "message": "Emerging Running Back successfully picked"
        },
        {
          "team": "Team G",
          "drop": "Third-string QB",
          "pick": "Potential Starter",
          "status": "success", 
          "message": "Potential Starter successfully acquired"
        },
        {
          "team": "Team H",
          "drop": "Bench Defensive Player",
          "pick": "Versatile Defensive Talent",
          "status": "success", 
          "message": "Versatile Defensive Talent added"
        },
        {
          "team": "Team I",
          "drop": "Backup Special Teams Player",
          "pick": "Promising Wide Receiver",
          "status": "success", 
          "message": "Promising Wide Receiver successfully picked"
        },
        {
          "team": "Team A",
          "drop": "Extra Kicker",
          "pick": "High-accuracy Kicker",
          "status": "success", 
          "message": "High-accuracy Kicker successfully added"
        },
        {
          "team": "Team B",
          "drop": "Practice Squad Player",
          "pick": "Developmental Talent",
          "status": "failure", 
          "message": "Failed: No suitable players available"
        },
        {
          "team": "Team C",
          "drop": "Depth Defensive Back",
          "pick": "Explosive Return Specialist",
          "status": "success", 
          "message": "Explosive Return Specialist successfully picked"
        },
        {
          "team": "Team D",
          "drop": "Extra Tight End",
          "pick": "Red Zone Threat",
          "status": "success", 
          "message": "Red Zone Threat successfully added"
        }
      ]
    },
    {
      "_id": "unique-id-4",
      "round": 4,
      "waiverOrder": ["Team G", "Team H", "Team I", "Team A", "Team B", "Team C", "Team D", "Team E", "Team F"],
      "picks": [
        {
          "team": "Team G",
          "drop": "Depth Receiver",
          "pick": "Game-changing Talent",
          "status": "success", 
          "message": "Game-changing Talent successfully added"
        },
        {
          "team": "Team H",
          "drop": "Practice Squad Player",
          "pick": "Emerging Young Star",
          "status": "success", 
          "message": "Emerging Young Star successfully picked"
        },
        {
          "team": "Team I",
          "drop": "Extra Defensive Back",
          "pick": "Top Defensive Prospect",
          "status": "success", 
          "message": "Top Defensive Prospect successfully added"
        },
        {
          "team": "Team A",
          "drop": "Backup Running Back",
          "pick": "Dynamic Playmaker",
          "status": "success", 
          "message": "Dynamic Playmaker successfully acquired"
        },
        {
          "team": "Team B",
          "drop": "Low-impact Receiver",
          "pick": "Potential Breakout Player",
          "status": "success", 
          "message": "Potential Breakout Player added"
        },
        {
          "team": "Team C",
          "drop": "Extra Defensive Lineman",
          "pick": "Versatile Defensive Player",
          "status": "failure", 
          "message": "Failed: No suitable players available"
        },
        {
          "team": "Team D",
          "drop": "Depth Quarterback",
          "pick": "Promising QB Talent",
          "status": "success", 
          "message": "Promising QB Talent successfully picked"
        },
        {
          "team": "Team E",
          "drop": "Extra Wide Receiver",
          "pick": "High-potential Receiver",
          "status": "success", 
          "message": "High-potential Receiver successfully added"
        },
        {
          "team": "Team F",
          "drop": "Backup Defensive Player",
          "pick": "Impact Special Teams Player",
          "status": "success", 
          "message": "Impact Special Teams Player successfully acquired"
        }
      ]
    }
  ]);

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
          icon: null,
          textColor: 'default',
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
      <Card sx={{ width: '100%' }}>
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