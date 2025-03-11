import React from 'react'
import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedLeagueId } from '../components/redux/reducer/authReducer';
import { Card, CardContent, CardActions, Button, Typography, TextField, CircularProgress } from '@mui/material';
import './LandingPage.css';

const baseURL = process.env.REACT_APP_BASE_URL;

const LandingPage = () => {
  const [mode, setMode] = useState(null);
  const [leagueCode, setLeagueCode] = useState('');
  const [myLeagues, setMyLeagues] = useState([]);
  const [leagueName, setLeagueName] = useState('');
  const [participants, setParticipants] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const userProfile = useSelector((state) => state.login.userProfile);

  const handleJoinLeague = () => {
    setIsLoading(true);
    const payload = {"email": userProfile.email,"leagueId": leagueCode};
    let response;
    try{
      response = fetch(baseURL+'join_league', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if(response.ok){
        let data = response.json()
        dispatch(setSelectedLeagueId(leagueCode))
        localStorage.setItem('leagueId', leagueCode)
        //Navigate to league page
      }
      }catch(error) {
        console.error(error);
        setIsLoading(false);
    } finally {
      setIsLoading(false); // Hide loading indicator
    };
  };

  useEffect(() => {
    const fetchMyLeagues = async () => {
      try {
        const response = await fetch(`${baseURL}get_leagues_by_email?email=${userProfile.email}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        //console.log(data);
        setMyLeagues(data.leagues || []);
      } catch (error) {
        console.error(error);
        setMyLeagues([]);
      }
    };
    if (userProfile?.email) {
      fetchMyLeagues();
    }
  }, [userProfile.email]);

  const handleLeagueClick = (leagueId) => {
    dispatch(setSelectedLeagueId(leagueId));
    localStorage.setItem('leagueId', leagueId)
    //Navigate to league page
  };


  return (
    <div className='landingbody'>
      <div className="landingcontainer">
        <h1>Welcome to Fantasy League</h1>
      <Container> 
        <Row>
          <Col>
            <Card sx={{ minWidth: 275, margin: '10px' }}>
              <CardContent>
                <Typography variant="h5" component="div">
                  Join a League
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Enter the league code to join an existing league.
                </Typography>
                {mode === 'join' && (
                  <TextField 
                    label="League Code" 
                    variant="outlined" 
                    value={leagueCode} 
                    onChange={(e) => setLeagueCode(e.target.value)} 
                    fullWidth 
                  />
                )}
              </CardContent>
              <CardActions>
                <Button variant="contained" onClick={() => setMode('join')}>Join League</Button>
                <Button 
                  variant="contained" 
                  onClick={handleJoinLeague} 
                  disabled={!leagueCode || isLoading}>
                  {isLoading ? 
                  ( <CircularProgress size={24} />) 
                  : 
                  ("Submit")}
                </Button>
              </CardActions>
            </Card>
          </Col>

          <Col>
            <Card sx={{ minWidth: 275, margin: '10px' }}>
              <CardContent>
                <Typography variant="h5" component="div">
                  Create My League
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Start a new league and invite your friends!
                </Typography>
                {mode === 'create' && (
                  <>
                    <TextField 
                      label="League Name" 
                      variant="outlined" 
                      value={leagueName} 
                      onChange={(e) => setLeagueName(e.target.value)} 
                      fullWidth 
                      sx={{ marginBottom: '10px' }}
                    />
                    <TextField 
                      label="Number of Participants" 
                      type="number" 
                      variant="outlined" 
                      value={participants} 
                      onChange={(e) => {const value = parseInt(e.target.value, 10); // Parse the value as an integer
                        setParticipants(value < 0 ? 0 : value);} }
                      fullWidth 
                      // slotProps={{ 
                      //   input: { min: 0 }
                      // }}
                      inputProps={{ min: 0 }} 
                    />
                  </>
                )}
              </CardContent>
              <CardActions>
                <Button variant="contained" onClick={() => setMode('create')}>Create League</Button>
                {/* <Button variant="contained" onClick={handleCreateLeague}>Submit</Button> */}
              </CardActions>
            </Card>
          </Col>

          <Col>
            <Card sx={{ minWidth: 275, margin: '10px' }}>
              <CardContent>
                <Typography variant="h5" component="div">
                  My Leagues
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  View and manage your existing leagues.
                </Typography>
                <CardActions>
                {myLeagues && myLeagues.length > 0 ? (<div>
                  {myLeagues.map((league) => (
                    <Button 
                      key={league._id} // Add a unique key for each button
                      variant="contained" 
                      onClick={() => handleLeagueClick(league._id)}
                      sx={{ 
                        display: 'block', // Make the buttons stack vertically
                        marginBottom: '5px' // Add some space between buttons
                      }}
                    >
                      {league.league_name}
                    </Button>
                  ))}
                </div>):(
                  <div>
                    <Button 
                      variant="contained" disabled 
                      sx={{ 
                        display: 'block', // Make the buttons stack vertically
                        marginBottom: '5px' // Add some space between buttons
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
    </div>
  );
}

export default LandingPage