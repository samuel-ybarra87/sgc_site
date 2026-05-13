import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Personnel } from '../lib/types';
import { PATHS } from '../lib/paths';

export default function PersonnelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState<Personnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; code: string } | null>(null);

  useEffect(() => {
    async function fetchPerson() {
      const { data, error } = await supabase
        .from('personnel')
        .select('*, teams!personnel_team_id_fkey(designation), roles!personnel_role_id_fkey(name)')
        .eq('id', id)
        .single();
      if (error) {
        if (error.code === 'PGRST116'){
          setPerson(null);
        } else {
          console.error(error);
          setError({ message: 'An unexpected error occurred.', code: '500' });
        }
        setLoading(false);
        return;
      } else setPerson(data);
      setLoading(false);
    }

    fetchPerson();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error {error.code}: {error.message}</p>;
  if (!person) return <p>Personnel record not found.</p>;

  async function handleDelete() {
    if(!person) return;
    if(!confirm('Are you sure you want to delete this record?')) return;

    const { error } = await supabase
      .from('personnel')
      .delete()
      .eq('id', person.id);
    
    if (error) {
      console.error(error);
      setError({ message: error.message, code: error.code });
    }
    else navigate(PATHS.PERSONNEL_LIST);
  }

  return (
    <div>
      <h1>
        {person.prefix ? `${person.prefix} ` : '' }
        {`${person.first_name} `}
        {person.middle_name ? ` ${person.middle_name} ` : ''} 
        {person.last_name}
        {person.suffix ? ` ${ person.suffix}` : ''}
      </h1>
      
      <div className="display-group">
        <ul>
          <li>{person.personnel_type == 'civilian' ? 'Civilian Contractor' : person.rank ? `Rank: ${person.rank}` : 'N/A' }</li>
          <li>Team: {person.teams?.designation ?? 'Unassigned'}</li>
          <li>Role: {person.roles?.name ?? person.role}</li>
          <li>Status: {person.status === "medical_leave" ? "Medical Leave" : `${person.status}`}</li>
        </ul>
      </div>

      <div className="form-actions">
        <button onClick={() => navigate(PATHS.PERSONNEL_LIST)}>Back</button>
        <button onClick={() => navigate(PATHS.PERSONNEL_EDIT(person.id))}>Edit</button>
        <button onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
}