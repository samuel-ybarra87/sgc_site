import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage'
import PersonnelList from './pages/PersonnelList';
import PersonnelDetail from './pages/PersonnelDetail';
import PersonnelForm from './pages/PersonnelForm';
import TeamList from './pages/TeamList';
import TeamDetail from './pages/TeamDetail'
import TeamForm from './pages/TeamForm';
import MissionList from './pages/MissionList';
import MissionForm from './pages/MissionForm';
import { PATHS, ROUTES } from './lib/paths';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={'/'} element={<Homepage />} />
        <Route path={PATHS.PERSONNEL_LIST} element={<PersonnelList />} />
        <Route path={PATHS.PERSONNEL_NEW} element={<PersonnelForm />} />
        <Route path={ROUTES.PERSONNEL_DETAIL} element={<PersonnelDetail />} />
        <Route path={ROUTES.PERSONNEL_EDIT} element={<PersonnelForm />} />
        <Route path={PATHS.TEAM_LIST} element={<TeamList />} />
        <Route path={PATHS.TEAM_NEW} element={<TeamForm />} />
        <Route path={ROUTES.TEAM_DETAIL} element={<TeamDetail />} />
        <Route path={ROUTES.TEAM_EDIT} element={<TeamForm />} />
        <Route path={PATHS.MISSION_LIST} element={<MissionList />} />
        <Route path={PATHS.MISSION_NEW} element={<MissionForm />} />
        <Route path={ROUTES.MISSION_EDIT} element={<MissionForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;