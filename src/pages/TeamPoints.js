import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "./TeamPoints.css";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Modal, Popover, Breadcrumb } from "antd";
import { useQuery } from '@tanstack/react-query';
import CustomLoadingOverlay from "../components/CustomLoadingOverlay";
import { useSelector } from 'react-redux';

const baseURL = process.env.REACT_APP_BASE_URL;

const getallplayerslist = async (id) => {
  const response = await fetch(baseURL+'/get_data?collectionName=leagueplayers&leagueId='+id);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

const getallownerslist = async (leagueId) => {
  const response = await fetch(baseURL+'/get_data?collectionName=teams&leagueId='+leagueId);
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
  const [gridApi, setGridApi] = useState(null);
  
  const selectedLeagueId = useSelector((state) => state.league.selectedLeagueId);

  const gridRef = useRef();

  const onGridReady = useCallback((params) => {
    setGridApi(params.api);
  }, []);

  const { isLoading: isLoadingTeams, error: errorTeams, data: stats } = useQuery({ 
    queryKey: ['teampointsteams'], 
    queryFn: async () => {
      let response;
      try {
        response = await getallownerslist(selectedLeagueId);
      } catch (error) {
        console.log(error);
      }
      return response;
    }
  });

  useEffect(() => {
    if (stats) {
      setTeamsstats(stats);
    }
  }, [stats]); 

  const { isLoading: isLoadingPlayers, error: errorPlayers, data: playerdata } = useQuery({ 
    queryKey: ['teampointsplayers'], 
    queryFn: async () => {
      let response;
      try {
        response = await getallplayerslist(selectedLeagueId);
      } catch (error) {
        console.log(error);
      }
      return response;
    }
  });

  useEffect(() => {
    if (playerdata) {
      setPlayerownersslist(
        playerdata.filter((item) => item.status === "sold")
      );
    }
  }, [playerdata]); 

  const { isLoading: isLoadingTS, error: errorTS, data: timsestamp } = useQuery({ 
    queryKey: ['timestamp'], 
    queryFn: async () => {
      let response;
      try {
        response = await gettimestamp();
      } catch (error) {
        console.log(error);
      }
      return response;
    }
  });

  useEffect(() => {
    if (timsestamp) {
      setTimestamps(timsestamp);
    }
  }, [timsestamp]);

  useEffect(() => {
    if (gridApi) {
      const isLoading = isLoadingTeams || isLoadingPlayers || isLoadingTS;
      const hasError = errorTeams || errorPlayers || errorTS;

      if (isLoading) {
        gridApi.showLoadingOverlay();
      } else if (hasError) {
        gridApi.showNoRowsOverlay();
      } else if (Teamsstats && Teamsstats.length === 0) {
        gridApi.showNoRowsOverlay();
      } else {
        gridApi.hideOverlay();
      }
    }
  }, [gridApi, isLoadingTeams, isLoadingPlayers, isLoadingTS, errorTeams, errorPlayers, errorTS, Teamsstats]);

  // Generate team data once we have both players and teams
  const team_data = useMemo(() => {
    if (!Playersownerslist.length || !Teamsstats.length) return [];

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
          // transferdata: teams.transferHistory,
        };
      }
      return tcc;
    }, {});

    const teams = [];
    for (const [teamName, players] of Object.entries(teamData)) {
      if (teampoints[teamName]) {
        const team = {
          teamName: teamName,
          totalpoint: teampoints[teamName].totalPoints,
          todaypoints: teampoints[teamName].todayPoints,
          // transferdetails: teampoints[teamName].transferdata,
          players: players,
        };
        teams.push(team);
      }
    }
    return teams;
  }, [Playersownerslist, Teamsstats]);

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
    overlayLoadingTemplate: CustomLoadingOverlay,
    overlayNoRowsTemplate: '<span class="ag-overlay-no-rows-center">No data available</span>'
  };

  const hide = () => {
    setPopoverVisible(false);
  };

  const playerColumns = [
    { headerName: "Name", field: "name", width: 120 },
    { headerName: "Points", field: "points", width: 100, sort: "desc" },
    { headerName: "TodaysPoints", field: "todayspoints", width: 130
      // cellRenderer: ({ data, rowIndex }) => (
      //   <Popover
      //     content={<><div>{popovercontent}</div>
      //     <div>
      //     <a style={{fontWeight:"bold"}} onClick={hide}>Close</a>
      //     </div></>}
      //     title={data.name+" detail's"}
      //     trigger="click"
      //     visible={popoverVisible && popoverPosition.rowIndex === rowIndex}
      //     onVisibleChange={(visible) => {
      //       setPopoverVisible(visible);
      //       if (!visible) {
      //         setPopoverContent(null);
      //       }
      //     }}
      //     overlayStyle={{
      //       position: "absolute",
      //       top: popoverPosition.top,
      //       right: popoverPosition.right,
      //     }}
      //   >
      //     <button style={{color:"blue"}}
      //       onClick={(e) =>
      //         handleDetailsClick(e, data, rowIndex)
      //       }
      //     >
      //       {data.todayspoints.total_points}
      //     </button>
      //   </Popover>
      // ),
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
  };

  const components = {
    loadingOverlay: CustomLoadingOverlay
  };

  return (
    <div className="teampointspage">
      <div className="teampointscontainer">
        {timsestamps && timsestamps[0] &&
          <Breadcrumb className="breadcrumb" items={[{title:'Points Updated On '+timsestamps[0].pointsUpdatedAt}]}/>
        }
        <div className="ag-theme-alpine-dark teampoints-main-container">
          <AgGridReact
            ref={gridRef}
            loading={isLoadingTeams || isLoadingPlayers || isLoadingTS}
            rowData={team_data}
            gridOptions={gridOptions}
            components={components}
            onGridReady={onGridReady}
            loadingOverlayComponent="loadingOverlay"
            columnDefs={[
              { cellRenderer: (params) => params.rowIndex + 1, headerName: "#", width: 60 },
              { field: "teamName", headerName: "Team Name", width: 180 },
              { field: "totalpoint", headerName: "Points", width: 100, sort: "desc" },
              { field: "todaypoints", headerName: "TodayPoints", width: 130 },
              // {
              //   field: "transferdetails",
              //   headerName: "Exodus Points",
              //   width:100,
              //   cellRenderer: (params) => {
              //     const transferHistory = params.data.transferdetails;
              //     const totalPoints = transferHistory.reduce((acc, item) => acc + item.points, 0);
              //     return totalPoints;
              //   },
              // },
            ]}
          />
        </div>
        <div>
          <Modal
            title={teamname + " players"}
            style={{ top: 30, width: 650, zIndex: 9999 }}
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleOk}
            cancelButtonProps={{ style: { display: "none" } }}
            className="custom-modal"
          >
            <div className="ag-theme-alpine-dark teampoints-main-container" style={{ height: "70vh" }}>
              <AgGridReact 
                rowData={showplayers} 
                columnDefs={playerColumns} 
                rowSelection="single"/>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
}