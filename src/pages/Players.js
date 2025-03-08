import React, { useState, useEffect, useMemo, useRef,useCallback} from "react";
import './Players.css'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useQuery } from '@tanstack/react-query';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useDispatch, useSelector } from 'react-redux';

const baseURL = process.env.REACT_APP_BASE_URL;

const fetchPlayerslist = async () => {
    const response = await fetch(baseURL+'/get_data?collectionName=players');
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    return response.json();
  };


export const AllPlayers = () => {
  const [Allplayers, setAllPlayerslist] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [soldPlayers, setSoldPlayers] = useState([]);
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.login.isLoggedIn);
  const userProfile = useSelector((state) => state.login.userProfile);

  const gridRef = useRef();

  //const playoffteams = ['Afghanistan','Australia','Bangladesh','England','India','South-africa','United-states-of-america','West-indies']

  const { isLoading, error, data } = useQuery({queryKey:['players'], queryFn:fetchPlayerslist});

  useEffect(() => {
    if (data) {
      setAllPlayerslist(data);
    }
  }, [data]); 

  const onBtnExport = useCallback(() => {
    gridRef.current.api.exportDataAsCsv();
  }, [gridRef]);

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',marginTop:'250px' }}>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;



  //setAllPlayerslist(data)

  console.log(isLoggedIn)
  console.log(userProfile)

  const defaultColDef = {
    sortable: true,
    resizable: true,
    //filter: true,
  };

  const columnDefs = [
    { field: "player_name", headerName: "Name", width: 250, filter: true},
    { field: "ipl_team_name", headerName: "IPL Team", width: 200, filter: true },
    //{ field: "status", headerName: "Status", width: 150,filter: true },
    { field: "player_role", headerName: "Role", width: 200, filter: true },
   //{ field: "country", headerName: "Country", width: 220,filter: true,sort:'asc'},
   { field: "tier", headerName: "Tier", width: 80, filter: true },
   { field: "isOverseas", headerName: "Overseas", width: 80, filter: true },
    //{ field: "ownerTeam", headerName: "Owner", width: 95 },
    //{ field: "boughtFor", headerName: "BoughtFor", width: 95 },
    { field: "ipl_salary", headerName: "Salary", width: 100 },
    { field: "afc_base_salary", headerName: "EFL Base Salary", width: 150 },
   { field: "rank", headerName: "Rank",sort:'asc', width: 100 },
  ];

  
  // const getRowStyle = (params) => {
  //   const country = params.data.country;
  //   switch (country) {
  //     case 'Afghanistan':
  //       return { backgroundColor: "lightsteelblue" };
  //     case 'Australia':
  //       return { backgroundColor: "gold" };
  //     case 'Bangladesh':
  //       return { backgroundColor: "forestgreen" };
  //     case 'Canada':
  //       return { backgroundColor: "firebrick" };
  //     case 'England':
  //       return { backgroundColor: "deepskyblue" };
  //     case 'India':
  //       return { backgroundColor: "dodgerblue" };
  //     case 'Ireland':
  //       return { backgroundColor: "limegreen" };
  //     case 'Namibia':
  //       return { backgroundColor: "cornflowerblue" };
  //     case 'Nepal':
  //       return { backgroundColor: "lightblue" };
  //     case 'Netherlands':
  //       return { backgroundColor: "orange" };
  //     case 'New-zealand':
  //       return { backgroundColor: "lightgrey" };
  //     case 'Oman':
  //       return { backgroundColor: "tomato" };
  //     case 'Pakistan':
  //       return { backgroundColor: "green" };
  //     case 'Papua-new-guinea':
  //       return { backgroundColor: "lightpink" };
  //     case 'Scotland':
  //       return { backgroundColor: "skyblue" };
  //     case 'South-africa':
  //       return { backgroundColor: "lightgreen" };
  //     case 'Sri-lanka':
  //       return { backgroundColor: "royalblue" };
  //     case 'Uganda':
  //       return { backgroundColor: "yellow" };
  //     case 'United-states-of-america':
  //       return { backgroundColor: "steelblue" };
  //     case 'West-indies':
  //       return { backgroundColor: "indianred" };
  //     default:
  //       return null;
  //   }
  // };

    /*
    const handleFilter = (e) => {
    const value = e.target.value;
    const filtered = soldPlayers.filter((player) =>
    player.name.toLowerCase().includes(value.toLowerCase()) ||
    player.iplTeam.toLowerCase().includes(value.toLowerCase()) ||
    player.role.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredPlayers(filtered);
    };
    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',flexDirection:'column' }}
    */
  
  
    return (
      <>
      {isLoggedIn ?
      (<div className ="ag-page">
        <div className="ag-container">
        <div style={{backgroundColor:'red',marginTop:'10px'}}>
          <button onClick={onBtnExport}>Download CSV export file</button>
        </div>
            <div className="ag-theme-alpine" style={{height: '71vh',width:"95%"}}>
              <AgGridReact
                ref={gridRef}
                rowData={Allplayers}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
               // getRowStyle={getRowStyle}
                suppressExcelExport={true}
              />
            </div>
            </div>
      </div>):(
        <div className ="ag-page">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',marginTop:'250px' }}>
          <h1>Please Login to view Players</h1>
        </div>
        </div>
      )}
      </>
    );
    }
