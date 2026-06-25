// components/Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PATHS } from '../lib/paths';

interface NavbarProps {
  userEmail?: string;
}

export default function Navbar({ userEmail }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/'); // Send them back to the root route
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 20px',
      backgroundColor: '#1a252f', // Military/Sci-fi dark blue
      color: '#ecf0f1',
      borderBottom: '2px solid #34495e'
    }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>
          🌌 SGC DATABASE
        </Link>
        <Link to={PATHS.PERSONNEL_LIST} style={{ color: '#bdc3c7', textDecoration: 'none' }}>Personnel</Link>
        <Link to={PATHS.TEAM_LIST} style={{ color: '#bdc3c7', textDecoration: 'none' }}>Teams</Link>
        <Link to={PATHS.MISSION_LIST} style={{ color: '#bdc3c7', textDecoration: 'none' }}>Missions</Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {userEmail && <span style={{ fontSize: '0.9rem', color: '#95a5a6' }}>{userEmail}</span>}
        <button 
          onClick={handleLogout}
          style={{
            backgroundColor: '#c0392b',
            color: 'white',
            border: 'none',
            padding: '5px 12px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Log Out
        </button>
      </div>
    </nav>
  );
}