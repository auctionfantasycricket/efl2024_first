import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setselectedLeagueId, setCurrentLeague } from '../components/redux/reducer/leagueReducer';

const baseURL = process.env.REACT_APP_BASE_URL;

const JoinLeague = () => {
  const { leagueId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userProfile = useSelector((state) => state.login.userProfile);

  useEffect(() => {
    // Always persist the invite target in case we need to survive a login redirect
    if (leagueId) {
      localStorage.setItem('pendingLeagueJoin', leagueId);
    }

    const token = localStorage.getItem('token');

    if (!token) {
      // Not logged in — send to sign-in; SignIn will redirect back here after auth
      navigate('/signin');
      return;
    }

    // Already logged in — join immediately
    if (userProfile?.email) {
      joinLeague(userProfile.email, leagueId);
    }
  }, [leagueId, userProfile]);

  const joinLeague = async (email, id) => {
    try {
      const response = await fetch(`${baseURL}join_league`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, leagueId: id }),
      });

      if (response.ok) {
        const data = await response.json();
        dispatch(setselectedLeagueId(id));
        localStorage.setItem('leagueId', id);
        localStorage.removeItem('pendingLeagueJoin'); // Clean up
        navigate('/teampoints');
      }
    } catch (error) {
      console.error('Failed to join league:', error);
      navigate('/league');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h2>Joining league...</h2>
    </div>
  );
};

export default JoinLeague;