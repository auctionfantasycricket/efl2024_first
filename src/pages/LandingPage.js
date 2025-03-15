import React from 'react'
import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux';
import { setLoginSuccess } from '../components/redux/reducer/authReducer';
import { setselectedLeagueId, setisLeagueadmin, setCurrentLeague, setmemberof } from '../components/redux/reducer/leagueReducer';
import { Card, CardContent, CardActions, Button, Typography, TextField, CircularProgress, MenuItem, Modal, Box } from '@mui/material';
import './LandingPage.css';
import { useNavigate } from "react-router-dom";

const baseURL = process.env.REACT_APP_BASE_URL;

const LandingPage = () => {
  
  const [leagueCode, setLeagueCode] = useState('');
  const [myLeagues, setMyLeagues] = useState([]);
  const [leagueName, setLeagueName] = useState('');
  const [leagueType, setLeagueType] = useState('');
  const [isLoadingJoin, setIsLoadingJoin] = useState(false);
  const [isLoadingCreate, setIsLoadingCreate] = useState(false);
  const dispatch = useDispatch();
  const userProfile = useSelector((state) => state.login.userProfile);
  const league = useSelector((state) => state.league.selectedLeagueId);

  const [successPopupOpen, setSuccessPopupOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); 

  const [refreshLeagues, setRefreshLeagues] = useState(0);

  const navigate = useNavigate()

  useEffect(() => {
      const token = localStorage.getItem('token');
      const leagueId = localStorage.getItem('leagueId');
      if (token) {
        const user = JSON.parse(atob(token.split('.')[1]));
        dispatch(setLoginSuccess(user));
      }
  
      if (leagueId){
        dispatch(setselectedLeagueId(leagueId));
      }
    }, [dispatch]);
  
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
    //let response;
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
    //Navigate to league page
    navigate('/teams')
  };

  const handleManageLeagueClick = (league) => {
    dispatch(setselectedLeagueId(league._id));
    localStorage.setItem('leagueId', league._id)
    dispatch(setCurrentLeague(league))
    localStorage.setItem('currentLeague',JSON.stringify(league))
    //Navigate to league page
    navigate('/manageleague')
  };

  const handleCloseSuccessPopup = () => {
    setSuccessPopupOpen(false);
  };


  return (
    <div className='landingbody'>
      <div className="landingcontainer">
        <h1>Welcome to Fantasy League</h1>
      <Container> 
        <Row>
          <Col>
            <Card sx={{ minWidth: 275, margin: '10px', backgroundColor: "rgba(255, 255, 255, 0.1)",borderRadius:'12px' }}>
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

          <Col>
            <Card sx={{ minWidth: 275, margin: '10px', backgroundColor: "rgba(255, 255, 255, 0.1)",borderRadius:'12px' }}>
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
                            color: 'black', // Set focused label color to lightblue
                          },
                          input: {
                            color: 'white', // Set text color to white
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
                          color: 'black', // Set focused label color to lightblue
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

          <Col>
            <Card sx={{ minWidth: 275, margin: '10px', backgroundColor: "rgba(255, 255, 255, 0.1)",borderRadius:'12px'}}>
              <CardContent>
                <Typography variant="h5" color="white" component="div">
                  My Leagues
                </Typography>
                <Typography sx={{ mb: 1.5 }} color='rgba(255, 255, 255, 0.7)'>
                  View and manage your existing leagues.
                </Typography>
                <CardActions>
                {myLeagues && myLeagues.length > 0 ? (
                  <div>
                  {myLeagues.map((league) => (
                    <div key={league._id} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <Button 
                      variant="contained" 
                      onClick={() => handleLeagueClick(league)}
                      sx={{ 
                        display: 'block', // Make the buttons stack vertically
                        marginBottom: '5px', // Add some space between buttons
                        borderRadius: '9px'
                      }}
                    >
                      {league.league_name}
                    </Button>
                    {league.admins.includes(userProfile?.email) && (
                     <Button
                     variant = "contained" color="error"
                     onClick={() => handleManageLeagueClick(league)}
                     sx={{ 
                       display: 'block',
                       marginBottom: '5px',
                       borderRadius: '9px'
                     }}
                   >
                     Manage
                   </Button>
                    )}
                   </div>
                  ))}
                </div>):(
                  <div>
                    <Button 
                      variant="contained" disabled 
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
                </CardActions>
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
        // slotProps={{backdrop: {
        //   onClick: () => {},
        // },}}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
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

export default LandingPage