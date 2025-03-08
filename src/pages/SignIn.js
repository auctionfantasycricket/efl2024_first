import React, { useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setLoginSuccess } from '../components/redux/reducer/authReducer';
import { useNavigate } from 'react-router-dom';
import './SignIn.css';

const baseURL = process.env.REACT_APP_BASE_URL;

const SignIn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const login = useGoogleLogin({
  
    onSuccess: async respose => {
      try {
          const res = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: {
                  "Authorization": `Bearer ${respose.access_token}`
              }
          })

          const backendtoken = await axios.post(baseURL+'/google_auth', {
            email: res.data.email,
            name: res.data.name
          });

          localStorage.setItem('token', backendtoken.data.token);
          // console.log(backendtoken)
          // console.log(backendtoken.data)
          dispatch(setLoginSuccess(res.data));
          navigate('/players')
      } catch (err) {
          console.log(err)

      }

    }
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const user = JSON.parse(atob(token.split('.')[1]));
      dispatch(setLoginSuccess(user));
      navigate('/players');
    } else {
      login();
    }
  }, [dispatch, navigate, login]);


  return (
      <div className='signin-page'>
        {/* <Form>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Email address</Form.Label>
            <Form.Control type="email" placeholder="name@example.com" />
          </Form.Group>
        </Form> */}
        <h2>Signing In...</h2>
      </div>
  )
}

export default SignIn