import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import {Route, Routes, HashRouter} from 'react-router-dom'
import { NavBar } from './components/NavBar';
import HomePage from './pages/HomePage';
import { Provider } from 'react-redux';
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

const queryClient = new QueryClient();


function App() {
  return (
    
    <div>
      
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <HashRouter>
            <NavBar/>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/players" element={<AllPlayers />} />
              {/* <Route path="/auction" element = {<Auction />}/> */}
              <Route path="/auction" element = {<NewAuction />}/>
              <Route path="/draft" element = {<SnakeDraft />}/>
              <Route path="/manageteam" element = {<ManageTeam />}/>
              <Route path="/teams" element = {<Teams />}/>
              <Route path ="/teampoints" element = {<TeamPoints />} />
              <Route path ="/linegraph" element = {<Linegraph />} />
              <Route path="/waiver" element = {<WaiverSystem/>} />
              <Route path="/SignIn" element = {<SignIn />} />
              <Route path='/league' element={<LandingPage />} />
              <Route path="/manageleague" element = {<LeagueManagement />}/>
              <Route path="/teamhub" element = {<TeamHub />}/>
            </Routes>
            </HashRouter>
          </PersistGate>
        </Provider>
      </QueryClientProvider>
    </div>
      
  );
}

export default App;
