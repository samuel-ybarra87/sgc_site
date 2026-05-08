import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PATHS } from '../lib/paths';
import type { Personnel, Team } from '../lib/types';

export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeams] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; code: string } | null>(null);

  const [person, setPersonnel] = useState<Personnel | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('teams')
        .select()
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

      if(!data.commanding_officer) return;

      const { data: personData, error: personError } = await supabase
            .from('personnel')
            .select()
            .eq('id', data.commanding_officer)
            .single();
        if(personError) {
            if(personError.code === 'PGRST116'){
                setPersonnel(null);
            } else {
                console.log(personError);
                setError({ message: 'An unexpected error occurred.', code: '500' });
            }
            return;
        } else setPersonnel(personData);
    }

    fetchData();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error {error.code}: {error.message}</p>;
  if (!team) return <p>Personnel record not found.</p>;

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

  return (
    <div>
      <h1>{team.designation}</h1>
      <p>Commanding Officer: {person ? (
        <>
            {person.rank ? `${person.rank} ` : '' }
            {`${person.first_name} `}
            {person.middle_name ? ` ${person.middle_name} ` : ''} 
            {person.last_name}
            {person.suffix ? ` ${ person.suffix}` : ''}
        </>
      ): 'Unassigned'}
      </p>
      <p>Status: {team.status}</p>
      <button onClick={() => navigate(PATHS.TEAM_LIST)}>Back</button>
      <button onClick={() => navigate(PATHS.TEAM_EDIT(team.id))}>Edit</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}