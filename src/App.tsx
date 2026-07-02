import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import LoginForm from './pages/LoginForm';
import Homepage from './pages/Homepage'
import PersonnelList from './pages/PersonnelList';
import PersonnelDetail from './pages/PersonnelDetail';
import PersonnelForm from './pages/PersonnelForm';
import TeamList from './pages/TeamList';
import TeamDetail from './pages/TeamDetail'
import TeamForm from './pages/TeamForm';
import MissionList from './pages/MissionList';
import MissionForm from './pages/MissionForm';
import MissionDetail from './pages/MissionDetail';
import { PATHS, ROUTES } from './lib/paths';
import './App.css';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import { useAuth } from './components/AuthContext';

function App() {
  const { session, loading: contextLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(!contextLoading){
      setLoading(false);
    }
  }, [contextLoading]);

  if(loading) return <div>Accessing SGC Database...</div>

  return (
    <BrowserRouter>
      {session && <Navbar userEmail={session.user.email} />} {/* Global Navbar */}
      <Routes>
        {/* Public Route: If logged in, go to Homepage, otherwise show LoginFrom */}
        <Route path={'/'} element={session ? <Homepage /> : <LoginForm />} />

        {/* 🛡️ Protected Routes: Anyone trying to access these must be logged in 🛡️ */}
        <Route element={<ProtectedRoute session={session} />}>
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
          <Route path={ROUTES.MISSION_DETAIL} element={<MissionDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;