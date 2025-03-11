import React from 'react'
import DataTable from 'react-data-table-component';
import settings from '../settings.json'

export default function OwnerStats(props) {
  const customStyles = {
    rows: {
      style: {
        maxHeight: '10px',
        fontSize: '6px',
        border: '1px solid black',
        maxWidth :'620px'
      },
    },
    headCells: {
      style: {
        border: '1px solid black',
        color: 'blue',
        fontSize:'8px'
      },
    },
    cells: {
      style: {
        border: '1px solid black',
        fontSize: '10px'
      },
    },
  };

  function makeAbv(string) {
    const words = string.split(' ');
    return words.map(word => word[0].toUpperCase());
  }

  const columns = [
    {
      name: 'Owner',
      selector: row => row.teamName,
      width:'60px',
      cell: row => <div style={{fontWeight: 'bold'}}>{makeAbv(row.teamName)}</div>,
    },
    {
      name: 'Bat(4)',
      selector: row=> row.batCount,
      width:'60px',
      cell: row => <div style={{ backgroundColor: row.batCount >= 4 ? 'lightgreen' : 'white',textAlign:'center', padding: '4px',width: '50%',
      height: '50%' }}>{row.batCount}</div>,
    },
    {
      name: 'Bowl(4)',
      selector: row=> row.ballCount,
      width:'60px',
      cell: row => <div style={{ backgroundColor: row.ballCount >= 4 ? 'lightgreen' : 'white',textAlign:'center', padding: '4px',width: '50%',
      height: '50%' }}>{row.ballCount}</div>,
    },
    // {
    //   name: 'WK(1)',
    //   selector: row=> row.wkCount,
    //   width:'60px',
    //   cell: row => <div style={{ backgroundColor: row.wkCount >= 1 ? 'lightgreen' : 'white',textAlign:'center', padding: '4px',width: '50%',
    //   height: '50%' }}>{row.wkCount}</div>,
    // },
    {
      name: 'AR(2)',
      selector: row=> row.arCount,
      width:'60px',
      cell: row => <div style={{ backgroundColor: row.arCount >= 2 ? 'lightgreen' : 'white',textAlign:'center', padding: '4px',width: '50%',
      height: '50%' }}>{row.arCount}</div>,
    },
    {
      name: 'I(4-6)',
      selector: row=> row.fCount,
      width:'60px',
      cell: row => <div style={{ backgroundColor: row.fCount >= 4 ? 'lightgreen' : 'white',textAlign:'center', padding: '4px',width: '50%',
      height: '50%' }}>{row.fCount}</div>,
    },
    {
      name: 'Sq('+settings.squadSize+')',
      selector: row=> row.totalCount,
      width:'80px',
      cell: row => <div style={{ backgroundColor: row.totalCount >= settings.squadSize ? 'lightgreen' : 'white',textAlign:'center', padding: '4px',width: '50%',
      height: '80%' }}>{row.totalCount}</div>,
    },
    {
      name: 'Purse',
      selector: row => row.currentPurse,
      width: '100px',
      cell: row => <div style={{ backgroundColor: 'white',textAlign:'center', padding: '2px',width: '100%',
      height: '50%' }}>{row.currentPurse}</div>,

    }
  ];

  return (
    <div>
      <DataTable
        title="Owners Stats"
        columns={columns}
        data={props.data}
        customStyles={customStyles}
        noHeader={true}
        dense={true}
      />
    </div>
  );
}
