import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import {Route, Routes, HashRouter} from 'react-router-dom'
import { NavBar } from './components/NavBar';
import HomePage from './pages/HomePage';
import { Provider } from 'react-redux';
import store from './components/redux/store'
import { AllPlayers } from './pages/Players';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Auction } from './pages/Auction';
import { ManageTeam } from './pages/ManageTeam';
import Teams from './pages/Teams';
import TeamPoints from './pages/TeamPoints';
import { Linegraph } from './pages/Linegraph';
import { WaiverSystem } from './pages/WaiverSystem';
import SnakeDraft from './pages/Snakedraft';
import DraftTeams from './pages/DraftTeams';
import SignIn from './pages/SignIn';
import LandingPage from './pages/LandingPage';

const queryClient = new QueryClient();


function App() {
  return (
    
    <div>
      
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
        
        <HashRouter>
        <NavBar/>
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/players" element={<AllPlayers />} />
        <Route path="/auction" element = {<Auction />}/>
        <Route path="/draft" element = {<SnakeDraft />}/>
        <Route path="/manageteam" element = {<ManageTeam />}/>
        <Route path="/teams" element = {<Teams />}/>
        <Route path ="/teampoints" element = {<TeamPoints />} />
        <Route path ="/linegraph" element = {<Linegraph />} />
        <Route path="/waiver" element = {<WaiverSystem/>} />
        <Route path="/SignIn" element = {<SignIn />} />
        <Route path='/league' element={<LandingPage />} />
        </Routes>
        </HashRouter>
        </Provider>
        </QueryClientProvider>
      </div>
      
  );
}

export default App;
