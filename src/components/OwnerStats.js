import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';
import bat from '../assets/images/Cricket_bat.svg.png';
import ball from '../assets/images/Cricketball.svg.png';
import AR from '../assets/images/AR.png';
import FlightIcon from '@mui/icons-material/Flight';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

export default function OwnerStats({ data }) {
  const headers = ['Owner', 
    <img src={bat} alt="Bat" style={{ width: '20px', height: '20px' }} />,
    <img src={ball} alt="Ball" style={{ width: '20px', height: '20px' }} />,
    <img src={AR} alt="AR" style={{ width: '20px', height: '20px' }} />,
    <FlightIcon style={{ width: '20px', height: '20px' }}/>,
    <ShoppingCartIcon style={{ width: '20px', height: '20px' }}/>,
    <CurrencyRupeeIcon style={{ width: '20px', height: '20px' }}/>];

  const makeAbv = (string) => string.split(' ').map(word => word[0].toUpperCase()).join('');

  const getCellStyle = (value, threshold) => ({
    backgroundColor: value >= threshold ? 'lightgreen' : 'transparent',
    fontWeight: 'bold',
    textAlign: 'center',
  });

  const foreigngetCellStyle = (value, minimum, threshold) => {
    if (value < minimum) {
      return {
        backgroundColor: 'transparent',
        fontWeight: 'bold',
        textAlign: 'center',
      };
    } else if (value >= minimum && value < threshold) {
      return {
        backgroundColor: 'lightgreen',
        fontWeight: 'bold',
        textAlign: 'center',
      };
    } else {
      return {
        backgroundColor: '#FF435A',
        fontWeight: 'bold',
        textAlign: 'center',
      };
    }
  };

  return (
    <Box sx={{ maxWidth: 900, margin: 'auto' }}>
      {/* <Typography variant="h5" gutterBottom>
        Owners Stats
      </Typography> */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header, index) => (
                <TableCell key={index} sx={{ fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f4f4f4' }}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell sx={{ fontWeight: 'bold' }}>{makeAbv(row.teamName)}</TableCell>
                <TableCell sx={getCellStyle(row.batCount, 4)}>{row.batCount}</TableCell>
                <TableCell sx={getCellStyle(row.ballCount, 4)}>{row.ballCount}</TableCell>
                <TableCell sx={getCellStyle(row.arCount, 2)}>{row.arCount}</TableCell>
                <TableCell sx={foreigngetCellStyle(row.fCount, 4,6)}>{row.fCount}</TableCell>
                <TableCell sx={foreigngetCellStyle(row.totalCount,0, 15)}>{row.totalCount}</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>₹{row.currentPurse}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
