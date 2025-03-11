import React from "react";
import { CircularProgress } from "@mui/material";
import styled from "styled-components";

const StyledLoadingOverlay = styled.div`
  background: white;
  height: 5rem;
  width: 15rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  gap: 2rem;
  padding: 8px;
  border: 1px solid black;
  font-weight: 600;

  .loading-text {
    color: #000300;
  }
`;

const CustomLoadingOverlay = () => (
  <StyledLoadingOverlay>
    <CircularProgress />
    <span className="loading-text">Loading...</span>
  </StyledLoadingOverlay>
);

export default CustomLoadingOverlay;
