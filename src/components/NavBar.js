import { useState, useEffect } from "react";
import { Navbar, Nav, Container, NavDropdown, Offcanvas, Button, Spinner } from "react-bootstrap";
import logo from '../assets/logos/logo-no-background.svg';
import navIcon1 from '../assets/images/nav-icon1.svg';
import navIcon2 from '../assets/images/nav-icon2.svg';
import navIcon3 from '../assets/images/nav-icon3.svg';
import './NavBar.css';
import { Link, BrowserRouter as Router, useNavigate, useLocation  } from "react-router-dom";
import { FaTimes } from 'react-icons/fa';
import {useGoogleLogin, googleLogout} from '@react-oauth/google';
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';
import { setLoginSuccess, setLogoutSuccess } from './redux/reducer/authReducer';
import { setselectedLeagueId, setisLeagueadmin, setCurrentLeague, setmemberof, clearLeagueState } from '../components/redux/reducer/leagueReducer';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { jwtDecode } from 'jwt-decode';

const baseURL = process.env.REACT_APP_BASE_URL;

export const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showTeamHub, setshowTeamHub] = useState(false)

  const location = useLocation();
  const currentPath = location.pathname;

  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.login.isLoggedIn);
  const userProfile = useSelector((state) => state.login.userProfile);
  const isAdmin = useSelector((state) => state.login.isAdmin);
  const leagueinfo = useSelector((state) => state.league.currentLeague);
  const league_type = leagueinfo?.league_type
  const selectedLeagueId = useSelector((state) => state.league.selectedLeagueId);

  const leagueadminEmails = leagueinfo?.admins;
  const isleagueAdmin = leagueadminEmails && leagueadminEmails.includes(userProfile?.email);


  // Use a let variable to store the final leagueId
  let leagueId = selectedLeagueId;
  if (leagueId === null){
    leagueId = localStorage.getItem('leagueId');
  }

  const navigate = useNavigate();

  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   const leagueId = localStorage.getItem('leagueId');
  //   const leaguedetailsstring = localStorage.getItem('currentLeague');

  //   if (token) {
  //     const user = JSON.parse(atob(token.split('.')[1]));
  //     dispatch(setLoginSuccess(user));
  //   } else {
  //     if(isLoggedIn){
  //       handlelogOut();
  //     }
  //   }

  //   if (leagueId){
  //     dispatch(setselectedLeagueId(leagueId));
  //   }

  //   if (leaguedetailsstring){
  //     const leaguedetails = JSON.parse(leaguedetailsstring)
  //     dispatch(setCurrentLeague(leaguedetails))
  //   }
  // }, [dispatch]);

  useEffect(()=>{
    if (leagueId === '67d4dd408786c3e1b4ee172a' || leagueId === '67da30b26a17f44a19c2241a'){
      setshowTeamHub(true)
    }else{
      setshowTeamHub(false)
    }
  },[leagueId])

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
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleClose = () => setIsMenuOpen(false);

  // Login Functionality
  const login = useGoogleLogin({
    onSuccess: async response => {
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

        //dispatch(setLoginSuccess(res.data));
        dispatch(setLoginSuccess(jwtDecode(backendtoken.data.token)))
        navigate('/league');
      } catch (err) {
        console.log(err);
      } finally {
        // Set loading state to false when login process completes
        setIsLoggingIn(false);
      }
    },
    onError: () => {
      // Also handle login errors by setting loading to false
      setIsLoggingIn(false);
    }
  });

  const handlelogin = () => {
    // Set loading state to true when login process starts
    setIsLoggingIn(true);
    
    const token = localStorage.getItem('token');
    const storedLeagueId = localStorage.getItem('leagueId');
    
    if (storedLeagueId) {
      dispatch(setselectedLeagueId(storedLeagueId));
    }
    
    if (token) {
      const user = JSON.parse(atob(token.split('.')[1]));
      dispatch(setLoginSuccess(user));
      navigate('/league');
      // If token exists, login is immediate, so reset loading state
      setIsLoggingIn(false);
    } else {
      // Google login will be initiated, loading state will be reset in callbacks
      login();
    }
  };

  const handlelogOut = () => {
    localStorage.removeItem('leagueId');
    localStorage.removeItem('currentLeague');
    dispatch(setLogoutSuccess());
    dispatch(clearLeagueState());
    googleLogout();
    navigate('/');
  };


  const isLinkActive = (path) => {
    // For the home route, only match exact path
    if (path === '/' && currentPath === '/') {
      return true;
    }
    // For other routes, check if current path starts with the path
    return path !== '/' && currentPath.startsWith(path);
  };

  // Login button with loading state
  const LoginButton = () => (
    <button 
      className="vvd" 
      onClick={handlelogin} 
      disabled={isLoggingIn}
    >
      {isLoggingIn ? (
        <>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
            className="me-2"
          />
          <span>Logging in...</span>
        </>
      ) : (
        <span>LogIn</span>
      )}
    </button>
  );

  return (
    <>
      <Navbar expand="md" className={scrolled ? "scrolled" : ""}>
        <Container>
          <Navbar.Brand>
            <Link to='/' className='navbar-brand' onClick={() => handleScrollToSection('home')}>
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
              <Nav.Link as={Link} to="/" className={`navbar-link ${isLinkActive('/') ? 'active' : ''}`} onClick={() => handleScrollToSection('home')}>
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/players" className={`navbar-link ${isLinkActive('/players') ? 'active' : ''}`}>
                Players List
              </Nav.Link>
              {(isleagueAdmin && isLoggedIn && (league_type==='auction')) && <Nav.Link as={Link} to="/auction" className={`navbar-link ${isLinkActive('/auction') ? 'active' : ''}`}>
                Auction
              </Nav.Link>}
              {(isLoggedIn && (league_type==='draft')) && <Nav.Link as={Link} to="/draft" className={`navbar-link ${isLinkActive('/draft') ? 'active' : ''}`}>
                Draft
              </Nav.Link>}
              {isLoggedIn && <Nav.Link as={Link} to="/teams" className={`navbar-link ${isLinkActive('/teams') ? 'active' : ''}`} onClick={() => null}>
                Teams
              </Nav.Link>}
              {isLoggedIn && <Nav.Link as={Link} to="/teampoints" className={`navbar-link ${isLinkActive('/teampoints') ? 'active' : ''}`} onClick={() => null}>
                Points Table
              </Nav.Link>}
              {isLoggedIn && <Nav.Link as={Link} to="/linegraph" className={`navbar-link ${isLinkActive('/linegraph') ? 'active' : ''}`} onClick={() => null}>
                Trends
              </Nav.Link>}
              {(isLoggedIn && showTeamHub) && <Nav.Link as={Link} to="/teamhub" className={`navbar-link ${isLinkActive('/teamhub') ? 'active' : ''}`} onClick={() => null}>
                Team Hub
              </Nav.Link>}
            </Nav>
            <span className="navbar-text">
              <div className="social-icon">
                <a href="#"><img src={navIcon2} alt="" /></a>
                <a href="#"><img src={navIcon3} alt="" /></a>
              </div>
              {isLoggedIn ? (
                <NavDropdown title={<AccountCircleIcon className="user-avatar" />} id="user-dropdown">
                  <NavDropdown.Item>{userProfile?.name || 'Name'}</NavDropdown.Item>
                  <NavDropdown.Item>{userProfile?.email || 'Email'}</NavDropdown.Item>
                  {isAdmin && <NavDropdown.Item>Admin</NavDropdown.Item>}
                  <NavDropdown.Item href="#/league" style={{background:'grey'}}>Select League</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handlelogOut}>Logout</NavDropdown.Item>
                </NavDropdown>
              ) : (
                <Nav.Link as={Link}>
                  <LoginButton />
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
                  <Nav.Link as={Link} to="/" className={`navbar-link ${isLinkActive('/') ? 'active' : ''}`} onClick={() => handleScrollToSection('home')}>
                    Home
                  </Nav.Link>
                  <Nav.Link as={Link} to="/players" className={`navbar-link ${isLinkActive('/players') ? 'active' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    Players List
                  </Nav.Link>
                  {(isleagueAdmin && isLoggedIn) && <Nav.Link as={Link} to="/auction" className={`navbar-link ${isLinkActive('/auction') ? 'active' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    Auction
                  </Nav.Link>}
                  {(isLoggedIn && (league_type==='draft')) && <Nav.Link as={Link} to="/draft" className={`navbar-link ${isLinkActive('/draft') ? 'active' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    Draft
                  </Nav.Link>}
                  {isLoggedIn && <Nav.Link as={Link} to="/teams" className={`navbar-link ${isLinkActive('/teams') ? 'active' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    Teams
                  </Nav.Link>}
                  {isLoggedIn && <Nav.Link as={Link} to="/teampoints" className={`navbar-link ${isLinkActive('/teampoints') ? 'active' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    Points Table
                  </Nav.Link>}
                  {isLoggedIn && <Nav.Link as={Link} to="/linegraph" className={`navbar-link ${isLinkActive('/linegraph') ? 'active' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    Trends
                  </Nav.Link>}
                  {(isLoggedIn && showTeamHub) && <Nav.Link as={Link} to="/teamhub" className={`navbar-link ${isLinkActive('/teamhub') ? 'active' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    Team Hub
                  </Nav.Link>}
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
                    <NavDropdown.Item href="#/league" onClick={() => setIsMenuOpen(!isMenuOpen)} style={{background:'grey'}}>Select League</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={() => {setIsMenuOpen(!isMenuOpen);handlelogOut()}}>Logout</NavDropdown.Item>
                  </NavDropdown>
                ) : (
                  <Nav.Link as={Link}>
                    <LoginButton />
                  </Nav.Link>
                )}
              </Offcanvas.Body>
            </Offcanvas>
          )}
        </Container>
      </Navbar>

      {/* Fullscreen overlay when logging in */}
      {isLoggingIn && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px 40px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <Spinner animation="border" role="status" variant="primary" />
            <span style={{ fontWeight: 'bold', color: 'green' }}>Authenticating...</span>
          </div>
        </div>
      )}
    </>
  );
};