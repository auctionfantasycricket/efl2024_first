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

      localStorage.setItem('token', backendtoken.data.token);
      dispatch(setLoginSuccess(jwtDecode(backendtoken.data.token)));
      navigate('/league');
    } catch (err) {
      console.log(err);
    }
  }, [dispatch, navigate]);

  const login = useGoogleLogin({
    onSuccess: loginCallback
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const leagueId = localStorage.getItem('leagueId');
    
    if (leagueId) {
      dispatch(setselectedLeagueId(leagueId));
    }
    
    if (token) {
      const user = JSON.parse(atob(token.split('.')[1]));
      dispatch(setLoginSuccess(user));
      navigate('/league');
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