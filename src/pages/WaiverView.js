import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Typography, Spin, message, Modal } from 'antd';
import { ReloadOutlined, UserOutlined, CalendarOutlined, SwapOutlined, EyeOutlined, HistoryOutlined  } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import './WaiverView.css';
import { encryptData, decryptData } from '../components/Encryption';
import { Alert } from 'antd';
import Marquee from 'react-fast-marquee';
import WaiverResults from './WaiverResults';
import WaiverHistory from './WaiverHistory';

// Material UI imports
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';

const { Title, Text } = Typography;

const baseURL = process.env.REACT_APP_BASE_URL;

const getIdValue = (id) => {
  if (id && typeof id === 'object' && id.$oid) {
    return id.$oid;
  }
  return id;
};

const fetchWaiverPlayerslist = async (id) => {
  const response = await fetch(`${baseURL}/get_data?collectionName=leagueplayers&leagueId=${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

const fetchTeamInfo = async (teamid) => {
  const response = await fetch(`${baseURL}/getTeamById/${teamid}`);
  if (!response.ok) {
    throw new Error('Failed to fetch team info');
  }
  return response.json();
};

const fetchWaiverHistory = async (teamid) => {
  const response = await fetch(`${baseURL}/getWaiverHistory/${teamid}`);
  if (!response.ok) {
    throw new Error('Failed to fetch team info');
  }
  return response.json();
};

const fetchLeagueInfo = async (Id) => {
  const response = await fetch(`${baseURL}/get_data?collectionName=leagues&leagueId=${Id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch team info');
  }
  return response.json();
};

const fetchDeadlines = async () => {
  const response = await fetch(baseURL + '/get_data?collectionName=global_data');
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

const WaiverView = ({ leaguetype, teamInfo }) => {
  const leagueId = useSelector((state) => state.league.selectedLeagueId);
  const teamname = teamInfo?.teamName;
  const teamId = teamInfo?.teamId;
  const userProfile = useSelector((state) => state.login.userProfile);
  const userId = userProfile?.userId;

  // State for player preferences and drops
  const [playerPreferences, setPlayerPreferences] = useState(['', '', '', '']);
  const [encryptplayerPreferences, setEncryptPlayerPreferences] = useState(['', '', '', '']);

  const [playersToDrop, setPlayersToDrop] = useState(['', '']);
  const [encryptplayersToDrop, setEncryptplayersToDrop] = useState(['', '']);

  // User Info
  const [lastupdatedby, setLastupdatedby] = useState('');
  const [lastupdatedat, setLastupdatedat] = useState('');

  // Player data state
  const [unsoldPlayers, setUnsoldPlayers] = useState([]);
  const [teamPlayers, setTeamPlayers] = useState([]);

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showwaiverResults, setShowWaiverResults] = useState(false);
  const [waivers, setWaivers] = useState(null);

  const [showtransferResults, setShowTransferResults] = useState(false);
  const [transferResults, setTransferResults] = useState(null);

  const [waiverDeadline, setWaiverDeadline] = useState('');
  const [transferDeadline, setTransferDeadline] = useState('');
  const [waiverProcessedAt, setWaiverProcessedAt] = useState('');

  const [isWaiverResultsModalVisible, setIsWaiverResultsModalVisible] = useState(false);

  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [waiverHistory, setWaiverHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Get player list using React Query
  const {
    isLoading,
    error,
    data: playerData
  } = useQuery({
    queryKey: ['teamhuballplayers', leagueId],
    queryFn: async () => {
      let response;
      try {
        response = await fetchWaiverPlayerslist(leagueId);
      } catch (error) {
        console.log(error);
      }
      return response;
    }
  });

  const {
    isteamLoading,
    teamerror,
    refetch,
    data: teamdetails
  } = useQuery({
    queryKey: ['teamInfo', teamId],
    queryFn: async () => {
      let response;
      try {
        response = await fetchTeamInfo(teamId);
      } catch (error) {
        console.log(error);
      }
      return response;
    },
    enabled: teamId !== null,
  });

  const {
    isLeagueLoading,
    lLeagueerror,
    data: LeagueData
  } = useQuery({
    queryKey: ['leaguedata', leagueId],
    queryFn: async () => {
      let response;
      try {
        response = await fetchLeagueInfo(leagueId);
      } catch (error) {
        console.log(error);
      }
      return response;
    }
  });

  const { isLoading: isLoadingTS, error: errorTS, data: deadlines } = useQuery({
    queryKey: ['deadline'],
    queryFn: async () => {
      let response;
      try {
        response = await fetchDeadlines();
      } catch (error) {
        console.log(error);
      }
      return response;
    }
  });


  const { isLoading: isLoadingWH, error: errorWH, data: waiverHistoryData } = useQuery({
    queryKey: ['waiverhistory', teamId],
    queryFn: async () => {
      let response;
      try {
        response = await fetchWaiverHistory(teamId);
      } catch (error) {
        console.log(error);
      }
      return response;
    },
    enabled: teamId !== null,
  });

  useEffect(() => {
    if (deadlines && deadlines.length > 0) {
      setWaiverDeadline(deadlines[0]?.nextDraftDeadline);
      setTransferDeadline(deadlines[0]?.nextAuctionDeadline);
    }
  }, [deadlines]);

  // Transform and process player data once when it's fetched
  useEffect(() => {
    if (playerData) {
      const unsold = playerData
        .filter(player => player.status !== 'sold')
        .map(player => ({
          value: player.player_name,
          label: player.player_name + (" [Points: " + (player.points) + "]") + (" [Role: " + (player.player_role) + "]"),
          points: player.points, // Include points for sorting
        }));

      setUnsoldPlayers(unsold);

      // Filter players belonging to user's team
      const myTeam = playerData
        .filter(player => player.status === 'sold' && player.ownerTeam === teamname)
        .map(player => ({
          value: player.player_name,
          label: player.player_name + (" [Points: " + (player.points) + "]") + (" [Role: " + (player.player_role) + "]"),
        }));

      setTeamPlayers(myTeam);
    }
  }, [playerData, teamname]);

  // Get Team Info
  useEffect(() => {
    if (teamdetails) {
      if (teamdetails?.currentWaiver) {
        handledecrypt(teamdetails?.currentWaiver.in, "pref");
        handledecrypt(teamdetails?.currentWaiver.out, "drop");
        setLastupdatedby(teamdetails?.currentWaiver.lastUpdatedBy);
        setLastupdatedat(teamdetails?.currentWaiver.lastUpdatedTime);
      }
    };
  }, [teamdetails, teamId]);

  useEffect(() => {
    if (LeagueData) {
      if (leaguetype === 'draft') {
        if (LeagueData[0]?.waiverResults && LeagueData[0]?.waiverResults.length > 0) {
          setShowWaiverResults(true);
          setWaivers(LeagueData[0].waiverResults);
          setWaiverProcessedAt(LeagueData[0].waiverProcessedAt);
        } else {
          setShowWaiverResults(false);
          setWaivers(null);
          setWaiverProcessedAt(null);
        }
      }
      // For auction leagues, we check for transfer results
      else if (leaguetype === 'auction') {
        if (LeagueData[0]?.releaseDetails && LeagueData[0]?.releaseDetails.length > 0) {
          setTransferResults(LeagueData[0].releaseDetails);
          setShowTransferResults(true);
        } else {
          setTransferResults(null);
          setShowTransferResults(false);
        }
      }
    }
  }, [LeagueData, leaguetype]);

  // Set waiver history data when it's fetched
  useEffect(() => {
    if (waiverHistoryData) {
      setWaiverHistory(waiverHistoryData);
    }
  }, [waiverHistoryData]);

  const handledecrypt = (val, opt) => {
    if (opt === "pref") {
      const newPreferences = val.map(item => decryptData(item));
      setEncryptPlayerPreferences(val);
      setPlayerPreferences(newPreferences);
    } else if (opt === "drop") {
      const newDrops = val.map(item => decryptData(item));
      setPlayersToDrop(newDrops);
      setEncryptplayersToDrop(val);
    }
  };

  // Handle preference selection change
  const handlePreferenceChange = (index, value) => {
    const newPreferences = [...playerPreferences];
    const newEncryptPreferences = [...encryptplayerPreferences];
    const encryptedprefvalue = encryptData(value);
    newPreferences[index] = value;
    newEncryptPreferences[index] = encryptedprefvalue;
    setPlayerPreferences(newPreferences);
    setEncryptPlayerPreferences(newEncryptPreferences);
  };

  // Handle clearing a preference
  const handleClearPreference = (index) => {
    const newPreferences = [...playerPreferences];
    const newEncryptPreferences = [...encryptplayerPreferences];
    newPreferences[index] = '';
    newEncryptPreferences[index] = '';
    setPlayerPreferences(newPreferences);
    setEncryptPlayerPreferences(newEncryptPreferences);
  };

  // Handle drop selection change
  const handleDropChange = (index, value) => {
    if (playersToDrop.includes(value)) {
      message.error('This player is already selected for drop. Please choose a different player.');
      return;
    }
    const newDrops = [...playersToDrop];
    const newEncryptedDrops = [...encryptplayersToDrop];
    const encrypteddropvalue = encryptData(value);
    newDrops[index] = value;
    newEncryptedDrops[index] = encrypteddropvalue;
    setPlayersToDrop(newDrops);
    setEncryptplayersToDrop(newEncryptedDrops);
  };

  // Handle clearing a drop
  const handleClearDrop = (index) => {
    const newDrops = [...playersToDrop];
    const newEncryptedDrops = [...encryptplayersToDrop];
    newDrops[index] = '';
    newEncryptedDrops[index] = '';
    setPlayersToDrop(newDrops);
    setEncryptplayersToDrop(newEncryptedDrops);
  };

  // Get filtered options for preference dropdowns
  const getFilteredPreferenceOptions = (index) => {
    // Filter out already selected players (except the current one)
    const filteredPlayers = unsoldPlayers.filter(player => {
      return !playerPreferences.includes(player.value) || playerPreferences[index] === player.value;
    });

    // Sort the filtered players by points in descending order
    return filteredPlayers.sort((a, b) => b.points - a.points);
  };

  // Get filtered options for drop dropdowns
  const getFilteredDropOptions = (index) => {
    // Filter out already selected players (except the current one)
    return teamPlayers.filter(player => {
      return !playersToDrop.includes(player.value) || playersToDrop[index] === player.value;
    });
  };

  // Handle waiver submission
  const handleSubmitWaiver = async () => {
    setIsSubmitting(true);

    const uniquedrops = new Set(playersToDrop.filter(drop => drop !== ''));
    if (uniquedrops.size !== playersToDrop.filter(drop => drop !== '').length) {
      message.error('You can\'t drop same player for both picks');
      setIsSubmitting(false);
      return;
    }
    const payload = {
      "currentWaiver": {
        "in": encryptplayerPreferences,
        "out": encryptplayersToDrop
      }
    };

    try {
      fetch(`${baseURL}/updateCurrentWaiver/${userId}/${teamId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
        .then(response => response.json())
        .then(data => {
          message.success("Your waivers saved successfully!! The selection will be locked on Tuesday at 11:59 pm");
          refetch();
        })
        .catch(error => {
          console.error(error);
        });

    } catch (error) {
      message.error('Error submitting waiver: ' + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle transfer submission (for auction leagues)
  const handleSubmitTransfer = async () => {
    setIsSubmitting(true);
    const uniquedrops = new Set(playersToDrop.filter(drop => drop !== ''));
    if (uniquedrops.size !== playersToDrop.filter(drop => drop !== '').length) {
      message.error('You can\'t drop same player for both picks');
      setIsSubmitting(false);
      return;
    }
    const payload = {
      "currentWaiver": {
        "in": encryptplayerPreferences,
        "out": encryptplayersToDrop
      }
    };

    try {
      fetch(`${baseURL}/updateCurrentWaiver/${userId}/${teamId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
        .then(response => response.json())
        .then(data => {
          message.success("Your Players will be dropped, prepare to pick replacement.");
          refetch();
        })
        .catch(error => {
          console.error(error);
        });

    } catch (error) {
      message.error('Error submitting waiver: ' + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open waiver history modal
  const handleOpenHistory = () => {
    setIsHistoryModalVisible(true);
  };

  // Close waiver history modal
  const handleCloseHistory = () => {
    setIsHistoryModalVisible(false);
  };

  // Render waiver results section
  const renderWaiverResults = () => {
    if (!showwaiverResults) {
      return (
        <div className="result-placeholder">
          <CalendarOutlined className="calendar-icon" style={{ fontSize: 24, marginBottom: 8 }} />
          <Text style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
            Results will be shown after waiver processing
          </Text>
          <Text style={{ textAlign: 'center', fontSize: 12, marginTop: 8, color: 'rgba(255, 255, 255, 0.5)' }}>
            Waivers are processed weekly
          </Text>
        </div>
      );
    }

    return (
      <div className="result-placeholder">
        <Text style={{ fontWeight: 'medium', marginBottom: 12, display: 'block', color: 'white', textAlign: 'center' }}>
          Last Processed: {waiverProcessedAt}
        </Text>

        {showwaiverResults && (
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => setIsWaiverResultsModalVisible(true)}
            style={{
              backgroundColor: '#1890ff',
              borderColor: '#1890ff',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            View Detailed Results
          </Button>
        )}

        <Modal
          title="Detailed Waiver Results"
          open={isWaiverResultsModalVisible}
          onCancel={() => setIsWaiverResultsModalVisible(false)}
          footer={null}
          width="90%"
          style={{ top: 20 }}
          className="wiaverview-custom-modal"
        >
          <WaiverResults waiverResults={waivers} />
        </Modal>
      </div>
    );
  };

  // Render transfer results section
  const renderTransferResults = () => {
    if (!showtransferResults || !transferResults) {
      return (
        <div className="result-placeholder">
          <SwapOutlined className="calendar-icon" style={{ fontSize: 24, marginBottom: 8 }} />
          <Text style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
            Results will be shown after transfer processing
          </Text>
          <Text style={{ textAlign: 'center', fontSize: 12, marginTop: 8, color: 'rgba(255, 255, 255, 0.5)' }}>
            Transfers are processed immediately
          </Text>
        </div>
      );
    }

    // Sort the transferResults array by order
    const sortedResults = [...transferResults].sort((a, b) => a.order - b.order);

    return (
      <div className="transfer-results-container">
        <div className="transfer-results-table">
          <table className="release-table">
            <thead>
              <tr>
                <th>#</th>
                <th className="team-name-cell">Team</th>
                <th>Released Players</th>
                <th className="purse-cell">Remaining Purse</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((team, index) => (
                <tr key={index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                  <td className="order-cell">
                    <div className="order-tag">{team.order}</div>
                  </td>
                  <td className="team-name-cell">
                    <div className="team-name">{team.teamName}</div>
                  </td>
                  <td>
                  <div className="released-players-container">
                    {team.releasedPlayers.length > 1 ? (
                      <ul className="players-list">
                        {team.releasedPlayers.map((player, playerIdx) => (
                          <li key={playerIdx} className="player-item">
                            {player}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="player-tag">{team.releasedPlayers[0]}</div>
                    )}
                  </div>
                </td>
                  <td className="purse-cell">
                    <div className="purse-tag">₹{team.remainingPurse} lacs</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="transfer-results-footer">
          <Text style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
            These players are now available in the free agent pool
          </Text>
        </div>
      </div>
    );
  };

  // Custom Material UI select component for preferences
  const MaterialPreferenceSelect = ({ index, label }) => {
    const options = getFilteredPreferenceOptions(index);
    
    return (
      <div className="select-container mui-select-wrapper">
        <Text className="select-label">{label}</Text>
        <Autocomplete
          value={playerPreferences[index] || null}
          onChange={(event, newValue) => {
            handlePreferenceChange(index, newValue ? newValue.value : '');
          }}
          disabled={isSubmitting}
          options={options}
          getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
          renderInput={(params) => (
            <TextField 
              {...params} 
              variant="outlined" 
              placeholder="Select Player" 
              fullWidth
              className="mui-select-input"
            />
          )}
          className="mui-autocomplete"
          size="small"
          clearOnBlur={false}
          clearIcon={
            <IconButton 
              size="small" 
              onClick={() => handleClearPreference(index)}
              disabled={isSubmitting}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          }
        />
      </div>
    );
  };

  // Custom Material UI select component for drops
  const MaterialDropSelect = ({ index, label }) => {
    const options = getFilteredDropOptions(index);
    
    return (
      <div className="select-container mui-select-wrapper">
        <Text className="select-label">{label}</Text>
        <Autocomplete
          value={playersToDrop[index] || null}
          onChange={(event, newValue) => {
            handleDropChange(index, newValue ? newValue.value : '');
          }}
          disabled={isSubmitting}
          options={options}
          getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
          renderInput={(params) => (
            <TextField 
              {...params} 
              variant="outlined" 
              placeholder="Select Player" 
              fullWidth
              className="mui-select-input"
            />
          )}
          className="mui-autocomplete"
          size="small"
          clearOnBlur={false}
          clearIcon={
            <IconButton 
              size="small" 
              onClick={() => handleClearDrop(index)}
              disabled={isSubmitting}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          }
        />
      </div>
    );
  };

  // Render Waiver Management (for draft leagues)
  const renderWaiverManagement = () => {
    return (
      <Card
        title="Waiver Management"
        className="team-hub-card waiver-view-card"
      >
        <div className="waiver-alert-container">
          <Alert
            banner
            type="info"
            message={
              <Marquee
                pauseOnHover
                gradient={false}
                style={{
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
              >
                {`Waiver submissions will be locked on ${waiverDeadline}. Please make your selections carefully.`}
              </Marquee>
            }
            className="waiver-management-alert"
          />
        </div>
        <div className="waiver-view-container">
          <Row gutter={[16, 16]}>
            {/* Player Preferences Card */}
            <Col md={8}>
              <Card
                title="Players to Pick (Preference Order)"
                className="waiver-card player-preferences-card"
              >
                {isLoading ? (
                  <div className="spinner-container">
                    <Spin />
                  </div>
                ) : (
                  <div>
                    <MaterialPreferenceSelect 
                      index={0} 
                      label="1st Preference" 
                    />
                    <MaterialPreferenceSelect 
                      index={1} 
                      label="2nd Preference" 
                    />
                    <MaterialPreferenceSelect 
                      index={2} 
                      label="3rd Preference" 
                    />
                    <MaterialPreferenceSelect 
                      index={3} 
                      label="4th Preference" 
                    />
                  </div>
                )}
              </Card>
            </Col>

            {/* Players to Drop Card */}
            <Col md={8}>
              <Card
                title="Players to Drop (Preference Order)"
                className="waiver-card players-drop-card"
              >
                {isLoading ? (
                  <div className="spinner-container">
                    <Spin />
                  </div>
                ) : (
                  <div>
                    <MaterialDropSelect 
                      index={0} 
                      label="Drop Player 1" 
                    />
                    <MaterialDropSelect 
                      index={1} 
                      label="Drop Player 2" 
                    />

                    {/* Submit Button */}
                    <Button
                      type="primary"
                      icon={isSubmitting ? <Spin size="small" /> : <ReloadOutlined />}
                      onClick={handleSubmitWaiver}
                      disabled={isSubmitting || isLoading}
                      loading={isSubmitting}
                      className="waiver-submit-button"
                    >
                      {isSubmitting ? "Submitting..." : "File Waivers"}
                    </Button>
                    {lastupdatedby && (
                      <div
                        style={{
                          marginTop: 12,
                          textAlign: 'center',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          padding: '8px 12px',
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Text
                          style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.75rem',
                            fontWeight: 500
                          }}
                        >
                          Last Updated By: {lastupdatedby}
                          {lastupdatedat && (
                            <span
                              style={{
                                marginLeft: 8,
                                color: 'rgba(255, 255, 255, 0.5)',
                                fontSize: '0.675rem'
                              }}
                            >
                              @ {lastupdatedat}
                            </span>
                          )}
                        </Text>
                      </div>
                    )}
                    {/* View History Button */}
                    <Button
                      type="default"
                      icon={<HistoryOutlined />}
                      onClick={handleOpenHistory}
                      style={{
                        marginTop: 12,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white'
                      }}
                    >
                      View Waiver History
                    </Button>
                    
                    {/* Waiver History Modal */}
                    <WaiverHistory
                      visible={isHistoryModalVisible}
                      onClose={handleCloseHistory}
                      historyData={waiverHistory}
                    />
                  </div>
                )}
              </Card>
            </Col>

            {/* Waiver Results Card */}
            <Col md={8}>
              <Card
                title="Waiver Order & Results"
                className="waiver-card waiver-results-card"
              >
                {renderWaiverResults()}
              </Card>
            </Col>
          </Row>
        </div>
      </Card>
    );
  };

  // Render Transfer Management (for auction leagues)
  const renderTransferManagement = () => {
    return (
      <Card
        title="Transfer Management"
        className="team-hub-card waiver-view-card"
      >
        <div className="waiver-alert-container">
          <Alert
            banner
            type="info"
            message={
              <Marquee
                pauseOnHover
                gradient={false}
                style={{
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
              >
                {`Drop Window closing on ${transferDeadline}, if you wish to participate please save players to be dropped.`}
              </Marquee>
            }
            className="waiver-management-alert"
          />
        </div>
        <div className="waiver-view-container">
          <Row gutter={[24, 16]}>
            {/* Players to Release Card */}
            <Col xs={24} md={12}>
              <Card
                title="Players to Release"
                className="waiver-card players-drop-card"
              >
                {isLoading ? (
                  <div className="spinner-container">
                    <Spin />
                  </div>
                ) : (
                  <div>
                    <MaterialDropSelect 
                      index={0} 
                      label="Release Player 1" 
                    />
                    <MaterialDropSelect 
                      index={1} 
                      label="Release Player 2" 
                    />

                    {/* Submit Button */}
                    <Button
                      type="primary"
                      icon={isSubmitting ? <Spin size="small" /> : <SwapOutlined />}
                      onClick={handleSubmitTransfer}
                      // disabled={isSubmitting || isLoading}
                      disabled={true}
                      loading={isSubmitting}
                      className="waiver-submit-button release-submit-button"
                    >
                      {isSubmitting ? "Processing..." : "Release Players"}
                    </Button>
                    {lastupdatedby && (
                      <div
                        style={{
                          marginTop: 12,
                          textAlign: 'center',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          padding: '8px 12px',
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Text
                          style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.75rem',
                            fontWeight: 500
                          }}
                        >
                          Last Updated By: {lastupdatedby}
                          {lastupdatedat && (
                            <span
                              style={{
                                marginLeft: 8,
                                color: 'rgba(255, 255, 255, 0.5)',
                                fontSize: '0.675rem'
                              }}
                            >
                              @ {lastupdatedat}
                            </span>
                          )}
                        </Text>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </Col>

            {/* Transfer Results Card */}
            <Col xs={24} md={12}>
              <Card
                title="Transfer Results"
                className="waiver-card waiver-results-card"
                bodyStyle={{ maxHeight: 'none', overflowY: 'visible' }}
              >
                {renderTransferResults()}
              </Card>
            </Col>
          </Row>
        </div>
      </Card>
    );
  };

  // Render the appropriate card based on leaguetype
  return leaguetype === 'draft' ? renderWaiverManagement() : renderTransferManagement();
};

export default WaiverView;