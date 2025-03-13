// import React from 'react'
// import DataTable from 'react-data-table-component';
// import settings from '../settings.json'

// export default function OwnerStats(props) {
//   const customStyles = {
//     rows: {
//       style: {
//         maxHeight: '10px',
//         fontSize: '6px',
//         border: '1px solid black',
//         maxWidth :'620px'
//       },
//     },
//     headCells: {
//       style: {
//         border: '1px solid black',
//         color: 'blue',
//         fontSize:'8px'
//       },
//     },
//     cells: {
//       style: {
//         border: '1px solid black',
//         fontSize: '10px'
//       },
//     },
//   };

//   function makeAbv(string) {
//     const words = string.split(' ');
//     return words.map(word => word[0].toUpperCase());
//   }

//   const columns = [
//     {
//       name: 'Owner',
//       selector: row => row.teamName,
//       width:'60px',
//       cell: row => <div style={{fontWeight: 'bold'}}>{makeAbv(row.teamName)}</div>,
//     },
//     {
//       name: 'Bat(4)',
//       selector: row=> row.batCount,
//       width:'60px',
//       cell: row => <div style={{ backgroundColor: row.batCount >= 4 ? 'lightgreen' : 'white',textAlign:'center', padding: '4px',width: '50%',
//       height: '50%' }}>{row.batCount}</div>,
//     },
//     {
//       name: 'Bowl(4)',
//       selector: row=> row.ballCount,
//       width:'60px',
//       cell: row => <div style={{ backgroundColor: row.ballCount >= 4 ? 'lightgreen' : 'white',textAlign:'center', padding: '4px',width: '50%',
//       height: '50%' }}>{row.ballCount}</div>,
//     },
//     // {
//     //   name: 'WK(1)',
//     //   selector: row=> row.wkCount,
//     //   width:'60px',
//     //   cell: row => <div style={{ backgroundColor: row.wkCount >= 1 ? 'lightgreen' : 'white',textAlign:'center', padding: '4px',width: '50%',
//     //   height: '50%' }}>{row.wkCount}</div>,
//     // },
//     {
//       name: 'AR(2)',
//       selector: row=> row.arCount,
//       width:'60px',
//       cell: row => <div style={{ backgroundColor: row.arCount >= 2 ? 'lightgreen' : 'white',textAlign:'center', padding: '4px',width: '50%',
//       height: '50%' }}>{row.arCount}</div>,
//     },
//     {
//       name: 'I(4-6)',
//       selector: row=> row.fCount,
//       width:'60px',
//       cell: row => <div style={{ backgroundColor: row.fCount >= 4 ? 'lightgreen' : 'white',textAlign:'center', padding: '4px',width: '50%',
//       height: '50%' }}>{row.fCount}</div>,
//     },
//     {
//       name: 'Sq('+settings.squadSize+')',
//       selector: row=> row.totalCount,
//       width:'80px',
//       cell: row => <div style={{ backgroundColor: row.totalCount >= settings.squadSize ? 'lightgreen' : 'white',textAlign:'center', padding: '4px',width: '50%',
//       height: '80%' }}>{row.totalCount}</div>,
//     },
//     {
//       name: 'Purse',
//       selector: row => row.currentPurse,
//       width: '100px',
//       cell: row => <div style={{ backgroundColor: 'white',textAlign:'center', padding: '2px',width: '100%',
//       height: '50%' }}>{row.currentPurse}</div>,

//     }
//   ];

//   return (
//     <div>
//       <DataTable
//         title="Owners Stats"
//         columns={columns}
//         data={props.data}
//         customStyles={customStyles}
//         noHeader={true}
//         dense={true}
//       />
//     </div>
//   );
// }


import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';

export default function OwnerStats({ data }) {
  const headers = ['Owner', 'Bat(4)', 'Bowl(4)', 'AR(2)', 'I(4-6)', `Sq(${4})`, 'Purse'];

  const makeAbv = (string) => string.split(' ').map(word => word[0].toUpperCase()).join('');

  const getCellStyle = (value, threshold) => ({
    backgroundColor: value >= threshold ? '#e0f7fa' : 'transparent',
    fontWeight: 'bold',
    textAlign: 'center',
  });

  return (
    <Box sx={{ maxWidth: 900, margin: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Owners Stats
      </Typography>
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
                <TableCell sx={getCellStyle(row.fCount, 4)}>{row.fCount}</TableCell>
                <TableCell sx={getCellStyle(row.totalCount, 4)}>{row.totalCount}</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>${row.currentPurse}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
