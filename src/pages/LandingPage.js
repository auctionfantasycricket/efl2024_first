import React from 'react'
import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux';
import { setLoginSuccess } from '../components/redux/reducer/authReducer';
import { setselectedLeagueId, setisLeagueadmin, setCurrentLeague, setmemberof } from '../components/redux/reducer/leagueReducer';
import { Card, CardContent, CardActions, Button, Typography, TextField, CircularProgress, MenuItem, Modal, Box } from '@mui/material';
import './LandingPage.css';
import { useNavigate } from "react-router-dom";
import DeleteIcon from '@mui/icons-material/Delete';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { useMediaQuery, useTheme } from '@mui/material';


const baseURL = process.env.REACT_APP_BASE_URL;

const LandingPage = () => {
  
  const [leagueCode, setLeagueCode] = useState('');
  const [myLeagues, setMyLeagues] = useState([]);
  const [leagueName, setLeagueName] = useState('');
  const [leagueType, setLeagueType] = useState('');
  const [isLoadingJoin, setIsLoadingJoin] = useState(false);
  const [isLoadingCreate, setIsLoadingCreate] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const dispatch = useDispatch();
  const userProfile = useSelector((state) => state.login.userProfile);
  const league = useSelector((state) => state.league.selectedLeagueId);

  const [successPopupOpen, setSuccessPopupOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); 

  const [refreshLeagues, setRefreshLeagues] = useState(0);

  const navigate = useNavigate()

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  useEffect(() => {
    const fetchMyLeagues = async () => {
      try {
        const response = await fetch(`${baseURL}get_leagues_by_email?email=${userProfile?.email}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        
        setMyLeagues(data.leagues || []);
        dispatch(setmemberof(data.leagues))
      } catch (error) {
        console.error(error);
        setMyLeagues([]);
      }
    };
    if (userProfile?.email) {
      fetchMyLeagues();
    }
  }, [userProfile?.email, refreshLeagues]);

  const handleJoinLeague = async() => {
    setIsLoadingJoin(true);
    const payload = {"email": userProfile?.email,"leagueId": leagueCode};
    try{
      const response = await fetch(baseURL+'join_league', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if(response.ok){
        await response.json()
        dispatch(setselectedLeagueId(leagueCode))
        localStorage.setItem('leagueId', leagueCode)
        setSuccessMessage("Successfuly Joined the League");
        setSuccessPopupOpen(true);
        setRefreshLeagues((prev) => prev + 1);
      }
      }catch(error) {
        console.error(error);
        setIsLoadingJoin(false);
    } finally {
      setIsLoadingJoin(false);
    };
  };

  const handleCreateLeague = async() => {
    setIsLoadingCreate(true);
    const payload = {"useremail": userProfile?.email,"league_name": leagueName,"league_type":leagueType};
    
    try{
      const response = await fetch(baseURL+'create_league', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if(response.ok){
        const data = await response.json()
        dispatch(setselectedLeagueId(data.leagueId))
        localStorage.setItem('leagueId', data.leagueId)
        setSuccessMessage(data.message);
        setSuccessPopupOpen(true);
        setRefreshLeagues((prev) => prev + 1);
      }
      }catch(error) {
        console.error(error);
        setIsLoadingCreate(false);
    } finally {
      setIsLoadingCreate(false);
    };
  }

  const handleLeagueClick = (league) => {
    dispatch(setselectedLeagueId(league._id));
    localStorage.setItem('leagueId', league._id)
    dispatch(setCurrentLeague(league))
    localStorage.setItem('currentLeague',JSON.stringify(league))
    navigate('/teams')
  };

  const handleManageLeagueClick = (league) => {
    dispatch(setselectedLeagueId(league._id));
    localStorage.setItem('leagueId', league._id)
    dispatch(setCurrentLeague(league))
    localStorage.setItem('currentLeague',JSON.stringify(league))
    navigate('/manageleague')
  };

  const handleDeleteLeagueClick = async(league) => {
    setIsLoadingDelete(true);

    try{
      const response = await fetch(baseURL+'delete_league?leagueId='+league._id, {
        method: 'DELETE',
      });
      if(response.ok){
        const data = await response.json()
        console.log(data)
        setSuccessMessage(data.message);
        setSuccessPopupOpen(true);
        setRefreshLeagues((prev) => prev + 1);
      }
      }catch(error) {
        console.error(error);
        setIsLoadingDelete(false);
    } finally {
      setIsLoadingDelete(false);
    };
  };

  const handleCloseSuccessPopup = () => {
    setSuccessPopupOpen(false);
  };

  // Common card styling with responsive width
  const cardStyle = {
    margin: '10px', 
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: '12px',
    width: '100%'  // Instead of fixed minWidth
  };

  return (
    <div className='landingbody'>
      <div className="landingcontainer">
        <h1>Welcome to Fantasy League</h1>
        <Container fluid={isSmallScreen}> 
          <Row className={isSmallScreen ? 'flex-column' : ''}>
            <Col xs={12} md={4} className="mb-3">
              <Card sx={cardStyle}>
                <CardContent>
                  <Typography variant="h5" color="white" component="div">
                    Join a League
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="rgba(255, 255, 255, 0.7)">
                    Enter the league code to join an existing league.
                  </Typography>
                  <TextField 
                    label="League Code" 
                    variant="outlined" 
                    value={leagueCode} 
                    onChange={(e) => setLeagueCode(e.target.value)} 
                    fullWidth
                    sx={{
                      '& label': {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                      '& label.Mui-focused': {
                        color: 'black',
                      },
                      input: {
                        color: 'white', 
                      }
                    }}
                  />
                </CardContent>
                <CardActions>
                  <Button 
                    variant="contained" 
                    onClick={handleJoinLeague} 
                    disabled={!leagueCode || isLoadingJoin} 
                    sx={{
                      borderRadius:'9px',
                      '&.Mui-disabled': {
                          color: 'rgba(255, 255, 255, 0.5)',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}>
                    {isLoadingJoin ? <CircularProgress size={24} /> : "Join League"}
                  </Button>
                </CardActions>
              </Card>
            </Col>

            <Col xs={12} md={4} className="mb-3">
              <Card sx={cardStyle}>
                <CardContent>
                  <Typography variant="h5" color="white" component="div">
                    Create My League
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="rgba(255, 255, 255, 0.7)">
                    Start a new league and invite your friends!
                  </Typography>
                  <>
                    <TextField 
                      label="League Name" 
                      variant="outlined" 
                      value={leagueName} 
                      onChange={(e) => setLeagueName(e.target.value)} 
                      fullWidth 
                      sx={{ marginBottom: '10px',
                          '& label': {
                            color: 'rgba(255, 255, 255, 0.7)',
                          },
                          '& label.Mui-focused': {
                            color: 'black',
                          },
                          input: {
                            color: 'white',
                          }
                       }}
                    />
                    <TextField
                      label="Type of League"
                      select
                      variant="outlined"
                      value={leagueType}
                      onChange={(e) => setLeagueType(e.target.value)}
                      fullWidth
                      sx={{
                        '& label': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        '& label.Mui-focused': {
                          color: 'black',
                        },
                        '& .MuiSelect-select': {
                          color: 'white',
                        },
                      }}
                    >
                      <MenuItem value="auction">Auction</MenuItem>
                      <MenuItem value="draft">Draft</MenuItem>
                    </TextField>
                  </>
                </CardContent>
                <CardActions>
                  <Button 
                    variant="contained" 
                    onClick={handleCreateLeague} 
                    disabled={!leagueName || !leagueType || isLoadingCreate} 
                    sx={{borderRadius:'9px',
                      '&.Mui-disabled': {
                          color: 'rgba(255, 255, 255, 0.5)',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}>
                  {isLoadingCreate ? <CircularProgress size={24} /> : "Create League"}
                  </Button>
                </CardActions>
              </Card>
            </Col>

            <Col xs={12} md={4} className="mb-3">
              <Card sx={cardStyle}>
                <CardContent>
                  <Typography variant="h5" color="white" component="div">
                    My Leagues
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color='rgba(255, 255, 255, 0.7)'>
                    View and manage your existing leagues.
                  </Typography>
                  {myLeagues && myLeagues.length > 0 ? (
                    <div style={{ width: '100%' }}>
                      {myLeagues.map((league) => (
                        <div 
                          key={league._id} 
                          style={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: '5px', 
                            marginBottom: '10px',
                            justifyContent: isSmallScreen ? 'space-between' : 'flex-start',
                            width: '100%'
                          }}
                          className="button-group-flex"
                        >
                          <Button 
                            variant="contained" 
                            onClick={() => handleLeagueClick(league)}
                            sx={{ 
                              borderRadius: '9px',
                              flex: isSmallScreen ? '1 1 auto' : '0 1 auto'
                            }}
                          >
                            {league.league_name}
                          </Button>
                          {league.admins.includes(userProfile?.email) && (
                            <>
                              <Button
                                variant="contained" 
                                color="success"
                                onClick={() => handleManageLeagueClick(league)}
                                sx={{ 
                                  borderRadius: '9px',
                                  minWidth: isSmallScreen ? '40px' : 'auto'
                                }}
                              >
                                {isSmallScreen ? <ManageAccountsIcon /> : 'Manage'}
                              </Button>
                              <Button
                                variant="contained" 
                                color="error"
                                onClick={() => handleDeleteLeagueClick(league)}
                                sx={{
                                  borderRadius: '9px',
                                  minWidth: '40px'
                                }}
                              >
                                {isLoadingDelete ? <CircularProgress size={24} /> : <DeleteIcon/>}
                              </Button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <Button 
                        variant="contained" 
                        disabled 
                        sx={{ 
                          display: 'block',
                          marginBottom: '5px',
                          '&.Mui-disabled': {
                            color: 'rgba(255, 255, 255, 0.5)',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          },
                        }}
                      >
                        No Leagues Found
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      <Modal
        open={successPopupOpen}
        onClose={handleCloseSuccessPopup}
        aria-labelledby="success-modal-title"
        aria-describedby="success-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isSmallScreen ? '90%' : 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="success-modal-title" variant="h6" component="h2" sx={{color:'green', fontWeight:'bold'}}>
            Success!
          </Typography>
          <Typography id="success-modal-description" sx={{ mt: 2, color: 'black' }}>
            {successMessage}
          </Typography>
          <Button onClick={handleCloseSuccessPopup} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default LandingPage;