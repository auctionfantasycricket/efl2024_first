import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import cricket from "../assets/images/cricket.jpg";
import { ArrowRightCircle } from 'react-bootstrap-icons';
import 'animate.css';
import TrackVisibility from 'react-on-screen';
import './Banner.css'
import { useDispatch, useSelector } from 'react-redux';

export const Banner = () => {

  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.login.isLoggedIn);
  const userProfile = useSelector((state) => state.login.userProfile);
 
  return (
    <section className="banner" id="home">
      <Container>
        <Row className="aligh-items-center">
          <Col xs={12} md={6} xl={7}>
            <TrackVisibility>
              {({ isVisible }) =>
              <div className={isVisible ? "animate__animated animate__slideInLeft" : ""}>
                <span className="tagline">Auction Fantasy Cricket</span>
                <h1><span className="wrap">Baap of Fantasy Cricket</span></h1>
                  <p>Bid Play Win Your Fantasy Cricket Auction Destination</p>
                  {isLoggedIn ?<button>
                    <a href = '#/league'>Let’s Play <ArrowRightCircle size={25} /></a>
                  </button>
                  :
                  <button>
                    <a href = '#/SignIn'>Let’s Play <ArrowRightCircle size={25} /></a> 
                    </button>}
              </div>}
            </TrackVisibility>
          </Col>
          <Col xs={12} md={6} xl={5}>
            <TrackVisibility>
              {({ isVisible }) =>
                <div className={isVisible ? "animate__animated animate__pulse" : ""}>
                  <img src={cricket} alt="cricket"/>
                </div>}
            </TrackVisibility>
          </Col>
        </Row>
      </Container>
    </section>
  )
}