// import React, { useEffect } from 'react';
// import { useGoogleLogin } from '@react-oauth/google';
// import axios from 'axios';
// import { useDispatch } from 'react-redux';
// import { setLoginSuccess } from '../components/redux/reducer/authReducer';
// import { setselectedLeagueId, setisLeagueadmin, setCurrentLeague, setmemberof } from '../components/redux/reducer/leagueReducer';
// import { useNavigate } from 'react-router-dom';
// import './SignIn.css';
// import {jwtDecode } from 'jwt-decode';

// const baseURL = process.env.REACT_APP_BASE_URL;

// const SignIn = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const login = useGoogleLogin({
  
//     onSuccess: async respose => {
//       try {
//           const res = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
//               headers: {
//                   "Authorization": `Bearer ${respose.access_token}`
//               }
//           })

//           const backendtoken = await axios.post(baseURL+'/google_auth', {
//             email: res.data.email,
//             name: res.data.name
//           });

//           localStorage.setItem('token', backendtoken.data.token);
//           //dispatch(setLoginSuccess(res.data));
//           dispatch(setLoginSuccess(jwtDecode(backendtoken.data.token)));
//           navigate('/league')
//       } catch (err) {
//           console.log(err)

//       }

//     }
//   });

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const leagueId = localStorage.getItem('leagueId');
    
//     if (leagueId){
//       dispatch(setselectedLeagueId(leagueId));
//     }
//     if (token) {
//       const user = JSON.parse(atob(token.split('.')[1]));
//       dispatch(setLoginSuccess(user));
//       navigate('/league');
//     } else {
//       login();
//     }
//   }, [dispatch, navigate, login]);


//   return (
//       <div className='signin-page'>
//         <h2>Signing In...</h2>
//       </div>
//   )
// }

// export default SignIn

//src/pages/SignIn.js
import React, { useEffect, useCallback } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setLoginSuccess } from '../components/redux/reducer/authReducer';
import { setselectedLeagueId, setisLeagueadmin, setCurrentLeague, setmemberof } from '../components/redux/reducer/leagueReducer';
import { useNavigate } from 'react-router-dom';
import './SignIn.css';
import { jwtDecode } from 'jwt-decode';

const baseURL = process.env.REACT_APP_BASE_URL;
const TOKEN_EXPIRY_KEY = 'tokenExpiry';
const TOKEN_KEY = 'token';
const LEAGUE_ID_KEY = 'leagueId';
const CURRENT_LEAGUE_KEY = 'currentLeague';
const PENDING_LEAGUE_JOIN_KEY = 'pendingLeagueJoin';

// Default expiry to June 1, 2026 (UTC)
const DEFAULT_TOKEN_EXPIRY = new Date('2026-06-01T00:00:00.000Z').toISOString();

const clearLocalAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  localStorage.removeItem(LEAGUE_ID_KEY);
  localStorage.removeItem(CURRENT_LEAGUE_KEY);
  localStorage.removeItem(PENDING_LEAGUE_JOIN_KEY);
};

const setAuthData = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, DEFAULT_TOKEN_EXPIRY);
};

const isTokenValid = () => {
  const expiryRaw = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiryRaw) return false;
  const expiryDate = new Date(expiryRaw);
  if (Number.isNaN(expiryDate.getTime())) return false;
  return expiryDate.getTime() >= Date.now();
};

const SignIn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loginCallback = useCallback(async (response) => {
    try {
      const res = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          "Authorization": `Bearer ${response.access_token}`
        }
      });

      const backendtoken = await axios.post(baseURL+'/google_auth', {
        email: res.data.email,
        name: res.data.name
      });

      setAuthData(backendtoken.data.token);
      dispatch(setLoginSuccess(jwtDecode(backendtoken.data.token)));
      // navigate('/league');

      // ✅ Check if user arrived via an invite link
      const pendingLeagueJoin = localStorage.getItem('pendingLeagueJoin');
      console.log('Pending league join:', pendingLeagueJoin);
      if (pendingLeagueJoin) {
        navigate(`/join/${pendingLeagueJoin}`); // JoinLeague page will handle the actual join
      } else {
        navigate('/league');
      }
    } catch (err) {
      console.log(err);
    }
  }, [dispatch, navigate]);

  const login = useGoogleLogin({
    onSuccess: loginCallback
  });

  useEffect(() => {
    // Expiry check: if tokenExpiry is missing/expired, clear and force a full re-auth.
    if (!isTokenValid()) {
      clearLocalAuthData();
      login();
      return;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    const leagueId = localStorage.getItem(LEAGUE_ID_KEY);

    if (leagueId) {
      dispatch(setselectedLeagueId(leagueId));
    }

    if (token) {
      try {
        const user = JSON.parse(atob(token.split('.')[1]));
        dispatch(setLoginSuccess(user));
        navigate('/league');
      } catch (err) {
        console.warn('Invalid token format, clearing storage:', err);
        clearLocalAuthData();
        login();
      }
    } else {
      login();
    }
  }, [dispatch, navigate]); // Removed login from dependency array

  return (
    <div className='signin-page'>
      <h2>Signing In...</h2>
    </div>
  );
};

export default SignIn;