import React, { useState, useEffect,useMemo, useRef,useCallback} from "react";
import './Teams.css'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Modal} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { setLoginSuccess } from '../components/redux/reducer/authReducer';
import { setselectedLeagueId, setisLeagueadmin, setCurrentLeague, setmemberof } from '../components/redux/reducer/leagueReducer';
import TeamCellRenderer from '../components/TeamCellRenderer';
import CustomLoadingOverlay from "../components/CustomLoadingOverlay";


export default function Teams() {
  const [Playerslist, setPlayerslist] = useState([]);
  const [Teamsstats, setTeamsstats] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [iserror, setIserror] = useState(false)

  //const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);

  const baseURL = process.env.REACT_APP_BASE_URL;


  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState('right');
  const [showplayers, setShowPlayers] = useState([])
  const [teamname,setSelectedteamname] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false);

   const dispatch = useDispatch();

  const selectedLeagueId = useSelector((state) => state.league.selectedLeagueId);

  const gridRef = useRef();

  const [gridApi, setGridApi] = useState(null);

  const onGridReady = useCallback((params) => {
    setGridApi(params.api);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const leagueId = localStorage.getItem('leagueId');
    if (token) {
      const user = JSON.parse(atob(token.split('.')[1]));
      dispatch(setLoginSuccess(user));
    }

    if (leagueId){
      dispatch(setselectedLeagueId(leagueId));
    }
  }, [dispatch]);

  useEffect(() => {
    async function getallsoldteamplayers(){
      setIsLoading(true)
      try {
        const response = await fetch(baseURL+'/get_data?collectionName=leagueplayers&leagueId='+selectedLeagueId);
        if(response.ok){
          const playerdata = await response.json();
          //console.log(playerdata)
          setPlayerslist(playerdata.filter((item) => item.status === 'sold'));
          setIsLoading(false)
          //console.log(Playerslist)
        } else {
          console.log('Error: ' + response.status + response.body);
          setIserror(true)
          setIsLoading(false)
        }
      } catch (error) {
        console.error(error);
        setIserror(true)
        setIsLoading(false)
      }
    }
    getallsoldteamplayers();
  }, [])


  useEffect(() => {
    async function getallteamspurse(){
      try {
        const response = await fetch(baseURL+'/get_data?collectionName=teams&leagueId='+selectedLeagueId);
        if(response.ok){
          const stats = await response.json();
          //console.log(stats)
          setTeamsstats(stats);
        } else {
          console.log('Error: ' + response.status + response.body);
        }
      } catch (error) {
        console.error(error);
      }
    }
    getallteamspurse();
  }, [])

  const teamsData = Playerslist.reduce((acc, player) => {
    if (!acc[player.ownerTeam]) {
      acc[player.ownerTeam] = [];
    }
    acc[player.ownerTeam].push({ name: player.player_name, iplTeam: player.ipl_team_name, role: player.player_role, isOverseas: player.isOverseas, boughtfor: player.boughtFor, tier: player.tier });
    return acc;
  }, {});

  const teampurse = Teamsstats.reduce((tcc, teams) => {
    if (!tcc[teams.teamName]) {
      tcc[teams.teamName] = teams.currentPurse;
    }
    return tcc;
  }, {});

  const data = [];
  
  for (const [teamName, players] of Object.entries(teamsData)) {
    const team = {
      teamName: teamName,
      players: players,
      sqaudsize:players.length,
      purse:teampurse[teamName]
    };
    data.push(team);
  }

  const defaultColDef = {
    sortable: true,
    resizable: true,
    //filter: true,
  };

  const columnDefs = [
    { field: "teamName", headerName: "Team", width: 200, filter: true,sort: "asc"},
    { field: "sqaudsize", headerName: "Squad Size", width: 120, filter: true },
    { field: "purse", headerName: "Remaining Purse", width: 180,filter: true },
  ];

  const gridOptions = {
    rowSelection: 'single', // enable single-row selection mode
    onRowSelected: (event) => {
      if (event.node.isSelected()) {
        // handle row selection
        const selectedRow = event.node.data;
        setSelectedteamname(selectedRow.teamName)
        setShowPlayers(selectedRow.players)
        setIsModalOpen(true);
      } 
    }
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const playerColumns = [
    { headerName: 'Name', field: 'name', width:150 },
    { headerName: 'IPLTeam', field: 'iplTeam' ,width:130, cellRenderer: 'teamCellRenderer'},
    { headerName: 'BoughtFor', field: 'boughtfor',width:100},
    { headerName: 'Role', field: 'role',width:100},
    { headerName: 'isOverseas', field: 'isOverseas',width:100},
    { headerName: 'Tier', field: 'tier',width:100,sort: "asc"},
  ];

  
  useEffect(() => {
    if (gridApi) {
      if (isLoading) {
        gridApi.showLoadingOverlay();
      } else if (iserror) {
        gridApi.showNoRowsOverlay();
      } else if (Playerslist && Playerslist.length === 0) {
        gridApi.showNoRowsOverlay();
      } else {
        gridApi.hideOverlay();
      }
    }
  }, [gridApi, isLoading, iserror, Playerslist]);

  const components = {
    loadingOverlay: CustomLoadingOverlay,
    teamCellRenderer: TeamCellRenderer,
  };

  return(
    <div className="teampage">
      <div className="teampagecontainer">
        <div className="ag-theme-alpine-dark teams-main-container" >
          <AgGridReact
          ref={gridRef}
          loading={isLoading}
          rowData={data}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          gridOptions={gridOptions}
          onGridReady={onGridReady}
          loadingOverlayComponent="loadingOverlay"
          />
        </div>
        <div>
          <Modal 
            title={teamname + " players"} 
            style={{ top: 30, width: 700, zIndex:9999 }} 
            open={isModalOpen} 
            onOk={handleOk} 
            onCancel={handleOk} 
            cancelButtonProps={{ style: { display: 'none' } }}
            className="custom-modal"
          >
          {
              <div className="ag-theme-alpine-dark teams-main-container" style={ {height:"72vh"} }>
                <AgGridReact
                rowData={showplayers}
                columnDefs={playerColumns}
                defaultColDef={defaultColDef}
                components={components}/>
              </div>
            }
          </Modal>
        </div>
      </div>
    </div>
  )
  
}
