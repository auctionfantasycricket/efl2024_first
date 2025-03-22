import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Container, Row, Col } from 'react-bootstrap';
import { Card, CardContent, CardActions, CardHeader, Button, Typography, Box, Snackbar, IconButton, Alert, TextField, CircularProgress } from '@mui/material';
import { Users, User, Calendar, List, RotateCcw, ArrowRight } from 'lucide-react';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { useNavigate } from "react-router-dom";
import './TeamHub.css';

// Constants
const baseURL = process.env.REACT_APP_BASE_URL;

const TeamHub = () => {
  // State management
  const [userTeam, setUserTeam] = useState(null);
  const [userTeamLoading, setUserTeamLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isLoadingJoin, setIsLoadingJoin] = useState(false);
  const [teamId, setTeamId] = useState('');
  
  // Add these new state variables for error message popup
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [refreshLeagues, setRefreshLeagues] = useState(0);
  
  const leagueId = useSelector((state) => state.league.selectedLeagueId);
  const userProfile = useSelector((state) => state.login.userProfile);
  const leagueinfo = useSelector((state) => state.league.currentLeague);
  const league_type = leagueinfo?.league_type

  const navigate = useNavigate()


  // Fetch user's team when component mounts
  useEffect(() => {
    if (userProfile?.userId && leagueId) {
      fetchUserTeam();
    }
  }, [userProfile?.userId, leagueId, refreshLeagues]);
  
  const fetchUserTeam = async () => {
    try {
      setUserTeamLoading(true);
      const response = await fetch(`${baseURL}teams/my_team?userId=${userProfile.userId}&leagueId=${leagueId}`);
      
      if (response.status === 404) {
        // User doesn't have a team
        setUserTeam(null);
        setUserTeamLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      setUserTeam(data);
      
      // Check if members exist
      if (data.members && data.members.length > 0) {
        console.log(data.members);
        setTeamMembers(data.members);
      } else {
        // Set team members empty and show error message
        setTeamMembers([]);
        setErrorMessage('No team members found for this team');
        setErrorSnackbarOpen(true);
      }
      
      setUserTeamLoading(false);
    } catch (err) {
      console.error('Error fetching user team:', err);
      setUserTeam(null);
      setUserTeamLoading(false);
      setErrorMessage('Error loading team data');
      setErrorSnackbarOpen(true);
    }
  };
  
  const handleJoinTeam = async() => {
    setIsLoadingJoin(true);
    const payload = {"userId": userProfile.userId,"teamId": teamId,"leagueId": leagueId};
    try{
      const response = await fetch(baseURL+'/teams/join', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if(response.ok){
        await response.json()
        setRefreshLeagues((prev) => prev + 1);
      }
    } catch(error) {
      console.error(error);
      setErrorMessage('Failed to join team');
      setErrorSnackbarOpen(true);
      setIsLoadingJoin(false);
    } finally {
      setIsLoadingJoin(false);
    };
  };
  
  const handleCopyTeamId = () => {
    const teamId = userTeam?.teamId;
    navigator.clipboard.writeText(teamId)
      .then(() => {
        // Show snackbar on successful copy
        setSnackbarOpen(true);
      })
      .catch(err => {
        console.error('Failed to copy team ID:', err);
      });
  };
  
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };
  
  // Add this handler for error snackbar
  const handleCloseErrorSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setErrorSnackbarOpen(false);
  };

  const handleclickpointstable =() =>{
    navigate('/teampoints')
  }

  const NoTeamView = () => (
    <Box className="no-team-container">
      <Card className="team-hub-card no-team-card">
        <CardContent>
          <Box className="no-team-content" sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              You are not part of any team
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Join an existing team.
            </Typography>
            <TextField 
              label="Team ID" 
              variant="outlined" 
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)} 
              fullWidth
              sx={{
                mb: 2,
                '& label': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
                '& label.Mui-focused': {
                  color: 'white',
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.7)', // Default border color
                  },
                  '&:hover fieldset': {
                    borderColor: 'white', // Hover border color
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white', // Focused border color
                  }
                },
                input: {
                  color: 'white', 
                }
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Button 
              variant="contained" 
              color="primary" 
              disabled={!teamId || isLoadingJoin}
              onClick={handleJoinTeam}
              className="search-button"
              size="small"
            >
              {isLoadingJoin ? <CircularProgress size={24} /> : "Join a Team"}
            </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
  
  // Component to render when user has a team
  const TeamView = () => (
    <Box className="team-view-container">
      <Card className="team-hub-card team-info-card" sx={{ mb: 1 }}>
        <CardContent sx={{ p: 1 }}>
          <Box className="team-header" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box className="team-logo">
              <Users size={32} className="team-avatar-icon" />
            </Box>
            <Box className="team-info">
              <Typography variant="h5" className="team-name reduced-team-name">
                {userTeam?.teamName}
              </Typography>
              
              {/* Team ID Display */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" className="team-id">
                  Team ID: {userTeam?.teamId}
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={handleCopyTeamId} 
                  className="copy-icon-button"
                  aria-label="copy team ID"
                >
                  <FileCopyIcon fontSize="small" />
                </IconButton>
              </Box>
              
              {/* Team Members Display - same format as Team ID */}
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <Typography variant="subtitle2" className="team-id">
                  Team Members: 
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', ml: 1 }} className="header-members-container">
                {teamMembers && teamMembers.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }} className="team-members-container">
                    {teamMembers.map((member, index) => (
                      <Box 
                        key={index} 
                        className="member-mini-card"
                      >
                        <User size={14} className="member-avatar-icon" />
                        <Typography variant="caption" className="member-name">
                          {member}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
            )  : (
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontStyle: 'italic' }}>
                      No members found
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
      
      {/* Team Actions */}
      <Card className="team-hub-card team-actions-card">
        <CardHeader 
          title={
            <Typography variant="subtitle1">Team Actions</Typography>
          }
        />
        <CardContent>
          <Box className="team-actions-buttons" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {league_type==='draft' && (<Button 
              variant="contained" 
              className="search-button file-waiver"
              endIcon={<ArrowRight size={16} />}
              size="small"
              disabled = {true}
            >
              File Waiver
            </Button>)}
            {league_type === 'auction' && (<Button 
              variant="contained" 
              className="search-button propose-transfer"
              endIcon={<ArrowRight size={16} />}
              size="small"
              disabled = {true}
            >
              Drop Players
            </Button>)}
            <Button 
              variant="contained" 
              className="search-button view-standings"
              endIcon={<List size={16} />}
              size="small"
              onClick={handleclickpointstable}
              // disabled = {true}
            >
              View Standings
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      {/* Snackbar for copy notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Team ID copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
  
  return (
    <div className="team-hub-container">
      <Container fluid className="team-hub-main-container">
        <div className="team-hub-card">
          <Box className="team-hub-header" sx={{ mb: 2 }}>
            <Typography variant="h6" className="team-hub-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Users size={20} /> Team Hub
            </Typography>
            <Typography variant="body2" className="team-hub-subtitle">
              Manage your team and view team information.
            </Typography>
          </Box>
          
          {userTeamLoading ? (
            <Box className="loading-indicator" sx={{ textAlign: 'center', p: 2 }}>
              <div className="spinner"></div>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Loading team information...
              </Typography>
            </Box>
          ) : userTeam ? (
            <TeamView />
          ) : (
            <NoTeamView />
          )}
          
          {/* Error message Snackbar */}
          <Snackbar
            open={errorSnackbarOpen}
            autoHideDuration={5000}
            onClose={handleCloseErrorSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert onClose={handleCloseErrorSnackbar} severity="warning" sx={{ width: '100%' }}>
              {errorMessage}
            </Alert>
          </Snackbar>
        </div>
      </Container>
    </div>
  );
};

export default TeamHub;