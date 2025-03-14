// // import React from "react";
// // import { CircularProgress } from "@mui/material";
// // import styled from "styled-components";

// // const StyledLoadingOverlay = styled.div`
// //   background: white;
// //   height: 5rem;
// //   width: 15rem;
// //   display: flex;
// //   justify-content: center;
// //   align-items: center;
// //   border-radius: 5px;
// //   box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
// //   gap: 2rem;
// //   padding: 8px;
// //   border: 1px solid black;
// //   font-weight: 600;

// //   .loading-text {
// //     color: #000300;
// //   }
// // `;

// // const CustomLoadingOverlay = () => (
// //   <StyledLoadingOverlay>
// //     <CircularProgress />
// //     <span className="loading-text">Loading...</span>
// //   </StyledLoadingOverlay>
// // );

// // export default CustomLoadingOverlay;

// import React from "react";
// import { CircularProgress } from "@mui/material";

// class CustomLoadingOverlay extends React.Component {
//   render() {
//     return (
//       `<div 
//         style={{
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           width: '100%',
//           height: '100%',
//           backgroundColor: 'rgba(255, 255, 255, 0.7)',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           zIndex: 10
//         }}
//       >
//         <div
//           style={{
//             background: 'white',
//             padding: '20px 40px',
//             borderRadius: '8px',
//             display: 'flex',
//             flexDirection: 'row',
//             alignItems: 'center',
//             justifyContent: 'center',
//             gap: '20px',
//             boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
//           }}
//         >
//           <CircularProgress size={40} />
//           <div style={{ fontWeight: 600, fontSize: '16px' }}>Loading data...</div>
//         </div>
//       </div>`
//     );
//   }
// }

// export default CustomLoadingOverlay;

import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import './CustomLoadingOverlay.css';

const CustomLoadingOverlay = () => {
  return (
    <div className="custom-loading-overlay">
      <CircularProgress />
      <span className="loading-text">Loading...</span>
    </div>
  );
};

export default CustomLoadingOverlay;