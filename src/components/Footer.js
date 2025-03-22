import React from 'react';
import { Container, Row, Col } from "react-bootstrap";
import logo from "../assets/logos/logo-no-background.svg";
import navIcon2 from '../assets/images/nav-icon2.svg';
import navIcon3 from '../assets/images/nav-icon3.svg';
import InstagramIcon from '@mui/icons-material/Instagram';
import EmailIcon from '@mui/icons-material/Email';
import './Footer.css'

export const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row className="align-items-center h-footer">
          <Col xs={12} md="auto" className="footer-item">
            <img src={logo} alt="Logo" className="footer-logo" />
          </Col>
          <Col xs={12} md="auto" className="footer-item">
            <p className="footer-copyright">Copyright 2024. All Rights Reserved</p>
          </Col>
          <Col xs={12} md="auto" className="footer-item">
            <div className="social-icon">
              <a href="/" target="_blank" rel="noreferrer"><img src={navIcon2} alt="Facebook" /></a>
              <a href="/" target="_blank" rel="noreferrer"><img src={navIcon3} alt="Instagram" /></a>
            </div>
            <p className="footer-contact"><EmailIcon/>contact@auctionfantasycricket.com</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

//img src={navIcon3} alt="Instagram" 