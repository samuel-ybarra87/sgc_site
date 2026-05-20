import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PATHS } from '../lib/paths';
import { rankAbbreviations } from '../lib/rankAbbreviations';
import type { Personnel, MissionObjectives, Team } from '../lib/types';

type TeamIds = {
    team_id: string,
}

type MissionForm = {
  name: string;
  destination: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string | null;
  objectives: MissionObjectives[];
}

const defaultForm: MissionForm = {
    name: '',
    destination: '',
    description: '',
    status: '',
    startDate: '',
    endDate: null,
    objectives: [],
}

export default function MissionForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const [form, setForm] = useState<MissionForm>(defaultForm);
    const [loading, setLoading] = useState(false);
    const [teamsIds, setTeamIds] = useState<string[]>([]);
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [fetching, setFetching] = useState(isEditing);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        async function getMissionMembers() {
            const { data: teamData, error: idsError } = await supabase
                .from('missions_teams')
                .select('team_id')
                .eq('mission_id', id);

            if (idsError) {
                console.error(idsError);
                return;
            }

            if(teamData.length === 0){
                console.error('No data returned on fetch');
                return;
            }

            const ids = teamData.map(row => row.team_id);
            setTeamIds(ids);

            const { data: teamsList, error: teamError } = await supabase
                .from('teams')
                .select('*')
                .in('id', teamsIds);
            
            if (teamError) console.error(teamError);
            else setTeams(teamsList);
            
            const { data: memberData, error: memberError } = await supabase
                .from('personnel')
                .select(`*,
                    roles:roles(name),
                    teams:teams(designation)
                    `)
                .in('team_id', teamsIds);
            
            if(memberError) console.error(memberError);
            else setPersonnel(memberData);
        }
        if (id) getMissionMembers();

        if (!isEditing) return;

        let shouldUpdate = true;
        async function fetchMissions() {
            const { data, error } = await supabase
                .from('missions')
                .select(`*,
                    objectives:mission_objectives(*),
                    teams:teams(*),
                    `)
                .eq('id', id)
                .single();
            if (error) console.error(error);
            else if (shouldUpdate) {
                setForm(data);
                setFetching(false);
            }
        }

        fetchMissions();

        return () => { shouldUpdate = false; }
    }, [id, isEditing]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        setLoading(true);
        const formData = {
            ...form,
        }

        if (isEditing) {
            const { error } = await supabase
                .from('missions')
                .update(formData)
                .eq('id', id);
            if (error) {
                console.error(error);
                setSubmitError(error.message);
            } else navigate(PATHS.MISSION_LIST);
        } else {
            const { error } = await supabase
                .from('missions')
                .insert(formData);
            if (error) {
                console.error(error);
                setSubmitError(error.message);
            } else navigate(PATHS.TEAM_LIST);
        }

        setLoading(false);
    }
    
    if (fetching) return <p>Loading...</p>;

    return(
        <div>
            <h1>{isEditing ? 'Edit Mission Record' : 'Add Mission Record'}</h1>
            {submitError && <p style={{ color: 'red' }}>{submitError}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-row-3">
                    <div className="form-group">
                        <label htmlFor="name">Name: </label>
                        <input id="name" name="name" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="destination">Destination: </label>
                        <input id="destination" name="destination" value={form.destination} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description: </label>
                        <input id="description" name="description" value={form.description} onChange={handleChange} required />
                    </div>
                </div>
                <div className="form-row-3">
                    <div className="form-group">
                        <label htmlFor="commanding_officer">Commanding Officer: </label>
                        <select id="commanding_officer" name="commanding_officer" value={form.commanding_officer} onChange={handleChange}>
                            <option value="">None</option>
                            {personnel.map((person) => (
                                <option key={person.id} value={person.id}>
                                    {`${rankAbbreviations[person.rank] ?? person.rank} ` }
                                    {`${person.first_name} `}
                                    {person.middle_name ? ` ${person.middle_name} ` : ''} 
                                    {person.last_name}
                                    {person.suffix ? ` ${ person.suffix}` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="startDate">Objective: </label>
                        <input id="startDate" name="startDate" value={form.startDate} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Secret Objective: </label>
                        <input id="description" name="description" value={form.description} onChange={handleChange} required />
                    </div>
                </div>
                <div className="form-row-3">
                    <div className="form-group">
                        <label htmlFor="status">Status: </label>
                        <input id="status" name="status" value={form.status} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="startDate">Start Date: </label>
                        <input id="startDate" name="startDate" value={form.startDate} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">endDate: </label>
                        <input id="description" name="description" value={form.description} onChange={handleChange} required />
                    </div>
                </div>
            </form>
        </div>
    );
};
