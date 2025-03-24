import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Row, Col, Typography, Spin } from 'antd';
import { ReloadOutlined, UserOutlined, CalendarOutlined, SwapOutlined } from '@ant-design/icons';
import { RotateCcw } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import './WaiverView.css';

const { Option } = Select;
const { Title, Text } = Typography;

const baseURL = process.env.REACT_APP_BASE_URL;

const getIdValue = (id) => {
  if (id && typeof id === 'object' && id.$oid) {
    return id.$oid;
  }
  return id;
};

const fetchPlayerslist = async (id) => {
  const response = await fetch(`${baseURL}/get_data?collectionName=leagueplayers&leagueId=${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

const WaiverView = ({ leaguetype, nameofteam }) => {
  const leagueId = useSelector((state) => state.league.selectedLeagueId);
  const teamname = nameofteam;
  console.log(teamname);
  
  // State for player preferences and drops
  const [playerPreferences, setPlayerPreferences] = useState(['', '', '', '']);
  const [playersToDrop, setPlayersToDrop] = useState(['', '']);
  
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
    queryFn: () => fetchPlayerslist(leagueId),
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
  
  // Transform and process player data once when it's fetched
  useEffect(() => {
    if (playerData) {
      // Transform unsold players for dropdown
      const unsold = playerData
        .filter(player => player.status !== 'sold')
        .map(player => ({
          value: getIdValue(player._id) || player.player_name,
          label: player.name || player.player_name
        }));
      
      setUnsoldPlayers(unsold);
      
      // Filter players belonging to user's team
      const myTeam = playerData
        .filter(player => player.status === 'sold' && player.ownerTeam === teamname)
        .map(player => ({
          value: getIdValue(player._id) || player.player_name,
          label: player.name || player.player_name
        }));
      
      setTeamPlayers(myTeam);
    }
  }, [playerData, teamname]);
  
  // Handle preference selection change
  const handlePreferenceChange = (index, value) => {
    const newPreferences = [...playerPreferences];
    newPreferences[index] = value;
    setPlayerPreferences(newPreferences);
  };
  
  // Handle clearing a preference
  const handleClearPreference = (index) => {
    const newPreferences = [...playerPreferences];
    newPreferences[index] = '';
    setPlayerPreferences(newPreferences);
  };
  
  // Handle drop selection change
  const handleDropChange = (index, value) => {
    const newDrops = [...playersToDrop];
    newDrops[index] = value;
    setPlayersToDrop(newDrops);
  };
  
  // Handle clearing a drop
  const handleClearDrop = (index) => {
    const newDrops = [...playersToDrop];
    newDrops[index] = '';
    setPlayersToDrop(newDrops);
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
    
    try {
      // Prepare data for submission
      const waiverData = {
        leagueId,
        teamName: teamname,
        preferences: playerPreferences.filter(p => p !== ''),
        playersToDrop: playersToDrop.filter(p => p !== '')
      };
      
      // Mock API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set mock waiver results
      setWaiverResults({
        processedDate: new Date().toLocaleDateString(),
        playersAdded: waiverData.preferences.map(prefId => {
          const player = unsoldPlayers.find(p => p.value === prefId);
          return player ? player.label : prefId;
        }),
        playersDropped: waiverData.playersToDrop.map(dropId => {
          const player = teamPlayers.find(p => p.value === dropId);
          return player ? player.label : dropId;
        })
      });
      
    } catch (error) {
      console.error('Error submitting waiver:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle transfer submission (for auction leagues)
  const handleSubmitTransfer = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare data for submission
      const transferData = {
        leagueId,
        teamName: teamname,
        playersToDrop: playersToDrop.filter(p => p !== '')
      };
      
      // Mock API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set mock transfer results
      setTransferResults({
        processedDate: new Date().toLocaleDateString(),
        playersDropped: transferData.playersToDrop.map(dropId => {
          const player = teamPlayers.find(p => p.value === dropId);
          return player ? player.label : dropId;
        })
      });
      
    } catch (error) {
      console.error('Error submitting transfer:', error);
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
                      // disabled={isSubmitting || isLoading}
                      disabled = {true}
                      loading={isSubmitting}
                      className="waiver-submit-button"
                    >
                      {isSubmitting ? "Submitting..." : "File Waivers"}
                    </Button>
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
                      // disabled={isSubmitting || isLoading}
                      disabled = {true}
                      loading={isSubmitting}
                      className="waiver-submit-button release-submit-button"
                    >
                      {isSubmitting ? "Processing..." : "Release Players"}
                    </Button>
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