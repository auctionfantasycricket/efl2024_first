import { useState, useEffect } from "react";
import { Navbar, Nav, Container, NavDropdown, Offcanvas, Button } from "react-bootstrap";
import logo from '../assets/logos/logo-no-background.svg';
import navIcon1 from '../assets/images/nav-icon1.svg';
import navIcon2 from '../assets/images/nav-icon2.svg';
import navIcon3 from '../assets/images/nav-icon3.svg';
import './NavBar.css'
import { Link, BrowserRouter as Router, useNavigate } from "react-router-dom";
import { FaTimes } from 'react-icons/fa';
import {useGoogleLogin, googleLogout} from '@react-oauth/google';
import axios from "axios"
import { useDispatch, useSelector } from 'react-redux';
import { setLoginSuccess, setLogoutSuccess, setSelectedLeagueId } from './redux/reducer/authReducer'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const baseURL = process.env.REACT_APP_BASE_URL;

export const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);

  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.login.isLoggedIn);
  const userProfile = useSelector((state) => state.login.userProfile);
  const isAdmin = useSelector((state) => state.login.isAdmin);

  const navigate = useNavigate()
 

  useEffect(() => {
    const token = localStorage.getItem('token');
    const leagueId = localStorage.getItem('leagueId');
    if (token) {
      const user = JSON.parse(atob(token.split('.')[1]));
      dispatch(setLoginSuccess(user));
    }

    if (leagueId){
      dispatch(setSelectedLeagueId(leagueId));
    }
  }, [dispatch]);


  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };

    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleScrollToSection = (sectionId) => {
    //setIsMenuOpen(false);

    if (isMenuOpen) { // Close menu on any link press if mobile
      setIsMenuOpen(false);
    }
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleClose = () => setIsMenuOpen(false);

  


  ///Login Functionality

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
          navigate('/league')
      } catch (err) {
          console.log(err)

      }

    }
  });

  const handlelogin =() => {
    const token = localStorage.getItem('token');
    const leagueId = localStorage.getItem('leagueId');
    if (leagueId){
      dispatch(setSelectedLeagueId(leagueId));
    }
    if (token) {
      const user = JSON.parse(atob(token.split('.')[1]));
      dispatch(setLoginSuccess(user));
      navigate('/league');
    }else{
      
      login();

    }

  }
  

  const handlelogOut = () => {
    googleLogout();
    dispatch(setLogoutSuccess());
    //navigate('/efl2024_first')
    navigate('/')
  };

