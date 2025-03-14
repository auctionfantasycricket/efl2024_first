import React, { useState, useEffect, useMemo } from "react";
import './DraftTeams.css';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Modal } from 'antd';
import { useQuery } from '@tanstack/react-query';

const baseURL = process.env.REACT_APP_BASE_URL;

const getallplayerslist = async () => {
  const response = await fetch(baseURL+'/get_data?collectionName=eflDraft_playersCentral');
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

export default function DraftTeams() {
  const [Playerslist, setPlayerslist] = useState([]);
  const [Teamsstats, setTeamsstats] = useState([]);
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState('right');
  const [showplayers, setShowPlayers] = useState([]);
  const [teamname, setSelectedteamname] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);


  const { isLoading: isLoadingPlayers, error: errorPlayers, data: playerdata } = useQuery({ queryKey: ['players'], queryFn: getallplayerslist });

  //console.log("KLM",playerdata)

  useEffect(() => {
    if (playerdata) {
      setPlayerslist(
            playerdata.filter((item) => item.status === "sold")
          );
    }
  }, [playerdata]); 

  if (isLoadingPlayers) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',marginTop:'250px' }}>Loading...</div>;
  if (errorPlayers) return <div>Error: {errorPlayers.message}</div>;

/*
  useEffect(() => {
    async function getallteamdetails() {
      try {
        const response = await fetch(baseURL + '/get_data?collectionName=eflDraft_ownerTeams');
        if (response.ok) {
          const stats = await response.json();
          console.log(stats);
          setTeamsstats(stats);
        } else {
          console.log('Error: ' + response.status + response.body);
        }
      } catch (error) {
        console.error(error);
      }
    }
    getallteamdetails();
  }, []);

  const mapTeamNameToDraftSequence = (teamData) => {
    return teamData.reduce((acc, team) => {
      acc.push({
        teamName: team.teamName,
        draftSequence: team.draftSequence
      });
      return acc;
    }, []);
  };

  const teamMapping = mapTeamNameToDraftSequence(Teamsstats);*/


  const teamsData = Playerslist.reduce((acc, player) => {
    if (!acc[player.ownerTeam]) {
      acc[player.ownerTeam] = [];
    }
    acc[player.ownerTeam].push({ name: player.player_name, role: player.player_role, country: player.country,});
    return acc;
  }, {});

  const teamMapping = Object.keys(teamsData).map(teamName => ({
    teamName,
    players: teamsData[teamName]
  }));

  //console.log("map", teamMapping);

  const defaultColDef = {
    sortable: true,
    resizable: true,
    // filter: true,
  };

  const columnDefs = [
    { field: "teamName", headerName: "Team", width: 200, filter: true, sort: "asc" }
  ];

  const gridOptions = {
    rowSelection: 'single', // enable single-row selection mode
    onRowSelected: (event) => {
      if (event.node.isSelected()) {
        // handle row selection
        const selectedRow = event.node.data;
        setSelectedteamname(selectedRow.teamName);
        //setShowPlayers(selectedRow.draftSequence.map(name => ({ name }))); // assuming draftSequence contains player details
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
    { headerName: 'Country', field: 'country',width:100},
    { headerName: 'Role', field: 'role',width:100},
  ];

  return (
    <div className="draftteampage">
      <div className="draftteampagecontainer">
        <div className="ag-theme-alpine-dark" style={{ height: "72vh", width: "82vw" }}>
          <AgGridReact
            rowData={teamMapping}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            gridOptions={gridOptions}
          />
        </div>
        <div>
          <Modal
            title={teamname + " players"}
            style={{ top: 30, width: 700, zIndex: 9999 }}
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleOk}
            cancelButtonProps={{ style: { display: 'none' } }}
          >
            {
              <div className="ag-theme-alpine" style={{ height: "72vh" }}>
                <AgGridReact
                  rowData={showplayers}
                  columnDefs={playerColumns}
                  defaultColDef={defaultColDef} />
              </div>
            }
          </Modal>
        </div>
      </div>
    </div>
  );
}
