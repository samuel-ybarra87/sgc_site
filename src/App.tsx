import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home'
import PersonnelList from './pages/PersonnelList';
import PersonnelDetail from './pages/PersonnelDetail';
import PersonnelForm from './pages/PersonnelForm';
import TeamList from './pages/TeamList';
import TeamDetail from './pages/TeamDetail'
import TeamForm from './pages/TeamForm';
import { PATHS, ROUTES } from './lib/paths';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={'/'} element={<Home />} />
        <Route path={PATHS.PERSONNEL_LIST} element={<PersonnelList />} />
        <Route path={PATHS.PERSONNEL_NEW} element={<PersonnelForm />} />
        <Route path={ROUTES.PERSONNEL_DETAIL} element={<PersonnelDetail />} />
        <Route path={ROUTES.PERSONNEL_EDIT} element={<PersonnelForm />} />
        <Route path={PATHS.TEAM_LIST} element={<TeamList />} />
        <Route path={PATHS.TEAM_NEW} element={<TeamForm />} />
        <Route path={ROUTES.TEAM_DETAIL} element={<TeamDetail />} />
        <Route path={ROUTES.TEAM_EDIT} element={<TeamForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;