/*className={`${scrolled ? "scrolled" : ""} ${isLoggedIn ? "logged" : ""}`}>*/

  return (
    <>
    <Navbar expand="md" className={scrolled ? "scrolled" : ""}>
      <Container>
        <Navbar.Brand>
        <Link to ='/' className='navbar-brand' onClick={() => handleScrollToSection('home')}>
          <img src={logo} alt="Logo" />
          </Link>
        </Navbar.Brand>
        {isSmallScreen && (
          <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span className="navbar-toggler-icon"></span>
          </Navbar.Toggle>
        )}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
          <Nav.Link as={Link} to="/" className='navbar-link' onClick={() => handleScrollToSection('home')}>
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/players" className='navbar-link'>
              Players List
            </Nav.Link>
            {isAdmin && <Nav.Link as={Link} to="/auction" className='navbar-link'>
              Auction
            </Nav.Link>}
            {/* <Nav.Link as={Link} to="/teams" className='navbar-link' onClick={() => null}>
            Teams
            </Nav.Link>
            <Nav.Link as={Link} 
            to={isLoggedIn ? "/teampoints" : "/teampoints"}
            className='navbar-link'
             onClick={() => isLoggedIn ? null: null}>
              {isLoggedIn ? "Team Points" : "Team Points"}
            </Nav.Link>
            <Nav.Link as={Link}
              to={isLoggedIn ? "/waiver":"/draft"}
              className='navbar-link'
              onClick={() => isLoggedIn ? null: null}>
              {isLoggedIn ? "Waivers": "Draft Results" }
            </Nav.Link>
            <Nav.Link as={Link} to="/linegraph" className='navbar-link' onClick={() => null}>
              Team Rank
            </Nav.Link>
            <Nav.Link as={Link} to="/" className='navbar-link' onClick={() => handleScrollToSection('contact')}>
              Contact Us
            </Nav.Link> */}
          </Nav>
          <span className="navbar-text">
            <div className="social-icon">
              <a href="#"><img src={navIcon2} alt="" /></a>
              <a href="#"><img src={navIcon3} alt="" /></a>
            </div>
            {isLoggedIn ? (
                <NavDropdown title={<AccountCircleIcon  className="user-avatar" />} id="user-dropdown">
                  <NavDropdown.Item>{userProfile?.name || 'Name'}</NavDropdown.Item>
                  <NavDropdown.Item>{userProfile?.email || 'Email'}</NavDropdown.Item>
                  {isAdmin && <NavDropdown.Item>Admin</NavDropdown.Item>}
                  <NavDropdown.Item href="#/league"style={{background:'lightblue'}}>Select League</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handlelogOut}>Logout</NavDropdown.Item>
                </NavDropdown>
              ) : (
                <Nav.Link as={Link}>
                  <button className="vvd" onClick={handlelogin} ><span>LogIn</span></button>
                </Nav.Link>
              )}
          </span>
        </Navbar.Collapse>

        {isSmallScreen && (
          <Offcanvas show={isMenuOpen} onHide={() => setIsMenuOpen(false)} placement="end">
            <Offcanvas.Header>
            <Button onClick={handleClose}>
              <FaTimes/>
            </Button>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="ms-auto">
              <Nav.Link as={Link} to="/" className='navbar-link' onClick={() => handleScrollToSection('home')}>
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/players" className='navbar-link' onClick={() => setIsMenuOpen(!isMenuOpen)}>
              Players List
            </Nav.Link>
            {isAdmin && <Nav.Link as={Link} to="/auction" className='navbar-link'>
              Auction
            </Nav.Link>}
            {/* <Nav.Link as={Link} to="/teams" className='navbar-link' onClick={() => null}>
            Teams
            </Nav.Link>
            <Nav.Link as={Link} 
            to={isLoggedIn ? "/teampoints" : "/teampoints"}
            className='navbar-link'
             onClick={() => isLoggedIn ? setIsMenuOpen(!isMenuOpen): setIsMenuOpen(!isMenuOpen)}>
              {isLoggedIn ? "Team Points" : "Team Points"}
            </Nav.Link>
            <Nav.Link as={Link}
              to={isLoggedIn ? "/waiver":"/draft"}
              className='navbar-link'
              onClick={() => isLoggedIn ? setIsMenuOpen(!isMenuOpen): setIsMenuOpen(!isMenuOpen)}>
              {isLoggedIn ? "Waivers": "Draft Results" }
            </Nav.Link>
            <Nav.Link as={Link} to="/linegraph" className='navbar-link' onClick={() => setIsMenuOpen(!isMenuOpen)}>
              Team Rank
            </Nav.Link>
            <Nav.Link as={Link} to="/" className='navbar-link' onClick={() => handleScrollToSection('contact')}>
              Contact Us
            </Nav.Link> */}
              </Nav>
              <div className="social-icon">
                <a href="#"><img src={navIcon2} alt="" /></a>
                <a href="#"><img src={navIcon3} alt="" /></a>
              </div>
              {isLoggedIn ? (
                <NavDropdown title={<AccountCircleIcon className="user-avatar" />} id="user-dropdown">
                  <NavDropdown.Item>{userProfile?.name || 'Name'}</NavDropdown.Item>
                  <NavDropdown.Item>{userProfile?.email || 'Email'}</NavDropdown.Item>
                  {isAdmin && <NavDropdown.Item>Admin</NavDropdown.Item>}
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handlelogOut}>Logout</NavDropdown.Item>
                </NavDropdown>
              ) : (
                <Nav.Link as={Link}>
                  <button className="vvd" onClick={handlelogin}><span>LogIn</span></button>
                </Nav.Link>
              )}
            </Offcanvas.Body>
          </Offcanvas>
        )}
      </Container>
    </Navbar>

    </>
  );
};
