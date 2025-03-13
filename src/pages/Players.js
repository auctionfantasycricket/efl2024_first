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
import RoleCellRenderer from '../components/RoleCellRenderer';
import TeamCellRenderer from '../components/TeamCellRenderer';
import DownloadIcon from '@mui/icons-material/Download';
import CustomLoadingOverlay from "../components/CustomLoadingOverlay";


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

  const [gridApi, setGridApi] = useState(null);

  const onGridReady = useCallback((params) => {
    setGridApi(params.api);
  }, []);

  const { isLoading, error, data } = useQuery({queryKey:['players'], queryFn:fetchPlayerslist});

  useEffect(() => {
    if (data) {
      setAllPlayerslist(data);
    }
  }, [data]); 

  const onBtnExport = useCallback(() => {
    gridRef.current.api.exportDataAsCsv();
  }, [gridRef]);

  // if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',marginTop:'250px' }}>Loading...</div>;
  // if (error) return <div>Error: {error.message}</div>;



  //setAllPlayerslist(data)

  const defaultColDef = {
    sortable: true,
    resizable: true,
    filter: true
  };

  const columnDefs = [
    { field: "player_name", headerName: "Name", width: 250},
    { field: "ipl_team_name", headerName: "IPL Team", width: 250, cellRenderer: 'teamCellRenderer' },
    //{ field: "status", headerName: "Status", width: 150,filter: true },
    { field: "player_role", headerName: "Role", width: 200,  cellRenderer: 'roleCellRenderer' },
   //{ field: "country", headerName: "Country", width: 220,filter: true,sort:'asc'},
   { field: "tier", headerName: "Tier", width: 80},
   { field: "isOverseas", headerName: "Overseas", width: 100 },
    //{ field: "ownerTeam", headerName: "Owner", width: 95 },
    //{ field: "boughtFor", headerName: "BoughtFor", width: 95 },
    { field: "ipl_salary", headerName: "Salary", width: 100 },
    { field: "afc_base_salary", headerName: "EFL Base Salary", width: 180 },
   { field: "rank", headerName: "Rank",sort:'asc', width: 140 },
  ];

  const gridOptions = {
    overlayLoadingTemplate: CustomLoadingOverlay,
    overlayNoRowsTemplate: '<span class="ag-overlay-no-rows-center">No data available</span>'
  };

  
  useEffect(() => {
    if (gridApi) {
      if (isLoading) {
        gridApi.showLoadingOverlay();
      } else if (error) {
        gridApi.showNoRowsOverlay();
      } else if (Allplayers && Allplayers.length === 0) {
        gridApi.showNoRowsOverlay();
      } else {
        gridApi.hideOverlay();
      }
    }
  }, [gridApi, isLoading, error, Allplayers]);

  const components = {
    roleCellRenderer: RoleCellRenderer,
    teamCellRenderer: TeamCellRenderer,
    //loadingOverlay: CustomLoadingOverlay
    overlayLoadingTemplate: CustomLoadingOverlay
  };

  
    return (
      <>
      {isLoggedIn ?
      (
        <div className="player-page">
          <div className="player-container">
            <div className="header-container">
              <button className="download-button" onClick={onBtnExport}>
                Download <DownloadIcon />
              </button>
            </div>
            <div className="ag-theme-alpine player-main-container">
              <AgGridReact
                ref={gridRef}
                loading={isLoading}
                rowData={Allplayers}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                //pagination={true}
                //paginationPageSize={50}
                components={components}
                suppressExcelExport={true}
                animateRows={true}
                onGridReady={onGridReady}
                //overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No data available</span>'
              />
            </div>
          </div>
        </div>

      ):(
        <div className ="player-page">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',marginTop:'250px' }}>
          <h1>Please Login to view Players</h1>
        </div>
        </div>
      )}
      </>
    );
    }
