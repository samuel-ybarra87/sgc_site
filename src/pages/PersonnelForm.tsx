import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PATHS } from '../lib/paths';

type TeamOptions = {
  id: string;
  designation: string;
};

type RoleOptions = {
  id: string;
  name: string;
}

type PersonnelFormData = {
  prefix: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  suffix: string;
  rank: string;
  role: string;
  role_id: string;
  team_id: string;
  personnel_type: string;
  status: string;
};

const defaultForm: PersonnelFormData = {
  prefix: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  suffix: '',
  rank: '',
  role: '',
  role_id: '',
  team_id: '',
  personnel_type: 'military',
  status: 'active',
};

export default function PersonnelForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<PersonnelFormData>(defaultForm);
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(id);
  const [fetching, setFetching] = useState(isEditing);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [teams, setTeams] = useState<TeamOptions[]>([]);
  const [roles, setRoles] = useState<RoleOptions[]>([]);

  useEffect(() => {

    async function fetchRoles() {
      const { data, error } = await supabase
        .from('roles')
        .select('id, name')
        .order('name', { ascending: true });
      if (error) console.error(error);
      else setRoles(data);
    }
    fetchRoles();

    async function fetchTeams() {
      const { data, error } = await supabase
        .from('teams')
        .select('id, designation')
        .order('designation', { ascending: true });
      if (error) console.error(error);
      else setTeams(data);
    }
    fetchTeams();

    if (!isEditing) return;

    async function fetchPerson() {
      const { data, error } = await supabase
        .from('personnel')
        .select('*')
        .eq('id', id)
        .single();
      if (error) console.error(error);
      else setForm(data);
      setFetching(false);
    }

    fetchPerson();
  }, [id, isEditing]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if(!form.team_id){
      setSubmitError('Please select a team.');
      setLoading(false);
      return;
    }

    const formData = {
      ...form,
      prefix: form.prefix === '' ? null : form.prefix,
      rank: form.rank === '' ? null : form.rank,
      team_id: form.team_id === '' ? null : form.team_id,
      role_id: form.role_id === '' ? null : form.role_id,
      role: form.role === '' ? null : form.role,
    }

    if (isEditing) {
      const { error } = await supabase
        .from('personnel')
        .update(formData)
        .eq('id', id);
      if (error) {
        console.error(error);
        setSubmitError(error.message);
      } else {
        navigate(PATHS.PERSONNEL_LIST);
      }
    } else {
      const { error } = await supabase
        .from('personnel')
        .insert(formData);
      if (error) {
        console.error(error);
        setSubmitError(error.message);
      } else navigate(PATHS.PERSONNEL_LIST);
    }

    setLoading(false);
  }

  if (fetching) return <p>Loading...</p>;

  return (
    <div>
      <h1>{isEditing ? 'Edit Personnel' : 'Add Personnel'}</h1>
      {submitError && <p style={{ color: 'red' }}>{submitError}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-row-3">
          <div className="form-group">
            <label htmlFor="prefix">Prefix: </label>
            <select id="prefix" name="prefix" value={form.prefix} onChange={handleChange}>
              <option value="">None</option>
              <option value="Mr.">Mr.</option>
              <option value="Ms.">Ms.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Dr.">Dr.</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="first_name">First Name: </label>
            <input id="first_name" name="first_name" value={form.first_name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="middle_name">Middle Name: </label>
            <input id="middle_name" name="middle_name" value={form.middle_name} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label htmlFor="last_name">Last Name: </label>
            <input id="last_name" name="last_name" value={form.last_name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="suffix">Suffix: </label>
            <input id="suffix" name="suffix" value={form.suffix} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label htmlFor="rank">Rank: </label>
            <select id="rank" name="rank" value={form.rank} onChange={handleChange}>
              <option value="">None</option>
              <option value="Airman Basic">Airman Basic</option>
              <option value="Airman">Airman</option>
              <option value="Airman First Class">Airman First Class</option>
              <option value="Senior Airman">Senior Airman</option>
              <option value="Staff Sergeant">Staff Sergeant</option>
              <option value="Technical Sergeant">Technical Sergeant</option>
              <option value="Master Sergeant">Master Sergeant</option>
              <option value="Senior Master Sergeant">Senior Master Sergeant</option>
              <option value="Chief Master Sergeant">Chief Master Sergeant</option>
              <option value="Command Chief Master Sergeant">Command Chief Master Sergeant</option>
              <option value="Chief Master Sergeant of the Air Force">Chief Master Sergeant of the Air Force</option>
              <option value="Second Lieutenant">Second Lieutenant</option>
              <option value="First Lieutenant">First Lieutenant</option>
              <option value="Captain">Captain</option>
              <option value="Major">Major</option>
              <option value="Lieutenant Colonel">Lieutenant Colonel</option>
              <option value="Colonel">Colonel</option>
              <option value="Brigadier General">Brigadier General</option>
              <option value="Major General">Major General</option>
              <option value="Lieutenant General">Lieutenant General</option>
              <option value="General">General</option>
              <option value="General of the Air Force">General of the Air Force</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="role_id">Role: </label>
            <select id="role_id" name="role_id" value={form.role_id ?? ''} onChange={handleChange}>
              <option value="">Custom</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            {!form.role_id && (
              <input id="role" name="role" title="role" value={form.role} onChange={handleChange} required />
            )}
          </div>

          <div className="form-group">
            <label htmlFor="team">Team: </label>
            <select id="team" name="team_id" value={form.team_id} onChange={handleChange}>
              <option value="">None</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>{team.designation}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label htmlFor="personnel_type">Personnel Type: </label>
            <select id="personnel_type" name="personnel_type" value={form.personnel_type} onChange={handleChange}>
              <option value="military">Military</option>
              <option value="civilian">Civilian</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status: </label>
            <select id="status" name="status" value={form.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="mia">MIA</option>
              <option value="kia">KIA</option>
              <option value="deceased">Deceased</option>
              <option value="retired">Retired</option>
              <option value="transferred">Transferred</option>
              <option value="medical_leave">Medical Leave</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={() => navigate(PATHS.PERSONNEL_LIST)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}