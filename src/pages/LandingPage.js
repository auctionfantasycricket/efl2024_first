import React from 'react'
import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import './LandingPage.css';


const LandingPage = () => {
    const [mode, setMode] = useState(null);
    const [leagueCode, setLeagueCode] = useState('');
    const [teamName, setTeamName] = useState('');
    const [participants, setParticipants] = useState('');



  return (
    <div className='landingbody'>
    <div className="landingcontainer">
    <h1>Welcome to Fantasy League</h1>
    <div className="button-group">
      <button onClick={() => setMode('join')}>Join a League</button>
      <button onClick={() => setMode('create')}>Create My League</button>
    </div>

    {mode === 'join' && (
      <div className="form-group">
        <label>Enter League Code:</label>
        <input
          type="text"
          value={leagueCode}
          onChange={(e) => setLeagueCode(e.target.value)}
          placeholder="League Code"
        />
      </div>
    )}

    {mode === 'create' && (
      <form className="form-group">
        <label>Team Name:</label>
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Enter your team name"
        />

        <label>Number of Participants:</label>
        <input
          type="number"
          value={participants}
          onChange={(e) => setParticipants(e.target.value)}
          placeholder="Enter number of participants"
        />
      </form>
    )}
    <button className="vvd"><span>Submit</span></button>
  </div>
  </div>
  )
}

export default LandingPage