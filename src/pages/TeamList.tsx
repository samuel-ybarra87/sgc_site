import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import type { Team } from '../lib/types';
import { PATHS } from '../lib/paths';

export default function TeamsList() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeams() {
      const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('designation', { ascending: true});
      if (error) {
        console.error(error);
        setError(error.message);
      } else setTeams(data);
      setLoading(false);
    }

    fetchTeams();
  }, []);

  if (loading) return <p>Loading...</p>;

  if (error) return <p>No team records found.</p>;

  return (
    <div>
      <h1>SGC Team List</h1>
      <button onClick={() => navigate(PATHS.HOME)}>Home</button>
      <button onClick={() => navigate(PATHS.TEAM_NEW)}>Add Team</button>
      {teams.length === 0 ? (
        <p>No team records found.</p>
      ) : (
        <div>
          <ul>
            {teams.map((t) => (
              <li key={t.designation}>
                <Link to={`/teams/${t.id}`}>
                  {t.designation}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}