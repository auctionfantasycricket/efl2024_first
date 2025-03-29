import React, { useState, useEffect, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
} from 'chart.js';
import { Line } from "react-chartjs-2";
import { Breadcrumb, Spin, Alert, Empty, Card } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import './Linegraph.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

// Color palette for team lines
const TEAM_COLORS = [
  { borderColor: "rgba(255, 206, 86, 0.8)", backgroundColor: "rgba(255, 206, 86, 0.5)" },
  { borderColor: "rgba(255, 99, 71, 0.8)", backgroundColor: "rgba(255, 99, 71, 0.5)" },
  { borderColor: "rgba(106, 209, 98, 0.8)", backgroundColor: "rgba(106, 209, 98, 0.5)" },
  { borderColor: "rgba(54, 162, 235, 0.8)", backgroundColor: "rgba(54, 162, 235, 0.5)" },
  { borderColor: "rgba(153, 102, 255, 0.8)", backgroundColor: "rgba(153, 102, 255, 0.5)" },
  { borderColor: "rgba(255, 159, 64, 0.8)", backgroundColor: "rgba(255, 159, 64, 0.5)" },
  { borderColor: "rgba(200, 142, 144, 0.8)", backgroundColor: "rgba(200, 142, 144, 0.5)" },
  { borderColor: "rgba(75, 192, 192, 0.8)", backgroundColor: "rgba(75, 192, 192, 0.5)" },
  { borderColor: "rgba(150, 25, 32, 0.8)", backgroundColor: "rgba(150, 25, 32, 0.5)" },
  { borderColor: "rgba(128, 0, 128, 0.8)", backgroundColor: "rgba(128, 0, 128, 0.5)" }
];

const baseURL = process.env.REACT_APP_BASE_URL;

// API service functions
const fetchTeamStandings = async (leagueId) => {
  if (!leagueId) return null;
  const response = await fetch(`${baseURL}/get_data?collectionName=teams&leagueId=${leagueId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch team standings');
  }
  return response.json();
};

const fetchTimestamps = async () => {
  const response = await fetch(`${baseURL}/get_data?collectionName=global_data`);
  if (!response.ok) {
    throw new Error('Failed to fetch timestamps');
  }
  return response.json();
};

export const Linegraph = () => {
  const selectedLeagueId = useSelector((state) => state.league.selectedLeagueId);
  const leagueInfo = useSelector((state) => state.league.currentLeague);
  const isPortrait = window.matchMedia("(orientation: portrait)").matches;
  
  // Fetch team standings data
  const { 
    isLoading: isLoadingTeams, 
    error: teamsError, 
    data: teamsData 
  } = useQuery({
    queryKey: ['teamsStanding', selectedLeagueId],
    queryFn: () => fetchTeamStandings(selectedLeagueId),
    enabled: !!selectedLeagueId,
    // staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch timestamps data
  const { 
    isLoading: isLoadingTimestamps, 
    error: timestampsError, 
    data: timestampsData 
  } = useQuery({
    queryKey: ['standingTimestamp'],
    queryFn: fetchTimestamps,
    // staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate chart data using useMemo to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    if (!teamsData || teamsData.length === 0) return null;

    const numDays = teamsData[0]?.standings?.length || 0;
    if (numDays === 0) return null;

    // Create day labels
    const labels = Array.from({ length: numDays }, (_, i) => `Day ${i + 1}`);

    // Create datasets for each team
    const datasets = teamsData.map((team, index) => ({
      label: team.teamName,
      data: team.standings || [],
      fill: false,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      ...TEAM_COLORS[index % TEAM_COLORS.length]
    }));

    return { labels, datasets };
  }, [teamsData]);

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Team Standings Trends',
        font: {
          size: 15,
          weight: 'bold'
        },
        padding: 10
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        padding: 10,
        cornerRadius: 6,
        usePointStyle: true
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Timeline',
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: 10
        },
        grid: {
          display: true,
          color: 'rgba(200, 200, 200, 0.2)'
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      y: {
        reverse: true,
        title: {
          display: true,
          text: 'Rank Position',
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: 10
        },
        grid: {
          display: true,
          color: 'rgba(200, 200, 200, 0.2)'
        },
        ticks: {
          stepSize: 1,
          font: {
            size: 12
          }
        }
      }
    }
  };

  // Loading and error states
  if (isLoadingTeams || isLoadingTimestamps) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Loading standings data..." />
      </div>
    );
  }

  if (teamsError || timestampsError) {
    return (
      <Alert
        message="Error Loading Data"
        description={teamsError?.message || timestampsError?.message || "Failed to load standing data"}
        type="error"
        showIcon
      />
    );
  }

  if (!teamsData || teamsData.length === 0) {
    return (
      <Empty 
        description="No team standings data available" 
        image={Empty.PRESENTED_IMAGE_SIMPLE} 
      />
    );
  }

  const lastUpdated = timestampsData?.[0]?.rankingsUpdatedAt || "Not available";

  return (
    <div className="line-graph-page">
      <Card className="line-graph-card">
        <Breadcrumb
          className="standings-breadcrumb"
          items={[{ title: `Standings Last Updated: ${lastUpdated}` }]}
          style={{ display:"flex", justifyContent: 'center' }}
        />
        
        <div 
          className="chart-container" 
          style={{ 
            height: isPortrait ? "70vh" : "75vh",
            width: "100%"
          }}
        >
          {chartData ? (
            <Line data={chartData} options={options} />
          ) : (
            <Empty description="No chart data available" />
          )}
        </div>
      </Card>
    </div>
  );
};

export default Linegraph;