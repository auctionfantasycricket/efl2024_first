import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Row, Col, Typography, Spin, message } from 'antd';
import { ReloadOutlined, UserOutlined, CalendarOutlined, SwapOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import './WaiverView.css';
import { encryptData,decryptData } from '../components/Encryption';
import { Alert } from 'antd';
import Marquee from 'react-fast-marquee';


const { Option } = Select;
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

const WaiverView = ({ leaguetype, teamInfo }) => {
  const leagueId = useSelector((state) => state.league.selectedLeagueId);
  const teamname = teamInfo?.teamName;
  const teamId = teamInfo?.teamId;
  const userProfile = useSelector((state) => state.login.userProfile);
  const userId = userProfile?.userId
  
  // State for player preferences and drops
  const [playerPreferences, setPlayerPreferences] = useState(['', '', '', '']);
  const [encryptplayerPreferences, setEncryptPlayerPreferences] = useState(['', '', '', '']);

  const [playersToDrop, setPlayersToDrop] = useState(['', '']);
  const [encryptplayersToDrop, setEncryptplayersToDrop] = useState(['', '']);

  // User Info
  const [lastupdatedby, setLastupdatedby] = useState('')
  const [lastupdatedat, setLastupdatedat] = useState('')
  
  // Player data state
  const [unsoldPlayers, setUnsoldPlayers] = useState([]);
  const [teamPlayers, setTeamPlayers] = useState([]);
  
  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waiverResults, setWaiverResults] = useState(null);
  const [transferResults, setTransferResults] = useState(null);

  
  // Get player list using React Query
  const { 
    isLoading, 
    error, 
    data: playerData 
  } = useQuery({
    queryKey: ['teamhuballplayers', leagueId],
    queryFn: () => fetchWaiverPlayerslist(leagueId),
    // staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
    // cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  const { 
    isteamLoading, 
    teamerror,
    refetch, 
    data: teamdetails 
  } = useQuery({
    queryKey: ['teamInfo', teamId],
    queryFn: () => fetchTeamInfo(teamId),
    enabled: teamId !== null,
    // staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
    // cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes

  });
  
  // Transform and process player data once when it's fetched
  useEffect(() => {
    if (playerData) {
      // Transform unsold players for dropdown
      const unsold = playerData
        .filter(player => player.status !== 'sold')
        .map(player => ({
          // value: getIdValue(player._id) || player.player_name,
          value: player.player_name,
          // label: player.name || player.player_name
          label: player.player_name
        }));
      
      setUnsoldPlayers(unsold);
      
      // Filter players belonging to user's team
      const myTeam = playerData
        .filter(player => player.status === 'sold' && player.ownerTeam === teamname)
        .map(player => ({
          // value: getIdValue(player._id) || player.player_name,
          value: player.player_name,
          // label: player.name || player.player_name
          label: player.player_name
        }));
      
      setTeamPlayers(myTeam);
    }
  }, [playerData, teamname]);

  // Get Team Info
  useEffect(() => {
    if (teamdetails) {
      handledecrypt(teamdetails.currentWaiver.in, "pref");
      handledecrypt(teamdetails.currentWaiver.out, "drop");
      setLastupdatedby(teamdetails.currentWaiver.lastUpdatedBy);
      setLastupdatedat(teamdetails.currentWaiver.lastUpdatedTime);
    };
  }, [teamdetails, teamId]);

  const handledecrypt = (val, opt) => {
    if (opt === "pref") {
      const newPreferences = val.map(item => decryptData(item));
      setEncryptPlayerPreferences(val)
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
    return unsoldPlayers.filter(player => {
      return !playerPreferences.includes(player.value) || playerPreferences[index] === player.value;
    });
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

    const uniquedrops = new Set(playersToDrop)
    if (uniquedrops.size !== playersToDrop.length){
      message.error('You cant drop sameplayer for both picks');
      return;
    }
    const payload = {  "currentWaiver": {
      "in": encryptplayerPreferences,
      "out": encryptplayersToDrop
    } };
    
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
            message.success("Your waivers saved successfully!!The selection will be locked on Tuesday at 11:59 pm")
            refetch();
          })
          .catch(error => {
              console.error(error);
          });
      
    } catch (error) {
      message.error('Error submitting waiver:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle transfer submission (for auction leagues)
  const handleSubmitTransfer = async () => {
    setIsSubmitting(true);
    const uniquedrops = new Set(playersToDrop)
    if (uniquedrops.size !== playersToDrop.length){
      message.error('You cant drop sameplayer for both picks');
      return;
    }
    const payload = {  "currentWaiver": {
      "in": encryptplayerPreferences,
      "out": encryptplayersToDrop
    } };
    
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
            message.success("Your Players will be dropped,prepare to pick replacement.")
            refetch();
          })
          .catch(error => {
              console.error(error);
          });
      
        } catch (error) {
          message.error('Error submitting waiver:', error);
        } finally {
          setIsSubmitting(false);
        }
  };

  // Render waiver results section
  const renderWaiverResults = () => {
    if (!waiverResults) {
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
      <div>
        <Text style={{ fontWeight: 'medium', marginBottom: 12, display: 'block', color: 'white' }}>
          Last Processed: {waiverResults.processedDate}
        </Text>
        
        <div className="result-section">
          <Text style={{ fontWeight: 'bold', display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem' }}>
            Players Added:
          </Text>
          {waiverResults.playersAdded && waiverResults.playersAdded.length > 0 ? (
            waiverResults.playersAdded.map((player, idx) => (
              <div key={idx} className="player-item">
                <UserOutlined />
                <Text style={{ color: 'white', marginLeft: 4 }}>{player}</Text>
              </div>
            ))
          ) : (
            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontStyle: 'italic' }}>
              No players added
            </Text>
          )}
        </div>
        
        <div className="result-section">
          <Text style={{ fontWeight: 'bold', display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem' }}>
            Players Dropped:
          </Text>
          {waiverResults.playersDropped && waiverResults.playersDropped.length > 0 ? (
            waiverResults.playersDropped.map((player, idx) => (
              <div key={idx} className="player-item">
                <UserOutlined />
                <Text style={{ color: 'white', marginLeft: 4 }}>{player}</Text>
              </div>
            ))
          ) : (
            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontStyle: 'italic' }}>
              No players dropped
            </Text>
          )}
        </div>
      </div>
    );
  };

  // Render transfer results section
  const renderTransferResults = () => {
    if (!transferResults) {
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
    
    return (
      <div>
        <Text style={{ fontWeight: 'medium', marginBottom: 12, display: 'block', color: 'white' }}>
          Last Processed: {transferResults.processedDate}
        </Text>
        
        <div className="result-section">
          <Text style={{ fontWeight: 'bold', display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem' }}>
            Players Released:
          </Text>
          {transferResults.playersDropped && transferResults.playersDropped.length > 0 ? (
            transferResults.playersDropped.map((player, idx) => (
              <div key={idx} className="player-item">
                <UserOutlined />
                <Text style={{ color: 'white', marginLeft: 4 }}>{player}</Text>
              </div>
            ))
          ) : (
            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontStyle: 'italic' }}>
              No players released
            </Text>
          )}
        </div>
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
                Waiver submissions will be locked on Tuesday at 11:59 PM. Please make your selections carefully.
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
                    {[0, 1, 2, 3].map((index) => (
                      <div key={`pref-${index}`} className="select-container">
                        <Text className="select-label">{`${index + 1}${
                          index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'
                        } Preference`}</Text>
                        <Select
                          showSearch
                          allowClear
                          placeholder="Select Player"
                          optionFilterProp="children"
                          onChange={(value) => handlePreferenceChange(index, value)}
                          onClear={() => handleClearPreference(index)}
                          filterOption={(input, option) => 
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                          filterSort={(optionA, optionB) =>
                            (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                          }
                          options={getFilteredPreferenceOptions(index)}
                          disabled={isSubmitting}
                          value={playerPreferences[index] || undefined}
                          className="custom-select"
                          popupClassName="custom-dropdown"
                        />
                      </div>
                    ))}
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
                    {[0, 1].map((index) => (
                      <div key={`drop-${index}`} className="select-container">
                        <Text className="select-label">{`Drop Player ${index + 1}`}</Text>
                        <Select
                          showSearch
                          allowClear
                          placeholder="Select Player"
                          optionFilterProp="children"
                          onChange={(value) => handleDropChange(index, value)}
                          onClear={() => handleClearDrop(index)}
                          filterOption={(input, option) => 
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                          filterSort={(optionA, optionB) =>
                            (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                          }
                          options={getFilteredDropOptions(index)}
                          disabled={isSubmitting}
                          value={playersToDrop[index] || undefined}
                          className="custom-select"
                          popupClassName="custom-dropdown"
                        />
                      </div>
                    ))}
                    
                    {/* Submit Button */}
                    <Button
                      type="primary"
                      icon={isSubmitting ? <Spin size="small" /> : <ReloadOutlined />}
                      onClick={handleSubmitWaiver}
                      disabled={isSubmitting || isLoading}
                      // disabled = {true}
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
                  </div>
                )}
              </Card>
            </Col>
            
            {/* Waiver Results Card */}
            <Col md={8}>
              <Card 
                title="Waiver Results"
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
                Drop Window closing on Friday 12PM, if you wish to participate please save players to be dropped.
              </Marquee>
            }
            className="waiver-management-alert"
          />
        </div>
        <div className="waiver-view-container">
          <Row gutter={[16, 16]}>
            {/* Players to Release Card */}
            <Col md={8}>
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
                    {[0, 1].map((index) => (
                      <div key={`release-${index}`} className="select-container">
                        <Text className="select-label">{`Release Player ${index + 1}`}</Text>
                        <Select
                          showSearch
                          allowClear
                          placeholder="Select Player"
                          optionFilterProp="children"
                          onChange={(value) => handleDropChange(index, value)}
                          onClear={() => handleClearDrop(index)}
                          filterOption={(input, option) => 
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                          filterSort={(optionA, optionB) =>
                            (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                          }
                          options={getFilteredDropOptions(index)}
                          disabled={isSubmitting}
                          value={playersToDrop[index] || undefined}
                          className="custom-select"
                          popupClassName="custom-dropdown"
                        />
                      </div>
                    ))}
                    
                    {/* Submit Button */}
                    <Button
                      type="primary"
                      icon={isSubmitting ? <Spin size="small" /> : <SwapOutlined />}
                      onClick={handleSubmitTransfer}
                      disabled={isSubmitting || isLoading}
                      //disabled = {true}
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
            <Col md={8}>
              <Card 
                title="Transfer Results"
                className="waiver-card waiver-results-card"
              >
                {renderTransferResults()}
              </Card>
            </Col>
            
            {/* Empty Column to Match Waiver Layout */}
            <Col md={8}>
              <Card 
                title="Transfer Information"
                className="waiver-card transfer-info-card"
              >
                <div className="result-placeholder">
                  <CalendarOutlined className="calendar-icon" style={{ fontSize: 24, marginBottom: 8 }} />
                  <Text style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
                    Free Agent Auction Information
                  </Text>
                  <Text style={{ textAlign: 'center', fontSize: 12, marginTop: 8, color: 'rgba(255, 255, 255, 0.5)' }}>
                    Released players enter the free agent pool
                  </Text>
                </div>
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