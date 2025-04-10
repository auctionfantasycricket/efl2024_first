import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import {Route, Routes, HashRouter} from 'react-router-dom'
import { NavBar } from './components/NavBar';
import HomePage from './pages/HomePage';
import { Provider, useSelector } from 'react-redux';
import store, { persistor } from './components/redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import { AllPlayers } from './pages/Players';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NewAuction } from './pages/Auction_New';
import { ManageTeam } from './pages/ManageTeam';
import Teams from './pages/Teams';
import TeamPoints from './pages/TeamPoints';
import { Linegraph } from './pages/Linegraph';
import { WaiverSystem } from './pages/WaiverSystem';
import SnakeDraft from './pages/Snakedraft';
import DraftTeams from './pages/DraftTeams';
import SignIn from './pages/SignIn';
import LandingPage from './pages/LandingPage';
import LeagueManagement from './pages/LeagueManagement'
import TeamHub from './pages/TeamHub'
import { FileTextOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';

const queryClient = new QueryClient();

// Create a separate component for the float button that can access Redux state
function HelpButton() {

  // Access the league info from Redux store
  const leagueInfo = useSelector((state) => state.league.currentLeague);
  
  // Create a description based on league info
  const description = leagueInfo ? `${leagueInfo.league_name || 'League Info'}` : 'HELP INFO';
  
  return (
    <FloatButton
      trigger="click"
      href="#/league"
      type="primary"
      tooltip={<div style={{ color: "white" }}>League Name</div>}
      description={description}
      shape="circle"
      style={{ insetInlineEnd: 24, 
        width: '60px',
        height: '60px'}}
    />
  );
}

// Main App component
function App() {
  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <HashRouter>
              <AppContent />
            </HashRouter>
          </PersistGate>
        </Provider>
      </QueryClientProvider>
    </div>
  );
}

// Create a separate component that will be rendered inside the Router
function AppContent() {
  return (
    <>
      <NavBar/>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/players" element={<AllPlayers />} />
        <Route path="/auction" element={<NewAuction />}/>
        <Route path="/draft" element={<SnakeDraft />}/>
        <Route path="/manageteam" element={<ManageTeam />}/>
        <Route path="/teams" element={<Teams />}/>
        <Route path="/teampoints" element={<TeamPoints />} />
        <Route path="/linegraph" element={<Linegraph />} />
        <Route path="/waiver" element={<WaiverSystem/>} />
        <Route path="/SignIn" element={<SignIn />} />
        <Route path='/league' element={<LandingPage />} />
        <Route path="/manageleague" element={<LeagueManagement />}/>
        <Route path="/teamhub" element={<TeamHub />}/>
      </Routes>
      
      <HelpButton />
    </>
  );
}

export default App;