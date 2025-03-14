import React, { useState, useEffect, useRef } from "react";
import "./TeamPoints.css";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Modal, Popover, Breadcrumb } from "antd";
import { useQuery } from '@tanstack/react-query';


const baseURL = process.env.REACT_APP_BASE_URL;

const getallplayerslist = async () => {
    const response = await fetch(baseURL+'/get_data?collectionName=efl_playersCentral_test');
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    return response.json();
  };


  const getallownerslist = async () => {
    const response = await fetch(baseURL+'/get_data?collectionName=efl_ownerTeams_test');
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    return response.json();
  };


  const gettimestamp = async () => {
    const response = await fetch(baseURL+'/get_data?collectionName=global_data');
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    return response.json();
  };

export default function TeamPoints() {
  const [Playersownerslist, setPlayerownersslist] = useState([]);
  const [Teamsstats, setTeamsstats] = useState([]);
  const [showplayers, setShowPlayers] = useState([]);
  const [teamname, setSelectedteamname] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [popovercontent, setPopoverContent] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({});
  const [timsestamps, setTimestamps] = useState([]);

  //const baseURL = process.env.REACT_APP_BASE_URL;

  const { isLoading: isLoadingTeams, error: errorTeams, data: stats } = useQuery({ queryKey: ['teams'], queryFn: getallownerslist });

  //console.log("NOP",stats)

  useEffect(() => {
    if (stats) {
        setTeamsstats(stats);
    }
  }, [stats]); 


  const { isLoading: isLoadingPlayers, error: errorPlayers, data: playerdata } = useQuery({ queryKey: ['players'], queryFn: getallplayerslist });

  //console.log("KLM",playerdata)

  useEffect(() => {
    if (playerdata) {
        setPlayerownersslist(
            playerdata.filter((item) => item.status === "sold")
          );
    }
  }, [playerdata]); 


  const { isLoading: isLoadingTS, error: errorTS, data: timsestamp } = useQuery({ queryKey: ['timestamp'], queryFn: gettimestamp });

  //console.log("NOP",stats)

  useEffect(() => {
    if (timsestamp) {
        setTimestamps(timsestamp);
    }
  }, [timsestamp]); 



  if (isLoadingTeams || isLoadingPlayers) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',marginTop:'250px' }}>Loading...</div>;
  if (errorPlayers||errorTeams) return <div>Error: {errorPlayers.message}</div>;


 
  if (Teamsstats.length === 0) return <div>Loading teams data...</div>;


/*
  useEffect(() => {
    async function getallsoldplayers() {
      try {
        const response = await fetch(
          baseURL + "/get_data?collectionName=efl_playersCentral_test"
        );
        if (response.ok) {
          const playerdata = await response.json();
          setPlayerownersslist(
            playerdata.filter((item) => item.status === "sold")
          );
        } else {
          console.log("Error: " + response.status + response.body);
        }
      } catch (error) {
        console.error(error);
      }
    }
    getallsoldplayers();
  }, []);

  useEffect(() => {
    async function getallteampoints() {
      try {
        const response = await fetch(
          baseURL + "/get_data?collectionName=efl_ownerTeams_test"
        );
        if (response.ok) {
          const stats = await response.json();
          setTeamsstats(stats);
        } else {
          console.log("Error: " + response.status + response.body);
        }
      } catch (error) {
        console.error(error);
      }
    }
    getallteampoints();
  }, []);*/


  //console.log("DEF",Playersownerslist)
  //console.log("GHI",Teamsstats)

  const teamData = Playersownerslist.reduce((acc, player) => {
    if (!acc[player.ownerTeam]) {
      acc[player.ownerTeam] = [];
      acc[player.ownerTeam].teamplayerpoints = 0;
    }
    acc[player.ownerTeam].push({
      name: player.player_name,
      points: player.points,
      todayspoints: player.todayPoints,
    });
    acc[player.ownerTeam].teamplayerpoints += player.points;
    return acc;
  }, {});

  const teampoints = Teamsstats.reduce((tcc, teams) => {
    if (!tcc[teams.teamName]) {
      tcc[teams.teamName] = {
        totalPoints: teams.totalPoints,
        todayPoints: teams.todayPoints,
        transferdata: teams.transferHistory,
      };
    }
    return tcc;
  }, {});

  const data = [];
  const teamtotalpoints = teampoints;

  for (const [teamName, players] of Object.entries(teamData)) {
    const team = {
      teamName: teamName,
      totalpoint: teamtotalpoints[teamName].totalPoints,
      todaypoints: teamtotalpoints[teamName].todayPoints,
      transferdetails: teamtotalpoints[teamName].transferdata,
      players: players,
    };
    data.push(team);
  }
  //console.log("ABC",data)
  


  const gridOptions = {
    rowSelection: "single",
    onRowSelected: (event) => {
      if (event.node.isSelected()) {
        const selectedRow = event.node.data;
        setSelectedteamname(selectedRow.teamName);
        setShowPlayers(selectedRow.players);
        setIsModalOpen(true);
      }
    },
  };

  const hide = () => {
    setPopoverVisible(false);
  };

  const playerColumns = [
    { headerName: "Name", field: "name", width: 120 },
    { headerName: "Points", field: "points", width: 100, sort: "desc" },
    {
      headerName: "TodaysPoints",
      cellRenderer: ({ data, rowIndex }) => (
        <Popover
          content={<><div>{popovercontent}</div>
          <div>
          <a style={{fontWeight:"bold"}} onClick={hide}>Close</a>
          </div></>}
          title={data.name+" detail's"}
          trigger="click"
          visible={popoverVisible && popoverPosition.rowIndex === rowIndex}
          onVisibleChange={(visible) => {
            setPopoverVisible(visible);
            if (!visible) {
              setPopoverContent(null);
            }
          }}
          overlayStyle={{
            position: "absolute",
            top: popoverPosition.top,
            right: popoverPosition.right,
          }}
        >
          <button style={{color:"blue"}}
            onClick={(e) =>
              handleDetailsClick(e, data, rowIndex)
            }
          >
            {data.todayspoints.total_points}
          </button>
        </Popover>
      ),
    },
  ];

  const handleDetailsClick = (e, rowData, rowIndex) => {
    const todaysPoints = rowData.todayspoints;
    const parsedObject = JSON.parse(JSON.stringify(todaysPoints));
    const formattedObject = {};
    for (const key in parsedObject) {
      const newKey = key.replace(/_/g, " ");
      formattedObject[newKey] = parsedObject[key];
    }
    const beautifiedString = JSON.stringify(formattedObject, null, 2);
    setPopoverContent(beautifiedString);

    const cellRect = e.target.getBoundingClientRect();
    setPopoverPosition({
      rowIndex,
      top: cellRect.top + cellRect.height,
      left: cellRect.left,
    });
  };

  const handleOk = () => {
    setIsModalOpen(false);
    //handleHoverChange()
  };

  return (
    <div className="teampointspage">
      <div className="teampointscontainer">
      {timsestamps[0] &&
      <Breadcrumb className="breadcrumb" items={[{title:'Points Updated On '+timsestamps[0].pointsUpdatedAt}]}/>
      }
        {Teamsstats &&
        <div className="ag-theme-alpine-dark" style={{ height: "70vh", width: "87vw" }}>
          <AgGridReact
            rowData={data}
            gridOptions={gridOptions}
            columnDefs={[
              { cellRenderer: (params) => params.rowIndex + 1, headerName: "#", width: 60 },
              { field: "teamName", headerName: "Team Name", width: 180 },
              { field: "totalpoint", headerName: "Points", width: 100, sort: "desc" },
              { field: "todaypoints", headerName: "TodayPoints", width: 100 },
              {
                field: "transferdetails",
                headerName: "Exodus Points",
                width:100,
                cellRenderer: (params) => {
                  const transferHistory = params.data.transferdetails;
                  const totalPoints = transferHistory.reduce((acc, item) => acc + item.points, 0);
                  return totalPoints;
                },
              },
            ]}
          />
        </div>}
        <div>
          <Modal
            title={teamname + " players"}
            style={{ top: 30, width: 650, zIndex: 9999 }}
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleOk}
            cancelButtonProps={{ style: { display: "none" } }}
          >
            <div className="ag-theme-alpine" style={{ height: "70vh" }}>
              <AgGridReact rowData={showplayers} columnDefs={playerColumns} rowSelection="single"/>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
}
