import React, { useState, useEffect,useMemo} from "react";
import './Teams.css'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Modal} from 'antd';



export default function Teams() {
  const [Playerslist, setPlayerslist] = useState([]);
  const [Teamsstats, setTeamsstats] = useState([])

  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);

  const baseURL = process.env.REACT_APP_BASE_URL;


  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState('right');
  const [showplayers, setShowPlayers] = useState([])
  const [teamname,setSelectedteamname] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false);

  

  useEffect(() => {
    async function getallsoldteamplayers(){
      try {
        const response = await fetch(baseURL+'/get_data?collectionName=efl_playersCentral_test');
        if(response.ok){
          const playerdata = await response.json();
          console.log(playerdata)
          setPlayerslist(playerdata.filter((item) => item.status === 'sold'));
          console.log(Playerslist)
        } else {
          console.log('Error: ' + response.status + response.body);
        }
      } catch (error) {
        console.error(error);
      }
    }
    getallsoldteamplayers();
  }, [])


  useEffect(() => {
    async function getallteamspurse(){
      try {
        const response = await fetch(baseURL+'/get_data?collectionName=efl_ownerTeams_test');
        if(response.ok){
          const stats = await response.json();
          console.log(stats)
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
    acc[player.ownerTeam].push({ name: player.player_name, iplTeam: player.ipl_team_name, role: player.player_role, country: player.country, boughtfor: player.boughtFor, tier: player.tier });
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
    { headerName: 'Name', field: 'name' },
    { headerName: 'IPLTeam', field: 'iplTeam' ,width:100},
    { headerName: 'Country', field: 'country',width:100},
    { headerName: 'Tier', field: 'tier',width:100,sort: "asc"},
    { headerName: 'BoughtFor', field: 'boughtfor',width:100},
    { headerName: 'Role', field: 'role',width:100},
  ];

  return(
    <div className="teampage">
    <div className="teampagecontainer">
      <div className="ag-theme-alpine-dark" style={ {height:"77vh",width:"82vw"} }>
    <AgGridReact
    rowData={data}
    columnDefs={columnDefs}
    defaultColDef={defaultColDef}
    gridOptions={gridOptions}
    />
     </div>
     <div>
      <Modal title={teamname + " players"} style={{ top: 160, width: 700 }} open={isModalOpen} onOk={handleOk} onCancel={handleOk} bodyStyle={{ background: '#1f1f1f', color: '#fff' }} cancelButtonProps={{ style: { display: 'none' } }}>
      {
          <div className="ag-theme-alpine" style={ {height:"60vh"} }>
          <AgGridReact
          rowData={showplayers}
          columnDefs={playerColumns}
          defaultColDef={defaultColDef}/>
          </div>
        }
      </Modal>
     </div>
      </div>
      </div>
  )
  
}
