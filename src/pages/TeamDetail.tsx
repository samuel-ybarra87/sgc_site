import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PATHS } from '../lib/paths';
import type { Personnel, Team } from '../lib/types';

interface TeamInfo extends Team {
  commanding_officer_details: Personnel | null;
  members: Personnel[];
}

export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeams] = useState<TeamInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; code: string } | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          commanding_officer_details:personnel!teams_commanding_officer_fkey(
            *,
            roles:roles(name)
          ),
          members:personnel!personnel_team_id_fkey(
            *,
            roles:roles(name)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116'){
          setTeams(null);
        } else {
          console.error(error);
          setError({ message: 'An unexpected error occurred.', code: '500' });
        }
        setLoading(false);
        return;
      }
      
      setTeams(data);
      setLoading(false);
    }

    fetchData();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error {error.code}: {error.message}</p>;
  if (!team || !team.id) return <p>Team record not found.</p>;

  async function handleDelete() {
    if(!team) return;
    if(!confirm('Are you sure you want to delete this record?')) return;

    const { error: updateError } = await supabase
        .from('teams')
        .update({commanding_officer: null })
        .eq('id', team.id);

    if(updateError){
        console.log(updateError);
        setError({ message: updateError.message, code: updateError.code });
        return;
    }
    
    const { error: deleteError } = await supabase
      .from('teams')
      .delete()
      .eq('id', team.id);
    
    if (deleteError) {
        console.error(deleteError);
        setError({ message: deleteError.message, code: deleteError.code });
    }
    else navigate(PATHS.TEAM_LIST);
  }

  const person = team.commanding_officer_details;

  return (
    <div>
      <h1>{team.designation}</h1>
        {team.designation !== 'Unassigned' ? <h3><u>Current Members</u></h3> : <h3>Members</h3>}
      <ul>
        <li>
            {person ? (
              <p>Commanding Officer: <></>
                  {person.rank ? `${person.rank} ` : ''}
                  {`${person.first_name} `}
                  {person.middle_name ? ` ${person.middle_name}` : ''}
                  {person.last_name}
                  {person.suffix ? ` ${person.suffix}` : ''}
              </p>
            ) : '' }
        </li>
      </ul>
      {team.members
        .filter(m => m.id !== team.commanding_officer)
        .filter(m => m.status === 'active')
        .map(member =>
          <ul key={`${member.last_name}, ${member.first_name}`}>
            <li>
              {`${member.roles ? member.roles.name : member.role}: `}
              {`${member.personnel_type === 'military' ? member.rank : member.prefix || '' } `}
              {member.first_name}
              {`${member.middle_name ? ` ${member.middle_name} ` : ' '}`}
              {member.last_name}
              {member.suffix ? ` ${member.suffix}` : ''}
            </li>
          </ul>
      )}
      {team.designation !== 'Unassigned' ? <h4>Status: {team.status}</h4> : '' }
      {team.members.filter(m => m.status !== 'active').length !== 0 ? (
        <div>
          {team.designation !== 'Unassigned' ? <h3><u>Other Members</u></h3> : '' }
          {team.members
            .filter(m => m.status !== 'active')
            .map(member =>
              <ul key={`${member.last_name}, ${member.first_name}`}>
                <li>
                  {`${member.roles ? member.roles.name : member.role}: `}
                  {`${member.personnel_type === 'military' ? member.rank : member.prefix || '' } `}
                  {member.first_name}
                  {`${member.middle_name ? ` ${member.middle_name} ` : ' '}`}
                  {member.last_name}
                  {member.suffix ? ` ${member.suffix} ` : ' '}
                  <b>({member.status.toUpperCase()})</b>
                </li>
              </ul>
            )}
        </div>
      ) : ''}
      <button onClick={() => navigate(PATHS.TEAM_LIST)}>Back</button>
      <button onClick={() => navigate(PATHS.TEAM_EDIT(team.id))}>Edit</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}